# FLASH 10 — Marker-Driven Multi-Template Scanner Architecture

## 0. Purpose

This document defines the next scanner/template architecture for FLASH 10.

The current implementation is centered on one physical template (`cat-v1`) and one preprocess profile (`a4-cat-v1`). That is no longer sufficient for the event workflow because multiple physical paper shapes will exist at the same time.

The new architecture must use a **machine-readable marker ID printed on each paper template** as the synchronization key between:

- the physical paper;
- the shape/template configuration;
- the scanner preprocessing profile;
- the Live Wall frame.

The marker ID is assigned sequentially by the project owner, for example:

```text
001 -> cat-v1
002 -> dog-v1
003 -> rabbit-v1
004 -> star-v1
...
```

The scanner must detect the marker ID from the scanned paper, resolve the corresponding template, preprocess the artwork using that template's masks, and create the submission with the matching `frameId`.

The second major requirement is that **all printable shapes use the same canonical paper frame/layout**. The project owner will provide the final visual frame reference later. New shapes must never hand-build their own A4 layout. Shape-specific geometry must be injected into one shared base frame/template generator.

This is an architecture migration, not a redesign of the Live Wall event pipeline.

---

# 1. Current implementation that must be preserved where possible

The repository already has useful foundations:

- scanner inbox/archive/failed workflow;
- PNG validation and SHA-256 dedupe;
- `preprocessScan()`;
- four black registration markers on the A4 template;
- projective page alignment from those four markers;
- template-aware masks and blank-template comparison;
- shared `SubmissionService`;
- `new_artwork` Socket.IO event;
- frame and animation registries on the client;
- `cat-v1` template assets under `shared/templates/cat-v1`.

Do not replace those systems unnecessarily.

The current high-level pipeline remains:

```text
scanner writes PNG
    ↓
watcher
    ↓
validate
    ↓
hash / dedupe
    ↓
resolve physical template from marker ID   <- NEW
    ↓
preprocess with resolved template          <- UPDATED
    ↓
createSubmission
    ↓
persist
    ↓
new_artwork
    ↓
Live Wall
```

Do not create another submission store, socket event, or scanner watcher.

---

# 2. Core architecture rule

The physical paper marker is the synchronization key.

```text
marker ID on paper
      ↓
Template Catalog
      ↓
┌───────────────────────────────┐
│ templateId                    │
│ frameId                       │
│ preprocessProfile             │
│ template asset directory      │
│ shape metadata                │
└───────────────────────────────┘
      ↓
scanner extraction + wall frame
```

A scan with marker `002` must never be processed as `cat-v1` merely because cat is the default.

For template scans, unknown, unreadable, duplicated, or invalid marker IDs must **fail closed** and move the source scan to the existing `failed/` workflow with a clear reason.

Never silently fall back to another shape for a template scan.

---

# 3. Separate the two marker responsibilities

The paper has two different machine-vision concepts and they must remain separate.

## A. Registration markers

Keep the existing four square registration markers at the A4 corners.

Purpose:

- detect page corners;
- correct translation;
- correct scale;
- correct small rotation;
- correct mild perspective distortion;
- normalize the scan into canonical A4 coordinates.

These markers are shared by **all** paper templates.

## B. Template ID marker

Add one dedicated machine-readable ID marker in a fixed location on the canonical paper frame.

Purpose:

- identify which shape/template the paper belongs to;
- resolve the correct template assets and Live Wall frame.

Do not use OCR of printed text as the primary ID mechanism.

Do not overload the four alignment markers with shape identity in the first implementation.

The separation should remain:

```text
4 corner markers = WHERE is the page?
1 ID marker      = WHICH template is this?
```

---

# 4. Important bootstrap rule: normalize before template lookup

The current template preprocessing loads the template profile first and then uses that profile's registration marker geometry to align the scan.

That creates a chicken-and-egg problem for multi-template scanning because the template is not known until its marker is decoded.

Fix this by moving all common page geometry into a **shared base paper frame configuration**.

The new flow must be:

```text
raw scan
    ↓
load shared base paper frame config
    ↓
detect the 4 common registration markers
    ↓
normalize to canonical A4 coordinates
    ↓
read template ID marker from known canonical ROI
    ↓
resolve template catalog entry
    ↓
load template-specific profile/masks
    ↓
extract guest artwork
```

