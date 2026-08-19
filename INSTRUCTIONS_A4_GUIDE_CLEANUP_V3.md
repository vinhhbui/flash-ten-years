# FLASH 10 — A4 Layered Character Compositing V3

## 0. Status and priority

This is the **authoritative instruction for the current A4 scanner output/compositing behavior**.

It supersedes older A4 compositing instructions wherever they conflict, including `INSTRUCTIONS_A4_COMPOSITING_V2.md`.

Keep the current four-registration-marker page alignment and the existing scanner ingestion pipeline.

Do **not** redesign scanner watching, deduplication, persistence, Socket.IO, Live Wall, frame registry, animation registry, or landing-page behavior.

The current task is only about how a normalized A4 scan becomes the final transparent PNG sprite.

---

# 1. Product objective

The final Live Wall sprite must behave like a real completed character, not like a sparse set of painted pixels and not like the whole printed template.

The required model is:

```text
FINAL SPRITE
=
BASE CHARACTER BODY LAYER
+
USER PAINT LAYER
```

The physical dashed guide is only a temporary coloring aid and must not appear in the final sprite.

The A4 page itself must not appear either.

---

# 2. Real guest behavior that must be supported

A guest may:

- color only part of the character;
- leave large areas completely untouched;
- paint directly over the dashed guide;
- paint across the dashed guide;
- draw beyond the original character boundary;
- add whiskers, ears, horns, hair, stars, accessories, or other external marks;
- make thick strokes that overshoot the guide;
- use black, gray, red, green, blue, pencil, or other colors.

All of these are valid.

The system must not require the user to fill the complete character.

---

# 3. Current bug and root cause

The current implementation in `server/src/scanner/templateCompositing.ts` fills every pixel inside `allowed-region-mask.svg` with opaque white before overlaying guest changes.

Conceptually it does:

```ts
if (insideCharacter && preserveCharacterInterior) {
  output = opaqueWhite;
}
```

where `insideCharacter` comes directly from `allowed-region-mask.svg`.

This is incorrect because one mask is doing two unrelated jobs:

1. canonical/reference character geometry;
2. final opaque white body silhouette.

The result is an unwanted **white outer rim / halo** around the user's painted contour even when the dashed guide itself has already been removed.

Therefore:

> **`allowed-region-mask.svg` must no longer be used directly as the final white alpha mask.**

---

# 4. Required two-layer architecture

## Layer A — Base Character Body Layer

This is the stable white interior of the character.

It exists so untouched areas remain white and the character does not look hollow.

Requirements:

- opaque white;
- contains only the intended internal body area;
- does not include the printed dashed guide;
- does not extend far enough to create a visible white rim outside the user's painted contour;
- independent from guest-paint detection.

### Required implementation

Add a distinct body-fill mask concept.

Preferred and authoritative P0 implementation:

```text
shared/templates/cat-v1/body-fill-mask.svg
```

This asset should be generated from the same canonical character geometry/config as the other template assets, but inset/eroded from the outer canonical boundary.

Do not simply alias:

```text
body-fill-mask = allowed-region-mask
```

The body-fill mask must be smaller than the full canonical outer region where needed to prevent a white halo.

A derived erosion implementation is acceptable internally, but the template/profile contract should still expose the idea as a separate body-fill region.

## Layer B — User Paint Layer

This layer contains only meaningful guest-added pixels.

It may include:

- coloring inside the body;
- facial details;
- user paint over the guide;
- paint crossing the body boundary;
- whiskers;
- external ears/horns/hair;
- stars/accessories;
- intentional overshoot.

Outside guest-created strokes, this layer is transparent.

Detect it primarily by comparing:

```text
normalized scan
VS
canonical blank template
```

not by checking whether pixels are merely non-white.

---

# 5. Mask and region responsibilities

The scanner must treat these as separate concepts.

## `allowed-region-mask.svg`

Role:

- canonical/reference character geometry;
- source for deriving body/capture geometry;
- reference boundary for tests and configuration;
- **not** automatically the final white alpha silhouette.

## `body-fill-mask.svg`

Role:

- defines where untouched character pixels stay opaque white;
- should sit inside the canonical outer boundary;
- must not create a white outer rim.

## `guide-stroke-mask.svg`

Role:

- identifies the printed dashed guide and cleanup band;
- unchanged guide must disappear;
- user paint over the guide must survive.

