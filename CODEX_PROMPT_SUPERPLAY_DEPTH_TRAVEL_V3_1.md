# Codex Task — Implement Depth Travel Motion V3.1

Implement the landing motion refactor now.

Read and follow in this priority order:

1. `INSTRUCTIONS_SUPERPLAY_DEPTH_TRAVEL_V3_1.md`
2. `INSTRUCTIONS_SUPERPLAY_MOTION_V3.md`
3. older landing instructions only where they do not conflict

`INSTRUCTIONS_SUPERPLAY_DEPTH_TRAVEL_V3_1.md` is authoritative for scene travel, visibility, element count, depth, and transitions.

Do not create another plan. Edit the code.

## Primary goal

The landing should feel like the user is continuously moving forward along the Film Road.

Every major composition must:

```text
start tiny at the horizon
→ approach the camera
→ become readable
→ continue forward
→ become huge / cropped
→ pass the camera
→ leave viewport
```

While it is leaving, the next composition must already be visible in the distance.

Do NOT use fade-in / fade-out as the primary composition transition.

## Preserve

Keep:

- one master scroll track;
- one pinned fullscreen stage;
- one master ScrollTrigger;
- one master GSAP timeline;
- current Film Road implementation unless a small adjustment is required;
- `/create` and `/wall` unchanged;
- React/Vite/TypeScript/GSAP/ScrollTrigger.

Do not add Three.js, WebGL, Lenis, or a physics library.

## Simplify first

Before tuning animation, simplify the stage.

Reduce the demo to approximately five clean beats:

1. `FLASH 10`
2. `TEN YEARS`
3. `CONNECTED`
4. `FLASHBACK`
5. `MAKE A MEMORY`

Each beat should contain at most:

```text
1 primary title
+ 1 simple geometric/demo object
+ optional short label
```

Remove or stop rendering most decorative V3 placeholder clutter such as large card collections, culture object collections, portal/sweep/token clusters, or redundant floating decorations.

Do not spend time on final visual design.

## Build a reusable depth lifecycle

Refactor the current long choreography into a reusable depth-beat system where practical.

A preferred pattern is config-driven, for example:

```ts
const depthBeats = [
  { id: "flash10", start: 0, laneX: 0, exitX: -35 },
  { id: "ten-years", start: 18, laneX: -7, exitX: 42 },
  { id: "connect", start: 36, laneX: 8, exitX: -18 },
  { id: "flashback", start: 55, laneX: -5, exitX: 38 },
  { id: "cta", start: 76, laneX: 0, settle: true },
];
```

and a helper equivalent to:

```ts
addDepthBeat(master, element, config)
```

Exact naming is up to you.

Do not blindly copy these values. Tune visually.

## Use CSS 3D perspective

Use a stage perspective roughly in this range as a starting point:

```text
perspective: 900–1400px
perspective-origin: ~50% 25–35%
```

Use GSAP transforms such as:

```text
z / translateZ
scale
xPercent
yPercent
rotationX
rotationY
rotationZ
```

The next beat should originate near the Film Road horizon.

A conceptual transform lifecycle is:

```text
FAR:
z -1800
scale 0.1

APPROACH:
z -700
scale 0.35

READ:
z -100 to 0
scale 0.9–1.1

FOREGROUND:
z +350 to +500
scale 2–3

PASS CAMERA:
cap z safely
scale 5–8
x/y travel outside viewport
```

Avoid CSS perspective singularity. If large positive z becomes unstable, cap z and exaggerate the final pass using scale + x/y.

## Strong prohibition

Do not solve transitions like this:

```ts
.to(oldScene, { autoAlpha: 0 })
.set(newScene, { autoAlpha: 1 })
```

for the primary beats.

Instead, keep the next beat spatially present in the distance before the current beat leaves.

Opacity may only be used for cleanup once an element is already off-camera, anti-pop setup, or reduced-motion mode.

## Film Road

Preserve the current road visuals because they are already acceptable.

Synchronize its feed/rewind with the depth journey:

```text
beat approaches → road frames stream toward camera
beat passes → foreground road movement feels faster
reverse scroll → everything rewinds toward horizon
```

Do not reset Film Road at beat boundaries.

## CTA

The final CTA also approaches from the horizon, but instead of passing the camera it should settle at readable depth and remain clickable.

## Quality gates

Do these in order.

### Gate 1

Render only Film Road + first two simple depth beats.

Verify the second beat is already visible at the horizon while the first is readable/foreground.

### Gate 2

Verify first beat continues beyond scale 1, becomes foreground, crops/exits viewport, and feels like the user moved past it.

### Gate 3

Verify reverse scroll restores the exact depth journey naturally.

### Gate 4

Add remaining beats using the same reusable lifecycle.

### Gate 5

Remove obsolete landing-only demo clutter and CSS.

### Gate 6

Check desktop and mobile.

Do not replace mobile with normal stacked sections.

## Validation

Run:

```bash
cd client
npm run check
npm run build
```

Fix all errors before stopping.

## Final report

Report only:

- files changed;
- depth system implemented;
- demo elements removed;
- whether primary fades were removed;
- check/build result;
- up to 3 motion tuning suggestions.

Proceed with implementation now.
