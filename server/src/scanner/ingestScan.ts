import crypto from "node:crypto";
import { access, copyFile, readFile, rename, rm } from "node:fs/promises";
import path from "node:path";
import { readSubmissions } from "../storage.js";
import type { SubmissionService } from "../submissionService.js";
import type { Submission } from "../types.js";
import type { ScannerConfig } from "./scannerConfig.js";
import { chooseScannerAnimation } from "./scannerConfig.js";
import { preprocessScan } from "./preprocessScan.js";
import { validateScan } from "./scanValidation.js";

export type ScanIngestResult =
  | { status: "accepted"; id: string }
  | { status: "duplicate" }
  | { status: "failed"; reason: string };

export interface IngestScanOptions {
  inputPath: string;
  config: ScannerConfig;
  submissionService: SubmissionService;
  readExistingSubmissions?: () => Promise<Submission[]>;
}

export async function ingestScan({
  inputPath,
  config,
  submissionService,
  readExistingSubmissions = readSubmissions,
}: IngestScanOptions): Promise<ScanIngestResult> {
  const fileName = path.basename(inputPath);
  try {
    console.log(`[scanner] validating ${fileName}`);
    await validateScan(inputPath, config.maxFileBytes);
    const sourceHash = await retryTransient(() => calculateHash(inputPath));
    const knownSubmissions = await retryTransient(readExistingSubmissions);
    if (knownSubmissions.some((submission) => submission.sourceHash === sourceHash)) {
      await retryTransient(() => moveScan(inputPath, config.archiveDirectory));
      console.log(`[scanner] duplicate ${fileName} → archived without broadcast`);
      return { status: "duplicate" };
    }

    const image = await retryTransient(() => preprocessScan(inputPath));
    const submission = await retryTransient(() => submissionService.createSubmission({
      image,
      animation: chooseScannerAnimation(config),
      idPrefix: "scan",
      frameId: config.defaultFrameId,
      source: "scanner",
      sourceHash,
      originalFileName: fileName,
    }));
    console.log(`[scanner] accepted ${submission.id}`);
    console.log("[scanner] emitted new_artwork");

    try {
      await retryTransient(() => moveScan(inputPath, config.archiveDirectory));
      console.log(`[scanner] archived ${fileName}`);
    } catch (error) {
      console.error(`[scanner:error] ${fileName} was accepted but could not be archived: ${describeError(error)}`);
    }
    return { status: "accepted", id: submission.id };
  } catch (error) {
    const reason = describeError(error);
    try {
      await retryTransient(() => moveScan(inputPath, config.failedDirectory));
      console.error(`[scanner:error] ${fileName} ${reason} → moved to failed`);
    } catch (moveError) {
      console.error(`[scanner:error] ${fileName} ${reason}; could not move to failed: ${describeError(moveError)}`);
    }
    return { status: "failed", reason };
  }
}

async function calculateHash(inputPath: string): Promise<string> {
  const contents = await readFile(inputPath);
  return crypto.createHash("sha256").update(contents).digest("hex");
}

async function moveScan(sourcePath: string, destinationDirectory: string): Promise<string> {
  const destinationPath = await findAvailableDestination(destinationDirectory, path.basename(sourcePath));
  try {
    await rename(sourcePath, destinationPath);
  } catch (error) {
    if (!isCrossDeviceError(error)) throw error;
    await copyFile(sourcePath, destinationPath);
    await rm(sourcePath);
  }
  return destinationPath;
}

async function findAvailableDestination(directory: string, fileName: string): Promise<string> {
  const parsed = path.parse(fileName);
  for (let attempt = 0; ; attempt += 1) {
    const suffix = attempt === 0 ? "" : `-${attempt}`;
    const candidate = path.join(directory, `${parsed.name}${suffix}${parsed.ext}`);
    try {
      await access(candidate);
    } catch (error) {
      if (isMissingFileError(error)) return candidate;
      throw error;
    }
  }
}

async function retryTransient<T>(operation: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt + 1 < attempts) await delay(250 * (attempt + 1));
    }
  }
  throw lastError;
}

function delay(milliseconds: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, milliseconds));
}

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function isMissingFileError(error: unknown): error is NodeJS.ErrnoException {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}

function isCrossDeviceError(error: unknown): error is NodeJS.ErrnoException {
  return typeof error === "object" && error !== null && "code" in error && error.code === "EXDEV";
}
