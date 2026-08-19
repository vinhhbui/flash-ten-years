# FLASH 10 — Marker-ID Template Architecture

## Status

This document is the implementation source of truth for the next scanner/template architecture.

It replaces the current assumption that every scan belongs to one default frame/profile. The scanner must identify the paper template from a machine-readable marker ID, resolve that ID through one template catalog, preprocess with the correct template assets, and submit the resulting artwork with the correct `frameId`.

Do not create a second scanner pipeline, submission store, Socket.IO event, or Live Wall implementation. Extend the current architecture.

---

# 1. Product requirement

At the event, multiple physical A4 drawing sheets may exist at the same time. Each sheet represents one shape/character template.

Every paper template must contain a machine-readable **template identity marker** whose ID is assigned sequentially.

Example mapping:

```text
001 -> cat-v1
002 -> dog-v1
003 -> rabbit-v1
004 -> star-v1
...
```

The same ID must exist in the software catalog. The marker printed on the paper and the catalog entry are the synchronization key between the physical sheet and the digital template.

The workflow must be:

```text
A4 paper
  -> decode template marker ID
  -> resolve marker ID in template catalog
  -> load the matching preprocess profile/assets
  -> align the page
  -> extract guest artwork
  -> create Submission with the matching frameId
  -> emit existing new_artwork event
  -> render on Live Wall
```

A guest creating a new drawing on an existing paper template does **not** create a new template. A new template is required only when a new physical shape/character is introduced.

---

# 2. Core design principles

## 2.1 Marker ID is the physical/digital join key

The marker ID is authoritative for template selection.

Do not infer the shape from image similarity when the marker is readable.

Do not select the template from `SCAN_DEFAULT_FRAME_ID` or `SCAN_PREPROCESS_PROFILE` in the normal event flow.

Do not spread conditions such as `if markerId === "001"` throughout the codebase.

All marker/template relationships must resolve through one catalog.

## 2.2 Keep registration and identity separate

The repository already has corner registration markers used for page alignment. Preserve that responsibility.

Add one separate **identity marker** in a fixed location outside the guest artwork region.

Conceptually:

```text
┌──────────────────────────────────────┐
│ registration                 registration
│                                      │
│        identity marker: 001          │
│                                      │
│          SHAPE / DRAW AREA           │
│                                      │
│ registration                 registration
└──────────────────────────────────────┘
```

The four page-registration markers answer: **where is the page?**

The identity marker answers: **which template is this page?**

Do not overload one sequential template ID into four different corner IDs unless a future hardware test proves that architecture is necessary.

## 2.3 One canonical physical frame for every shape

`shared/templates/_frame-template/` is the canonical frame/template source.

All future shape templates must be generated from this frame.

The user will provide the final visual frame reference later. Until that asset is provided, keep the current `_frame-template` as the working canonical frame. Do not invent a new final visual system.

When the final frame reference arrives, update the canonical frame once and regenerate every shape template from it.

A shape-specific template may change the shape geometry and shape metadata, but must not independently redesign:

- A4 page dimensions;
- global margins;
- registration-marker layout;
- identity-marker slot;
- title/instruction slots;
- canonical drawing-area bounds;
- shared print styling;
- shared scanner-safe zones.

## 2.4 Generated assets, not manually diverging copies

New shapes must be produced through a reusable generator or equivalent deterministic build step.

Do not maintain independently hand-edited page layouts for `cat-v1`, `dog-v1`, etc.

Shape-specific geometry may be authored separately, but printable output, masks, marker placement, and page layout must be composed from the canonical frame definition.

## 2.5 Fail closed in the event flow

If the scanner cannot decode a marker or the marker ID is unknown, do not silently process the image as `cat-v1`.

Unknown identity is an ingestion error and the scan should follow the existing failed-file path with a clear reason.

A development-only fallback may exist behind an explicit environment flag, but production/event default must be **no fallback**.

---

# 3. Marker format

