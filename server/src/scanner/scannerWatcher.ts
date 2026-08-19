import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import chokidar, { type FSWatcher } from "chokidar";
import type { ScannerConfig } from "./scannerConfig.js";
import { ensureScannerDirectories } from "./scannerConfig.js";
import { isSupportedScanPath } from "./scanValidation.js";

export interface ScannerWatcher {
  close(): Promise<void>;
}

export interface StartScannerWatcherOptions {
  config: ScannerConfig;
  onStableFile(inputPath: string): Promise<unknown>;
}

export async function startScannerWatcher({ config, onStableFile }: StartScannerWatcherOptions): Promise<ScannerWatcher> {
  await ensureScannerDirectories(config);
  const processingPaths = new Set<string>();
  let processingQueue = Promise.resolve();
  const watcher = chokidar.watch(config.inputDirectory, {
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 1000,
      pollInterval: 100,
    },
    ignorePermissionErrors: true,
  });

  const queueFile = (candidatePath: string) => {
    const inputPath = path.resolve(candidatePath);
    const processingKey = inputPath.toLocaleLowerCase();
    if (!isSupportedScanPath(inputPath) || processingPaths.has(processingKey)) return;
    processingPaths.add(processingKey);
    processingQueue = processingQueue
      .catch(() => undefined)
      .then(async () => {
        console.log(`[scanner] detected ${path.basename(inputPath)}`);
        console.log(`[scanner] processing ${path.basename(inputPath)}`);
        await onStableFile(inputPath);
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[scanner:error] ${path.basename(inputPath)} ${message}`);
      })
      .finally(() => processingPaths.delete(processingKey));
  };

  watcher.on("add", queueFile);
  watcher.on("error", (error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[scanner:error] watcher ${message}`);
  });
  await waitForWatcherReady(watcher);
  console.log(`[scanner] watching ${config.inputDirectory}`);

  for (const existingPath of await listExistingScans(config.inputDirectory)) {
    queueFile(existingPath);
  }

  return { close: () => watcher.close() };
}

async function listExistingScans(inputDirectory: string): Promise<string[]> {
  const entries = await readdir(inputDirectory, { withFileTypes: true });
  const files = await Promise.all(entries
    .filter((entry) => entry.isFile() && isSupportedScanPath(entry.name))
    .map(async (entry) => {
      const filePath = path.join(inputDirectory, entry.name);
      const details = await stat(filePath);
      return { filePath, modifiedAt: details.mtimeMs };
    }));
  return files
    .sort((left, right) => left.modifiedAt - right.modifiedAt || left.filePath.localeCompare(right.filePath))
    .map((file) => file.filePath);
}

function waitForWatcherReady(watcher: FSWatcher): Promise<void> {
  return new Promise((resolve) => watcher.once("ready", resolve));
}