## Artwork capture region

Role:

- defines how far outside the canonical character meaningful guest marks may survive;
- may be derived by dilating the canonical mask;
- should preserve whiskers/accessories/overshoot;
- should exclude title/footer/registration markers.

Reusable mental model:

```text
allowed region       = reference geometry
body fill mask       = stable white interior
user difference mask = guest-created artwork
capture mask         = allowable external artwork area
guide mask           = printed template content to suppress
```

---

# 6. Required final pixel semantics

After four-marker page normalization, classify each pixel by zone.

## Zone A — inside `bodyFillMask`

Default:

```text
opaque white
```

If the guest changed the pixel meaningfully:

```text
use normalized scanned guest pixel
```

If unchanged printed guide crosses this region:

```text
keep opaque white
```

Result:

```text
untouched face/body → opaque white
```

## Zone B — inside canonical allowed region but outside `bodyFillMask`

This is the critical anti-white-rim boundary band.

Default:

```text
transparent
```

Only preserve meaningful guest-added pixels.

Examples:

```text
untouched white paper near edge → transparent
untouched gray guide            → transparent
red paint near edge             → preserve red
black paint near edge           → preserve black
green paint near edge           → preserve green
```

Do not automatically fill this zone white.

## Zone C — outside canonical region but inside artwork capture region

Default:

```text
transparent
```

Preserve only meaningful guest-added pixels.

Examples:

```text
whisker             → keep
external blue ear   → keep
horn/accessory      → keep
marker overshoot    → keep
blank paper         → transparent
printed guide       → transparent
```

## Zone D — outside artwork capture region

Always transparent.

---

# 7. Guide cleanup rule

Guide removal and body fill are separate operations.

Do not erase all pixels simply because they are inside `guide-stroke-mask.svg`.

Use the blank canonical template to decide whether a guide-area pixel is unchanged template content or guest paint.

Inside the configurable guide cleanup band:

```text
if scan pixel ≈ canonical template/guide pixel:
    if inside bodyFillMask:
        output = opaque white
    else:
        output = transparent

if scan pixel differs meaningfully from canonical template:
    preserve guest pixel
```

Required behavior:

```text
unchanged gray guide inside body core  → white
unchanged gray guide near/outside edge → transparent
red over guide                         → red
black over guide                       → black
green over guide                       → green
```

Do not remove all gray pixels by color because guest whiskers may also be gray.

Use `guide.cleanupBandPaddingPx` / existing template guide extraction-width config rather than a one-pixel exact match.

---

# 8. User Paint Layer extraction

Build the guest layer before white-body composition.

Recommended pipeline:

```text
normalized scan
    ↓
blank-template difference
    ↓
guide-aware thresholding
    ↓
guest-change candidates
    ↓
component/noise filtering
    ↓
USER PAINT LAYER
```

Keep meaningful guest changes both inside and outside the canonical character when they are inside the capture region.

Do not preserve every non-white pixel outside the body.

Use blank-template difference so printed template content disappears while a newly drawn gray whisker survives.

---

# 9. Template/profile contract

Extend the template profile so the body-fill concept is explicit.

Recommended configuration:

```json
{
  "output": {
    "preserveCharacterInterior": true,
    "bodyFillMode": "asset",
    "bodyFillMask": "body-fill-mask.svg",
    "preserveOutsideUserStrokes": true,
    "outsideCaptureRadiusPx": 180,
    "outsideDifferenceThreshold": 45,
    "minimumOutsideComponentPixels": 10,
    "minimumGuestArtworkPixels": 24,
    "cropPaddingRatio": 0.04
  }
}
```

If the implementation derives the mask instead of loading an asset, support something conceptually equivalent to:

```json
{
  "output": {
    "bodyFillMode": "eroded-allowed-mask",
    "bodyFillInsetPx": 10
  }
}
```

Exact values must be tuned against real scan fixtures.

Do not treat example values as universal constants.

Future template generation should keep these synchronized:

```text
printable-template.svg
allowed-region-mask.svg
body-fill-mask.svg
guide-stroke-mask.svg
```

---

# 10. Current code areas to change

Focus on:

```text
server/src/scanner/templateCompositing.ts
server/src/scanner/templateProfiles.ts
shared/templates/cat-v1/template.config.json
shared/templates/cat-v1/body-fill-mask.svg   ← new
```

