# FLASH 10 — Landing V3.5: Straight Film Road + Spatial Camera Travel

> **Authoritative correction for route `/`.**
>
> V3.5 supersedes V3.4/V3.3 whenever they conflict on Film Road geometry or scene motion.
> Keep `/create`, `/wall`, scanner/live-wall behavior, template logic, server APIs, Socket.IO, and persistence unchanged.

---

# 0. Latest intent

Two corrections are mandatory:

1. **The Film Road must be perfectly straight.**
   - no curve;
   - no S-bend;
   - no bowed/taper curve;
   - no perspective silhouette that bends inward/outward;
   - left/right road boundaries must be literal straight lines from vanishing point to foreground.

2. **The landing must feel like a camera traveling forward through a 3D world.**
   - do not animate five independent web sections toward the user;
   - do not make each whole section simply `scale + z + fade`;
   - think in world coordinates and camera coordinates;
   - the user scrolls forward through a continuous space;
   - previous content passes the camera, current content is readable, and next content is already visible far ahead.

The supplied motion reference should be interpreted spatially:

```text
far objects cluster near the vanishing point
→ camera advances
→ those same objects separate / fan outward because of perspective
→ some become readable
→ some grow beyond the viewport and pass beside/through the camera
→ next scene is already visible as a tiny composition in the distance
```

The page should feel like traveling through a designed world, not watching slides fade in/out.

---

# 1. Why the current Film Road looks curved

The current implementation independently applies nonlinear projection to width and Y:

```text
widthPower = 10
depthPower = 2.15
```

and builds the road silhouette from many depth samples.

That means road width is not a linear function of projected screen Y, so the outer boundaries visually bow/curve even though `centerX` stays constant.

V3.5 must remove that behavior.

---

# 2. Film Road: mathematically straight trapezoid

## 2.1 Hard geometry rule

The Film Road body must be generated from exactly four outer silhouette points:

```text
farLeft  = (centerX - farWidth / 2, horizonY)
farRight = (centerX + farWidth / 2, horizonY)
nearLeft = (centerX - nearWidth / 2, foregroundY)
nearRight= (centerX + nearWidth / 2, foregroundY)
```

Then:

```text
M farLeft
L nearLeft
L nearRight
L farRight
Z
```

The outer left and right edges must therefore be straight line segments.

Do NOT construct the body edge from multiple width samples.
Do NOT use Bézier curves.
Do NOT use `widthPower` to shape the silhouette.
Do NOT use any bend/center offset varying with depth.

## 2.2 Width must be derived from projected Y

Sprocket holes may still use nonlinear depth spacing, but their X position must be derived from the straight trapezoid at their final projected Y.

Concept:

```ts
const t = (y - horizonY) / (foregroundY - horizonY);
const widthAtY = lerp(farWidth, nearWidth, t);
```

This preserves straight outer boundaries while still allowing perspective compression along Y.

Important distinction:

```text
NONLINEAR: object spacing along depth / Y
LINEAR: road width as a function of projected Y
```

That is how the road can look strongly perspective-compressed without becoming curved.

## 2.3 Edge bands are also straight

The dark perforated left/right film bands must be quadrilaterals on the same trapezoid plane.

Use either:

```text
constant percentage of road width
```

or a pair of inner straight lines interpolated from far to near.

No curved inner edge.
No detached rails.

## 2.4 Straightness acceptance test

At desktop size, draw an imaginary ruler from:

```text
far-left edge → near-left edge
far-right edge → near-right edge
```

Every point of the road edge must lie on that ruler.

If the silhouette visibly bows, V3.5 fails.

---

# 3. Film Road remains one long flat film plane

Keep the V3.4 visual identity:

```text
[ dark perforated band ] [ clean/light film center ] [ dark perforated band ]
```

All three areas are one plane.

Keep:

- rectangular light sprocket holes;
- holes compressed toward the horizon;
- larger holes toward the viewer;
- no dominant outer stroke;
- no heavy drop shadow;
- no colorful mountain/sun demo artwork;
- no extrusion;
- no lifted ribbon look;
- soft horizon haze if useful.

The road remains centered:

```text
centerX = 50vw
bend = 0
tilt = 0
rotationZ = 0
```

The centerline must never move sideways during scene transitions.

---

# 4. Replace beat-centric motion with camera-centric motion

The current `addDepthBeat()` approach animates each whole beat independently through `z`, `scale`, `y`, opacity, and lateral drift.

