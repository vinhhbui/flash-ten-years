# FLASH 10 — Scanner → Live Wall Event Workflow

## 0. Status and priority

This document defines the **current event input workflow** for the FLASH 10 interactive memory wall.

For this iteration, this file **supersedes the phone `/create` submission flow described in `INSTRUCTIONS.md`** whenever the two documents conflict.

The existing Live Wall, animation system, storage model, and Socket.IO delivery should be reused as much as possible. The main architectural change is the source of artwork:

> **OLD:** phone drawing → HTTP submit → server → Live Wall
>
> **CURRENT:** paper drawing → scanner → watched folder → automatic ingestion → server → Live Wall

Do not rebuild working parts of the wall unless the scanner workflow requires a small compatible refactor.

---

# 1. Codex mission

Turn the current prototype into a reliable **event-local scanner ingestion system**.

At the event, a guest decorates a physical paper template. Event staff scans the finished paper using a scanner connected to the same Windows laptop that runs the application. The scanner software saves a PNG into a configured folder. The application automatically detects the new file, waits until the scanner has completely finished writing it, validates it, registers it as a new artwork submission, and immediately makes it appear on the fullscreen Live Wall.

The intended experience is:

```text
Guest finishes drawing on paper
        ↓
Staff scans the paper
        ↓
Scanner saves PNG into watched folder
        ↓
Server detects new PNG automatically
        ↓
Wait until file write is complete
        ↓
Validate + ingest + assign metadata
        ↓
Store artwork in server/uploads
        ↓
Append submission metadata
        ↓
Socket.IO emits new_artwork
        ↓
Live Wall shows the artwork automatically
        ↓
Artwork starts its animation
```

No refresh, manual upload, drag-and-drop, or phone submission should be required during normal event operation.

---

# 2. Primary product principle

The event operator should only need to do two things:

1. scan the finished paper;
2. keep the Live Wall open.

Everything between the scanner output and the Live Wall must happen automatically.

The system should be optimized for **simplicity, observability, recoverability, and event reliability**, not for cloud scale.

This is a local event workflow. Avoid introducing cloud storage, queues, databases, authentication systems, AI services, or complex infrastructure unless clearly required later.

---

# 3. Scope decision

## In scope now

- Scanner connected to event laptop
- Scanner software outputs PNG files
- Configurable scanner inbox folder
- Automatic folder watching
- Detect newly created PNG files
- Wait for file to become stable before reading it
- PNG validation
- Duplicate protection
- Automatic ingestion into the existing submission system
- Copy processed artwork into `server/uploads/`
- Persist submission metadata
- Broadcast `new_artwork` through the existing Socket.IO channel
- Live Wall updates without refresh
- Automatic animation assignment
- Processed/archive folder
- Failed/quarantine folder
- Useful terminal logs for event staff
- Restart-safe behavior
- A simple scanner status / operator page if it can be added without delaying the core workflow
- Windows-first local event setup documentation

## Explicitly out of scope for this iteration

- Phone upload
- Guest upload from personal devices
- QR upload
- `/create` as the primary event flow
- Cloud upload
- User accounts
- Authentication
- AI image generation
- AI moderation
- OCR
- Face detection
- Complex image segmentation
- Scanner hardware control through TWAIN/WIA
- Automatically pressing the scanner's Scan button
- Remote scanner management
- Production database
- Multi-location synchronization

Important: **The application does not need to control the scanner hardware.** The scanner vendor software may handle scanning. Our responsibility starts when a PNG appears in the watched folder.

---

# 4. Existing system to preserve

The repository already contains a useful submission pipeline:

```text
Submission
    ↓
server/uploads/
    ↓
server/data/submissions.json
    ↓
Socket.IO event: new_artwork
    ↓
/wall
```

Reuse this contract rather than creating a second parallel wall system.

The scanner ingestion module should ultimately produce the same `Submission` shape consumed by the Live Wall.