Use a robust machine-readable fiducial marker that encodes a numeric ID. ArUco-compatible markers are preferred conceptually because they are designed for reliable machine detection, but the decoder implementation must fit the current Node server and deployment constraints.

Codex must inspect the existing runtime/dependencies before choosing a library. Prefer a pure JavaScript or WASM implementation when practical. Do not introduce a Python sidecar or a second service only to decode markers unless explicitly requested later.

The marker decoder must be behind an internal interface so the rest of the scanner does not depend on one library.

Recommended domain interface:

```ts
export interface DetectedTemplateMarker {
  markerId: string;
  rawId: number | string;
  confidence?: number;
  corners?: Array<{ x: number; y: number }>;
}

export interface TemplateMarkerDecoder {
  decode(input: Buffer | RawImage): Promise<DetectedTemplateMarker | undefined>;
}
```

Normalize IDs into a zero-padded string at the architecture boundary:

```text
1   -> "001"
2   -> "002"
15  -> "015"
```

Initial supported range:

```text
001..999
```

Reserve `000` for calibration/debugging and do not assign it to a production shape.

The human-readable value such as `TEMPLATE 001` may also be printed near the marker for staff, but OCR text is not the machine source of truth.

---

# 4. Canonical template catalog

Create:

```text
shared/templates/catalog.json
```

Suggested schema:

```json
{
  "schemaVersion": 1,
  "frameTemplateVersion": "frame-template-v1",
  "templates": [
    {
      "markerId": "001",
      "templateId": "cat-v1",
      "frameId": "cat-v1",
      "preprocessProfile": "a4-cat-v1",
      "directory": "cat-v1",
      "label": "Original Cat",
      "enabled": true,
      "displayOrder": 1
    }
  ]
}
```

The catalog is the single source of truth for marker-to-template resolution.

Validation rules:

1. `markerId` must match `^[0-9]{3}$` and cannot be `000` for enabled production templates.
2. `markerId` must be globally unique.
3. `templateId` must be globally unique.
4. `frameId` must be globally unique unless a future explicit shared-frame use case is added.
5. `preprocessProfile` must resolve to the referenced template directory/config.
6. The directory must exist.
7. Required generated assets must exist.
8. Disabled templates must not be selected during scanner ingestion.
9. Catalog validation must fail loudly during startup/test/build rather than failing only after an event scan.

Do not create another independent marker mapping in the server or client.

---

# 5. Template directory contract

Keep the current template-folder pattern.

Target structure:

```text
shared/templates/
├── catalog.json
├── _frame-template/
│   ├── README.md
│   ├── template.config.json
│   ├── printable-template.svg
│   ├── allowed-region-mask.svg
│   └── guide-stroke-mask.svg
│
├── cat-v1/
│   ├── shape.svg or canonical shape geometry
│   ├── printable-template.svg
│   ├── allowed-region-mask.svg
│   ├── guide-stroke-mask.svg
│   ├── body-fill-mask.svg
│   └── template.config.json
│
└── future-shape-v1/
    └── ...
```

The exact source filename for editable shape geometry may differ if the current generator has a better representation, but there must be a clear separation between:

```text
CANONICAL FRAME GEOMETRY
+
SHAPE-SPECIFIC GEOMETRY
=
GENERATED PHYSICAL/DIGITAL TEMPLATE ASSETS
```

Every template-specific config must contain or be resolvable to the matching marker ID.

Example:

```json
{
  "id": "a4-cat-v1",
  "frameId": "cat-v1",
  "markerId": "001"
}
```

The catalog and template config must agree. Add validation for mismatch.

---

# 6. Canonical frame inheritance

Refactor the current shape-generation path so `_frame-template` acts as the base layout.

The reusable frame must define at least:

```text
page size / orientation
canonical raster dimensions
global safe margins
four registration marker locations
identity-marker slot / ROI
drawing-area bounds
shared text/header/footer placement
shared extraction defaults
shared print styling
```

