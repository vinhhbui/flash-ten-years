# FLASH 10 — A4 Guide Frame → User Artwork Extraction

## 0. Purpose

This instruction defines the next correction to the current A4 scanner workflow.

The current scanner preprocessing must **stop treating the printed frame/outline as the artwork**.

The physical paper template has two different concepts that must remain separate:

1. **Guide frame / guide outline** — printed on A4 only to show the guest where they are allowed to draw/color.
2. **User artwork** — the actual marker, pen, pencil, paint, or coloring added by the guest inside that region.

The final PNG sent to the Live Wall must contain **only the user artwork region**, with transparent pixels outside it.

The printed guide frame must not appear in the animated Live Wall sprite.

This task is an image-extraction correction. Do not redesign the scanner watcher, submission service, Socket.IO event, animation registry, or Live Wall architecture.

---

# 1. Required physical experience

The intended event flow is:

```text
A4 PAPER TEMPLATE
    ↓
Guest sees a faint dashed character outline
    ↓
Guest colors / decorates inside that outline
    ↓
Staff scans the A4 paper
    ↓
Scanner preprocessing recognizes the known template
    ↓
Guide outline is ignored / removed
    ↓
Only guest-created color/drawing inside the allowed shape remains
    ↓
Transparent PNG
    ↓
Submission
    ↓
Live Wall animation
```

Important distinction:

```text
Printed dashed outline = GUIDE ONLY
Guest drawing/coloring = CONTENT
```

Never use the printed dashed outline as the final sprite border.

---

# 2. Why the current implementation needs to change

The current `server/src/scanner/preprocessScan.ts` uses a largest-connected-component strategy and then treats that component as a primary enclosing frame.

That was acceptable for a generic scanned drawing, but it is the wrong model for the new A4 template.

With a printed character outline, the largest connected visual element may be the pre-printed frame itself. As a result, the preprocessing can preserve the guide outline instead of extracting only the guest artwork.

For this A4 workflow, do not infer the artwork boundary from the largest connected ink component.

Instead, use a **known template + known allowed-region mask**.

---

# 3. New design principle: template-aware extraction

The A4 paper is not an unknown image. It is a known physical template produced by us.

Therefore the preprocessing pipeline should know:

- the A4 template layout;
- the allowed drawing region;
- the printed guide-stroke region;
- the expected page orientation;
- optional registration/alignment markers;
- the frame/template ID.

The correct conceptual pipeline is:

```text
raw scan
    ↓
normalize page
    ↓
align scan to canonical A4 template
    ↓
load allowedRegionMask
    ↓
load guideStrokeMask / reference template
    ↓
remove known printed guide pixels
    ↓
keep only user-created pixels inside allowedRegionMask
    ↓
remove paper background
    ↓
trim transparent margin
    ↓
transparent PNG
```

---

# 4. Paper template specification

Create a canonical A4 template asset for each physical frame.

Recommended structure:

```text
shared/templates/
└── cat-v1/
    ├── printable-template.svg
    ├── allowed-region-mask.svg
    ├── guide-stroke-mask.svg
    └── template.config.ts/json
```

The exact shared location may be adjusted, but both printable output and server preprocessing must derive from the **same canonical geometry**.

Do not manually duplicate two slightly different cat shapes in separate client/server files.

## `printable-template.svg`

This is what is printed on A4.

Requirements:

- A4 aspect ratio.
- White paper background.
- Character/shape guide centered at a known position.
- Guide stroke is **faint**.
- Guide stroke is **dashed**.
- Guide exists only to tell the guest where to color.
- No thick permanent black outline intended for the final wall sprite.

Suggested initial visual style:

```text
stroke: light gray
opacity: approximately 20–35%
stroke width: visually clear on paper but not dominant
stroke-dasharray: configurable
fill: none
```

Do not hardcode the dash pattern into extraction logic. It is a presentation property of the printable template.

## `allowed-region-mask.svg`

This is not printed as a visible filled shape.

It represents the full region inside which guest artwork is allowed to survive preprocessing.

Conceptually:

```text
inside character = white / 1
outside character = black / 0
```

The final output must be clipped by this mask.

## `guide-stroke-mask.svg`