Template-specific profiles must no longer be required to know where the four common registration markers are.

---

# 5. Canonical base paper frame

Create one shared base-frame definition.

Recommended structure:

```text
shared/templates/
├── _base-frame/
│   ├── frame.config.json
│   ├── base-frame.svg                 # optional source asset / layout layer
│   └── README.md
├── catalog.generated.json
├── cat-v1/
│   ├── template.config.json
│   ├── printable-template.svg         # generated
│   ├── allowed-region-mask.svg        # generated
│   ├── guide-stroke-mask.svg          # generated
│   └── body-fill-mask.svg             # generated
└── ...future templates
```

The exact file naming may be adjusted if the existing generator suggests a cleaner fit, but there must be exactly one authoritative common paper-layout definition.

## `frame.config.json`

It should own values shared by every printable paper, such as:

```json
{
  "version": 1,
  "canvas": {
    "width": 1240,
    "height": 1754
  },
  "paper": {
    "widthMm": 210,
    "heightMm": 297,
    "rasterDensity": 150
  },
  "registrationMarkers": {
    "...": "shared current registration marker geometry"
  },
  "templateIdMarker": {
    "x": 0,
    "y": 0,
    "size": 0,
    "gridSize": 6,
    "quietZone": 1
  },
  "shapeArea": {
    "x": 0,
    "y": 0,
    "width": 0,
    "height": 0
  }
}
```

Use real values derived from the current cat template while migrating. Do not leave production zero values.

The project owner will later provide a final visual frame reference. Until that asset exists, migrate the current paper layout into `_base-frame` without inventing a new visual style.

When the final base frame is provided later, updating the base-frame source and regenerating templates should update every printable shape consistently.

---

# 6. Template ID marker format

Implement a small custom binary square marker instead of immediately adding OpenCV/ArUco dependencies.

Reason:

- the environment uses a controlled scanner;
- the page is already normalized from four corner registration markers;
- the marker ROI is therefore known in canonical coordinates;
- decoding a fixed grid is deterministic and testable;
- this avoids native CV dependencies on the event laptop.

## Required marker properties

The marker must:

- be black/white only;
- have a quiet zone;
- have a solid outer border or otherwise deterministic sampling boundary;
- encode a numeric sequential marker ID;
- include an integrity check so random dirt/guest strokes are not accepted as a different valid ID;
- support at least IDs `001` through `999`;
- render the human-readable ID near the marker for staff, but not depend on OCR;
- be generated from `markerId` automatically.

Recommended implementation:

```text
6 x 6 logical marker
outer 1-cell border = fixed black border
inner 4 x 4 payload = 16 bits
```

Suggested 16-bit payload:

```text
12 bits = marker ID (1..4095)
4 bits  = checksum derived from marker ID
```

A different compact encoding is acceptable if it is documented and covered by tests.

## Orientation

Because the common A4 page is normalized first, the initial implementation may assume canonical portrait orientation.

For robustness, if the ID marker cannot be decoded at the expected location, the resolver may try a 180-degree normalized-page rotation once and decode again. Do not add expensive arbitrary-angle marker search in phase 1.

## Decoder confidence

Do not decode by reading a single center pixel per cell.

Sample an interior area of each logical cell, compute the average luminance, and classify black/white using a configurable threshold.

Return a structured result such as:

```ts
interface DecodedTemplateMarker {
  markerId: number;
  markerIdText: string; // zero-padded, e.g. "002"
  checksumValid: boolean;
  confidence: number;
}
```

Reject low-confidence or checksum-invalid reads.

---

# 7. Marker IDs and naming rules

Marker IDs are project-level stable identifiers.

Use numeric IDs with zero-padded display form:

```text
1   -> "001"
2   -> "002"
15  -> "015"
```

The numeric value is encoded in the marker. The zero-padded form is for configuration, logs, filenames, and human display.

Recommended production mapping:

```text
001 -> cat-v1
002 -> next real shape
003 -> next real shape
...
```

Rules:

- one marker ID maps to exactly one active template;
- a template has exactly one marker ID;
- marker IDs cannot be duplicated;
- do not recycle a retired marker ID during the same event/version unless explicitly approved;
- changing a shape's marker ID is a migration, not a cosmetic change.