A shape template must define only shape-specific values such as:

```text
markerId
templateId
frameId
label
shape path / shape source
shape transform inside canonical drawing area
shape-specific extraction overrides when truly required
wall size/aspect metadata when required
```

Do not copy page-level constants into every new shape by hand.

If the preprocessing function still needs a flattened config at runtime, generate the flattened config from canonical frame + shape config. That is acceptable. The important rule is that page layout must originate from one canonical frame.

---

# 7. Generic template generator

The repository currently has a cat-specific generation script. Refactor toward one generic generator instead of creating one script per new animal/shape.

Target developer workflow:

```text
1. choose next marker ID
2. add/import new shape geometry
3. add minimal shape config
4. run template generator
5. generator composes shape with _frame-template
6. generator emits printable template + extraction masks
7. generator validates catalog/config consistency
8. template becomes available to scanner and Live Wall
```

Suggested command shape:

```bash
npm run template:generate -- --template cat-v1
npm run template:generate -- --all
```

Optional creation helper:

```bash
npm run template:create -- --id dog-v1 --marker 002 --label "Dog"
```

Do not require the user to manually update multiple TypeScript registries after creating a template.

The generator must place the identity marker into the same canonical slot on every printable page and encode the catalog/config `markerId`.

Generated marker pixels must be excluded from artwork output.

---

# 8. Scanner resolution architecture

Create a focused module boundary such as:

```text
server/src/scanner/templateCatalog.ts
server/src/scanner/templateMarker.ts
server/src/scanner/resolveScanTemplate.ts
```

Exact filenames may vary if the current scanner structure suggests cleaner names.

Recommended domain object:

```ts
export interface ResolvedScanTemplate {
  markerId: string;
  templateId: string;
  frameId: string;
  preprocessProfile: string;
  directory: string;
}
```

Recommended flow:

```ts
const detectedMarker = await decodeTemplateMarker(input);
const resolvedTemplate = resolveTemplateByMarkerId(detectedMarker.markerId);
const image = await preprocessScan(inputPath, resolvedTemplate.preprocessProfile);

await submissionService.createSubmission({
  image,
  frameId: resolvedTemplate.frameId,
  ...existingSubmissionFields,
});
```

Template identity must be resolved once per scan and then passed through the pipeline. Do not decode the marker repeatedly in separate modules.

---

# 9. Required change to `ingestScan.ts`

Preserve the current high-level responsibilities:

```text
validate
hash / dedupe
preprocess
createSubmission
archive/fail
```

Insert template identity resolution between validation/hash and preprocessing.

Target conceptual flow:

```text
validate scan
  -> hash / dedupe
  -> decode identity marker
  -> resolve catalog entry
  -> load matching preprocess profile
  -> preprocess scan
  -> create Submission using resolved frameId
  -> emit existing event through current SubmissionService
  -> archive
```

Remove `config.defaultFrameId` and `config.preprocessProfile` from the normal selection path.

They may temporarily remain for an explicit development fallback only.

Suggested environment behavior:

```env
SCAN_ALLOW_TEMPLATE_FALLBACK=false
SCAN_FALLBACK_FRAME_ID=cat-v1
SCAN_FALLBACK_PREPROCESS_PROFILE=a4-cat-v1
```

Do not make fallback enabled by default.

---

# 10. Error model

Use explicit scanner errors/messages for operational debugging.

At minimum distinguish:

```text
TEMPLATE_MARKER_NOT_FOUND
TEMPLATE_MARKER_INVALID
TEMPLATE_MARKER_UNKNOWN
TEMPLATE_DISABLED
TEMPLATE_CONFIG_MISMATCH
TEMPLATE_ASSET_MISSING
TEMPLATE_PREPROCESS_FAILED
```

The existing scanner failed-directory behavior should remain the operational sink for failed scans.

Logs should include the source filename and marker ID when available.

Example:

