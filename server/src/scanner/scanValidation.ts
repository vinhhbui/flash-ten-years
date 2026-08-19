import { open, stat } from "node:fs/promises";
import path from "node:path";

const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

export class ScanValidationError extends Error {}

export interface ValidatedScan {
  fileName: string;
  size: number;
}

export async function validateScan(inputPath: string, maxFileBytes: number): Promise<ValidatedScan> {
  const fileName = path.basename(inputPath);
  if (path.extname(fileName).toLowerCase() !== ".png") {
    throw new ScanValidationError("unsupported file extension");
  }

  const details = await stat(inputPath);
  if (!details.isFile()) throw new ScanValidationError("scan is not a file");
  if (details.size === 0) throw new ScanValidationError("scan is empty");
  if (details.size > maxFileBytes) {
    throw new ScanValidationError(`scan exceeds the ${Math.floor(maxFileBytes / 1024 / 1024)} MB limit`);
  }

  const handle = await open(inputPath, "r");
  try {
    const signature = Buffer.alloc(pngSignature.length);
    const { bytesRead } = await handle.read(signature, 0, signature.length, 0);
    if (bytesRead !== pngSignature.length || !signature.equals(pngSignature)) {
      throw new ScanValidationError("invalid PNG signature");
    }
  } finally {
    await handle.close();
  }

  return { fileName, size: details.size };
}

export function isSupportedScanPath(filePath: string): boolean {
  return path.extname(filePath).toLowerCase() === ".png" && !isTemporaryScanPath(filePath);
}

export function isTemporaryScanPath(filePath: string): boolean {
  const fileName = path.basename(filePath).toLowerCase();
  return fileName.startsWith("~")
    || fileName.endsWith(".tmp")
    || fileName.endsWith(".part")
    || fileName.endsWith(".crdownload");
}