This identifies pixels belonging to the printed dashed guide.

It can be generated from the same shape path as the printable guide.

The server uses it only as a known exclusion/reference area.

---

# 5. Registration / alignment strategy

Do not assume every scanner output has exactly identical crop, DPI, or one-pixel-perfect placement unless verified with the real scanner.

Implement alignment in stages.

## Stage A — fixed scanner / fixed A4 layout

If the event scanner consistently returns a full A4 page in the same orientation and crop:

- normalize orientation;
- resize the page to a canonical working resolution;
- use normalized template coordinates;
- avoid unnecessary computer-vision complexity.

This should be attempted first because the event uses one controlled scanner.

## Stage B — alignment tolerance

If real scans shift slightly, support a small alignment search against the canonical template.

Allow:

- small X/Y translation;
- small scale difference;
- small rotation.

## Stage C — registration markers if needed

If Stage A/B is not reliable enough, add subtle registration markers outside the artwork region.

Recommended concept:

```text
A4 page
┌──────────────────────────────┐
│  registration mark      mark │
│                              │
│        dashed guide          │
│        character             │
│                              │
│  registration mark      mark │
└──────────────────────────────┘
```

Registration markers belong outside the artwork region and must never appear in the final sprite.

Do not immediately add OpenCV/template-marker infrastructure before testing whether fixed scanner normalization is sufficient.

---

# 6. Replace `isolatePrimaryArtwork()` for template scans

For the A4 template preprocessing profile, stop using the current largest-connected-component algorithm as the main segmentation rule.

The A4 template profile should use a dedicated function boundary such as:

```ts
async function extractTemplateArtwork(
  input: Buffer | RawImage,
  profile: TemplatePreprocessProfile,
): Promise<Buffer>
```

or equivalent.

Do not delete generic preprocessing if it is useful for other future scan modes. Route preprocessing by profile.

Example:

```ts
async function preprocessScan(
  inputPath: string,
  preprocessProfile = "a4-cat-v1",
): Promise<Buffer> {
  switch (preprocessProfile) {
    case "a4-cat-v1":
      return extractTemplateArtwork(...);
    default:
      return genericPreprocess(...);
  }
}
```

Avoid spreading `if frameId === ...` conditionals throughout scanner ingestion.

---

# 7. Template preprocess profile

Create a reusable definition, e.g.:

```ts
interface TemplatePreprocessProfile {
  id: string;
  pageAspectRatio: number;
  canonicalWidth: number;
  canonicalHeight: number;

  allowedRegionMask: string;
  guideStrokeMask?: string;
  referenceTemplate?: string;

  guideColor?: {
    r: number;
    g: number;
    b: number;
    tolerance: number;
  };

  cropPaddingRatio?: number;
}
```

For the current frame:

```text
profile id: a4-cat-v1
frame id: cat-v1
```

Connect the existing frame metadata using `preprocessProfile` instead of coupling frame rendering directly to server implementation details.

Future frames should be able to add their own profile.

---

# 8. User artwork extraction rule

After the scan is aligned to the template, every pixel should conceptually be classified as one of:

```text
A. paper background
B. printed guide
C. user-created artwork
D. outside allowed region
```

Desired output:

```text
A → transparent
B → transparent
C → keep
D → transparent
```

This is the core acceptance rule.

---

# 9. Detecting user-created pixels

Prefer comparison against the **known blank template**, not only a global white threshold.

Conceptually:

```text
blankTemplatePixel = expected printed template pixel
scanPixel          = actual scanned pixel

difference = colorDistance(scanPixel, blankTemplatePixel)

if difference > threshold:
    pixel may be user artwork
else:
    pixel is unchanged paper/template
```

Then apply:

```text
candidateUserPixel
AND allowedRegionMask
AND NOT knownGuideOnlyPixel when unchanged
```

This makes the dashed guide removable even if it is darker than the paper.

Important: if the guest draws directly over a dashed guide segment, preserve the guest contribution where possible. Do not blindly erase the entire guideStrokeMask from the final output.

The better rule is:

```text
remove pixels that still look like the original guide
keep pixels that differ meaningfully from the original guide
```

---

# 10. Preserve real guest media

Do not optimize only for bright marker colors.

The event may include:

- colored markers;
- crayons;
- ballpoint pen;
- pencil;
- black marker;
- gray marker;
- mixed colors.

Avoid a simplistic rule such as:

```text
"delete all gray/dark pixels"
```

because that would remove legitimate guest artwork.

Template subtraction / difference detection is preferred specifically so black/gray guest drawing can still be preserved.

---

# 11. Guide line visual policy

The guide line exists only on the physical paper.

The default guide should be visually subordinate to guest artwork.

Recommended printable style:

```text
light gray
dashed
thin
low contrast
```

Example SVG concept only:

```svg
<path
  d="..."
  fill="none"
  stroke="#B8B8B8"
  stroke-opacity="0.35"
  stroke-width="2"
  stroke-dasharray="8 8"
/>
```

Exact values should be adjusted after one print + scan test.

The printed appearance and extraction mask must come from the same canonical path.

---

# 12. Final sprite rule

The PNG stored under `server/uploads/` for a scanner submission must have:

```text
outside allowed region → alpha 0
paper background       → alpha 0
unchanged dashed guide → alpha 0
user coloring/drawing  → visible RGBA
```

The output PNG should be tightly cropped to the visible user artwork/allowed character region with small transparent padding.

Do not add the dashed frame back in `ArtworkSprite`.

If the Live Wall later needs a decorative outline, that must be a **separate digital overlay/frame asset**, independent from the printed guide.

Physical guide and digital presentation are different layers.

---

# 13. Important separation of layers

Maintain these four independent layers:

```text
LAYER 1 — PRINT TEMPLATE
Faint dashed guide on physical A4.

LAYER 2 — EXTRACTION MASK
Invisible allowed-region geometry used by preprocessing.

LAYER 3 — USER ARTWORK
Actual scanned guest-created pixels that become the PNG.

LAYER 4 — DIGITAL WALL FRAME (optional)
A separate client overlay/mask if we later want a polished border on screen.
```

Do not merge these layers again.

In particular:

```text
printed guide != final sprite outline
allowed region != printed pixels
wall overlay != scanner segmentation
```

---

# 14. Integration with Frame Registry

The client already supports frame metadata fields such as:

```text
maskAsset
overlayAsset
preprocessProfile
```

Use this separation intentionally.

Example desired frame metadata:

```ts
export const catFrame = {
  id: "cat-v1",
  label: "Original Cat",
  aspectRatio: 460 / 520,
  defaultWidth: 190,
  defaultHeight: 215,
  preprocessProfile: "a4-cat-v1",
  // digital mask/overlay are optional and unrelated to printed guide
};
```

If server/client cannot safely share this TypeScript object, define a shared serializable template/profile config rather than importing client code into the server.

---

# 15. Scanner ingestion contract remains unchanged

Do not change the high-level event flow:

```text
watcher
  ↓
validate PNG
  ↓
hash / dedupe
  ↓
preprocessScan
  ↓
createSubmission
  ↓
persist
  ↓
new_artwork
  ↓
Live Wall
```

Only the internals of preprocessing/template selection should change.

Do not create another socket event.

Do not create another submission store.

Do not change animation assignment as part of this task.

---

# 16. Recommended implementation phases

| Phase | Priority | Work | Exit condition |
|---|---:|---|---|
| 0 | P0 | Inspect current `preprocessScan.ts` and real A4 scan assumptions | Current failure mode documented |
| 1 | P0 | Create canonical A4 template geometry | Printable guide + allowed region derive from one shape |
| 2 | P0 | Add `a4-cat-v1` preprocess profile | Scanner can resolve correct profile |
| 3 | P0 | Normalize scan to canonical page coordinates | Fixed scanner test aligns reliably |
| 4 | P0 | Apply allowed-region mask | Nothing outside character survives |
| 5 | P0 | Implement blank-template difference extraction | Unchanged paper + guide disappear |
| 6 | P0 | Preserve guest pixels drawn over guide | Guest marks are not erased with guide |
| 7 | P0 | Output transparent cropped PNG | Final PNG contains user art only |
| 8 | P0 | Feed existing submission/socket pipeline | Wall still updates automatically |
| 9 | P1 | Add translation/rotation tolerance | Slight scan shift still extracts correctly |
| 10 | P1 | Add registration marks only if needed | Real scanner remains reliable over repeated tests |

