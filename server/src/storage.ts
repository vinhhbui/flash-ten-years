import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
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
  } catch {
    await writeFile(submissionsFile, "[]\n", "utf8");
  }
}

export async function readSubmissions(): Promise<Submission[]> {
  try {
    const parsed: unknown = JSON.parse(await readFile(submissionsFile, "utf8"));
    return Array.isArray(parsed) ? parsed as Submission[] : [];
  } catch {
    return [];
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
  await writeFile(path.join(uploadsDirectory, fileName), image);
  return `/uploads/${fileName}`;
}