Do not duplicate wall state or create a second metadata store for scanner submissions.

---

# 5. Event folder model

Use one configurable scanner workspace.

Recommended default structure:

```text
flash-ten-years/
├── event-data/
│   └── scanner/
│       ├── inbox/
│       ├── archive/
│       └── failed/
│
├── server/
│   ├── uploads/
│   └── data/
│       └── submissions.json
```

Meaning:

```text
inbox/
    Scanner software writes new PNG files here.

archive/
    Successfully ingested source scans are moved here.

failed/
    Invalid or unprocessable scans are moved here.

server/uploads/
    Application-owned copies that are served to the Live Wall.
```

Do not serve files directly from `inbox/`.

The scanner folder path must be configurable because real scanner software may save somewhere outside the repository.

Example environment variable:

```env
SCAN_INPUT_DIR=C:\FLASH10\scanner\inbox
```

If unset, use the repository-local development folder:

```text
event-data/scanner/inbox
```

Also support configurable archive and failed folders, or derive them safely from the scanner workspace.

Never hardcode one developer-specific Windows username or drive path.

---

# 6. Scanner ingestion architecture

Create a dedicated scanner ingestion module instead of putting all watcher logic directly inside `server/src/index.ts`.

Recommended structure:

```text
server/src/
├── index.ts
├── storage.ts
├── types.ts
├── scanner/
│   ├── scannerWatcher.ts
│   ├── ingestScan.ts
│   ├── scanValidation.ts
│   └── scannerConfig.ts
```

Responsibilities:

## `scannerConfig.ts`

- resolve scanner inbox path
- resolve archive path
- resolve failed path
- read scanner-related environment variables
- create required directories
- expose animation assignment policy

## `scannerWatcher.ts`

- watch the scanner inbox
- react only to supported files
- ignore temporary files
- wait until writes are complete
- send stable files to `ingestScan`
- prevent simultaneous duplicate processing
- log watcher status

## `scanValidation.ts`

- confirm extension is `.png`
- confirm PNG magic bytes
- confirm file is non-empty
- reject unreasonable file sizes
- optionally verify the image can be decoded if a lightweight image library is later added

## `ingestScan.ts`

- create unique submission ID
- determine final upload filename
- copy the scan into `server/uploads/`
- construct `Submission`
- persist metadata using existing storage helpers
- emit `new_artwork`
- move original scan to archive only after successful persistence
- move bad scan to failed folder on permanent failure

Keep file watching, validation, storage, and realtime delivery separated enough to test independently.

---

# 7. File watcher requirements

Prefer a mature file watcher such as `chokidar` rather than implementing fragile polling from scratch.

Recommended behavior:

```ts
watch(inbox, {
  ignoreInitial: false,
  awaitWriteFinish: {
    stabilityThreshold: 1000,
    pollInterval: 100,
  },
});
```

Exact values may be adjusted after testing with the real scanner.

The watcher must handle the common scanner behavior where the target PNG filename appears before the scanner has finished writing all bytes.

Do not ingest immediately on the first raw filesystem notification.

Required supported extensions for now:

```text
.png
.PNG
```

Ignore common temporary files such as:

```text
.tmp
.part
.crdownload
~*
```

JPEG support can be added later only if the real scanner cannot reliably output PNG.

---

# 8. Restart-safe behavior

The system must not assume that it was running at the exact moment the scanner produced the file.

On server startup:

1. ensure scanner directories exist;
2. start the watcher;
3. inspect existing unprocessed PNG files in the inbox;
4. ingest them in deterministic order, preferably oldest first;
5. skip any file already known to have been processed.

This makes recovery from an accidental server restart possible without manually rescanning artwork.

---

# 9. Duplicate protection

Duplicate artwork appearing twice on the wall is undesirable during the event.

Do not rely only on filename because scanner software may reuse or rename files.

Minimum deduplication strategy:

