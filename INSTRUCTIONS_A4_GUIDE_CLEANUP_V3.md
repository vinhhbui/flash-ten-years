# FLASH 10 — A4 Guide Cleanup V3

## 0. Purpose

This instruction fixes a residual preprocessing problem after the A4 scanner compositing changes.

The current desired sprite semantics are:

- the canonical character interior remains opaque, including untouched white areas;
- guest artwork inside the character is preserved;
- guest artwork extending outside the character is preserved;
- the printed dashed guide must disappear completely;
- the A4 page outside the actual character/artwork remains transparent.

This specifically addresses the case where the outside half of the printed dashed guide survives as visible gray dashes around the final sprite.

Do not redesign registration-marker alignment, scanner watching, submission persistence, Socket.IO, Live Wall, frame registry, or animation registry.

---

# 1. Correct output rule

The final PNG should conceptually be:

```text
OPAQUE CHARACTER BODY
+
GUEST DRAWING INSIDE
+
GUEST DRAWING OUTSIDE
-
PRINTED DASHED GUIDE
=
FINAL SPRITE
```

The printed guide must never remain visible merely because part of its stroke lies outside `allowed-region-mask.svg`.

---

# 2. Important distinction

Outside the canonical character shape there are two very different kinds of pixels:

## Printed template pixels

Examples:

- gray dashed guide;
- anti-aliased gray guide edge pixels;
- small rasterization halo around the printed guide.

These should become transparent outside the character.

## Guest-added pixels

Examples:

- whiskers;
- ears;
- horns;
- accessories;
- thick marker overshoot;
- hand-drawn lines crossing the guide.

These should remain if they are meaningful guest changes inside the configured artwork capture region.

Do not solve the problem by hard-clipping everything outside the character mask.

---

# 3. Required three-zone compositing behavior

For each canonical A4 pixel after marker-based alignment:

## Zone A — inside canonical character mask

If inside `allowed-region-mask.svg`:

- output alpha = 255;
- preserve user color when user changed the pixel;
- if an unchanged printed guide pixel is present, replace it with normalized paper white;
- if no user drawing exists at that location, keep normalized white/paper color.

Result: the character body never becomes transparent inside.

## Zone B — outside character but inside artwork capture region

If outside `allowed-region-mask.svg` but still inside the configured expanded capture region:

- preserve only meaningful guest-added pixels;
- unchanged blank paper becomes transparent;
- unchanged printed dashed guide becomes transparent;
- guide anti-alias/halo pixels become transparent;
- if the user painted or drew over the guide, preserve the user pixel.

This is the critical fix.

## Zone C — outside artwork capture region

Always transparent.

This excludes title, instructions, marker blocks, and unrelated A4 content.

---

# 4. Do not classify outside strokes by paper threshold alone

Outside the character, do NOT keep every non-white or non-paper pixel.

That incorrectly preserves the printed dashed guide.

Outside pixels must be classified primarily by difference from the canonical blank template.

Conceptually:

```text
actual normalized scan pixel
      VS
canonical blank template pixel
```

If they are close:

```text
unchanged template content
→ transparent outside character
```

If they differ enough:

```text
candidate guest-added pixel
→ preserve
```

This lets whiskers survive while unchanged gray guide disappears.

---

# 5. Guide cleanup band

The printed guide is rasterized and anti-aliased, so a one-pixel mask is not sufficient.

Use `guide-stroke-mask.svg` or the configured guide extraction width to build a **guide cleanup band** slightly wider than the visible printed stroke.

The repo already has `guide.extractionMaskWidth` in the template config; use it or an equivalent configurable field rather than introducing unrelated magic numbers.

Inside this cleanup band:

```text
if scan pixel ≈ canonical guide/template pixel
    → unchanged guide

    if inside character:
        replace with opaque white

    if outside character:
        alpha = 0

if scan pixel differs meaningfully from canonical template
    → user painted over guide
    → preserve user pixel
```

This cleanup band should also remove gray anti-alias fringe around the guide.

---

# 6. Desired behavior using the current real example

The current sprite shows:

- white character interior: correct;
- red/blue/green/black user drawing: correct;
- whiskers outside: correct;
- gray dashed border still visible around the character: incorrect.

Expected output:

```text
KEEP
- opaque white character interior
- red outline/coloring created by user
- blue ears
- black facial details
- green details
- whiskers outside
- intentional overshoot outside

REMOVE
- every untouched gray dash around the body
- gray anti-aliased halo from the printed guide
- A4 background
- title/subtitle/footer
- registration markers
```

The final outline should be determined by the user's artwork plus the white character body, not by the printed dashed template.

---

# 7. Critical edge cases

## User paints red over dashed guide outside the character

Preserve red.

Do not erase simply because the pixel is inside guide cleanup band.

## User draws gray whisker outside the character

Preserve it if it differs from the canonical blank template and forms meaningful guest content.

Do not remove all gray pixels by color.

## Untouched gray dashed guide outside the character

Transparent.

## Untouched gray dashed guide inside the character

Opaque white.

## Thick user stroke crosses from inside to outside

Preserve the complete meaningful stroke within the capture region.

---

# 8. Recommended compositing order

Use an order similar to:

```text
1. normalize page using the existing 4 markers
2. load blank template
3. load allowed-region mask
4. load guide-stroke mask
5. derive artwork capture region
6. derive widened guide cleanup band
7. compute guest-difference mask versus blank template
8. compose opaque white interior
9. overlay guest pixels inside character
10. preserve meaningful guest pixels outside character
11. explicitly suppress unchanged guide pixels outside character
12. suppress all other page pixels
13. crop transparent margins around full sprite
```

Do not let outside-stroke extraction run before guide/template suppression in a way that reintroduces the guide.

---

# 9. Blank-template detection remains separate

Because the character interior is always opaque white, final alpha coverage cannot determine whether the guest drew anything.

Continue using a separate guest-change metric such as `guestChangedPixelCount` before final compositing.

A blank template should still fail as "no meaningful guest artwork".

---

# 10. Required tests

Add regression tests for at least:

1. untouched guide outside character → transparent;
2. untouched guide inside character → opaque white;
3. red paint over guide outside character → red preserved;
4. black paint over guide outside character → black preserved;
5. gray whisker outside character → preserved when guest-added;
6. untouched blank paper outside → transparent;
7. guide anti-alias fringe → removed;
8. white untouched character interior → opaque;
9. thick stroke crossing boundary → preserved across boundary;
10. title/footer/markers → absent;
11. final crop includes whiskers/accessories but not page content.

Use a synthetic fixture modeled on the real failing screenshot where the gray dashed outline is still visible around an otherwise correct sprite.

---

# 11. Acceptance criteria

Do not consider the task complete until:

- [ ] white character interior remains opaque;
- [ ] untouched guide dashes outside the character are fully transparent;
- [ ] untouched guide dashes inside become white, not transparent;
- [ ] user paint over the guide survives;
- [ ] whiskers and intentional outside artwork survive;
- [ ] guide anti-alias halo is removed;
- [ ] A4 page text and markers remain excluded;
- [ ] blank-template rejection still works;
- [ ] existing 4-marker alignment still works;
- [ ] scanner ingest, persistence, Socket.IO, wall rendering remain unchanged;
- [ ] tests/check/build pass.

The core product rule is:

> **Keep the white character body and the guest's actual drawing, but make the printed dashed template outline completely disappear.**
