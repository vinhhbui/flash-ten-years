import { createServer } from "node:http";
import crypto from "node:crypto";
import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { appendSubmission, ensureStorage, readSubmissions, saveImage, uploadsDirectory } from "./storage.js";
import type { AnimationType, Submission, SubmissionInput } from "./types.js";

const port = Number(process.env.PORT ?? 3001);
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: true, methods: ["GET", "POST"] } });

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
  return value === "float" || value === "hop" ? value : null;
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

    const id = `cat_${crypto.randomUUID()}`;
    const submission: Submission = {
      id,
      ...(name ? { name } : {}),
      image: await saveImage(id, image),
      animation,
      createdAt: new Date().toISOString(),
    };
    await appendSubmission(submission);
    io.emit("new_artwork", submission);
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
  httpServer.listen(port, "0.0.0.0", () => {
    console.log(`Memory Cat server is ready on http://0.0.0.0:${port}`);
  });
}

start().catch((error) => {
  console.error("Memory Cat server could not start", error);
  process.exitCode = 1;
});
