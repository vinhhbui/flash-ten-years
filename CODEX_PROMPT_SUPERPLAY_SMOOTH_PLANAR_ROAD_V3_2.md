# Codex Task — Smooth Planar Film Road V3.2

Implement the V3.2 landing refinement now.

Read and follow:

1. `INSTRUCTIONS_SUPERPLAY_SMOOTH_PLANAR_ROAD_V3_2.md`
2. `INSTRUCTIONS_SUPERPLAY_DEPTH_TRAVEL_V3_1.md`
3. `INSTRUCTIONS_SUPERPLAY_MOTION_V3.md`

When they conflict, V3.2 wins for:

- Film Road geometry;
- Film Road styling;
- road width;
- road straightness;
- frame/sprocket planarity;
- depth-beat travel;
- smoothness;
- lateral exit behavior;
- demo visual density.

Do not create a plan only. Implement the code.

## Preserve

- the one-master-stage architecture;
- one primary ScrollTrigger;
- one master GSAP timeline;
- the persistent Film Road concept;
- five simple depth beats;
- `/create`;
- `/wall`;
- backend/server behavior;
- scanner/live-wall logic;
- APIs, Socket.IO, storage, persistence.

Do not add Three.js, WebGL, or a second animation framework.

---

# Priority 1 — flatten and straighten Film Road

Inspect:

- `client/src/landing/film/FilmRoad.tsx`
- `client/src/landing/film/filmRoadConfig.ts`
- `client/src/landing/landing.css`

Make the Film Road one straight flat perspective plane.

Required changes:

- center axis stays fixed;
- all visual `bend` values become zero;
- all visual `tilt` values become zero;
- remove road shadow;
- remove road outer stroke;
- do not replace the stroke with another border;
- reduce near/far road width by roughly 15–22%;
- remove active-frame scale pop/highlight;
- frame windows, separators, and sprocket holes must remain on the exact same SVG perspective plane as the road;
- no individual frame translateZ or floating treatment;
- simplify frame artwork if needed;
- remove frame numbers if they add visual noise.

Target desktop geometry approximately:

```text
centerX   500
horizonY  225–245
farWidth  108–125
nearWidth 455–500
bend      0
tilt      0
```

Tune within that range visually.

The road should feel narrower and cleaner than the current implementation.

---

# Priority 2 — smooth camera-forward depth travel

Inspect:

- `client/src/landing/animation/createMasterTimeline.ts`
- `client/src/landing/animation/motionConfig.ts`

Current large sideways exits must be removed.

Each beat should primarily travel along depth:

```text
z -1100 / scale ~0.12
→ z -620 / scale ~0.32
→ z -80 / scale ~0.96
→ z +220 / scale ~1.7
→ z +700 or more / scale ~5
→ cleanup only after camera pass
```

Keep x drift very small before readable state.

Recommended:

```text
laneX: within ±4vw
pass drift: within ±8–18vw
```

Do not use default exits around ±60–75vw.

Reduce rotation substantially:

```text
rotationY roughly within ±4deg
rotationX roughly within ±2deg
rotationZ roughly within ±2deg
```

The viewer should feel that they are moving forward and passing content, not that cards are flying away sideways.

---

# Priority 3 — smoothness

Use one deterministic master timeline.

Tune ScrollTrigger numeric scrub around:

```ts
scrub: 1.1
```

Acceptable range approximately 0.9–1.4 after testing.

Avoid visible hard `.set()` transitions.

Use `.set()` only for initial state or cleanup after objects have already left the camera.

Make far movement slower and camera-pass movement faster.

Suggested rhythm per beat:

```text
far → approach      long
approach → readable medium
readable hold       shallow depth movement
readable → near     medium-short
near → camera pass  short
```

---

# Priority 4 — overlap beats

The next beat must already be visible near the horizon before the current beat reaches foreground.

At normal points in the sequence, the stage should show:

```text
current beat near/readable
next beat approaching
following beat tiny at horizon
```

Adjacent beats should overlap by roughly 25–40% of their travel duration.

No blank gaps.

---

# Priority 5 — keep the demo minimal

Use only these five beats:

- FLASH 10
- TEN YEARS
- CONNECTED
- FLASHBACK
- MAKE A MEMORY

Each beat should contain at most:

- one title;
- one simple geometric object;
- optional tiny label.

Do not add decorative cards, sticker clouds, fake UI, extra floating tokens, or extra content panels.

This pass is only to validate motion and geometry.

---

# Quality gates

Do not stop until all pass.

## Gate 1

Film Road:

- perfectly straight;
- narrower;
- no stroke;
- no shadow;
- no bend/tilt.

## Gate 2

Film print:

- frame windows and sprockets look printed into the same road plane;
- no active frame pop;
- no floating film elements.

## Gate 3

One beat travels smoothly:

```text
horizon → readable → foreground → pass camera
```

without using fade as the main transition.

## Gate 4

Next beat is already visible before current beat passes.

## Gate 5

All five beats feel like stations along one straight road the user is travelling through.

---

# Build verification

Run:

```bash
cd client
npm run check
npm run build
```

Fix errors before stopping.

Then report only:

- important files changed;
- Film Road geometry/styling changes;
- motion smoothing changes;
- check result;
- build result;
- any temporary demo visual that remains.

Proceed with implementation now.