```text
[scanner] scan_034.png marker=003 template=rabbit-v1
[scanner:error] scan_035.png TEMPLATE_MARKER_UNKNOWN marker=027 -> failed
```

Do not log full image contents.

---

# 11. Marker-detection robustness

The event uses a controlled scanner, so implement the simplest reliable approach first.

Detection strategy should support:

1. expected portrait scan;
2. fixed identity-marker ROI from the canonical frame when the scanner crop is stable;
3. reasonable translation/scale tolerance;
4. optional retry with 90/180/270-degree rotations if orientation is uncertain;
5. marker rejection if confidence/geometry is implausible.

Do not begin with a complex learned vision classifier.

The existing four registration markers remain responsible for accurate page alignment after identity is resolved.

If identity decoding benefits from a coarse normalization using the existing registration geometry, reuse that logic rather than creating a second alignment implementation.

---

# 12. Template preprocessing

After marker resolution, use the resolved profile and preserve the existing template-aware extraction model:

```text
raw scan
  -> normalize / align page
  -> compare against matching blank printable template
  -> apply matching allowed-region mask
  -> remove unchanged guide pixels
  -> preserve guest-created pixels
  -> remove paper background
  -> transparent PNG
  -> crop/pad
```

The identity marker, registration markers, title, instruction copy, and all other printed frame elements must never appear in the final Live Wall sprite.

Do not weaken the current rule that legitimate black/gray/pencil artwork should survive when it differs from the known blank template.

---

# 13. Server template-profile registry

Replace the hardcoded single-template directory map with catalog-driven resolution.

Current pattern to eliminate conceptually:

```ts
new Map([
  ["a4-cat-v1", ".../cat-v1"]
]);
```

Target behavior:

```text
catalog entry
  -> directory
  -> template.config.json
  -> generated asset paths
  -> TemplatePreprocessProfile
```

`getTemplatePreprocessProfile(profileId)` may remain as an API if useful, but the backing source must be the catalog instead of a manually edited map.

Cache loaded profiles after validation.

---

# 14. Client frame registry

The client must not require a new manual import + `registerFrame(...)` call for every shape.

Refactor frame registration to derive from the shared catalog or from a generated client-safe artifact produced from the catalog.

If directly importing `shared/templates/catalog.json` is incompatible with the current Vite/TypeScript boundaries, generate a client artifact during the template build. Do not create a separately hand-maintained list.

The client frame definition must resolve at least:

```text
frameId
label
aspect ratio / default wall size
optional mask/overlay assets
preprocessProfile metadata only if still useful to the UI
```

Scanner submissions must already contain the correct `frameId`, so the Live Wall should only render that frame and should not need to decode marker information.

---

# 15. Submission metadata

Preserve existing fields and behavior.

Add template identity metadata only where useful for traceability, preferably:

```ts
markerId?: string;
templateId?: string;
```

Do not make the Live Wall depend on these fields for rendering if `frameId` is already present.

The purpose is debugging/auditing:

```text
submission -> source scan -> marker -> template
```

Existing stored submissions that lack these optional fields must remain readable.

---

# 16. Existing architecture that must remain unchanged

Do not redesign these areas as part of this task:

```text
scanner watcher
scan validation concept
source hashing / duplicate protection
SubmissionService ownership
submission persistence model beyond optional metadata
Socket.IO new_artwork event name
animation registry / animation assignment concept
Live Wall scene architecture
archive / failed folder workflow
```

The goal is template selection and scalable template creation, not a rewrite of the application.

---

# 17. Migration of `cat-v1`

`cat-v1` becomes the first catalog-backed production template.

Assign:

```text
markerId: 001
templateId: cat-v1
frameId: cat-v1
preprocessProfile: a4-cat-v1
```

Regenerate its printable sheet so marker `001` is embedded in the canonical identity-marker slot.

Keep its existing extraction behavior working after the registry refactor.

Do not create `cat-v2` only for this migration.

---