Also update template-generation code/tests if those assets are generated.

The current `composeFinalSprite()` behavior that fills the full `allowedRegionMask` white must be removed.

Target composition pseudocode:

```ts
if (bodyFillMask[pixel]) {
  output = guestChanged[pixel]
    ? scanPixel
    : opaqueWhite;
}
else if (guestChanged[pixel] && captureMask[pixel]) {
  output = scanPixel;
}
else {
  output = transparent;
}
```

This exact semantic separation is required.

---

# 11. Blank-template validation

Because Layer A is always white, final output alpha coverage cannot prove that the guest drew anything.

Continue using a separate metric such as:

```text
guestChangedPixelCount
```

computed from the User Paint Layer before base-body composition.

A clean untouched template must still fail as:

```text
no meaningful guest artwork
```

The white body alone must not count as guest artwork.

---

# 12. Crop behavior

Crop only after final composition.

The final crop must include:

- white body core;
- guest coloring inside;
- boundary paint;
- whiskers;
- external ears/accessories;
- meaningful overshoot.

It must exclude:

- page title;
- footer/instructions;
- registration markers;
- blank A4 paper;
- unused white boundary band.

Do not crop only to the canonical body bounding box because that would cut external user artwork.

---

# 13. Required regression tests

Add/update tests for all of these.

## Test 1 — untouched white interior

Guest colors only a small part.

Expected:

- untouched face/body core remains opaque white;
- no extra white rim appears outside the body-fill region.

## Test 2 — no white outer rim

No guest paint in the canonical boundary band.

Expected:

```text
inside allowedRegion but outside bodyFillMask
→ transparent
```

This is the main regression test.

## Test 3 — user paint at boundary

Red/black/green paint near or across the boundary remains visible.

## Test 4 — unchanged guide in white core

Becomes white, not gray and not transparent.

## Test 5 — unchanged guide near/outside edge

Fully transparent, including anti-alias halo.

## Test 6 — paint over guide

Guest color survives.

## Test 7 — whiskers outside

Gray/black whiskers remain when they differ from the blank template.

## Test 8 — external ear/accessory

User-created external decoration remains.

## Test 9 — blank paper

Transparent outside body/user art.

## Test 10 — blank template

Rejected as no meaningful guest artwork.

## Test 11 — page content

Title, instructions, footer, and four registration markers never appear.

## Test 12 — crop

Includes whiskers/accessories without including blank page space.

## Test 13 — existing marker alignment

Rotated/translated/perspective input still uses the current four-marker workflow successfully.

Use a regression fixture modeled on the real failing case:

- dashed guide already removed;
- white interior correct;
- user paint visible;
- unwanted white outer rim previously visible.

The test should fail if any white halo remains in the boundary band without guest paint.

---

# 14. Do not change

Do not redesign:

- four-marker detection;
- projective page normalization;
- scanner watcher;
- scanner inbox/archive/failed workflow;
- deduplication;
- submission service;
- `submissions.json`;
- Socket.IO `new_artwork`;
- Live Wall rendering;
- animation registry;
- frame registry;
- landing page.

This is a contained A4 compositing refactor.

---

# 15. Definition of Done

Do not consider the task complete until:

- [ ] `allowed-region-mask.svg` is no longer blindly used as the full white silhouette;
- [ ] a separate body-fill region exists;
- [ ] `body-fill-mask.svg` or equivalent profile-backed body-fill logic is implemented;
- [ ] untouched body core remains opaque white;
- [ ] canonical boundary area without guest paint becomes transparent;
- [ ] the unwanted white outer rim is gone;
- [ ] user paint near/crossing the boundary survives;
- [ ] user artwork outside the canonical character survives within capture limits;
- [ ] unchanged printed guide is invisible;
- [ ] guide anti-alias halo is invisible;
- [ ] blank A4 paper is transparent;
- [ ] title/footer/markers are excluded;
- [ ] blank-template rejection still works;
- [ ] current four-marker alignment remains unchanged;
- [ ] scanner ingestion/persistence/Socket.IO/Live Wall behavior remains unchanged;
- [ ] tests pass;
- [ ] type checks pass;
- [ ] production build passes.

---

# 16. Product rule

> **Use one layer for the stable white character interior and a separate layer for the guest's real paint. Keep the inside solid, preserve genuine outside decorations, and never let the canonical template mask create a white outer rim.**
