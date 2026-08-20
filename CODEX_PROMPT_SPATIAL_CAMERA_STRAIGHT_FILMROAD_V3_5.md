# Codex Task — Implement Landing V3.5

Implement the latest landing correction now.

Read in this priority order:

1. `INSTRUCTIONS_SPATIAL_CAMERA_STRAIGHT_FILMROAD_V3_5.md`
2. `INSTRUCTIONS_SUPERPLAY_FILMROAD_REFERENCE_V3_4.md`
3. `INSTRUCTIONS_SUPERPLAY_FLAT_FILMROAD_DEPTHFADE_V3_3.md`
4. `INSTRUCTIONS_SUPERPLAY_DEPTH_TRAVEL_V3_1.md`

V3.5 is authoritative for Film Road geometry and scene/camera motion whenever older instructions conflict.

## First inspect the current implementation

Read:

```text
client/src/landing/film/FilmRoad.tsx
client/src/landing/film/filmRoadConfig.ts
client/src/landing/depth/DepthWorld.tsx
client/src/landing/animation/createMasterTimeline.ts
client/src/landing/animation/motionConfig.ts
client/src/landing/landing.css
```

Do not rewrite unrelated application flows.

---

## Part 1 — Make the Film Road mathematically straight

The current road is visually curved because width and Y use different nonlinear projection powers and the body silhouette is built from multiple depth samples.

Remove that behavior.

The Film Road must be an exact straight trapezoid:

```text
farLeft  ---------------- farRight
   \                         /
    \                       /
     \                     /
      \                   /
       \                 /
        \               /
         \             /
          \           /
           \         /
            \       /
             \     /
              \   /
               \ /
foreground / viewer
```

Implementation rule:

```ts
farLeft   = [centerX - farWidth / 2, horizonY]
farRight  = [centerX + farWidth / 2, horizonY]
nearLeft  = [centerX - nearWidth / 2, foregroundY]
nearRight = [centerX + nearWidth / 2, foregroundY]
```

Build the road silhouette with four straight line segments only.

Do not use Bézier curves.
Do not use sampled width points for the body silhouette.
Do not use `widthPower` to curve the road shape.
Do not animate road bend, centerX, or tilt.

Sprocket spacing may remain nonlinear in Y for perspective compression, but sprocket X/width must be derived from the straight trapezoid at the projected Y:

```ts
const t = (y - horizonY) / (foregroundY - horizonY)
const widthAtY = lerp(farWidth, nearWidth, t)
```

This keeps the road edges perfectly straight while retaining strong depth compression.

Keep:

- one flat film plane;
- two dark perforated edge bands;
- clean/light center film surface;
- rectangular sprocket holes;
- soft horizon fade;
- no outer stroke;
- no heavy shadow;
- no colorful frame artwork.

---

## Part 2 — Change the motion model from “sections zooming” to “camera traveling”

The current `addDepthBeat()` animates each whole beat independently with `z`, `scale`, `y`, opacity, and `passDriftX`.

That is not enough.

Refactor the landing so the user feels like the camera is traveling forward through one continuous 3D world.

Preferred architecture:

```text
fixed pinned camera/stage
+ one spatial world
+ scenes placed at fixed world-space Z positions
+ scroll advances one shared cameraZ/worldZ
```

Use either:

### Preferred A
CSS 3D world:

- `.spatial-world { transform-style: preserve-3d; }`
- scenes have fixed `translateZ()` world positions;
- the master timeline moves the shared world in Z to simulate camera advance.

### Alternative B
One projection helper:

```text
distance = worldZ - cameraZ
scale = perspective / (perspective + distance)
```

Project each node from world coordinates using a single `cameraZ`.

Use imperative GSAP/DOM updates if needed.
Do not use React state per scroll frame.

---

## Part 3 — Give each scene internal depth

Do not animate each scene as one flat group.

Each non-final scene should contain roughly 2–4 simple spatial child nodes:

```text
title
+ shape/card/object
+ optional second object/accent
```

Give children different:

```text
worldX
worldY
localZ
```

Example concept:

```text
title       x=0      z=0
shape       x=-260   z=+120
photo/card  x=+320   z=-160
```

The key behavior:

```text
far away:
all children visually cluster near the same vanishing point

camera approaches:
children naturally separate / fan outward
parallax becomes stronger
near child grows faster
far child lags behind

camera passes:
foreground child becomes huge / crops at edge
title may also become oversized
other children leave at different times
```

This should feel like the supplied reference video.

---

## Part 4 — Use one shared vanishing point

Film Road and scene content must belong to one space.

Target roughly:

```text
x = 50vw
y = 44–52vh
```

Tune visually.

Do not give every beat a different origin.

---

## Part 5 — Required transition rhythm

At most transition points the frame should contain:

```text
foreground: previous scene passing the camera
midground: current scene readable
background: next scene already tiny near the vanishing point
```

Target about 25–40% scene overlap.

Do not allow:

```text
previous scene disappears
→ blank / clean stage
→ next scene appears
```

Do not allow:

```text
whole Scene A scale 0.1 → 5 → opacity 0
whole Scene B scale 0.1 → 5 → opacity 0
```

The page must behave as one continuous world.

---

## Part 6 — Reduce fake lateral exit motion

Remove large `passDriftX` as the main choreography tool.

Objects should mostly spread because their fixed world X offsets are amplified by perspective while the camera moves closer.

Small authored x/y adjustments are acceptable, but they are secondary.

The Film Road itself must stay exactly centered and straight at all times.

---

## Part 7 — Fade only supports depth

Use opacity only for:

- horizon haze;
- far atmospheric softness;
- cleanup after an object has already passed camera;
- reduced-motion mode.

Do not use fade as the primary scene transition.

Near-camera exit should be mostly geometric: scale, crop, offscreen pass, and depth.

---

## Part 8 — Sync Film Road to camera travel

The film reel progression must come from the same camera/world progress.

Scroll down:

```text
camera advances
→ new sprocket holes emerge from horizon
→ holes grow along the straight trapezoid
→ holes pass below viewport
```

Scroll up rewinds the exact same geometry.

Do not use unrelated timing for the road and scenes.

---

## Likely files to modify

```text
client/src/landing/film/FilmRoad.tsx
client/src/landing/film/filmRoadConfig.ts
client/src/landing/depth/DepthWorld.tsx
client/src/landing/animation/createMasterTimeline.ts
client/src/landing/animation/motionConfig.ts
client/src/landing/landing.css
```

Optional new helper:

```text
client/src/landing/animation/spatialProjection.ts
```

or:

```text
client/src/landing/depth/spatialSceneConfig.ts
```

Do not touch:

```text
/create
/wall
scanner flow
template system
server APIs
Socket.IO
persistence
```

---

## Acceptance checks

Do not stop until all are true:

1. Film Road left/right boundaries are perfectly straight at every scroll position.
2. Film Road centerline remains fixed at 50%.
3. No road bend/curve/bow exists.
4. Scene motion is driven by one camera/world depth progression.
5. At least 3 scenes contain multiple children with meaningful depth offsets.
6. Far objects cluster around the shared vanishing point.
7. Objects naturally fan outward as camera approaches.
8. Previous/current/next scenes overlap spatially.
9. Some elements become oversized/cropped as the camera passes them.
10. Reverse scroll reconstructs the exact world backward.
11. Film sprockets move in sync with camera travel.
12. `/create` and `/wall` remain unchanged.

---

## Validation

Run:

```bash
cd client
npm run check
npm run build
```

Fix all errors before stopping.

If browser preview is available, test around:

```text
1440 × 900
390 × 844
```

Scrub slowly through transitions and verify visually that the result feels like the **camera is moving through space**, not like web sections are scaling/fading.

Finally report:

- files changed;
- exact Film Road geometry refactor;
- how straightness is guaranteed mathematically;
- camera/world architecture used;
- scene world-Z spacing;
- child local-Z/world-X strategy;
- scene overlap strategy;
- Film Road/camera synchronization;
- `npm run check` result;
- `npm run build` result;
- remaining visual limitations.
