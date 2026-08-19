import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import type { Submission } from "./types.js";

const serverRoot = path.resolve(import.meta.dirname, "..");
export const uploadsDirectory = path.join(serverRoot, "uploads");
const dataDirectory = path.join(serverRoot, "data");
const submissionsFile = path.join(dataDirectory, "submissions.json");
let writeQueue = Promise.resolve();

export async function ensureStorage() {
  await Promise.all([mkdir(uploadsDirectory, { recursive: true }), mkdir(dataDirectory, { recursive: true })]);
  try {
    await readFile(submissionsFile, "utf8");
  } catch (error) {
    if (isMissingFileError(error)) {
      await writeFile(submissionsFile, "[]\n", "utf8");
      return;
    }
    throw error;
  }
}

export async function readSubmissions(): Promise<Submission[]> {
  try {
    const parsed: unknown = JSON.parse(await readFile(submissionsFile, "utf8"));
    if (!Array.isArray(parsed)) {
      throw new Error("Submission metadata must be a JSON array.");
    }
    return parsed as Submission[];
  } catch (error) {
    if (isMissingFileError(error)) return [];
    throw error;
  }
}

export async function appendSubmission(submission: Submission) {
  writeQueue = writeQueue.catch(() => undefined).then(async () => {
    const submissions = await readSubmissions();
    submissions.push(submission);
    const temporaryFile = `${submissionsFile}.tmp`;
    await writeFile(temporaryFile, `${JSON.stringify(submissions, null, 2)}\n`, "utf8");
    await rename(temporaryFile, submissionsFile);
  });
  return writeQueue;
}

export async function saveImage(id: string, image: Buffer) {
  const fileName = `${id}.png`;
  const finalPath = path.join(uploadsDirectory, fileName);
  const temporaryPath = path.join(uploadsDirectory, `.${id}.${crypto.randomUUID()}.tmp`);
  try {
    await writeFile(temporaryPath, image);
    await rename(temporaryPath, finalPath);
  } catch (error) {
    await rm(temporaryPath, { force: true }).catch(() => undefined);
    throw error;
  }
  return `/uploads/${fileName}`;
}

export async function removeSavedImage(id: string) {
  await rm(path.join(uploadsDirectory, `${id}.png`), { force: true });
}

function isMissingFileError(error: unknown): error is NodeJS.ErrnoException {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}