---

# 8. Per-template configuration

Each shape owns only shape-specific data.

Example desired `shared/templates/cat-v1/template.config.json` direction:

```json
{
  "schemaVersion": 2,
  "templateId": "cat-v1",
  "markerId": "001",
  "frameId": "cat-v1",
  "preprocessProfile": "a4-cat-v1",
  "label": "Original Cat",
  "wall": {
    "aspectRatio": 0.884615,
    "defaultWidth": 190,
    "defaultHeight": 215
  },
  "shape": {
    "path": "...",
    "transform": "..."
  },
  "guide": {
    "...": "shape-specific guide parameters when needed"
  },
  "extraction": {
    "...": "template-specific thresholds when needed"
  }
}
```

Do not copy shared A4 dimensions, common title positioning, registration marker positions, or ID-marker placement into every shape unless technically unavoidable.

The generator should merge:

```text
base frame config
      +
shape template config
      ↓
printable template + masks + catalog metadata
```

---

# 9. Template catalog: generated, not hand-duplicated

Avoid having the same marker mapping manually maintained in multiple files.

Use each template's `template.config.json` as the authoring source, then generate a shared catalog.

Recommended generated file:

```text
shared/templates/catalog.generated.json
```

Example:

```json
{
  "schemaVersion": 1,
  "templates": [
    {
      "markerId": "001",
      "templateId": "cat-v1",
      "frameId": "cat-v1",
      "preprocessProfile": "a4-cat-v1",
      "label": "Original Cat",
      "assetDirectory": "cat-v1",
      "wall": {
        "aspectRatio": 0.884615,
        "defaultWidth": 190,
        "defaultHeight": 215
      }
    }
  ]
}
```

The generation/validation step must fail when:

- duplicate `markerId` exists;
- duplicate `templateId` exists;
- duplicate `frameId` exists unexpectedly;
- required generated assets are missing;
- marker ID is outside the supported numeric range;
- `preprocessProfile` is invalid;
- config schema is invalid.

Sort generated catalog entries by numeric marker ID for deterministic diffs.

Do not make runtime code scan directories and guess production mappings.

---

# 10. Shared template generation

Replace the cat-only generator mindset with a reusable template generator.

Current `server/scripts/generate-cat-v1-template.mjs` may be refactored into a generic generator while preserving output compatibility.

Desired commands may look like:

```powershell
npm.cmd run generate:templates --workspace server
npm.cmd run validate:templates --workspace server
```

Optional convenience command:

```powershell
npm.cmd run generate:template --workspace server -- --template cat-v1
```

The exact npm script names may follow the repository's conventions.

## Generator responsibilities

For every template config:

1. load `_base-frame/frame.config.json`;
2. validate the shape config and marker ID;
3. render the common paper frame;
4. render the four common registration markers;
5. encode and render the template ID marker;
6. render a human-readable `ID 001` label near it;
7. inject the shape guide into the canonical shape area;
8. generate `printable-template.svg`;
9. generate `allowed-region-mask.svg`;
10. generate `guide-stroke-mask.svg`;
11. generate `body-fill-mask.svg` if still required by extraction;
12. regenerate `catalog.generated.json`;
13. validate that printed marker ID and catalog marker ID derive from the same source value.

Never make developers manually edit marker pixels in an SVG.

---

# 11. New-shape onboarding contract

Adding a new shape must become a predictable data/asset task, not a multi-file code change.

Desired workflow:

```text
1. choose next marker ID, e.g. 002
2. create shared/templates/dog-v1/template.config.json
3. provide dog shape path/geometry
4. run template generator
5. generator creates printable template + masks + shared catalog
6. server can resolve marker 002 automatically
7. client can resolve frame dog-v1 automatically
8. no scanner ingestion code changes required
```

If a scaffolding command is easy to add without delaying P0, provide something like:

```powershell
npm.cmd run template:new --workspace server -- --id dog-v1 --marker 002 --label "Happy Dog"
```

This command is P1, not required for the core migration.

---

# 12. Server-side template catalog

Remove the hard-coded template directory map such as:

```ts
new Map([
  ["a4-cat-v1", ".../cat-v1"]
])
```

Replace it with catalog-backed lookup.

Recommended API boundaries:

```ts
interface TemplateCatalogEntry {
  markerId: string;
  templateId: string;
  frameId: string;
  preprocessProfile: string;
  label: string;
  assetDirectory: string;
  wall: {
    aspectRatio: number;
    defaultWidth: number;
    defaultHeight: number;
  };
}

function getTemplateByMarkerId(markerId: string): TemplateCatalogEntry
function getTemplateByProfileId(profileId: string): TemplateCatalogEntry
function listTemplates(): TemplateCatalogEntry[]
```

Runtime server code should resolve asset paths safely from the validated catalog entry.

Do not allow marker/catalog values to become arbitrary filesystem paths.

---

# 13. Scanner template resolver

Create one scanner boundary responsible for turning a raw scan into a resolved template.

Recommended module:

```text
server/src/scanner/scanTemplateResolver.ts
```

Recommended conceptual API:

```ts
interface ResolvedTemplateScan {
  markerId: string;
  template: TemplateCatalogEntry;
  normalizedPage: RawRgbaImage;
  rotationApplied: 0 | 180;
  markerConfidence: number;
}

async function resolveTemplateScan(inputPath: string): Promise<ResolvedTemplateScan>
```

Responsibilities:

1. read/rotate scan into portrait orientation using the existing safe logic;
2. load common base-frame registration geometry;
3. detect the four registration markers;
4. normalize page to the base canonical A4 canvas;
5. crop/read the fixed template-ID-marker ROI;
6. decode marker ID and checksum;
7. if appropriate, try one 180-degree normalized-page orientation fallback;
8. lookup marker ID in the template catalog;
9. return the already-normalized page plus catalog entry.

Do not perform guest-art extraction in this resolver.

---

# 14. Refactor preprocessing to avoid decoding/alignment twice

The resolver already normalizes the page. Do not reread the file and normalize it again inside template preprocessing.

Refactor the template path so extraction can accept a normalized page plus a resolved profile.

Conceptual boundary:

```ts
async function preprocessResolvedTemplateScan(
  normalizedPage: RawRgbaImage,
  template: TemplateCatalogEntry,
): Promise<Buffer>
```

or:

```ts
async function extractTemplateArtwork(
  normalizedPage: RawRgbaImage,
  profile: TemplatePreprocessProfile,
): Promise<Buffer>
```

Preserve the existing blank-template comparison, masks, guide cleanup, body fill, transparent output, and cropping behavior unless a migration test shows a real problem.

The goal is to change **template selection**, not rewrite the extraction algorithm.

---

# 15. Update scanner ingestion

The current scanner ingestion uses one global `config.preprocessProfile` and `config.defaultFrameId`.

For template event scans, replace that behavior with the marker resolver.

Target conceptual flow:

```ts
const resolved = await resolveTemplateScan(inputPath);

const image = await preprocessResolvedTemplateScan(
  resolved.normalizedPage,
  resolved.template,
);

const submission = await submissionService.createSubmission({
  image,
  animation: chooseScannerAnimation(config),
  idPrefix: "scan",
  frameId: resolved.template.frameId,
  source: "scanner",
  sourceHash,
  originalFileName: fileName,
});
```

Add useful log context:

```text
[scanner] detected marker 002 -> dog-v1
[scanner] accepted scan-... frame=dog-v1 marker=002
```

Do not log raw image data.

## Legacy generic scan mode

The old generic preprocessing mode may remain for development/legacy use.

If `generic` mode is explicitly selected, it may use the existing default frame config.

However, the physical event template flow must default to marker-driven resolution.

Suggested config direction:

```env
SCAN_MODE=template-marker
```

with optional legacy:

```env
SCAN_MODE=generic
SCAN_DEFAULT_FRAME_ID=cat-v1
```

Do not require `SCAN_PREPROCESS_PROFILE=a4-cat-v1` for the normal multi-template event flow after migration.

---

# 16. Client frame registry

The client must stop requiring a new TypeScript frame file plus manual `registerFrame()` call for every shape when the frame metadata is already represented in the generated template catalog.

Use `catalog.generated.json` as the source for standard template-backed wall frames.

Conceptual direction:

```ts
for (const template of templateCatalog.templates) {
  registerFrame({
    id: template.frameId,
    label: template.label,
    aspectRatio: template.wall.aspectRatio,
    defaultWidth: template.wall.defaultWidth,
    defaultHeight: template.wall.defaultHeight,
    preprocessProfile: template.preprocessProfile,
  });
}
```

Preserve the ability to define special digital-only mask/overlay assets if required later.

Unknown historical frame IDs may still fall back safely on the wall renderer. That client fallback is separate from scanner template detection.

Important distinction:

```text
scanner unknown marker -> FAIL
wall unknown old frame -> visual fallback allowed
```

---

# 17. Paper frame consistency requirement

Every generated printable template must use the same base frame/layout.

Only these concepts should vary by shape:

- marker ID value;
- shape guide/path;
- allowed region;
- shape-specific body fill mask;
- shape-specific extraction thresholds only when justified;
- label/name if the paper design includes it.

These must remain common unless the base-frame version changes:

- A4 size;
- canvas resolution;
- 4 registration marker positions;
- template ID marker position and size;
- title/instruction system;
- margins;
- drawing-zone bounding area;
- general printable frame treatment.

When the project owner provides the final reference frame later, implement it in the base-frame layer, not separately in each shape.

---

# 18. Base-frame versioning

Add a version field to support future paper-layout changes safely.

Example:

```json
{
  "version": 1
}
```

A template config can record the expected base-frame version if helpful.

Do not create multiple layout systems prematurely. Versioning exists so a later physical print revision can be deliberate.

If marker decoding itself changes incompatibly, introduce a marker codec version instead of silently changing bit interpretation.

---

# 19. Error handling and event safety

Template resolution errors must be explicit.

Examples:

```text
could not detect all four registration markers
could not decode template ID marker
marker checksum invalid
marker confidence below threshold
unknown template marker ID: 017
resolved template assets are missing
catalog contains duplicate marker ID
```

For a bad incoming scan:

```text
input file
  ↓
existing failed/ directory
```

Do not emit `new_artwork`.

Do not create a partial Submission.

Do not silently use cat.

A failed scan should remain diagnosable by staff from the filename plus logs.

---

# 20. Debug outputs

Extend the existing scanner debug concept so marker problems can be diagnosed quickly.

When debug output is enabled, useful optional artifacts include:

```text
debug-normalized-page.png
debug-template-id-roi.png
debug-template-id-cells.png
debug-resolved-marker.json
debug-allowed-mask.png
debug-final-artwork.png
```

`debug-resolved-marker.json` may contain:

```json
{
  "markerId": "002",
  "confidence": 0.96,
  "checksumValid": true,
  "rotationApplied": 0,
  "templateId": "dog-v1"
}
```

Keep debug output disabled by default during the real event.

---

# 21. Security and robustness constraints

Do not:

- use marker/catalog text directly as a filesystem path;
- allow `../` path traversal from template config;
- accept checksum-invalid marker IDs;
- accept duplicate marker IDs at build/runtime;
- silently coerce malformed IDs into another valid ID;
- download remote template assets at scan time;
- add network dependencies to the scanner workflow;
- require internet connectivity during the event.

All template assets must be local and validated before event runtime.

---

# 22. Migration of current `cat-v1`

`cat-v1` is the first migrated production template.

Assign:

```text
markerId: 001
templateId: cat-v1
frameId: cat-v1
preprocessProfile: a4-cat-v1
```

Migration steps:

1. extract common A4/page geometry from current cat config into `_base-frame/frame.config.json`;
2. keep cat shape geometry in `cat-v1/template.config.json`;
3. add `markerId: "001"`;
4. regenerate cat printable/masks using the generic generator;
5. ensure visual/extraction output remains equivalent except for the new ID marker and any intentionally centralized common layout;
6. generate catalog entry for cat;
7. make the server resolve marker `001` to cat;
8. make the client register cat from the generated catalog;
9. remove cat-only hard-coded template/profile mapping when tests pass.

Do not delete the generic fallback preprocessing path as part of this migration.

---

# 23. Implementation phases

## Phase 0 — inspect and lock current behavior

P0.

- run existing tests/check/build;
- inspect current cat generator, masks, registration marker alignment, template compositing, frame registry, scanner config, and ingest flow;
- document any repository detail that requires adapting names in this spec.

Exit condition: current baseline is understood and no behavior is accidentally removed.