That can still read as five cards being zoomed toward the user.

V3.5 should instead model one continuous world and one camera traveling through it.

Preferred mental model:

```text
CAMERA -----> -----> ----->

Scene 1        Scene 2        Scene 3        Scene 4        Scene 5
  |              |              |              |              |
  z=0          z=GAP          z=2GAP         z=3GAP         z=4GAP
```

Scrolling changes **camera depth**, not which section is active.

Each composition already exists in the world at a fixed world-space depth.

---

# 5. Preferred CSS 3D world architecture

Use the existing pinned master stage and CSS perspective.
Do not add Three.js/WebGL.

Recommended structure:

```tsx
<div className="landing-master-stage">
  <StageBackground />
  <FilmRoad />

  <div className="spatial-world">
    <DepthScene data-world-z="0" />
    <DepthScene data-world-z="-900" />
    <DepthScene data-world-z="-1800" />
    <DepthScene data-world-z="-2700" />
    <DepthScene data-world-z="-3600" />
  </div>
</div>
```

Exact signs/numbers may change depending on implementation, but preserve the idea:

```text
scene depth is fixed
camera/world translation changes continuously
```

Preferred implementation options:

### Option A — real CSS 3D world

Place scenes at fixed `translateZ()` positions and animate one shared `.spatial-world` translation in Z.

This is preferred if stable.

### Option B — projection helper

Maintain a single `cameraZ` and project each node from world coordinates:

```text
distance = worldZ - cameraZ
projectionScale = perspective / (perspective + distance)
```

Then derive projected X/Y/scale from that one camera value.

Use imperative DOM/GSAP updates, not React state on every tick.

Do NOT keep independent hand-authored Z timelines for each scene if a shared camera model can replace them.

---

# 6. One shared vanishing point

Everything must belong to the same space.

Use one shared vanishing point approximately around:

```text
x = 50vw
y = 44–52vh
```

Tune visually.

The Film Road, far-away titles, cards, shapes, and upcoming scenes must all converge toward this same region.

This is critical.

Do not give every section its own arbitrary origin.

---

# 7. Spatial scene composition

A scene is not one flat DOM group.

Each scene should contain a few child nodes with different local world coordinates.

Example:

```text
Scene 02
├── title        worldX = 0      localZ = 0
├── shape A      worldX = -260   localZ = +100
├── photo/card   worldX = +320   localZ = -140
└── tiny accent  worldX = +80    localZ = -240
```

When far away, perspective compresses these objects toward the vanishing point.

As the camera approaches:

```text
objects naturally spread apart
→ parallax increases
→ near object grows faster
→ far object lags behind
→ composition opens across the screen
```

This is the behavior visible in the supplied reference and is more important than adding many decorative elements.

For the demo, use only about **2–4 spatial nodes per scene**.

---

# 8. Camera-travel lifecycle per scene

Do not use the old lifecycle as a flat reveal.

Use this spatial lifecycle:

## A. DISTANT SEED

The upcoming scene is already visible near the vanishing point.

```text
very small
clustered tightly
low contrast / slight haze
```

It should look physically far away, not hidden waiting for a fade-in.

## B. APPROACH

The camera moves closer.

```text
scene grows
children begin separating spatially
parallax becomes visible
road sprockets accelerate toward viewer
```

## C. READABLE DEPTH

The main title reaches a comfortable readable scale.

Do not stop the camera completely.
Use a slower section of camera travel for reading.

## D. CAMERA PASS

The camera continues through the scene.

Important:

- title may become huge and crop outside viewport;
- foreground child may pass left/right of camera;
- another child can remain behind briefly;
- different children leave at different moments because of local Z offsets;
- the scene should break apart through perspective, not disappear as one flat group.

## E. NEXT WORLD ALREADY AHEAD

While current nodes are passing the camera, the next scene must already be clearly visible in the distance.

No blank stage.

---

# 9. Match the supplied video's spatial rhythm

The reference should be reproduced as a motion principle, not copied visually.

Important rhythm seen in the reference:

```text
small centered composition in distance
→ it approaches
→ separate cards/shapes fan outward
→ some foreground objects become very large / crop at edges
→ a next message is already small in the center background
→ background takeover happens while objects are still in motion
```

Recreate this feeling with original FLASH 10 elements.

Do NOT simply do:

```text
Scene A scale 0.1 → 5
fade out
Scene B scale 0.1 → 5
```

