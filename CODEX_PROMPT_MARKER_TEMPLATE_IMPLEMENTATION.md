# Codex Prompt — Implement Marker-Driven Multi-Template Scanner

Implement the marker-driven multi-template scanner architecture defined in:

```text
INSTRUCTIONS_MARKER_TEMPLATE_ARCHITECTURE.md
```

Treat that file as the authoritative specification for this task.

## Objective

Migrate the current FLASH 10 scanner from a single hard-coded `cat-v1` template/profile into a marker-driven multi-template system.

Each physical A4 paper must contain:

- the existing four common registration markers for page alignment; and
- one dedicated machine-readable template ID marker.

The template ID marker is the synchronization key between physical paper, template configuration, preprocessing profile, and Live Wall frame.

Initial production mapping:

```text
001 -> cat-v1
```

The architecture must support future mappings such as:

```text
002 -> dog-v1
003 -> rabbit-v1
...
```

without requiring scanner ingestion logic changes or manual client frame registration for every new shape.

## Important constraints

1. Read the current implementation before editing.
2. Reuse the working four-corner registration detection, page alignment, template subtraction/masks, `SubmissionService`, watcher, archive/failed behavior, dedupe, Socket.IO event, and Live Wall architecture.
3. Do not replace the current extraction algorithm unless required by the migration.
4. Do not add OpenCV/ArUco/native CV dependencies for phase 1. Implement the normalized-grid marker codec described in the architecture spec.
5. Do not use OCR as the primary template detector.
6. Do not use scan filenames to select templates.
7. Do not silently fall back to cat when a marker is unreadable or unknown.
8. Template scan resolution must fail closed and use the existing `failed/` path.
9. Preserve the explicit legacy `generic` scan mode if currently useful.
10. Do not invent a new final paper visual design. The project owner will provide the final shared frame reference later. Migrate the current A4 layout into a shared provisional base-frame source.
11. All future printable shapes must derive from one common base paper frame/layout.
12. Keep the scanner event workflow fully local/offline.

## Required implementation direction

Implement the migration in coherent phases.

### Phase 0 — Baseline

Inspect and run the existing project before changing code.

Focus on:

```text
server/src/scanner/preprocessScan.ts
server/src/scanner/registrationMarkers.ts
server/src/scanner/pageAlignment.ts
server/src/scanner/templateProfiles.ts
server/src/scanner/ingestScan.ts
server/src/scanner/scannerConfig.ts
server/scripts/generate-cat-v1-template.mjs
shared/templates/cat-v1/template.config.json
client/src/frames/frameRegistry.ts
client/src/frames/catFrame.ts
```

Also inspect related tests and package scripts.

### Phase 1 — Shared base paper frame

Create one shared base-frame configuration under `shared/templates/_base-frame/` or an equivalent clean location.

Move common page data there:

- A4/canvas dimensions;
- registration marker geometry;
- common printable layout values;
- canonical template-ID-marker ROI;
- canonical drawing/shape area.

Keep cat-specific shape geometry in `cat-v1`.

The current paper appearance should remain the provisional visual baseline.

### Phase 2 — Template ID marker codec

Implement a local deterministic binary marker encoder/decoder.

Requirements:

- numeric IDs;
- zero-padded human display (`001`, `002`, ...);
- supports at least 001..999;
- fixed black/white grid;
- quiet zone / deterministic boundary;
- checksum/integrity validation;
- confidence score;
- decoder samples cell regions, not one pixel;
- generated automatically from template config;
- no manually edited marker SVG pixels.

Add focused unit tests including 001, 002, 015, and 999 plus checksum corruption.

### Phase 3 — Generic template generation + generated catalog

Refactor the cat-only generator into a reusable template generator.

Each shape config should provide at least:

```text
templateId
markerId
frameId
preprocessProfile
label
wall metadata
shape geometry
shape-specific extraction values when needed
```

Generate all printable/mask assets from:

```text
shared base frame + shape config
```

Generate:

```text
shared/templates/catalog.generated.json
```

The catalog must be deterministic and validated.

Generation must fail for duplicate marker IDs, duplicate template IDs, malformed IDs, or missing required assets.

Migrate cat as:

