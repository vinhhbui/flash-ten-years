import { mkdir } from "node:fs/promises";
import path from "node:path";

export interface ScannerConfig {
  inputDirectory: string;
  archiveDirectory: string;
  failedDirectory: string;
  animationMode: string;
  animationIds: string[];
  maxFileBytes: number;
  defaultFrameId: string;
  preprocessProfile: string;
}

const projectRoot = path.resolve(import.meta.dirname, "../../..");
const defaultAnimationIds = ["float", "hop"];

export function loadScannerConfig(environment = process.env): ScannerConfig {
  const inputDirectory = resolveDirectory(
    environment.SCAN_INPUT_DIR,
    path.join(projectRoot, "event-data", "scanner", "inbox"),
  );
  const workspaceDirectory = path.dirname(inputDirectory);
  const archiveDirectory = resolveDirectory(
    environment.SCAN_ARCHIVE_DIR,
    path.join(workspaceDirectory, "archive"),
  );
  const failedDirectory = resolveDirectory(
    environment.SCAN_FAILED_DIR,
    path.join(workspaceDirectory, "failed"),
  );
  const animationMode = normalizeAnimationId(environment.SCAN_ANIMATION_MODE) ?? "random";
  const animationIds = parseAnimationIds(environment.SCAN_ANIMATION_IDS);

  return {
    inputDirectory,
    archiveDirectory,
    failedDirectory,
    animationMode,
    animationIds,
    maxFileBytes: parseMaxFileBytes(environment.SCAN_MAX_FILE_MB),
    defaultFrameId: normalizeAnimationId(environment.SCAN_DEFAULT_FRAME_ID) ?? "cat-v1",
    preprocessProfile: normalizeAnimationId(environment.SCAN_PREPROCESS_PROFILE) ?? "a4-cat-v1",
  };
}

export async function ensureScannerDirectories(config: ScannerConfig) {
  const directories = [config.inputDirectory, config.archiveDirectory, config.failedDirectory];
  if (new Set(directories.map((directory) => directory.toLocaleLowerCase())).size !== directories.length) {
    throw new Error("Scanner inbox, archive, and failed directories must be different.");
  }
  await Promise.all(directories.map((directory) => mkdir(directory, { recursive: true })));
}

export function chooseScannerAnimation(config: ScannerConfig, random = Math.random): string {
  if (config.animationMode !== "random") return config.animationMode;
  return config.animationIds[Math.floor(random() * config.animationIds.length)] ?? "float";
}

function resolveDirectory(value: string | undefined, fallback: string): string {
  const configuredValue = value?.trim();
  return path.resolve(projectRoot, configuredValue || fallback);
}

function parseMaxFileBytes(value: string | undefined): number {
  const sizeInMegabytes = Number(value ?? 25);
  if (!Number.isFinite(sizeInMegabytes) || sizeInMegabytes <= 0) return 25 * 1024 * 1024;
  return Math.floor(sizeInMegabytes * 1024 * 1024);
}

function parseAnimationIds(value: string | undefined): string[] {
  const configuredIds = value
    ?.split(",")
    .map((id) => normalizeAnimationId(id))
    .filter((id): id is string => Boolean(id));
  return configuredIds?.length ? [...new Set(configuredIds)] : defaultAnimationIds;
}

function normalizeAnimationId(value: string | undefined): string | undefined {
  const normalized = value?.trim().toLowerCase();
  return normalized && /^[a-z0-9-]{1,48}$/.test(normalized) ? normalized : undefined;
}
