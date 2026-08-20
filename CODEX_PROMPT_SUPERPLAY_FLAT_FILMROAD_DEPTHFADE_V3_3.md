# Codex Task — Implement Landing V3.3

Implement the landing refinement now.

Read in this order:
1. `INSTRUCTIONS_SUPERPLAY_FLAT_FILMROAD_DEPTHFADE_V3_3.md`
2. `INSTRUCTIONS_SUPERPLAY_SMOOTH_PLANAR_ROAD_V3_2.md`
3. `INSTRUCTIONS_SUPERPLAY_DEPTH_TRAVEL_V3_1.md`

V3.3 is the authority if older files conflict.

## What to change

### 1. Fix the Film Road concept
The road itself must become **one flat filmstrip road** in perspective.

It must NOT look like:
- left strip + empty center + right strip;
- floating frames;
- thick outline / shadow ribbon.

It must look like:
- one continuous dark film surface;
- sprocket holes on both edges;
- frame windows embedded in the middle of the same plane.

### 2. Add fade in / fade out + depth
Every major beat must follow:
`horizon → approach → readable → near → pass camera`

And opacity must follow:
`faint → fade in → strongest readability → soften → fade out`

Fade is only valid when combined with forward depth motion.

### 3. Keep stronger forward-travel feeling
Use:
- perspective
- translateZ
- scale
- subtle Y travel toward viewer
- only small lateral drift

Reduce aggressive sideways exits.

### 4. Simplify the demo
Keep only a few simple beats:
- FLASH 10
- TEN YEARS
- CONNECTED
- FLASHBACK
- MAKE A MEMORY

Each beat should be visually simple.

## Constraints
- Preserve `/create` and `/wall`
- Keep React + Vite + TS + GSAP + ScrollTrigger
- Keep the existing pinned master-stage architecture
- Do not add Three.js / WebGL / another animation library

## Validation
Run:
```bash
cd client
npm run check
npm run build
```

Fix all errors before stopping.

## Report back
After implementation, report:
- files changed
- how Film Road was refactored
- how fade/depth timing was updated
- which elements were simplified/removed
- build/check status
- any remaining visual limitations