```text
markerId: 001
templateId: cat-v1
frameId: cat-v1
preprocessProfile: a4-cat-v1
```

### Phase 4 — Marker-driven scan resolver

Create a clean scanner boundary equivalent to:

```ts
resolveTemplateScan(inputPath)
```

It should:

1. read/rotate scan safely;
2. use shared base-frame registration geometry;
3. detect the four existing corner markers;
4. normalize the page once;
5. decode the template ID marker from its canonical ROI;
6. optionally try a 180-degree normalized-page retry when decoding fails;
7. resolve the generated catalog entry;
8. return normalized page + template metadata + marker confidence.

Unknown/invalid markers must throw a structured scanner preprocessing/resolution error.

### Phase 5 — Preprocessing integration

Refactor template extraction so it can accept the already-normalized page and resolved template/profile.

Avoid reading/alignment twice.

Preserve:

- blank-template comparison;
- allowed region mask;
- guide removal;
- body-fill behavior;
- user marker/color preservation;
- transparent output;
- crop behavior.

### Phase 6 — Scanner ingestion

Update the physical event template flow so it no longer uses one global default profile/frame to identify the paper.

Conceptually:

```ts
const resolved = await resolveTemplateScan(inputPath);
const image = await preprocessResolvedTemplateScan(
  resolved.normalizedPage,
  resolved.template,
);

await submissionService.createSubmission({
  ...,
  frameId: resolved.template.frameId,
});
```

Add concise logs such as:

```text
[scanner] detected marker 001 -> cat-v1
```

Keep generic mode explicit if retained.

### Phase 7 — Client frame registry

Use the generated template catalog to register standard template-backed frames.

Adding a normal new template must not require editing `frameRegistry.ts` or creating a new dedicated TypeScript frame registration file merely to repeat catalog metadata.

Preserve the existing visual fallback for historical/unknown submission frame IDs.

Remember the distinction:

```text
unknown marker during scanner ingest -> fail
unknown historical frame during wall render -> visual fallback allowed
```

### Phase 8 — Multi-template proof

Add a second synthetic/test-only template with marker `002`, unless a real second production shape already exists in the repository.

Do not invent a production character visual solely for this task.

Use the fixture to prove that scans for marker 001 and 002 resolve to different templates/frame IDs in arbitrary order without changing scanner code.

## Tests that must pass

Cover at least:

- marker codec round trips;
- damaged marker checksum rejection;
- catalog duplicate-ID validation;
- unknown marker rejection;
- cat `001 -> cat-v1` resolution;
- second fixture `002` resolution;
- all four registration markers remain required;
- template extraction regression for cat;
- resolved `frameId` stored in Submission;
- exactly one `new_artwork` for accepted scan;
- no Submission / no event for unknown marker;
- bad marker moves through existing failed workflow;
- dedupe behavior remains unchanged;
- generated catalog auto-registers client frames.

## Environment/config migration

Normal event flow should move toward something equivalent to:

```env
SCAN_MODE=template-marker
```

The multi-template event flow must not require changing:

```text
SCAN_DEFAULT_FRAME_ID
SCAN_PREPROCESS_PROFILE
```

between physical paper shapes.

Keep default-frame behavior only where it still makes sense for explicit generic/legacy mode.

Update `.env.example` and README only after the implementation behavior is real.

## Documentation

After implementation, update README scanner setup to explain:

1. print generated templates;
2. each template has its own marker ID;
3. marker ID is resolved automatically;
4. adding a new shape means adding config/assets + unique marker ID + regenerating templates/catalog;
5. no manual scanner profile switching is required.

Also document how to regenerate and validate templates.

## Validation

At the end run the repository's complete validation commands, including:

```powershell
npm.cmd run test
npm.cmd run check
npm.cmd run build
```

Also run the template generator/validator commands you introduce.

Fix failures caused by the migration rather than stopping after the first compile pass.

## Final response

When finished, report:

1. files changed;
2. final marker format;
3. how `001` resolves to `cat-v1`;
4. how to add marker `002` / a new shape;
5. new npm commands;
6. env changes;
7. tests/build results;
8. any real-scanner calibration that still requires physical testing.

Do not only produce a plan. Implement the architecture in the repository.