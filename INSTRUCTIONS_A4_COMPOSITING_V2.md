# FLASH 10 — A4 Scan Compositing V2

## 0. Status

This document defines the **current desired output semantics** for A4 template scanning.

It supersedes any older instruction that says the final sprite should contain only guest-added pixels inside `allowed-region-mask.svg`.

The current marker-based page registration should be preserved.

The new objective is:

> **Keep the whole character interior opaque, remove the printed dashed guide, preserve guest drawing inside the character, and also preserve intentional guest strokes that extend outside the character. Everything else on the A4 page becomes transparent.**

Do not redesign scanner watching, deduplication, persistence, Socket.IO, Live Wall, frame registry, or animation registry.

---

# 1. Desired physical behavior

A guest receives the printed A4 template and may:

- color inside the character;
- leave some areas completely uncolored;
- paint directly over the dashed guide;
- draw across the dashed boundary;
- add whiskers, ears, accessories, stars, lines, or other decorations outside the dashed shape;
- make imperfect strokes that overshoot the guide.

All of those behaviors are valid.

The system must not require the user to color every part of the character.

---

# 2. New output semantics

The final PNG has three different pixel classes.

## A. Inside the canonical character shape

Pixels inside `allowed-region-mask.svg` must remain **opaque**.

This includes areas the guest did not color.

Conceptually:

```text
inside allowed region
    ↓
opaque output
```

Uncolored paper inside the character should remain white / normalized paper color instead of becoming transparent.

Example:

```text
INPUT CHARACTER

red ear
white face area
black eyes
green body marks

OUTPUT

red ear          = opaque
white face area  = opaque white
black eyes       = opaque
green body marks = opaque
```

Do not make untouched white areas inside the character transparent.

---

## B. Printed dashed guide

The printed gray dashed guide must still disappear.

However, removing the guide must not punch transparent holes into the character interior.

Correct behavior inside the character:

```text
unchanged gray guide pixel
    ↓
replace with opaque normalized paper/white
```

NOT:

```text
unchanged gray guide pixel
    ↓
transparent
```

If the guest paints over a guide pixel:

```text
red over guide   → preserve red
black over guide → preserve black
green over guide → preserve green
```

Only the unchanged printed guide itself is removed.

---

## C. Guest drawing outside the canonical character shape

Guest-added strokes outside `allowed-region-mask.svg` must be preserved when they are close enough to the character artwork area.

Examples:

- whiskers;
- antennae;
- hair;
- horns;
- ears extending past the guide;
- stars or small decorations beside the character;
- accidental overshoot from thick marker strokes.

These pixels must not be clipped just because they are outside the original dashed shape.

However, the complete A4 page must not become part of the sprite.

So the system needs a separate **artwork capture region** larger than the canonical character shape.

---

# 3. Three masks / regions

The scanner should conceptually use three separate regions.

```text
1. CANONICAL CHARACTER MASK
   allowed-region-mask.svg

2. GUIDE STROKE MASK
   guide-stroke-mask.svg

3. ARTWORK CAPTURE REGION
   expanded region around the character
```

Their roles are different.

## Canonical character mask

Defines the region that must always remain opaque.

## Guide stroke mask

Defines where known printed dashed guide pixels may need replacement/removal.

## Artwork capture region

Defines how far outside the original character the system is willing to preserve guest-added strokes.

Do not use the canonical character mask as a hard clip for all guest artwork anymore.

---

# 4. Recommended capture-region implementation

For P0, derive the capture region by expanding/dilating the canonical `allowed-region-mask` by a configurable radius.

Example config:

```json
{
  "output": {
    "preserveCharacterInterior": true,
    "preserveOutsideUserStrokes": true,
    "outsideCaptureRadiusPx": 180,
    "outsideDifferenceThreshold": 45,
    "minimumOutsideComponentPixels": 10,
    "interiorPaperMode": "normalized-paper"
  }
}
```

Exact values must be tuned using real A4 scans.

Do not hardcode them in multiple functions.

`outsideCaptureRadiusPx` should be large enough to preserve whiskers and similar decorations but small enough to avoid capturing the page title, instructions, and corner markers.