Do not begin advanced CV work before testing the controlled fixed-scanner path.

---

# 17. Acceptance tests

Use actual or realistic A4 samples.

## Test A — Blank template

Input:

```text
A4 template with dashed guide, no guest drawing
```

Expected:

```text
no meaningful artwork extracted
```

The dashed guide must not become a sprite.

## Test B — Solid coloring inside shape

Guest fills part of the shape with color.

Expected:

- color is preserved;
- white paper disappears;
- dashed guide disappears where unchanged;
- nothing outside allowed region remains.

## Test C — Drawing crosses guide line

Guest intentionally draws over the dashed boundary.

Expected:

- pixels outside the allowed region are clipped;
- guest drawing inside the allowed region remains;
- unchanged guide pixels are removed.

## Test D — Black marker

Expected:

- black guest marks survive;
- gray printed guide does not survive.

## Test E — Pencil / low contrast

Expected:

- tune template-difference threshold so normal pencil remains usable without bringing back large amounts of paper noise.

## Test F — Blank + small shift

Slightly offset scan.

Expected:

- extraction does not create the dashed guide as false artwork;
- alignment tolerance works or the failure is explicitly detected.

## Test G — Existing Live Wall pipeline

Expected:

- exactly one Submission is created;
- `new_artwork` is emitted once;
- final transparent PNG appears on wall;
- existing Float/Hop animations still work.

---

# 18. Debugging outputs during development

During development only, allow optional debug images such as:

```text
debug-normalized-page.png
debug-allowed-mask.png
debug-template-difference.png
debug-user-mask.png
debug-final-artwork.png
```

Gate them behind a setting such as:

```env
SCAN_DEBUG_OUTPUT=false
```

Do not generate these for every scan during the real event by default.

These debug outputs will make threshold/alignment issues much easier to diagnose than terminal logs alone.

---

# 19. Do not do these shortcuts

Do not solve this by:

- keeping the largest connected line as the frame;
- simply cropping to the dashed bounding box and leaving the guide visible;
- deleting all gray pixels globally;
- deleting all dark pixels globally;
- assuming saturation always means guest artwork;
- drawing a white stroke on top of the guide after extraction;
- baking the printed dashed guide into the Live Wall frame;
- redesigning scanner watcher / Socket.IO / animations.

Those approaches either preserve the wrong layer or destroy legitimate guest drawing.

---

# 20. Definition of Done

This correction is complete when:

- [ ] The A4 printable frame uses a faint dashed guide.
- [ ] The guide is clearly visible enough for guests to know where to color.
- [ ] The allowed artwork region is represented by an independent mask.
- [ ] Preprocessing no longer uses the printed outline as the extracted sprite boundary.
- [ ] A blank printed template does not become visible artwork.
- [ ] Unchanged guide pixels are removed.
- [ ] User-created pixels inside the region are preserved.
- [ ] Black/gray user marks are not intentionally discarded by a global color rule.
- [ ] Pixels outside the allowed region are transparent.
- [ ] Final stored PNG contains only user artwork with transparent background.
- [ ] The existing scanner → Submission → Socket.IO → Live Wall flow remains unchanged.
- [ ] Existing animation behavior still works.
- [ ] At least several real print → draw → scan tests pass on the actual event scanner.

---

# 21. Instruction to Codex

Before coding:

1. inspect `server/src/scanner/preprocessScan.ts`;
2. inspect scanner config and `ingestScan.ts`;
3. inspect the existing `FrameDefinition` / `cat-v1` registry;
4. inspect how the A4 template is currently generated or stored;
5. identify whether the actual scanner output is fixed A4 crop/orientation/DPI;
6. write a short implementation note describing the smallest compatible change;
7. implement template-aware extraction without changing scanner ingestion contracts;
8. add focused tests for blank-template rejection, guide removal, and user-art preservation;
9. run project test/check/build commands;
10. document any threshold/alignment assumptions that still need one real scanner calibration.

The key product rule is:

> **The dashed character outline is only a physical coloring guide. The Live Wall must animate the guest's artwork, not the printed guide.**