# 18. Adding the second and later shapes

After this architecture is implemented, adding a new shape must not require scanner logic changes.

Desired process for `dog-v1`:

```text
marker 002
  + shape geometry dog-v1
  + minimal template metadata
  -> generic generator
  -> generated printable-template.svg
  -> generated allowed-region-mask.svg
  -> generated guide-stroke-mask.svg
  -> generated body-fill-mask.svg when needed
  -> catalog validation
  -> automatically available to server/client registries
```

The same process must scale to 10–50 templates without a growing switch statement.

---

# 19. Frame-template replacement policy

The user will later provide a final frame/template visual reference.

When that happens:

1. update `_frame-template` only;
2. keep marker/catalog IDs unchanged;
3. preserve shape-specific geometry unless the new frame requires a controlled transform;
4. regenerate all printable templates/masks;
5. rerun scanner extraction tests;
6. do not individually redesign every shape folder.

Treat `_frame-template` as a versioned contract. If its geometry changes in a scan-breaking way, increment `frameTemplateVersion` and regenerate all assets together.

---

# 20. Testing requirements

Add unit/integration coverage for the new architecture.

## Catalog tests

- `001` resolves to `cat-v1`.
- duplicate marker IDs fail validation.
- duplicate template IDs fail validation.
- malformed marker IDs fail validation.
- unknown marker ID fails resolution.
- disabled template cannot be selected.
- catalog/config mismatch fails validation.

## Marker tests

Use generated/scanned-like fixtures rather than testing only a parsing helper.

- clean marker `001` decodes.
- small translation/scale still decodes.
- reasonable scanner noise still decodes.
- unreadable marker returns `TEMPLATE_MARKER_NOT_FOUND`.
- unsupported ID returns `TEMPLATE_MARKER_UNKNOWN` after successful decode.
- if rotation retry is implemented, verify supported orientations.

## Ingestion tests

- scan with marker `001` uses `a4-cat-v1`.
- resulting Submission receives `frameId: cat-v1`.
- `markerId/templateId` metadata is stored if implemented.
- unknown marker goes to failure path and creates no Submission.
- duplicate scan behavior remains unchanged.
- `new_artwork` still emits exactly once for an accepted scan.

## Preprocess regression tests

Preserve/extend current template extraction tests:

- blank template produces no meaningful guest artwork;
- color survives;
- black marker survives;
- pencil/low contrast is still reasonable;
- unchanged guide disappears;
- registration and identity markers disappear;
- outside paper/frame content does not become a sprite.

## Multi-template test

Add at least one lightweight second-template fixture for architecture validation, even if it is not a final production visual.

The purpose is to prove that marker `002` resolves to a different profile/frame without editing scanner logic.

Do not present this fixture as the user's final second shape design.

---

# 21. Development/debug tooling

Keep or extend gated debug output.

Useful optional outputs:

```text
debug-marker-roi.png
debug-marker-detection.json
debug-normalized-page.png
debug-template-difference.png
debug-user-mask.png
debug-final-artwork.png
```

Gate behind existing/new development flags and disable by default for the live event.

Marker debug JSON may include:

```json
{
  "markerId": "001",
  "templateId": "cat-v1",
  "confidence": 0.98
}
```

Do not persist unnecessary debug artifacts during normal event operation.

---

# 22. Performance and operational constraints

The event flow must remain local-first and predictable.

Requirements:

- no remote API call is required to identify a template;
- marker decoding happens locally;
- template catalog/profile data is cached after validation;
- adding templates must not linearly add runtime code branches;
- scanner ingestion must remain sequential/safe with the existing watcher semantics;
- one failed scan must not crash the watcher;
- startup should report catalog/config validation failures clearly.

---

# 23. Security/safety constraints

Treat marker data as untrusted input.

- never use raw decoded marker text as a filesystem path;
- resolve only through validated catalog entries;
- do not allow `../` path traversal through catalog directory fields;
- enforce known template directories under `shared/templates/`;
- do not dynamically execute code from a template folder;
- keep upload/scan file validation in place.