A future template may provide an explicit `artwork-capture-mask.svg`, but this is not required for the first implementation.

---

# 5. Updated template preprocessing pipeline

Keep the current registration-marker page alignment.

The new flow is:

```text
RAW SCAN
    ↓
detect 4 registration markers
    ↓
normalize / perspective-warp to canonical A4
    ↓
load blank canonical template
    ↓
load allowed-region-mask
    ↓
load guide-stroke-mask
    ↓
create expanded artwork capture region
    ↓
detect meaningful guest changes versus blank template
    ↓
compose opaque character interior
    ↓
remove unchanged dashed guide without creating transparency inside
    ↓
add guest-created pixels from the outside capture region
    ↓
remove A4 page / title / instructions / markers
    ↓
crop to visible sprite bounds
    ↓
RGBA transparent PNG
```

---

# 6. Interior compositing rule

Inside `allowed-region-mask.svg`, do not use "difference from blank template" to decide alpha.

Alpha should normally be 255 for the whole canonical character interior.

Pseudo-rule:

```ts
if (insideAllowedRegion) {
  output.alpha = 255;

  if (guestChangedPixel) {
    output.rgb = normalizedScanPixel;
  } else if (isUnchangedGuidePixel) {
    output.rgb = normalizedPaperColor;
  } else {
    output.rgb = normalizedScanPixelOrPaper;
  }
}
```

The important result is:

```text
untouched white interior → opaque white
```

not transparent.

---

# 7. Guide removal rule

The guide must be removed visually while preserving user paint over it.

Use the existing canonical blank template + `guide-stroke-mask.svg`.

Inside or near the guide:

```text
scan pixel ≈ blank guide pixel
    → unchanged guide
    → replace with normalized paper/white

scan pixel differs meaningfully from blank guide
    → user drew over it
    → preserve scan pixel
```

Do not simply zero alpha for guide-mask pixels.

This rule applies both just inside and just outside the canonical boundary where the dashed stroke has thickness.

---

# 8. Outside-stroke extraction rule

Outside `allowed-region-mask.svg` but inside the expanded artwork capture region:

```text
blank-template comparison
    ↓
meaningful guest-added pixel?
```

If yes:

```text
preserve it with alpha 255
```

If no:

```text
transparent
```

This allows whiskers and decorations to survive without preserving the entire paper.

The static A4 title, instructions, corner markers, and unchanged guide should not survive because they are present in the blank canonical template and therefore are not guest additions.

---

# 9. Outside-component filtering

To reduce scanner noise, optionally group outside guest-difference pixels into connected components.

Suggested rules:

- discard extremely tiny components;
- preserve components above `minimumOutsideComponentPixels`;
- optionally prefer components that touch or come near the canonical character region;
- do not require a component to be physically connected to the body, because decorations such as separate stars may be valid.

Do not aggressively filter thin whiskers.

Thin long strokes are valid artwork.

---

# 10. Blank-template acceptance rule

Because the character interior is now always opaque, output visibility can no longer be used to decide whether a guest actually drew anything.

Do NOT do:

```text
count opaque output pixels
→ decide artwork exists
```

That would make an untouched blank template look like valid artwork.

Instead, calculate a separate `guestChangedPixelCount` before composing the opaque white interior.

Acceptance rule:

```text
guestChangedPixelCount >= minimumGuestArtworkPixels
```

Only meaningful guest-added changes count.

The untouched character's white interior must not count as guest artwork.

---

# 11. Crop behavior

Crop the final RGBA result using all visible output pixels.

Because the canonical interior is opaque, the crop naturally includes the entire character body.

If whiskers or other outside decorations extend beyond the body, the crop must expand to include them too.

Use the existing crop padding setting or add a dedicated output padding if needed.

Do not crop external decorations off.

---

# 12. Example based on real event behavior

Input:

```text
        blue ears
        ↓
   red painted border

 gray whisker ← CAT → gray whisker

      white face
      black eyes
      green marks

 some strokes cross outside the dashed guide
```

Expected final sprite:

```text
transparent outside capture

        blue ears
        ↓
   red painted border

 gray whisker ← CAT → gray whisker

      WHITE FACE     ← opaque, not transparent
      black eyes
      green marks

transparent page background
```

