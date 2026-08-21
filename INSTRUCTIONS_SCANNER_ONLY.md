# FLASH 10 — Scanner-Only Event Input

## Status

This document is the current source of truth for how new artwork enters the FLASH 10 Live Wall.

It supersedes any older instruction that treats `/create`, phone upload, browser drawing, or `POST /api/submissions` as an active event workflow.

## Product decision

There is only one supported input path during the event:

```text
Guest decorates physical paper template
        ↓
Event staff scans the paper
        ↓
Scanner software saves PNG into the configured scanner inbox
        ↓
Folder watcher detects a stable completed file
        ↓
Validate + hash + deduplicate
        ↓
Optional preprocessing boundary
        ↓
Create Submission through submissionService
        ↓
Persist image + metadata
        ↓
Emit new_artwork through Socket.IO
        ↓
Live Wall displays the artwork automatically
```

The website is no longer an artwork creation/upload interface.

## Removed product surface

The following are no longer part of the supported product:

- `/create` page
- browser drawing flow
- phone upload flow
- guest file picker / drag-and-drop upload
- animation selection by the guest before submission
- client-side `submitArtwork()`
- public `POST /api/submissions` digital-ingestion endpoint
- CREATE CTA in the landing navigation

Do not reintroduce any of these unless the product decision changes explicitly.

## What must remain

Keep and reuse the existing wall pipeline:

- `server/src/scanner/*`
- `submissionService`
- `server/uploads/`
- `server/data/submissions.json`
- `GET /api/submissions`
- Socket.IO event `new_artwork`
- `/wall`
- existing wall animation/rendering system

Scanner ingestion must create the same Submission model already consumed by the wall. Do not create a separate scanner-specific wall state or API.

## Scanner responsibility boundary

The application does not need to operate scanner hardware through TWAIN/WIA.

Scanner vendor software is responsible for acquiring the paper scan and saving the resulting file. The FLASH 10 application starts working only after a PNG appears in the configured inbox.

Recommended configuration:

```env
SCAN_INPUT_DIR=./event-data/scanner/inbox
SCAN_ARCHIVE_DIR=./event-data/scanner/archive
SCAN_FAILED_DIR=./event-data/scanner/failed
SCAN_ANIMATION_MODE=random
SCAN_MAX_FILE_MB=25
```

On the event laptop, `SCAN_INPUT_DIR` may be an absolute Windows path such as:

```env
SCAN_INPUT_DIR=C:\FLASH10\scanner\inbox
```

Never commit a developer-specific absolute path.

## Required runtime behavior

The scanner watcher must:

1. watch the configured inbox;
2. accept only supported completed scan files;
3. wait until the file is stable before reading;
4. validate the PNG;
5. calculate a content hash;
6. reject duplicate content without creating a second wall item;
7. preprocess through one isolated function boundary;
8. create a Submission through the shared submission service;
9. persist the result before broadcasting;
10. emit `new_artwork` exactly once for an accepted scan;
11. archive successful source scans;
12. quarantine permanent failures;
13. recover unprocessed inbox files after a server restart.

The event operator should not need to press any button in the web app after scanning.

## Submission policy

New event submissions should use:

```text
source = scanner
```

Old `source = digital` records may remain readable for backward compatibility with existing saved data, but no new digital submissions should be created by the application.

Guest name is optional. Scanner filename is metadata only and must not become the primary identity displayed on the wall.

Animation is assigned automatically by the server according to `SCAN_ANIMATION_MODE`.

## Image preprocessing boundary

Keep preprocessing isolated behind a function such as:

```ts
async function preprocessScan(inputPath: string): Promise<Buffer>
```

Current scanner transport must not depend on advanced computer vision.

Future preprocessing may include:

- paper/template crop
- perspective correction
- marker/template ID detection
- white background cleanup
- transparent background extraction
- shape extraction
- sticker outline generation
- frame/template mapping

These features should be added inside or behind the preprocessing layer without changing scanner watching, persistence, Socket.IO delivery, or wall rendering contracts.

## UI behavior

Supported public routes:

```text
/       landing experience
/wall   live wall
```

The landing page may link to `/wall`, but it must not expose a CREATE/upload action.

Unknown routes may return to `/`.

## API behavior

The browser-facing API is read-only for submissions:

```text
GET /api/health
GET /api/submissions
GET /uploads/*
```

Do not expose a public browser endpoint that can create artwork while scanner-only mode is the product decision.

New submissions originate from the server-side scanner ingestion process.

## Event operating workflow

```text
1. Start the server.
2. Confirm scanner watcher logs the resolved inbox path.
3. Open /wall fullscreen on the event display.
4. Configure scanner software to save PNG files into SCAN_INPUT_DIR.
5. Scan a completed guest paper.
6. Confirm the scan is detected and accepted.
7. Confirm the artwork appears on /wall without refresh.
8. Confirm the source scan moves to archive.
```

If a scan fails, the operator should be able to identify the reason from short scanner logs and find the source file in the failed/quarantine folder.

## Acceptance criteria

Scanner-only mode is complete when all of these are true:

- `/create` is not an active application page.
- The landing page has no CREATE CTA.
- The client has no active artwork submission request.
- `POST /api/submissions` is not available for digital upload.
- A PNG saved into the scanner inbox creates exactly one Submission.
- The new artwork appears on `/wall` without refresh.
- Refreshing `/wall` restores the scanner submission from persisted metadata.
- Duplicate scan content does not create duplicate wall items.
- A server restart does not lose valid scans left in the inbox.
- Existing wall animation and rendering behavior continues to work.

## Codex guardrail

When working on this project, treat scanner ingestion as the only supported artwork creation path. Do not spend implementation time rebuilding or polishing the old `/create` experience. Any future work involving new template shapes, marker IDs, image extraction, or animation types should extend the scanner preprocessing/submission pipeline rather than restoring browser upload.