The key is **multiple depths inside each scene plus one advancing camera**.

---

# 10. Fade rules

Fade should only support spatial depth.

Use opacity for:

- distance haze near the vanishing point;
- subtle atmospheric fade far away;
- cleanup after an object has passed the camera;
- reduced-motion fallback.

Do not use opacity as the section-change mechanism.

Near-camera exit should mostly happen because geometry becomes huge/cropped/offscreen.

---

# 11. Lateral motion rules

Remove the current large `passDriftX` mindset.

Objects may pass left/right, but this should come from their world X coordinates and perspective projection.

Preferred:

```text
fixed worldX + camera approach
→ apparent screen separation grows naturally
```

Instead of:

```text
animate x from 0vw to 12vw only because the section is exiting
```

Keep hand-authored lateral tweening minimal.

The Film Road itself never drifts sideways.

---

# 12. Scene overlap / convoy

At many scroll positions, the user should simultaneously perceive:

```text
foreground = previous scene passing camera
midground  = current scene readable
background = next scene tiny at vanishing point
```

This is mandatory for the travel illusion.

Use a scene spacing / camera speed that allows roughly 25–40% overlap between neighboring worlds.

---

# 13. Background transitions

Background colors can change, but they must feel like entering a new zone in the same world.

Prefer:

```text
camera approaches next zone
→ color starts taking over
→ foreground objects from previous zone still pass
→ new background becomes dominant
```

Avoid instant color switch exactly when a scene becomes active.

Keep only a few strong background states for the demo.

---

# 14. Film Road sync with camera

The Film Road reel must be driven from the same normalized camera travel.

Concept:

```text
cameraZ increases
→ sprocket phase advances
→ holes emerge from horizon
→ grow along the straight trapezoid
→ pass below viewport
```

Reverse scroll rewinds exactly.

Do not give road motion and scene motion unrelated timing systems.

The road is the ground cue that proves the camera is traveling forward.

---

# 15. Suggested implementation refactor

Expected files:

```text
client/src/landing/film/FilmRoad.tsx
client/src/landing/film/filmRoadConfig.ts
client/src/landing/depth/DepthWorld.tsx
client/src/landing/animation/createMasterTimeline.ts
client/src/landing/animation/motionConfig.ts
client/src/landing/landing.css
```

Recommended new helper if useful:

```text
client/src/landing/animation/spatialProjection.ts
```

or:

```text
client/src/landing/depth/spatialSceneConfig.ts
```

Keep responsibilities separated:

```text
FilmRoad geometry
camera progress
world-space scene config
projection / CSS 3D transforms
background choreography
```

---

# 16. Implementation quality gates

## Gate A — road is truly straight

- left edge = one straight line;
- right edge = one straight line;
- centerline fixed at 50%;
- no curvature in the road silhouette;
- no bend at any scroll position.

## Gate B — camera model

Pausing at arbitrary points should show a coherent depth world, not one active section and four hidden sections.

## Gate C — internal parallax

At least 3 non-final scenes must have 2+ child nodes at different local Z/world X positions so their separation changes naturally as camera approaches.

## Gate D — overlap

Previous/current/next spatial layers overlap during transitions.

## Gate E — pass-camera behavior

At least some text/object elements become very large/cropped and pass the camera before cleanup.

## Gate F — reverse scroll

Reverse scroll reconstructs the same spatial world backward without directional hacks.

## Gate G — regression safety

`/create` and `/wall` remain unchanged and functional.

---

# 17. Explicit failure conditions

V3.5 fails if:

- Film Road edge is visibly curved or bowed;
- `widthPower` or sampled width geometry still bends the road silhouette;
- road centerline shifts left/right during transitions;
- each section is still one flat group doing the same `scale/z/fade` animation;
- children inside a scene have no meaningful depth separation;
- next scene appears only after previous scene disappears;
- large lateral tweens are still the main transition language;
- fade is doing more work than perspective;
- road motion is not synchronized with camera travel;
- the result feels like slides zooming at the user instead of the user traveling through a continuous world.

---

# 18. Validation

Run:

```bash
cd client
npm run check
npm run build
```

Visually test approximately:

```text
1440 × 900 desktop
390 × 844 mobile
```

For desktop, scrub slowly through every transition and verify:

```text
road edges stay perfectly straight
next scene exists in distance
objects fan outward through perspective
current scene passes camera
reverse scroll reconstructs the same geometry
```
