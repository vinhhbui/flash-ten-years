import { createServer } from "node:http";
import path from "node:path";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { ensureStorage, readSubmissions, uploadsDirectory } from "./storage.js";
import { createSubmissionService } from "./submissionService.js";
import { ingestScan } from "./scanner/ingestScan.js";
import { loadScannerConfig } from "./scanner/scannerConfig.js";
import { startScannerWatcher, type ScannerWatcher } from "./scanner/scannerWatcher.js";
import type { AnimationType, SubmissionInput } from "./types.js";

dotenv.config({ path: path.resolve(import.meta.dirname, "../..", ".env") });

const port = Number(process.env.PORT ?? 3001);
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: true, methods: ["GET", "POST"] } });
const submissionService = createSubmissionService((submission) => io.emit("new_artwork", submission));
let scannerWatcher: ScannerWatcher | undefined;

app.use(cors({ origin: true }));
app.use(express.json({ limit: "12mb" }));
app.use("/uploads", express.static(uploadsDirectory, { fallthrough: false, maxAge: "1h" }));

function parsePngData(value: unknown): Buffer | null {
  if (typeof value !== "string") return null;
  const match = /^data:image\/png;base64,([A-Za-z0-9+/=]+)$/.exec(value);
  if (!match) return null;
  const image = Buffer.from(match[1], "base64");
  const pngSignature = "89504e470d0a1a0a";
  if (image.length < 8 || image.subarray(0, 8).toString("hex") !== pngSignature) return null;
  return image;
}

function parseAnimation(value: unknown): AnimationType | null {
  if (typeof value !== "string") return null;
  const animation = value.trim().toLowerCase();
  return /^[a-z0-9-]{1,48}$/.test(animation) ? animation : null;
}

function parseName(value: unknown): string | undefined | null {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") return null;
  return value.trim().slice(0, 24) || undefined;
}

app.get("/api/health", (_request, response) => response.json({ ok: true }));

app.get("/api/submissions", async (_request, response, next) => {
  try {
    response.json(await readSubmissions());
  } catch (error) {
    next(error);
  }
});

app.post("/api/submissions", async (request, response, next) => {
  try {
    const input = request.body as SubmissionInput;
    const image = parsePngData(input.imageData);
    const animation = parseAnimation(input.animation);
    const name = parseName(input.name);
    if (!image) return response.status(400).json({ error: "Please submit a valid PNG artwork." });
    if (!animation) return response.status(400).json({ error: "Please choose Float or Hop." });
    if (name === null) return response.status(400).json({ error: "Name must be text." });
    if (image.length > 8 * 1024 * 1024) return response.status(413).json({ error: "Artwork is too large. Please try again." });

    const submission = await submissionService.createSubmission({
      image,
      animation,
      idPrefix: "cat",
      ...(name ? { name } : {}),
      frameId: "cat-v1",
      source: "digital",
    });
    return response.status(201).json(submission);
  } catch (error) {
    next(error);
  }
});

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  console.error("Request failed", error);
  response.status(500).json({ error: "The server could not save your cat. Please try again." });
});

async function start() {
  await ensureStorage();
  const scannerConfig = loadScannerConfig();
  scannerWatcher = await startScannerWatcher({
    config: scannerConfig,
    onStableFile: (inputPath) => ingestScan({
      inputPath,
      config: scannerConfig,
      submissionService,
    }),
  });
  httpServer.listen(port, "0.0.0.0", () => {
    console.log(`Memory Cat server is ready on http://0.0.0.0:${port}`);
  });
}

async function shutdown() {
  await scannerWatcher?.close();
  httpServer.close();
}

process.once("SIGINT", () => { void shutdown(); });
process.once("SIGTERM", () => { void shutdown(); });

start().catch((error) => {
  console.error("Memory Cat server could not start", error);
  process.exitCode = 1;
});
