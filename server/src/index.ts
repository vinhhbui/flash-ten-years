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

dotenv.config({ path: path.resolve(import.meta.dirname, "../..", ".env") });

const port = Number(process.env.PORT ?? 3001);
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: true, methods: ["GET"] } });
const submissionService = createSubmissionService((submission) => io.emit("new_artwork", submission));
let scannerWatcher: ScannerWatcher | undefined;

app.use(cors({ origin: true }));
app.use(express.json());
app.use("/uploads", express.static(uploadsDirectory, { fallthrough: false, maxAge: "1h" }));

app.get("/api/health", (_request, response) => response.json({ ok: true }));

app.get("/api/submissions", async (_request, response, next) => {
  try {
    response.json(await readSubmissions());
  } catch (error) {
    next(error);
  }
});

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  console.error("Request failed", error);
  response.status(500).json({ error: "The server could not complete the request." });
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
