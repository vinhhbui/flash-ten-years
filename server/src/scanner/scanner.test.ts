import assert from "node:assert/strict";
import crypto from "node:crypto";
import { access, mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import sharp from "sharp";
import { ingestScan } from "./ingestScan.js";
import type { ScannerConfig } from "./scannerConfig.js";
import { startScannerWatcher } from "./scannerWatcher.js";
import type { SubmissionService } from "../submissionService.js";

test("scanner ingestion accepts valid PNG files and archives the source", async () => {
  await withScannerWorkspace(async ({ config, inbox, archive }) => {
    const inputPath = path.join(inbox, "guest-art.PNG");
    await writeFile(inputPath, await createPaperArtworkPng());
    const calls: Parameters<SubmissionService["createSubmission"]>[0][] = [];
    const result = await ingestScan({
      inputPath,
      config,
      submissionService: fakeSubmissionService(calls),
      readExistingSubmissions: async () => [],
    });

    assert.deepEqual(result, { status: "accepted", id: "scan_test" });
    assert.equal(calls.length, 1);
    assert.equal(calls[0]?.source, "scanner");
    assert.equal(calls[0]?.frameId, "cat-v1");
    assert.equal(calls[0]?.animation, "hop");
    const processedPixels = await sharp(calls[0]?.image).ensureAlpha().raw().toBuffer();
    const processedInfo = await sharp(calls[0]?.image).metadata();
    assert.equal(processedInfo.width, 18);
    assert.equal(processedInfo.height, 18);
    assert.equal(processedPixels[3], 0);
    assert.equal(processedPixels[(1 * 18 + 1) * 4 + 3], 0);
    assert.equal(processedPixels[(9 * 18 + 9) * 4 + 3], 255);
    assert.equal(processedPixels[(7 * 18 + 7) * 4], 230);
    await assert.doesNotReject(access(path.join(archive, "guest-art.PNG")));
  });
});

test("scanner ingestion quarantines invalid PNG files", async () => {
  await withScannerWorkspace(async ({ config, inbox, failed }) => {
    const inputPath = path.join(inbox, "not-a-png.png");
    await writeFile(inputPath, "not an image");
    const calls: Parameters<SubmissionService["createSubmission"]>[0][] = [];
    const result = await ingestScan({
      inputPath,
      config,
      submissionService: fakeSubmissionService(calls),
      readExistingSubmissions: async () => [],
    });

    assert.equal(result.status, "failed");
    assert.equal(calls.length, 0);
    await assert.doesNotReject(access(path.join(failed, "not-a-png.png")));
  });
});

test("scanner ingestion archives duplicate content without creating a submission", async () => {
  await withScannerWorkspace(async ({ config, inbox, archive }) => {
    const inputPath = path.join(inbox, "duplicate.png");
    const image = await createPaperArtworkPng();
    await writeFile(inputPath, image);
    const sourceHash = crypto.createHash("sha256").update(image).digest("hex");
    const calls: Parameters<SubmissionService["createSubmission"]>[0][] = [];
    const result = await ingestScan({
      inputPath,
      config,
      submissionService: fakeSubmissionService(calls),
      readExistingSubmissions: async () => [{
        id: "scan_existing",
        image: "/uploads/scan_existing.png",
        animation: "float",
        createdAt: new Date().toISOString(),
        source: "scanner",
        sourceHash,
      }],
    });

    assert.deepEqual(result, { status: "duplicate" });
    assert.equal(calls.length, 0);
    await assert.doesNotReject(access(path.join(archive, "duplicate.png")));
  });
});

test("watcher recovers existing PNG files from the inbox at startup", async () => {
  await withScannerWorkspace(async ({ config, inbox }) => {
    const inputPath = path.join(inbox, "waiting-before-start.png");
    await writeFile(inputPath, await createPaperArtworkPng());
    let resolveDetected: ((inputPath: string) => void) | undefined;
    const detected = new Promise<string>((resolve) => { resolveDetected = resolve; });
    const watcher = await startScannerWatcher({
      config,
      onStableFile: async (stablePath) => resolveDetected?.(stablePath),
    });

    try {
      assert.equal(await detected, inputPath);
    } finally {
      await watcher.close();
    }
  });
});

async function withScannerWorkspace(
  run: (workspace: { config: ScannerConfig; inbox: string; archive: string; failed: string }) => Promise<void>,
) {
  const root = await mkdtemp(path.join(os.tmpdir(), "flash-scanner-test-"));
  const inbox = path.join(root, "inbox");
  const archive = path.join(root, "archive");
  const failed = path.join(root, "failed");
  await Promise.all([mkdir(inbox), mkdir(archive), mkdir(failed)]);
  const config: ScannerConfig = {
    inputDirectory: inbox,
    archiveDirectory: archive,
    failedDirectory: failed,
    animationMode: "hop",
    animationIds: ["float", "hop"],
    maxFileBytes: 1024,
    defaultFrameId: "cat-v1",
    preprocessProfile: "generic",
  };

  try {
    await run({ config, inbox, archive, failed });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

async function createPaperArtworkPng(): Promise<Buffer> {
  const width = 20;
  const height = 20;
  const pixels = Buffer.alloc(width * height * 4, 255);
  for (let y = 5; y <= 14; y += 1) {
    for (let x = 5; x <= 14; x += 1) {
      if (x === 5 || x === 14 || y === 5 || y === 14) {
        const offset = (y * width + x) * 4;
        pixels[offset] = 30;
        pixels[offset + 1] = 30;
        pixels[offset + 2] = 30;
      }
    }
  }
  const outsideDecoration = (2 * width + 2) * 4;
  pixels[outsideDecoration] = 50;
  pixels[outsideDecoration + 1] = 110;
  pixels[outsideDecoration + 2] = 220;
  const insideDecoration = (8 * width + 8) * 4;
  pixels[insideDecoration] = 230;
  pixels[insideDecoration + 1] = 80;
  pixels[insideDecoration + 2] = 100;
  return sharp(pixels, { raw: { width, height, channels: 4 } }).png().toBuffer();
}

function fakeSubmissionService(calls: Parameters<SubmissionService["createSubmission"]>[0][]): SubmissionService {
  return {
    async createSubmission(input) {
      calls.push(input);
      return {
        id: "scan_test",
        image: "/uploads/scan_test.png",
        animation: input.animation,
        createdAt: new Date().toISOString(),
      };
    },
  };
}
