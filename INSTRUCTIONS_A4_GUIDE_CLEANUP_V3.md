# FLASH 10 — A4 Layered Character Compositing V3

## 0. Purpose and priority

This document defines the **current desired scanner output semantics** for the physical A4 coloring workflow.

It supersedes older A4 instructions wherever they imply either of these behaviors:

- using the full `allowed-region-mask.svg` directly as an opaque white final silhouette;
- keeping only guest-changed pixels and making all untouched character interior transparent.

The required model is now a **layered composition**:

```text
FINAL SPRITE
=
BASE CHARACTER BODY LAYER
+
USER PAINT LAYER
```

The printed dashed guide is input/template metadata only. It must not become part of the final sprite.

Keep the current four-registration-marker alignment architecture. Do not redesign scanner watching, ingestion, persistence, Socket.IO, Live Wall, frame registry, or animation registry.

---

# 1. Product behavior

A guest receives a known A4 template. They may:

- color only part of the character;
- leave large areas untouched;
- paint over the dashed guide;
- paint beyond the dashed guide;
- add whiskers, ears, hair, horns, stars, accessories, or other marks outside the original shape;
- make imperfect thick strokes crossing the boundary.

All of these behaviors are valid.

The final animated PNG should feel like one complete character:

- untouched interior remains opaque white;
- user colors inside remain visible;
- user-added artwork outside remains visible;
- unused A4 paper outside becomes transparent;
- the printed dashed guide disappears;
- there is **no unwanted white outer rim/halo caused by the canonical template mask**.

---

# 2. Root cause of the current white-rim bug

The current implementation in `server/src/scanner/templateCompositing.ts` conceptually does this:

```ts
if (insideCharacter && preserveCharacterInterior) {
  output = opaqueWhite;
}
```

where `insideCharacter` is determined directly from `allowed-region-mask.svg`.

That means the same mask is doing two jobs:

1. describing the canonical character boundary;
2. defining the final opaque white body silhouette.

Those jobs must be separated.

If the canonical mask reaches the printed outline/boundary, forcing the whole mask to opaque white can leave a visible white ring around the user's painted contour even after the dashed guide itself has been removed.

Therefore:

> **`allowed-region-mask.svg` must no longer automatically mean “fill every pixel here white.”**

---

# 3. Required layered model

## Layer A — Base Character Body Layer

This is the stable white body that prevents the character from looking hollow when the guest leaves areas uncolored.

Requirements:

- opaque white;
- contains only the intended **interior core** of the character;
- does not include the printed dashed guide;
- does not produce a white rim around the original guide boundary;
- exists independently from guest paint detection.

Preferred implementation:

```text
body-fill-mask.svg
```

Alternative P0 implementation:

```text
allowed-region-mask
    ↓ erode/inset
bodyFillMask
```

The important rule is that the body-fill mask is **inset from the canonical outer boundary** enough that unpainted white pixels do not appear as a halo around the user's contour.

Do not simply alias:

```text
bodyFillMask = allowedRegionMask
```

unless a test proves that template has no white-rim problem.

## Layer B — User Paint Layer

This contains only meaningful guest-added pixels detected from the normalized scan.

It may contain:

- red/green/blue/black coloring inside;
- thin pen/pencil details;
- user paint over the guide;
- thick paint crossing the character boundary;
- whiskers;
- external ears/horns/hair;
- stars/accessories;
- intentional overshoot.

Outside the user-painted strokes, this layer is transparent.

The layer must be detected primarily by comparing:

```text
normalized scan
VS
canonical blank template
```

not by checking whether a pixel is merely non-white.

---

# 4. Mask responsibilities

The system should treat these as separate concepts.

## A. `allowed-region-mask.svg`

Role:

- canonical/reference character region;
- geometry source for deriving body fill and capture regions;
- not automatically the final white alpha mask.

## B. `body-fill-mask.svg` or derived body-fill mask

Role:

- defines only where untouched character pixels should stay opaque white;
- should be inset from the outer guide/boundary;
- must not create a white outer rim.

## C. `guide-stroke-mask.svg`

Role:

- identifies printed guide pixels and their cleanup band;
- unchanged guide must disappear;
- user paint over the guide must survive.

## D. artwork capture region

Role:

- defines how far outside the canonical character user-added marks may be preserved;
- may be derived by dilating the canonical mask;
- should include whiskers/accessories/overshoot but exclude title/footer/markers.

The reusable mental model is:

```text
canonical shape      = geometry reference
body fill mask       = white interior
user difference mask = guest-created artwork
capture mask         = allowed external decoration area
guide mask           = printed content to suppress
```

---

# 5. Required final compositing semantics

For each pixel after four-marker page normalization:

## Zone A — inside `bodyFillMask`

Default:

```text
opaque white
```

If guest changed the pixel meaningfully:

```text
use scanned guest pixel
```

If the original dashed guide is unchanged there:

```text
keep opaque white
```

Result: untouched internal face/body areas remain solid white.

## Zone B — between `bodyFillMask` and the canonical outer shape

This is the critical anti-white-rim boundary zone.

Default:

```text
transparent
```

Only keep pixels when they are meaningful guest-added content.

Examples:

```text
untouched paper near boundary → transparent
untouched printed guide       → transparent
red paint near boundary       → preserve red
black paint near boundary     → preserve black
```

Do not automatically fill this band white.

## Zone C — outside canonical shape but inside artwork capture region

Default:

```text
transparent
```

Preserve only meaningful guest-added pixels.

Examples:

```text
whisker             → keep
external blue ear   → keep
star/accessory      → keep
marker overshoot    → keep
blank paper         → transparent
printed gray guide  → transparent
```

