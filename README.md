# FLASH 10 Live Wall

FLASH 10 is a local interactive event wall. The supported event flow is physical: a guest decorates a paper drawing, staff scan it to a PNG, and the artwork automatically appears and animates on the fullscreen Live Wall.

## Architecture

- `client/`: React, Vite, GSAP, and the Live Wall. It resolves each submission through frame and animation registries.
- `server/`: Express, Socket.IO, shared submission creation, and the scanner watcher.
- `event-data/scanner/inbox/`: scanner software output folder.
- `event-data/scanner/archive/`: successfully accepted source scans.
- `event-data/scanner/failed/`: invalid or unprocessable source scans.
- `server/uploads/`: application-owned PNG copies served to the wall.
- `server/data/submissions.json`: persisted submission metadata.

The scanner and HTTP creator both use the same submission service: save application-owned image, persist metadata, then emit `new_artwork`. The wall uses that one event and restores all persisted items from `GET /api/submissions`.

## Prerequisites

- Node.js 20 or newer.
- Windows laptop running the FLASH application and scanner vendor software.
- Scanner configured to save PNG files.

## Development

From the repository root:

```powershell
npm.cmd install
npm.cmd run dev
```

Open the Live Wall at `http://localhost:5173/wall`. The API and Socket.IO server run on port `3001`.

For separate processes:

```powershell
npm.cmd run dev:server
npm.cmd run dev:client
```

Check the project before a handoff:

```powershell
npm.cmd run test
npm.cmd run check
npm.cmd run build
```

## Scanner setup

1. Copy `.env.example` to `.env` in the repository root.
2. Connect the scanner to the Windows laptop.
3. Configure the scanner software to output PNG files.
4. Set its output folder to `SCAN_INPUT_DIR`. The default is `./event-data/scanner/inbox`.
5. Start FLASH with `npm.cmd run dev`.
6. Verify the terminal shows `[scanner] watching ...` with the resolved folder path.
7. Open `/wall` on the projector or event display.
8. Perform one test scan and confirm it appears without refreshing the wall.

Relative scanner paths resolve from the repository root. Absolute Windows paths also work, for example:

```env
SCAN_INPUT_DIR=C:\FLASH10\scanner\inbox
SCAN_ARCHIVE_DIR=C:\FLASH10\scanner\archive
SCAN_FAILED_DIR=C:\FLASH10\scanner\failed
```

The server loads `.env` automatically. `SCAN_MAX_FILE_MB` defaults to `25`. `SCAN_ANIMATION_MODE` accepts `random`, `float`, `hop`, or a future registered animation ID. For random assignment, `SCAN_ANIMATION_IDS` is the allow-list and defaults to `float,hop`.

## Event guest workflow

```text
Guest draws on paper
    ↓
Staff scans the drawing
    ↓
The scanner saves PNG into the inbox
    ↓
FLASH validates, archives, persists, and broadcasts it
    ↓
Artwork appears and animates on the Live Wall
```

Guests do not need to use phones during the event. The existing `/create` route remains available for development compatibility but is not part of the event operating procedure.

## Scanner behavior and recovery

- The watcher waits for 1 second of stable file size before processing a new file.
- Only `.png` and `.PNG` files are accepted; temporary files are ignored.
- A scan must be non-empty, within the configured size limit, and have valid PNG magic bytes.
- Duplicate file content is recognized with SHA-256, archived, and not broadcast again.
- Accepted images are copied to `server/uploads/` before their metadata is persisted or the wall event is emitted.
- Invalid files move to `failed/`; valid source files move to `archive/` only after persistence succeeds.
- PNG files already in `inbox/` when the server starts are recovered oldest first.

If a scan does not appear, check that the scanner wrote a PNG into the configured inbox, then inspect `failed/` and the `[scanner]` logs. Restarting the application does not lose persisted submissions and will retry unprocessed inbox files.

## Visual extension points

- Add an animation in `client/src/animations/`, then register it in `animationRegistry.ts`.
- Add a frame definition in `client/src/frames/`, then register it in `frameRegistry.ts`.
- `resolveWallVisual()` is the one Live Wall boundary that maps submission metadata to those definitions.

Unknown old or future frame and animation IDs safely use the default cat frame and Float animation.

## Current limitations

- This is a local event workflow, not a cloud deployment.
- Scanner hardware control, crop/perspective correction, paper extraction, OCR, moderation, authentication, and databases are intentionally out of scope.
- Scanner preprocessing removes the connected paper background, keeps the largest central artwork, and trims transparent page margins. It assumes the main drawing is one connected central shape with a sufficiently closed outline; it does not yet perspective-correct or detect a specific paper template.