- keep an in-memory `processing` set for paths currently being handled;
- calculate a content hash such as SHA-256 for the stable PNG;
- persist the source hash in submission metadata;
- before ingesting, check whether the same hash has already been registered;
- if already processed, archive the duplicate source file without emitting another `new_artwork`.

Extend the shared model safely:

```ts
type SubmissionSource = "digital" | "scanner";

interface Submission {
  id: string;
  name?: string;
  image: string;
  animation: "float" | "hop";
  createdAt: string;
  source?: SubmissionSource;
  sourceHash?: string;
  originalFileName?: string;
}
```

Keep the new fields optional so old submissions continue to load.

Do not break existing saved JSON data.

---

# 10. Animation assignment for scanned artwork

Because the guest is no longer choosing an animation on a phone, the server must assign one automatically.

Support this environment setting:

```env
SCAN_ANIMATION_MODE=random
```

Allowed values:

```text
random
float
hop
```

Behavior:

- `random`: select `float` or `hop` per new scan
- `float`: every new scan uses Float
- `hop`: every new scan uses Hop

Default:

```text
random
```

Keep this policy isolated in scanner config so it can later be replaced by more animation types without changing the ingestion pipeline.

---

# 11. Naming policy

Do not require the event operator to type a guest name for every scan.

For scanner submissions:

```ts
name = undefined
```

is valid.

Use a generated internal ID such as:

```text
scan_<uuid>
```

The original scanner filename should be metadata only and should not be exposed as the primary identity on the wall.

---

# 12. Atomic ingestion rule

A scan must be considered successfully ingested only after **all required steps** succeed.

Recommended transaction-like order:

```text
1. stable source file found
2. validate source
3. calculate hash
4. verify not duplicate
5. copy to a temporary upload filename
6. rename temporary upload to final upload filename
7. append submission metadata
8. emit new_artwork
9. archive original source scan
```

If an error occurs before metadata persistence:

- do not emit `new_artwork`;
- do not leave an incomplete final upload if it can be cleaned safely;
- retry transient errors a small number of times;
- move permanently failing source scans to `failed/`;
- log the reason clearly.

The wall should never receive metadata pointing to a file that does not exist.

---

# 13. Image preprocessing boundary

For the first scanner integration, prioritize proving transport and realtime behavior.

Initial accepted implementation:

```text
scanner PNG
    ↓
validate
    ↓
copy as-is
    ↓
Live Wall
```

Do **not** block the scanner integration on advanced paper extraction.

However, put preprocessing behind one function boundary so it can be added later:

```ts
async function preprocessScan(inputPath: string): Promise<Buffer>
```

Version 1 may simply return the original PNG bytes.

Future versions may add:

- auto crop
- background removal
- perspective correction
- template region detection
- white-paper cleanup
- transparent background conversion
- sticker-outline generation

Do not implement these future items unless separately requested.

---

# 14. Live Wall behavior

The Live Wall should continue using the existing realtime event:

```text
new_artwork
```

No scanner-specific wall socket event is needed.

A scanner submission should behave exactly like a normal wall submission after ingestion:

```text
new scan arrives
    ↓
image preload
    ↓
spawn/pop entrance
    ↓
assigned Float or Hop animation begins
```

The wall must also restore scanner submissions after refresh from `GET /api/submissions`.

Do not create a separate `/scanner-wall` route.

---

# 15. Event operator visibility

Terminal logs must be understandable during the event.

Use short structured messages such as:

```text
[scanner] watching C:\FLASH10\scanner\inbox
[scanner] detected IMG_0042.png
[scanner] waiting for file to finish writing
[scanner] processing IMG_0042.png
[scanner] accepted scan_abcd1234
[scanner] broadcast new_artwork
[scanner] archived IMG_0042.png
```

Error example:

```text
[scanner:error] IMG_0043.png invalid PNG signature → moved to failed
```

Avoid flooding the terminal with raw filesystem events.

Optional P1 improvement: add an operator route such as `/operator` showing:

- watcher online/offline
- watched folder path
- last processed filename
- last processed time
- accepted count
- failed count
- recent scanner events

This page is for event staff, not guests.

Do not make `/operator` a blocker for the core flow.

---

# 16. Event mode and `/create`

The current event workflow intentionally removes guest phone uploads.

Do not spend time extending the `/create` page.

Preferred behavior for this iteration:

- keep existing `/create` source code if removing it risks regressions;
- do not advertise `/create` in event instructions;
- make `/wall` + scanner ingestion the supported production-like event flow;
- optionally add an environment flag later if switching between digital and scanner input becomes useful.

Possible future flag:

```env
EVENT_INPUT_MODE=scanner
```

Do not build a complex feature-flag system now.

---

# 17. Configuration

Recommended `.env.example` additions:

```env
PORT=3001

# Scanner integration
SCAN_INPUT_DIR=./event-data/scanner/inbox
SCAN_ARCHIVE_DIR=./event-data/scanner/archive
SCAN_FAILED_DIR=./event-data/scanner/failed
SCAN_ANIMATION_MODE=random
SCAN_MAX_FILE_MB=25
```

Resolve relative paths relative to a clearly documented project/server working directory.

Log the final resolved scanner path on startup.

Do not commit real event machine absolute paths into Git.

---

# 18. Recommended dependencies

Add only what is necessary.

Expected new dependency:

```text
chokidar
```

Do not add a database or message broker.

Avoid introducing image-processing dependencies until preprocessing is actually required.

---

# 19. Implementation phases

Implement in this order.

| Phase | Priority | Work | Exit condition |
|---|---:|---|---|
| 0 | P0 | Refactor submission creation so HTTP and scanner can reuse storage/broadcast logic | Existing wall flow still works |
| 1 | P0 | Scanner config + folder creation | Server starts and prints resolved watcher path |
| 2 | P0 | Watch inbox for stable PNG files | New completed PNG is detected once |
| 3 | P0 | Validate + hash + dedupe | Invalid/duplicate files do not create duplicate wall items |
| 4 | P0 | Ingest scan into uploads + metadata | New scan survives refresh via GET submissions |
| 5 | P0 | Emit existing `new_artwork` event | Wall shows scan without refresh |
| 6 | P0 | Archive/failed handling | Inbox stays operational after successes/failures |
| 7 | P0 | Restart recovery | PNG left in inbox while server was off is ingested after restart |
| 8 | P1 | Event logs + config docs | Operator can diagnose basic problems quickly |
| 9 | P1 | Optional `/operator` status page | Watcher state visible without reading terminal |
| 10 | P1 | Physical scanner test | Real scanner → folder → wall works repeatedly |

Do not start visual polish before P0 scanner reliability works.

---

# 20. Detailed acceptance test

The scanner workflow is complete only when this physical-style test passes:

## Test A — normal scan

1. start the application;
2. open `/wall` fullscreen;
3. copy or scan `test-cat-01.png` into the watched folder;
4. server detects it automatically;
5. no button is pressed in the web UI;
6. one new Submission is stored;
7. one `new_artwork` event is emitted;
8. artwork appears on wall without refresh;
9. source scan moves to archive;
10. refreshing wall restores the artwork.

## Test B — slow file write

Simulate a PNG being written gradually or copied slowly.

Expected:

- watcher does not ingest the half-written file;
- only one valid submission appears after the file becomes stable.

## Test C — duplicate

Put the same PNG content into inbox twice with different filenames.

Expected:

- only the first creates a Live Wall submission;
- second is recognized as duplicate;
- no duplicate `new_artwork` emission.

## Test D — invalid file

Rename a non-PNG file to `.png` and place it in inbox.

Expected:

- no Live Wall item is created;
- file is moved to `failed/`;
- useful error is logged;
- watcher continues running.

## Test E — server restart

1. stop the server;
2. place a valid PNG in inbox;
3. restart the server.