## Phase 1 — base frame extraction

P0.

- create `_base-frame/frame.config.json`;
- move common A4 and registration-marker geometry there;
- keep cat shape geometry separate;
- preserve current printable appearance as the provisional base frame.

Exit condition: cat can be generated from base frame + cat config.

## Phase 2 — marker codec

P0.

- implement marker encoder;
- render marker from `markerId`;
- implement canonical-grid decoder;
- checksum + confidence validation;
- unit tests.

Exit condition: IDs 001, 002, 015, 999 round-trip deterministically.

## Phase 3 — catalog generation

P0.

- scan known template configs at generation time;
- validate uniqueness/schema;
- generate deterministic `catalog.generated.json`.

Exit condition: cat appears as marker `001` and duplicate IDs fail generation.

## Phase 4 — scan template resolver

P0.

- normalize raw scan using common base registration marker config;
- decode marker ID at canonical ROI;
- resolve catalog entry;
- support one 180-degree retry if needed;
- provide structured errors and debug info.

Exit condition: a cat test scan resolves to marker `001` / `cat-v1` without caller-supplied profile.

## Phase 5 — extraction integration

P0.

- refactor template extraction to accept normalized page + resolved template/profile;
- avoid double read/alignment;
- preserve current extraction results.

Exit condition: cat output remains correct.

## Phase 6 — ingest integration

P0.

- scanner event flow uses resolver;
- submission `frameId` comes from resolved template;
- unknown/bad marker fails without broadcast;
- generic legacy mode remains explicit.

Exit condition: physical scan no longer depends on default cat profile.

## Phase 7 — client auto-registration

P0.

- register standard template-backed frames from generated catalog;
- remove need for manual `catFrame.ts` registration if it becomes redundant;
- preserve visual fallback for old unknown submissions.

Exit condition: adding a catalog-backed frame does not require editing `frameRegistry.ts`.

## Phase 8 — second-template fixture

P0 test fixture / P1 production asset.

Create either:

- a test-only synthetic second shape, or
- the next real shape when supplied.

Give it marker `002`.

Prove that `001` and `002` resolve to different profiles/frame IDs without scanner code changes.

Do not invent a production visual character if none has been supplied; a test fixture is sufficient.

## Phase 9 — tooling polish

P1.

- optional `template:new` scaffolder;
- better debug marker visualization;
- operator-facing validation command.

---

# 24. Required tests

At minimum add/adjust tests for the following.

## Marker codec

1. encode/decode `001`.
2. encode/decode `002`.
3. encode/decode a multi-digit value such as `015`.
4. encode/decode `999`.
5. damaged payload fails checksum.
6. ambiguous/low-contrast marker fails confidence threshold.

## Catalog

7. duplicate marker IDs fail validation.
8. duplicate template IDs fail validation.
9. unknown marker lookup fails explicitly.
10. catalog ordering is deterministic by numeric marker ID.

## Resolver

11. cat scan with valid marker resolves `001 -> cat-v1`.
12. second fixture marker resolves to its own template.
13. missing ID marker fails.
14. invalid checksum fails.
15. all four corner markers are still required.
16. 180-degree normalized page can recover if fallback is implemented.

## Extraction

17. cat extraction still removes paper and unchanged guide.
18. guest color remains.
19. black guest marker remains.
20. blank template still does not create meaningful artwork.

## Ingestion

21. resolved frame ID is written to Submission.
22. successful scan emits exactly one `new_artwork`.
23. unknown marker creates no Submission and emits no event.
24. unknown marker source moves to `failed/`.
25. duplicate source scan behavior remains unchanged.

## Client

26. generated catalog registers cat frame.
27. generated second template registers without editing frame registry source.
28. historical unknown frame ID still uses existing visual fallback.

---

# 25. Acceptance criteria

This architecture is complete only when all of the following are true.

### A. Paper/template synchronization

A physical paper printed with marker `001` resolves to `cat-v1` automatically.

### B. No global cat assumption

The normal template scanner flow does not require:

```text
SCAN_DEFAULT_FRAME_ID=cat-v1
SCAN_PREPROCESS_PROFILE=a4-cat-v1
```

for correct template identification.

### C. Multiple shapes

Two different marker IDs can be processed by the same scanner watcher in any order:

```text
001 scan
002 scan
001 scan
002 scan
```

Each gets the correct frame/profile.

### D. Safe failure

An unreadable or unknown marker never becomes the wrong character on the Live Wall.

### E. Shared paper frame

All printable templates are generated from one shared base-frame layout.

### F. Easy new template workflow

Adding a normal new shape requires shape config/assets + a new unique marker ID + regeneration, not scanner/client logic changes.

### G. Offline event operation

The full scan path works locally without internet access.

### H. Existing behavior preserved

Dedupe, archive/failed handling, submission persistence, `new_artwork`, Live Wall restore, and existing animations continue to work.

---

# 26. Do not do these shortcuts

Do not solve this migration by:

- parsing the scan filename to choose the shape;
- asking staff to choose a shape in the UI for every scan;
- keeping one global `SCAN_PREPROCESS_PROFILE` and changing `.env` between papers;
- OCR-reading `001` as the primary detector;
- hard-coding `if markerId === "001"` / `"002"` throughout scanner files;
- adding one server map entry and one client TypeScript file for every new template;
- duplicating the base A4 frame into every template folder;
- silently falling back to cat when marker detection fails;
- pulling template assets from the internet during the event;
- rewriting the existing extraction/compositing algorithm without a demonstrated need.

---

# 27. Expected file boundaries after implementation

Names may vary slightly, but the resulting architecture should have equivalent responsibilities:

```text
shared/templates/
├── _base-frame/
│   ├── frame.config.json
│   └── ...shared visual source
├── catalog.generated.json
├── cat-v1/
│   ├── template.config.json
│   ├── printable-template.svg
│   ├── allowed-region-mask.svg
│   ├── guide-stroke-mask.svg
│   └── body-fill-mask.svg
└── ...

server/src/scanner/
├── baseFrameConfig.ts              # common paper geometry loader/validator
├── templateIdMarker.ts             # marker encode/decode
├── templateCatalog.ts              # generated catalog access
├── scanTemplateResolver.ts         # raw scan -> normalized page + resolved template
├── registrationMarkers.ts          # existing, reused/refactored
├── pageAlignment.ts                # existing, reused
├── templateProfiles.ts             # catalog-backed profile loader
├── preprocessScan.ts               # generic + resolved template extraction
└── ingestScan.ts                   # resolver integration

server/scripts/
├── generate-templates.mjs
└── ...validation/helper scripts

client/src/frames/
└── frameRegistry.ts                # catalog-backed standard registration
```

Do not force these exact file names if the existing repository structure makes another boundary materially cleaner. Preserve the responsibilities.

---

# 28. Codex implementation discipline

When implementing this specification:

1. inspect current code before editing;
2. reuse the working registration/alignment and template-compositing logic;
3. make changes in small coherent phases;
4. update tests alongside each phase;
5. avoid introducing native CV dependencies unless the custom normalized-grid marker demonstrably fails real scanner tests;
6. do not invent the final visual base frame before the project owner supplies it;
7. keep the current cat appearance as the provisional migration baseline;
8. run the full project validation at the end:

```powershell
npm.cmd run test
npm.cmd run check
npm.cmd run build
```

If any existing test expectations conflict with this specification because they assume one global cat template, update those tests to reflect marker-driven resolution rather than preserving obsolete behavior.

---

# 29. Final architecture summary

The target system should be understandable as:

```text
                    ONE SHARED PAPER FRAME
                             │
                ┌────────────┴────────────┐
                │                         │
        4 registration markers     template ID marker
           page alignment             shape identity
                │                         │
                └────────────┬────────────┘
                             ↓
                      normalized page
                             ↓
                      decode marker ID
                             ↓
                    generated catalog
                             ↓
              ┌──────────────┼──────────────┐
              ↓              ↓              ↓
           cat-v1          dog-v1       rabbit-v1
           ID 001          ID 002        ID 003
              ↓              ↓              ↓
         matching mask  matching mask  matching mask
              └──────────────┼──────────────┘
                             ↓
                       guest artwork PNG
                             ↓
                       Submission.frameId
                             ↓
                          Live Wall
```

The key invariant is:

> **The marker printed on the physical paper and the template ID configured in the repository are generated from the same source configuration, so paper, preprocessing, and Live Wall frame cannot drift apart silently.**