The printed dashed guide is gone.

The page title, instructions, and registration markers are gone.

---

# 13. Required code change area

The current marker-based registration should remain.

Focus the refactor on the template compositing/extraction stage, especially the logic currently equivalent to:

```ts
if (allowedRegionMask.data[targetOffset] <= 128) continue;
```

and:

```ts
if (difference <= threshold) continue;
```

Those rules currently force:

- outside strokes to disappear;
- untouched interior to become transparent.

Replace them with separate interior and outside compositing paths.

Keep `preprocessScan()` as the public boundary.

Recommended internal separation:

```text
extractGuestDifferenceMask()
composeOpaqueCharacterInterior()
extractOutsideGuestStrokes()
removeUnchangedGuide()
composeFinalArtwork()
```

Exact names may differ.

---

# 14. Configuration contract

Extend template configuration with one obvious output section.

Recommended shape:

```json
{
  "output": {
    "preserveCharacterInterior": true,
    "interiorPaperMode": "normalized-paper",
    "preserveOutsideUserStrokes": true,
    "outsideCaptureRadiusPx": 180,
    "outsideDifferenceThreshold": 45,
    "minimumOutsideComponentPixels": 10,
    "minimumGuestArtworkPixels": 24
  }
}
```

Do not put template-specific visual tuning into global scanner watcher code.

Future frames/templates should be able to tune these values independently.

---

# 15. Required tests

Add focused tests for the new output semantics.

## Test A — partial coloring

Guest colors only part of the character.

Expected:

- colored regions preserved;
- uncolored interior remains opaque white;
- outside page transparent.

## Test B — guide removal

Guest leaves part of the dashed guide untouched.

Expected:

- untouched guide disappears visually;
- character interior underneath remains opaque white.

## Test C — paint over guide

Guest paints red/black/green over the dashed guide.

Expected:

- guest paint survives;
- unchanged gray guide does not.

## Test D — whiskers outside shape

Guest draws long thin whiskers outside the canonical mask.

Expected:

- whiskers survive;
- page background around them is transparent.

## Test E — overshoot

Thick marker stroke crosses the character boundary.

Expected:

- inside part preserved;
- reasonable outside overshoot preserved inside the capture region.

## Test F — static page elements

Expected final output must not contain:

- title;
- subtitle;
- instructions;
- registration markers.

## Test G — blank template

Expected:

- rejected as no meaningful guest artwork;
- opaque character interior alone must not cause acceptance.

## Test H — crop with external decoration

Expected:

- crop includes the whole character;
- crop also includes whiskers/decorations extending beyond it.

---

# 16. Do not change

Do not redesign:

- registration-marker detection;
- perspective normalization unless a regression requires a small fix;
- scanner watcher;
- deduplication;
- submission service;
- `submissions.json`;
- Socket.IO `new_artwork`;
- `/wall`;
- animation registry;
- frame registry;
- Float/Hop;
- landing page.

This task is specifically about how the normalized A4 scan becomes the final sprite PNG.

---

# 17. Definition of Done

- [ ] Page still aligns using registration markers.
- [ ] Whole canonical character interior is opaque.
- [ ] Untouched white areas inside the character remain white/opaque.
- [ ] Printed dashed guide is visually removed.
- [ ] Removing the guide does not create transparent holes inside the character.
- [ ] Guest paint over the guide survives.
- [ ] Guest strokes outside the canonical shape survive within a configurable capture region.
- [ ] Whiskers and thin external lines are preserved.
- [ ] A4 paper outside the sprite becomes transparent.
- [ ] Page title/instructions/registration markers are absent from output.
- [ ] Blank template is still rejected as no guest artwork.
- [ ] Crop includes external decorations.
- [ ] Existing scanner ingestion and Live Wall realtime behavior remain unchanged.
- [ ] Tests pass.
- [ ] TypeScript check passes.
- [ ] Production build passes.

---

# 18. Product rule

> **The character body is the opaque base. The guest can color part of it or leave part of it white. Decorations may extend beyond the original dashed guide. The dashed guide and A4 page are temporary physical aids only and must not appear in the Live Wall sprite.**
