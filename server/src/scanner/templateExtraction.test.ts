import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import sharp from "sharp";
import { preprocessScan, ScanPreprocessError } from "./preprocessScan.js";

const templateDirectory = path.resolve(import.meta.dirname, "../../../shared/templates/cat-v1");
const printableTemplatePath = path.join(templateDirectory, "printable-template.svg");
const allowedRegionMaskPath = path.join(templateDirectory, "allowed-region-mask.svg");
const guideStrokeMaskPath = path.join(templateDirectory, "guide-stroke-mask.svg");

test("a4-cat-v1 rejects a blank template and does not create a sprite", async () => {
  await withTemplateWorkspace(async (workspace) => {
    const scanPath = path.join(workspace, "blank.png");
    await writeFile(scanPath, await createBlankTemplate());

    await assert.rejects(preprocessScan(scanPath, "a4-cat-v1"), ScanPreprocessError);
  });
});

test("a4-cat-v1 keeps guest colors only inside the allowed region", async () => {
  await withTemplateWorkspace(async (workspace) => {
    const scanPath = path.join(workspace, "guest-colors.png");
    const scan = await addArtwork(await createBlankTemplate(), [
      rectangle(600, 760, 42, 42, "#E65064"),
      rectangle(80, 140, 42, 42, "#236EEA"),
    ]);
    await writeFile(scanPath, scan);

    const output = await preprocessScan(scanPath, "a4-cat-v1");
    const pixels = await readPixels(output);

    assert.equal(countOpaqueColor(pixels.data, [230, 80, 100]) > 500, true);
    assert.equal(countOpaqueColor(pixels.data, [35, 110, 234]), 0);
    assert.equal(countOpaquePixels(pixels.data) > 500, true);
  });
});

test("a4-cat-v1 preserves a black marker drawn over the dashed guide", async () => {
  await withTemplateWorkspace(async (workspace) => {
    const guidePoint = await findGuidePointInsideAllowedRegion();
    const scanPath = path.join(workspace, "guide-marker.png");
    const scan = await addArtwork(await createBlankTemplate(), [
      rectangle(guidePoint.x - 10, guidePoint.y - 10, 21, 21, "#000000"),
    ]);
    await writeFile(scanPath, scan);

    const output = await preprocessScan(scanPath, "a4-cat-v1");
    const pixels = await readPixels(output);

    assert.equal(countOpaqueColor(pixels.data, [0, 0, 0]) > 40, true);
  });
});

test("a4-cat-v1 preserves light pencil marks above the difference threshold", async () => {
  await withTemplateWorkspace(async (workspace) => {
    const scanPath = path.join(workspace, "pencil.png");
    const scan = await addArtwork(await createBlankTemplate(), [
      rectangle(650, 820, 34, 34, "#AAAAAA"),
    ]);
    await writeFile(scanPath, scan);

    const output = await preprocessScan(scanPath, "a4-cat-v1");
    const pixels = await readPixels(output);

    assert.equal(countOpaqueColor(pixels.data, [170, 170, 170]) > 300, true);
  });
});

test("a4-cat-v1 rejects a blank template with a small scanner shift", async () => {
  await withTemplateWorkspace(async (workspace) => {
    const scanPath = path.join(workspace, "shifted-blank.png");
    await writeFile(scanPath, await shiftImage(await createBlankTemplate(), 4, 4));

    await assert.rejects(preprocessScan(scanPath, "a4-cat-v1"), ScanPreprocessError);
  });
});

async function withTemplateWorkspace(run: (workspace: string) => Promise<void>) {
  const workspace = await mkdtemp(path.join(os.tmpdir(), "flash-template-test-"));
  try {
    await run(workspace);
  } finally {
    await rm(workspace, { recursive: true, force: true });
  }
}

async function createBlankTemplate(): Promise<Buffer> {
  return sharp(printableTemplatePath, { density: 150 }).png().toBuffer();
}

function rectangle(x: number, y: number, width: number, height: number, fill: string): Buffer {
  return Buffer.from(
    `<svg width="1240" height="1754" viewBox="0 0 1240 1754" xmlns="http://www.w3.org/2000/svg"><rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}"/></svg>`,
  );
}

async function addArtwork(blankTemplate: Buffer, overlays: Buffer[]): Promise<Buffer> {
  return sharp(blankTemplate).composite(overlays.map((input) => ({ input }))).png().toBuffer();
}

async function findGuidePointInsideAllowedRegion(): Promise<{ x: number; y: number }> {
  const [allowedMask, guideMask] = await Promise.all([
    readTemplatePixels(allowedRegionMaskPath),
    readTemplatePixels(guideStrokeMaskPath),
  ]);
  for (let y = 0; y < allowedMask.height; y += 1) {
    for (let x = 0; x < allowedMask.width; x += 1) {
      const offset = (y * allowedMask.width + x) * 4;
      if (allowedMask.data[offset]! > 128 && guideMask.data[offset]! > 128) return { x, y };
    }
  }
  throw new Error("The template guide does not overlap its allowed drawing region");
}

async function readTemplatePixels(filePath: string): Promise<{ data: Buffer; width: number; height: number }> {
  return readPixels(await sharp(filePath, { density: 150 }).png().toBuffer());
}

async function shiftImage(image: Buffer, horizontal: number, vertical: number): Promise<Buffer> {
  const source = await readPixels(image);
  const shifted = Buffer.alloc(source.data.length, 255);
  for (let y = 0; y < source.height; y += 1) {
    const targetY = y + vertical;
    if (targetY < 0 || targetY >= source.height) continue;
    for (let x = 0; x < source.width; x += 1) {
      const targetX = x + horizontal;
      if (targetX < 0 || targetX >= source.width) continue;
      const sourceOffset = (y * source.width + x) * 4;
      const targetOffset = (targetY * source.width + targetX) * 4;
      source.data.copy(shifted, targetOffset, sourceOffset, sourceOffset + 4);
    }
  }
  return sharp(shifted, { raw: { width: source.width, height: source.height, channels: 4 } }).png().toBuffer();
}

async function readPixels(image: Buffer): Promise<{ data: Buffer; width: number; height: number }> {
  const { data, info } = await sharp(image).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

function countOpaquePixels(pixels: Buffer): number {
  let count = 0;
  for (let offset = 3; offset < pixels.length; offset += 4) {
    if (pixels[offset]! > 0) count += 1;
  }
  return count;
}

function countOpaqueColor(pixels: Buffer, expected: [number, number, number]): number {
  let count = 0;
  for (let offset = 0; offset < pixels.length; offset += 4) {
    if (pixels[offset + 3]! === 0) continue;
    if (pixels[offset] === expected[0] && pixels[offset + 1] === expected[1] && pixels[offset + 2] === expected[2]) {
      count += 1;
    }
  }
  return count;
}
