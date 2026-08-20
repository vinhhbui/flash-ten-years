# Codex Task — Implement Film Road Reference V3.4

Implement the latest Film Road correction for the landing page now.

Read in this order:

1. `INSTRUCTIONS_SUPERPLAY_FILMROAD_REFERENCE_V3_4.md`
2. `INSTRUCTIONS_SUPERPLAY_FLAT_FILMROAD_DEPTHFADE_V3_3.md`
3. `INSTRUCTIONS_SUPERPLAY_DEPTH_TRAVEL_V3_1.md`

V3.4 is authoritative for Film Road visuals, geometry, placement, and film-pattern motion whenever older files conflict.
Keep V3.3/V3.1 for depth-beat choreography and the existing single pinned master-stage architecture.

## Before editing

Inspect the current implementation first:

```text
client/src/landing/film/FilmRoad.tsx
client/src/landing/film/filmRoadConfig.ts
client/src/landing/landing.css
client/src/landing/animation/useLandingScroll.ts
client/src/landing/animation/createMasterTimeline.ts
client/src/landing/animation/motionConfig.ts
```

Do not redesign the whole landing from scratch.
This task is mainly a focused Film Road refactor.

## Visual target

The latest reference shows a very clean perspective road in the lower half of the viewport:

- one long film plane lying flat on the ground;
- two dark tapered film-edge bands;
- repeated light rectangular sprocket holes;
- a clean/light central film area between the bands;
- strong compression toward a soft horizon;
- a wide foreground opening toward the bottom;
- lots of empty visual space above the road;
- no outer stroke;
- no heavy shadow;
- no raised/extruded ribbon appearance;
- no colorful mini artwork inside every film frame.

Important: the two dark sides are not detached rails. They are the perforated edge bands of one continuous film sheet.

## Required changes

### 1. Refactor `FilmRoad.tsx`

Remove/replace the current illustrated `SliceArtwork` treatment.
The Film Road must stop looking like repeated colored cards.

Remove the concepts represented by:

```text
film-road__frame-matte
colored film-road__frame-window fills
film-road__image-mountain
film-road__image-sun
large decorative per-slice artwork
```

Build a cleaner road from:

```text
one center film plane
+ left dark edge band
+ right dark edge band
+ repeating sprocket cutouts
+ optional subtle center separators
```

Keep the current imperative `FilmRoadHandle` / `setState({ reel })` flow if possible.

### 2. Tune perspective geometry

Target desktop appearance:

```text
road visually emerges around 46–54vh
clearly visible narrow area around 52–58vh
bottom width around 52–60vw
far apparent width around 10–15vw
centered at 50vw
road continues beyond the bottom of the viewport
```

For the current `viewBox="0 0 1000 1160"`, use this only as a starting search region:

```text
centerX   ≈ 500
farWidth  ≈ 90–140
nearWidth ≈ 520–610
```

Tune `horizonY` together with a top mask/haze so the film visually sits in the lower half without breaking the existing depth-world choreography.

Increase perspective compression compared with the current road. A nonlinear width/Y curve around power `1.9–2.4` is a reasonable tuning range.

### 3. Match the edge-band / sprocket look

The side bands should be near-black/charcoal and flush with the center plane.

Sprocket holes should be:

- light/transparent cutouts;
- rectangular with slightly softened corners;
- repeated continuously;
- tightly compressed near the horizon;
- larger and more separated near the viewer;
- visually closer to the reference than the current chunky blocks.

Do not add a visible outer stroke.
Do not add a large drop shadow.

### 4. Keep the center visually clean

Use a paper-white / neutral-light / subtle translucent neutral center plane.

Do not reintroduce colorful frame artwork.
If center frame separators are needed, keep them extremely subtle and coplanar.

### 5. Keep it flat on the ground

The Film Road must feel printed onto one floor plane.

Avoid:

```text
vertical billboard
standing ribbon
floating bridge
extruded film
separate-depth rails
```

SVG is fine.
CSS 3D is also fine if it produces the target more simply.
Do not add WebGL / Three.js.

### 6. Make the film feel like one long roll

Scrolling down must continuously feed the film toward the viewer:

```text
new holes emerge at horizon
→ approach
→ grow with perspective
→ pass below viewport
→ next holes continue seamlessly
```

Scrolling up must rewind exactly.

Keep deterministic timeline behavior.
Fix any visible recycling/wrap pop by recycling samples only inside the masked horizon zone or below the viewport.

You may increase visible depth samples to roughly `24–32` on desktop if needed, but do not create hundreds of React nodes.

### 7. Preserve the current depth/fade system

Do not rewrite the five major beats unless a small layering change is required.

Keep the V3.3 motion lifecycle:

```text
far + faint
→ approach + fade in
→ readable
→ near
→ pass + fade out
```

Keep the Film Road under the main depth content.

## Files expected to change

Primary:

```text
client/src/landing/film/FilmRoad.tsx
client/src/landing/film/filmRoadConfig.ts
client/src/landing/landing.css
```

Only if necessary:

```text
client/src/landing/animation/motionConfig.ts
client/src/landing/animation/createMasterTimeline.ts
client/src/landing/animation/useLandingScroll.ts
```

Do not touch `/create`, `/wall`, scanner workflow, template logic, server APIs, Socket.IO, or persistence.

## Acceptance checks

The result is not done until all of these are true:

1. At desktop size, the road visually resembles the latest reference silhouette.
2. The road occupies mainly the lower half, leaving large clean space above.
3. The film reads as one continuous plane, not two detached rails.
4. The dark edge bands taper naturally into perspective.
5. Sprocket holes compress strongly toward the horizon.
6. The center is clean/light and does not contain colorful demo artwork.
7. No heavy outline/shadow/extrusion remains.
8. Film pattern moves continuously on scroll and rewinds on reverse scroll.
9. No visible sprocket/frame teleport occurs in the midground.
10. Existing depth/fade beats still work.
11. `/create` and `/wall` remain unchanged.

## Validation

Run:

```bash
cd client
npm run check
npm run build
```

Fix all TypeScript/build errors before stopping.

If a browser preview is available, visually check at approximately:

```text
1440 × 900 desktop
390 × 844 mobile
```

## Report back

After implementation, report:

- files changed;
- how the road geometry changed;
- how the old colored slice artwork was removed;
- how sprocket holes are generated and recycled;
- how the lower-half placement / horizon fade is achieved;
- desktop/mobile tuning values used;
- `npm run check` result;
- `npm run build` result;
- any remaining visual limitation.