## Zone D — outside artwork capture region

Always transparent.

---

# 6. Guide removal behavior

Guide removal and body fill are separate operations.

Do not solve guide removal by deleting every pixel under `guide-stroke-mask`.

Inside the guide cleanup band compare the scan against the blank template.

If pixel still matches template/guide closely:

```text
inside bodyFillMask  → opaque white
outside bodyFillMask → transparent
```

If the guest painted over that location:

```text
preserve user pixel
```

Required examples:

```text
unchanged gray guide inside body core  → white
unchanged gray guide near/outside edge → transparent
red over guide                         → red
black over guide                       → black
green over guide                       → green
```

Use the existing configurable cleanup band such as `guide.cleanupBandPaddingPx`; do not rely on exact grayscale matching because scan interpolation and anti-aliasing vary.

---

# 7. User Paint Layer extraction

Detect the guest layer before final white-body composition.

Recommended process:

```text
normalized scan
    ↓
blank-template difference
    ↓
guide-aware thresholds
    ↓
user-change candidates
    ↓
component/noise filtering
    ↓
USER PAINT LAYER
```

Keep user changes both inside and outside the canonical shape when they are within the capture region.

Outside the body, do not preserve every gray/non-white pixel. Compare against the blank template so printed content disappears while a newly drawn gray whisker survives.

---

# 8. New template configuration

Extend the current template output configuration with a body-fill concept.

Preferred asset-backed form:

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

Acceptable P0 derived form:

```json
{
  "output": {
    "preserveCharacterInterior": true,
    "bodyFillMode": "eroded-allowed-mask",
    "bodyFillInsetPx": 10,
    "preserveOutsideUserStrokes": true
  }
}
```

Exact inset value must be tuned with the real scan fixture. Do not blindly use `10` as a universal value.

If `body-fill-mask.svg` is added, future frame/template generation should generate it from the same canonical geometry/config so masks remain synchronized.

---

# 9. Current recommended architecture

Keep `preprocessScan()` as the public boundary.

`templateCompositing.ts` should conceptually operate as:

```text
composeTemplateArtwork()
    ↓
create/load bodyFillMask
    ↓
create artworkCaptureMask
    ↓
create guideCleanupBand
    ↓
detectGuestChangeMask
    ↓
filter meaningful outside components
    ↓
composeBaseBodyLayer
    ↓
composeUserPaintLayer
    ↓
merge layers
    ↓
transparent outside unused regions
```

Recommended final composition pseudocode:

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

Guide suppression must happen during guest-change classification so unchanged guide pixels are not mistakenly reintroduced as user artwork.

---

# 10. Blank-template validation

Because Layer A is always opaque white, final output alpha coverage cannot determine whether the guest drew anything.

Keep a separate metric such as:

```text
guestChangedPixelCount
```

computed from the User Paint Layer before white body composition.

An untouched template must still fail as no meaningful guest artwork.

---

# 11. Crop behavior

Crop only after final layer composition.

The crop must include:

- white body core;
- user paint inside;
- whiskers;
- ears/accessories outside;
- meaningful overshoot.

It must exclude:

- page title;
- footer/instructions;
- registration markers;
- blank A4 paper.

Do not crop only to the original canonical body box because that would cut external user artwork.

---

# 12. Required regression tests

Add/update tests for all of these cases.

1. **Untouched interior**
   - guest colors only a small area;
   - center/face/body untouched area remains opaque white.

2. **No white outer rim**
   - no guest paint in the boundary band;
   - pixels outside `bodyFillMask` are transparent even if they are still inside `allowed-region-mask`.

3. **User paint at boundary**
   - red/black/green guest paint near or across the boundary remains visible.

4. **Untouched guide in white core**
   - becomes white, not gray and not transparent.

5. **Untouched guide outside body core**
   - fully transparent, including anti-alias halo.

6. **Paint over guide**
   - guest color survives.

7. **Whiskers outside**
   - gray/black whiskers remain when they differ from the blank template.

8. **External ear/accessory**
   - user-created external decoration remains.

9. **Blank paper**
   - remains transparent outside body/user art.

10. **Blank template**
    - still rejected as no meaningful guest artwork.

11. **Page content**
    - title, instructions, footer, and four markers never appear in final output.

12. **Crop**
    - includes whiskers/accessories but does not include blank page space.

13. **Existing marker alignment**
    - rotated/translated/perspective input still aligns through the current four-marker workflow.

Use a regression fixture modeled on the real failure: character interior is correctly white, guide is already removed, but an unwanted white halo/rim remains around the user's painted contour.

---

# 13. Acceptance criteria

Do not consider this task complete until all are true:

- [ ] `allowed-region-mask` is no longer blindly used as the full white alpha silhouette;
- [ ] a distinct body-fill mask/core exists;
- [ ] untouched body core remains opaque white;
- [ ] boundary area without user paint can become transparent;
- [ ] no unwanted white rim remains around the character;
- [ ] user paint near/crossing the boundary survives;
- [ ] user artwork outside the canonical shape survives within capture limits;
- [ ] unchanged printed guide is invisible;
- [ ] guide anti-alias halo is invisible;
- [ ] blank paper is transparent;
- [ ] title/footer/markers are excluded;
- [ ] blank-template rejection still works;
- [ ] current four-marker alignment remains unchanged;
- [ ] scanner ingestion/persistence/Socket.IO/Live Wall behavior remains unchanged;
- [ ] tests, type checks, and production build pass.

The core product rule is:

> **Use one layer for the stable white character interior and a separate layer for the guest's real paint. Keep the inside solid, keep genuine outside decorations, but never let the template mask create a white outer rim.**