---

# 24. Suggested implementation phases

## Phase 0 — Inspect and document current coupling

Inspect at minimum:

```text
server/src/scanner/ingestScan.ts
server/src/scanner/scannerConfig.ts
server/src/scanner/templateProfiles.ts
server/src/scanner/registrationMarkers.ts
server/src/scanner/pageAlignment.ts
server/src/scanner/preprocessScan.ts
client/src/frames/frameRegistry.ts
client/src/frames/catFrame.ts
shared/templates/_frame-template/
shared/templates/cat-v1/
server/scripts/generate-cat-v1-template.mjs
```

Do not start by rewriting modules that are already reusable.

## Phase 1 — Catalog and validation

Create `shared/templates/catalog.json`, register `cat-v1` as marker `001`, implement loading/validation, and remove hardcoded template directory selection.

## Phase 2 — Identity marker generation

Add canonical identity-marker slot and generate marker `001` into `cat-v1` printable output.

Keep four existing registration markers for alignment.

## Phase 3 — Marker decoder

Implement decoder interface and local decoder compatible with the current Node runtime. Add fixture tests.

## Phase 4 — Scanner integration

Resolve marker before preprocessing and use resolved profile/frame in `ingestScan.ts`. Unknown/missing markers fail closed.

## Phase 5 — Generic template generation

Refactor cat-specific generation into reusable frame + shape generation. Preserve a compatibility wrapper only if useful.

## Phase 6 — Client auto-registration

Generate/derive frame definitions from the shared catalog. Remove the need to manually import/register each future shape.

## Phase 7 — Multi-template proof

Create a non-final test fixture for marker `002` and prove the architecture chooses a different template without scanner code changes.

## Phase 8 — Regression and docs

Run tests/builds, update relevant README/developer commands, and document the exact procedure for adding the next production shape.

---

# 25. Acceptance criteria

Implementation is complete only when all of the following are true:

```text
[ ] A physical/generated sheet contains a machine-readable sequential template marker.
[ ] cat-v1 uses marker 001.
[ ] Scanner decodes the marker locally.
[ ] Scanner resolves marker through one catalog.
[ ] Scanner no longer depends on a global default frame/profile in the normal event path.
[ ] Unknown/missing marker fails safely instead of becoming cat-v1.
[ ] Correct preprocess profile is selected from resolved template metadata.
[ ] Correct frameId is stored on the Submission.
[ ] Existing new_artwork flow still works.
[ ] Existing alignment and extraction behavior remains valid.
[ ] Identity/registration markers do not appear in final sprite.
[ ] Server template directories are catalog-driven, not hardcoded per shape.
[ ] Client frames do not require a manual registry edit for every new shape.
[ ] A generic template generator uses _frame-template as the canonical base.
[ ] All future shapes inherit the same page/frame design.
[ ] The canonical frame can later be replaced from the user's supplied visual reference and all shapes regenerated.
[ ] A second-template fixture proves multi-template routing.
[ ] Tests/builds pass.
```

---

# 26. Non-goals

Do not include these unless separately requested:

- AI shape classification;
- phone upload redesign;
- cloud recognition service;
- new Live Wall animation system;
- new submission database;
- event admin dashboard;
- automatic generation of artistic character designs with AI;
- replacing the user's future canonical frame with a Codex-invented visual design.

---

# 27. Final developer rule

The architecture must make this statement true:

> To add a new production shape, we assign the next marker ID, add the new shape source/config, run the generic template generator, and validate the catalog. We do not edit scanner branching logic or manually maintain another frame registry.

And this physical/digital invariant must always hold:

```text
MARKER ID ON PAPER
      ==
MARKER ID IN CATALOG
      ==
TEMPLATE SELECTED BY SCANNER
```

That invariant is the foundation of the multi-template event workflow.
