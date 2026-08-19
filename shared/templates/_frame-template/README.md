# Reusable A4 Frame Template

Copy this entire folder whenever you want to create a new physical A4 coloring frame.

## Files

- `printable-template.svg`: the A4 artwork that is printed for guests. The character outline is faint and dashed.
- `allowed-region-mask.svg`: the closed shape that defines where user-created artwork is allowed to survive preprocessing. White = allowed, black = rejected.
- `guide-stroke-mask.svg`: the pixels belonging to the pre-printed dashed guide. White = guide stroke, black = not guide stroke.
- `template.config.json`: page size, asset paths, registration markers, extraction options, and frame ID.

## Golden rule

The same canonical `frame-shape` path must be used in all three SVG files.

```text
printable dashed path
        =
allowed-region shape boundary
        =
guide-stroke shape path
```

The visual styles may differ, but the geometry must stay synchronized.

## Create a new frame

Example: create `star-v1`.

1. Copy this folder:

```text
shared/templates/_frame-template/
→
shared/templates/star-v1/
```

2. Change the ID in `template.config.json`:

```json
{
  "id": "star-v1"
}
```

3. Draw one CLOSED SVG path for the new character/shape.

4. Paste the exact same `d="..."` value into:

```text
printable-template.svg
allowed-region-mask.svg
guide-stroke-mask.svg
```

5. Keep the printable version faint and dashed. Suggested starting values:

```text
stroke: #b8b8b8
stroke-opacity: 0.25–0.40
stroke-width: 8–12px at 2480×3508
stroke-dasharray: 28–40 / 20–30
```

6. In `allowed-region-mask.svg`:

```text
inside shape = white
outside shape = black
```

7. In `guide-stroke-mask.svg`:

```text
printed dashed line = white
all other pixels = black
```

8. Print one blank sample and scan it using the real event scanner.

9. Test at least:

```text
blank template
→ no Live Wall sprite

colored interior
→ only user coloring survives

black pen / pencil
→ user stroke survives

drawing across dashed line
→ new user stroke survives, original printed dash disappears

color outside shape
→ clipped out
```

## Recommended shape rules

For reliable extraction:

- use one closed path for the main allowed region;
- leave generous whitespace around the shape;
- avoid putting instructional text inside the allowed region;
- keep registration markers outside the drawable region;
- avoid very tiny islands or extremely thin appendages for the first versions;
- keep the frame large enough for guests to color comfortably on A4.

## Registration markers

The four small corner squares in `printable-template.svg` are optional alignment helpers. They are outside `allowed-region-mask.svg`, so they should never appear in the final sprite.

If template alignment is later implemented, use the marker coordinates from `template.config.json` to map the scanned page back to the canonical 2480×3508 coordinate system before applying masks.

## Important separation

```text
PRINTED GUIDE
    only helps the guest color

ALLOWED REGION MASK
    determines what area may survive extraction

USER ARTWORK
    the actual content sent to the wall

DIGITAL FRAME / OVERLAY
    optional visual decoration on the wall
```

Do not merge these concepts into one image.