Expected:

- existing inbox file is detected and processed automatically.

## Test F — burst scans

Place 5–10 valid PNG files into inbox within a short period.

Expected:

- every unique file is processed exactly once;
- metadata remains valid JSON;
- wall receives all accepted submissions;
- server does not crash.

---

# 21. Real event operating procedure

Document this in README after implementation.

Expected event startup:

```text
1. Connect scanner to Windows laptop.
2. Configure scanner software to output PNG.
3. Configure scanner output directory = SCAN_INPUT_DIR.
4. Start FLASH 10 app.
5. Verify terminal says scanner watcher is online.
6. Open /wall on projector/display.
7. Make one test scan.
8. Confirm it appears on wall.
9. Begin event.
```

Expected per guest:

```text
Guest decorates paper
        ↓
Staff inserts paper into scanner
        ↓
Staff scans
        ↓
Done
```

No guest phone setup is part of the event SOP for this version.

---

# 22. Failure recovery during event

Design for fast operator recovery.

## If a scan does not appear

Operator checks:

1. did scanner software actually create a PNG?
2. is it in the configured inbox?
3. is watcher online?
4. is the file still being written?
5. did it move to `failed/`?
6. is the wall socket connected?

A failed scan should never stop future scans from being processed.

## If the app restarts

- submissions already stored remain available;
- wall restores them from metadata;
- unprocessed files remaining in inbox are processed on startup.

## If scanner software generates the same filename repeatedly

The ingestion system must still create unique application filenames and use content hashes for deduplication.

---

# 23. Code quality rules for Codex

- Keep TypeScript strict enough to catch path and payload errors.
- Reuse existing storage and Socket.IO contracts.
- Avoid one giant `index.ts` implementation.
- Keep scanner watcher lifecycle explicit.
- Clean up watcher resources on process shutdown if practical.
- Do not swallow scanner errors silently.
- Do not emit wall events before persistence succeeds.
- Do not assume Windows paths use `/` only.
- Use Node `path` APIs for path handling.
- Never trust only a `.png` extension; validate magic bytes.
- Do not process the same source concurrently.
- Preserve backwards compatibility with existing `submissions.json`.

---

# 24. Definition of Done

This iteration is done when all statements below are true:

- [ ] Scanner can save PNG into a configured folder.
- [ ] Server automatically watches that folder.
- [ ] Server waits for the scan file to finish writing.
- [ ] Valid PNG is ingested without web UI interaction.
- [ ] Invalid PNG does not crash the watcher.
- [ ] Duplicate PNG does not create duplicate wall art.
- [ ] Ingested image is stored under application-owned uploads.
- [ ] Submission metadata is persisted.
- [ ] Existing `new_artwork` Socket.IO event is reused.
- [ ] `/wall` shows new scan without refresh.
- [ ] `/wall` restores scans after refresh.
- [ ] Successful source file is archived.
- [ ] Permanent failure is quarantined in `failed/`.
- [ ] Existing inbox files are recovered after server restart.
- [ ] Animation is assigned automatically.
- [ ] Phone upload is not required for event operation.
- [ ] README contains the Windows scanner setup and event SOP.
- [ ] A real or realistic scanner test succeeds several times in a row.

---

# 25. Final instruction to Codex

Before coding:

1. inspect the existing server storage helpers, shared submission types, Socket.IO setup, and `/wall` consumption;
2. identify the smallest refactor that allows scanner ingestion to reuse the same submission persistence and broadcast path;
3. write a short implementation plan mapped to the phases above;
4. then implement P0 phases in order;
5. run existing checks/builds after each meaningful refactor;
6. do not redesign the landing page or drawing editor as part of this task;
7. stop scope creep into AI/image processing until the basic scanner pipeline is physically reliable.

The core success metric is simple:

> **A PNG appears in the scanner folder, and a few moments later that artwork is alive on the Live Wall—with no manual upload step.**
