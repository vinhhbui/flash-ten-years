# FLASH 10 — Depth Travel / Horizon Journey Motion V3.1

> **Authoritative motion addendum for route `/`.**
>
> This file supersedes `INSTRUCTIONS_SUPERPLAY_MOTION_V3.md` for composition travel, scene visibility, depth, demo element count, and transition behavior whenever there is a conflict.
>
> Preserve the current master-stage architecture and the current Film Road unless a small change is necessary to support depth travel.

---

# 0. User intent

The V3 master-stage direction is closer, but the compositions still feel too much like normal web sections that appear and disappear.

The new goal is a much stronger **3D forward-travel illusion**:

```text
                    HORIZON
                       ·
                       ·
                 [ next beat ]
                       ·
                       ↓
                [   beat   ]
                       ↓
             [     BEAT     ]
                       ↓
          [       BEAT        ]
                       ↓
        ─────── CAMERA ───────
                       ↓
             passes viewer
                       ↓
                 disappears
```

The user should feel like they are continuously moving forward along the Film Road.

The stage/camera remains mostly fixed.

The **world comes toward the camera**.

Every major composition should repeat this depth cycle:

```text
spawn at horizon
→ approach
→ become readable
→ continue toward camera
→ become huge / crop outside viewport
→ pass viewer
→ leave behind camera
→ next composition approaches
```

Do not treat compositions as flat slides.

---

# 1. Keep what already works

Keep:

- one long scroll track;
- one pinned fullscreen master stage;
- one primary master ScrollTrigger;
- one master GSAP timeline;
- current Film Road concept and implementation where possible;
- React + Vite + TypeScript;
- GSAP + ScrollTrigger;
- reverse-on-scroll behavior;
- `/create` and `/wall` untouched.

Do not return to separate pinned sections.

---

# 2. Main correction — stop using opacity as scene choreography

The current implementation still relies heavily on patterns equivalent to:

```text
composition A autoAlpha 1
→ autoAlpha 0
composition B autoAlpha 0
→ autoAlpha 1
```

This is NOT the main transition model anymore.

## New rule

A composition should normally remain visible while its geometry carries it through depth.

Use motion such as:

```text
very small at horizon
→ scale / translateZ toward viewer
→ readable at mid-depth
→ large foreground
→ oversized and cropped
→ off-camera
```

Opacity may only be used for:

- initial anti-pop setup before the timeline starts;
- cleanup after an element is already outside the camera/viewport;
- reduced-motion mode;
- tiny supporting accents.

Opacity must NOT be the mechanism by which one major composition turns into another.

## Failure condition

If pausing the timeline between two beats shows:

```text
old composition fades out
new composition fades in
```

instead of visible spatial travel, V3.1 fails.

---

# 3. Camera model

Treat the viewport as a fixed camera looking toward a vanishing point on the Film Road.

Recommended visual model:

```text
viewport
┌──────────────────────────────────┐
│                                  │
│            horizon               │
│              ·                   │
│             / \                  │
│            /   \                 │
│        next composition          │
│          /       \               │
│        /           \             │
│                                  │
│       current composition        │
│                                  │
└──────────────────────────────────┘
              CAMERA
```

Recommended horizon region on desktop:

```text
x ≈ 50vw
y ≈ 24–34vh
```

Do not hard-code one exact pixel position if responsive interpolation is easier.

The Film Road should visually converge toward the same horizon.

All major beat origins should feel spatially related to this vanishing point.

---

# 4. Use CSS 3D / GSAP depth before WebGL

Do not add Three.js for this demo.

Use CSS perspective and GSAP transforms first.

Recommended stage setup:

```css
.landing-master-stage {
  perspective: 1100px;
  perspective-origin: 50% 30%;
  overflow: hidden;
}

.depth-world,
.depth-beat {
  transform-style: preserve-3d;
}
```

Exact values must be tuned visually.

GSAP may animate:

```text
z / translateZ
scale
xPercent
yPercent
rotationX
rotationY
rotationZ
```

A hybrid approach is acceptable:

- use `z` for real CSS perspective depth;
- use `scale` to exaggerate the travel;
- use small `yPercent` drift so objects follow the visual road plane.

Do not build a physics engine.

---

# 5. Universal depth lifecycle for every major beat

Every major beat must implement approximately these states.

## A. FAR / horizon — 0–20%

The next composition is already present in the distance.

Target appearance:

```text
scale ≈ 0.05–0.16
or
z ≈ -1400 to -2200
```

Characteristics:

- centered near horizon;
- very small but recognizable;
- low detail is fine;
- do not fade it in near the viewer;
- it should look as though it has existed farther down the road all along.

## B. APPROACH — 20–45%

The beat comes toward the user.

Characteristics:

- strong depth acceleration;
- scale increases rapidly;
- moves slightly down from horizon toward center frame;
- supporting object separates slightly from title;
- Film Road frames move toward viewer at matching rhythm.

The user should feel forward motion here.

## C. READ / settle — 45–62%

The composition reaches readable mid-depth.

Characteristics:

- title is fully readable;
- motion slows briefly;
- composition is around normal visual scale;
- keep this calmer than approach/exit;
- this is where later final content can be decorated.

Do not freeze entirely; retain subtle depth drift.

## D. FOREGROUND PASS — 62–88%

The user continues forward past the composition.

Characteristics:

- composition continues growing;
- title/object begins cropping against viewport edges;
- small rotation/parallax can increase;
- object may pass left/right of the camera instead of dead center;
- visual scale may reach 3–8x depending on the object.

This is the major transition.

## E. BEHIND CAMERA / cleanup — 88–100%

The old composition is effectively behind the viewer.

Characteristics:

- it is mostly or fully outside viewport;
- only here may Codex set `visibility`, `autoAlpha`, or `display` cleanup if useful;
- next beat should already be clearly approaching from the horizon.

No blank stage is allowed.

---

# 6. Continuous convoy model

Do not run one composition fully and only then spawn the next one.

At most times, the user should be able to perceive:

```text
foreground: previous beat leaving camera
midground: current beat readable
background: next beat approaching from horizon
```

Not all three need equal prominence, but overlap in depth is required.

Conceptual timeline:

```text
Beat A:  FAR ─ APPROACH ─ READ ─ FOREGROUND ─ EXIT
Beat B:           FAR ─ APPROACH ─ READ ─ FOREGROUND ─ EXIT
Beat C:                     FAR ─ APPROACH ─ READ ─ FOREGROUND ─ EXIT
Beat D:                               FAR ─ APPROACH ─ READ ─ ...
```

This overlap is critical.

It creates the feeling of traveling through a continuous world rather than viewing slides.

---

# 7. Simplify the demo aggressively

V3.1 is a **motion prototype**, not final art direction.

Remove most decorative elements currently used only to make scenes look busy.

The current demo does not need:

```text
many media cards
many culture objects
multiple stickers
multiple portals
decorative sweep layers
several tokens per scene
large sets of floating UI/card elements
complex illustration clusters
```

## Maximum element budget per beat

Each depth beat should contain only:

```text
1 primary title
+ optional 1 short label/subline
+ 1 simple geometric demo object
```

Maximum recommended moving elements per beat: **2–3**.

The Film Road is already a major visual element and does not count toward this budget.

## Suggested placeholder visual vocabulary

Use only simple original placeholders such as:

```text
circle
square
ring
star
photo rectangle
solid 10
short word
```

Avoid building final FLASH artwork in this pass.

---

# 8. Reduce the composition set for motion testing

Do not preserve six visually busy scenes just because V3 had six component names.

For V3.1, a simpler sequence is preferred.

Recommended demo beats:

```text
Beat 01 — FLASH 10
Beat 02 — TEN YEARS
Beat 03 — CONNECT
Beat 04 — FLASHBACK
Beat 05 — CTA
```

Five beats are enough to validate the travel system.

Existing scene components may be reused/renamed if that is the lowest-risk refactor, but visually the result should read as five clean depth checkpoints.

Temporary copy is fine.

Example:

```text
FLASH 10
TEN YEARS
CONNECTED
FLASHBACK
MAKE A MEMORY
```

Do not spend time polishing copy.

---

# 9. Depth staging per beat

Each beat should be one absolutely positioned 3D group inside the same stage.

Recommended conceptual markup:

```tsx
<div className="depth-world">
  <DepthBeat id="flash10" />
  <DepthBeat id="ten-years" />
  <DepthBeat id="connect" />
  <DepthBeat id="flashback" />
  <DepthBeat id="cta" />
</div>
```

Each beat begins at the same conceptual horizon but may have a small lateral lane offset.

Example lane offsets:

```text
Beat 1   center
Beat 2   8vw left
Beat 3   9vw right
Beat 4   5vw left
Beat 5   center
```

Keep offsets restrained so everything still belongs to the Film Road world.

---

# 10. Depth function / transform guidance

Do not animate only `scale` from 0 to 1 and stop.

The core travel curve must continue through the user.

A beat may conceptually travel through states like:

```text
FAR
z: -1800
scale: 0.10
y: horizon

APPROACH
z: -700
scale: 0.38
y: 38vh

READ
z: -100 → 0
scale: 0.9 → 1.1
y: 50vh

FOREGROUND
z: +420
scale: 2.6
y: 62vh

PASS CAMERA
z: +760
scale: 5–8
x: ±20–60vw depending on lane
```

These values are tuning references, not a mandatory exact implementation.

Important:

- avoid singularity/glitches near CSS perspective plane;
- use clipping and x/y travel to move an oversized element off-camera cleanly;
- if `z` becomes unstable, cap real `z` and exaggerate the final pass with `scale`.

The visual result matters more than physically perfect 3D math.

---

# 11. Film Road synchronization

The Film Road should reinforce the same forward movement.

Keep its current good visual shape, but make its progression correlate with world depth.

When a beat travels:

```text
beat approaches
→ film frames also stream toward camera
→ perforations accelerate toward foreground
→ active frame region grows
```

When scrolling upward:

```text
beat moves back toward horizon
→ film rewinds
→ frame spacing visually compresses into distance
```

Do not reset Film Road state at beat boundaries.

The road must remain continuous through the entire master progress.

---

# 12. Background behavior

Simplify background behavior too.

For the motion demo, use no more than 3 background states.

Example:

```text
dark
→ bright accent
→ dark
```

Background transitions should be slower than the depth pass and should overlap multiple beats.

Do not make every beat a different colored rectangular section.

The world should feel continuous.

---

# 13. Typography rules

Typography should also exist in depth.

Do not animate a title as:

```text
opacity 0
→ opacity 1
→ wait
→ opacity 0
```

Instead:

```text
tiny at horizon
→ grows into readability
→ travels toward viewer
→ becomes giant cropped typography
→ passes camera
```

This means the title itself can become the scene transition without a separate wipe layer.

Prefer one giant word/phrase over several text blocks.

---

# 14. Geometry and lane variety

To avoid every beat feeling mechanically identical, vary the camera pass slightly.

Examples:

```text
Beat 1 exits lower-left
Beat 2 exits upper-right
Beat 3 passes almost center
Beat 4 exits lower-right
Beat 5 settles instead of passing
```

But all beats must still originate from the shared horizon.

Do not randomize motion.

The same scroll position must always create the same composition.

---

# 15. CTA exception

The final CTA should still approach from the horizon like every other beat.

However, once it reaches readable camera depth, it may **stop** instead of flying through the viewer.

Desired ending:

```text
CTA far away
→ approaches
→ becomes readable
→ settles
→ Film Road motion calms
→ buttons remain clickable
```

Do not force the final CTA to disappear behind the camera.

---

# 16. Master timeline implementation guidance

Keep one primary timeline.

The preferred structure is not hundreds of chained `.set(autoAlpha)` calls.

Prefer helper abstractions such as:

```ts
addDepthBeat(master, beat, {
  start,
  laneX,
  exitX,
  rotation,
});
```

or a config-driven system:

```ts
const depthBeats = [
  { id: "flash10", start: 0, laneX: 0, exitX: -35 },
  { id: "ten-years", start: 18, laneX: -7, exitX: 42 },
  { id: "connect", start: 36, laneX: 8, exitX: -18 },
  { id: "flashback", start: 55, laneX: -5, exitX: 38 },
  { id: "cta", start: 76, laneX: 0, settle: true },
];
```

The exact numbers must be tuned.

The important architecture is:

```text
one timeline
+ reusable depth lifecycle
+ overlapping beats
+ minimal elements
```

---

# 17. Scroll rhythm

The user should feel a clear cycle:

```text
see something far away
→ approach it
→ understand it
→ move through/past it
→ see the next thing ahead
```

Repeat.

This is different from:

```text
reveal
→ read
→ hide
→ reveal next
```

The first cycle is the V3.1 target.

---

# 18. Reverse behavior

Reverse scroll is mandatory.

If the user scrolls upward:

```text
object behind camera
→ re-enters foreground
→ shrinks back to readable depth
→ continues toward horizon
```

Do not create separate upward animations.

The same master timeline should scrub backward naturally.

No direction-based layout state.

---

# 19. Mobile

Preserve the depth concept on mobile.

Simplify by:

- reducing max foreground scale;
- reducing x exit distance;
- using fewer simultaneous visible beats;
- shortening total scroll distance;
- keeping the horizon near upper-middle viewport;
- reducing rotationX/rotationY.

Do not replace depth travel with ordinary vertical cards.

---

# 20. Performance

For the demo:

- animate transforms only wherever possible;
- use `will-change: transform` selectively;
- avoid React state per scroll tick;
- avoid layout reads inside GSAP `onUpdate`;
- avoid dozens of decorative elements;
- do not add WebGL;
- do not add a physics library.

The simplification requested in this V3.1 should improve performance significantly.

---

# 21. Required code cleanup

After the V3.1 travel system works, remove landing-only demo elements and CSS that are no longer used.

Likely candidates include old V3 concepts equivalent to:

```text
large media-card collections
culture-object collections
hero-object collections if redundant
portal layers
sweep layers
transfer tokens
multiple handoff tokens
busy decorative placeholder clusters
```

Do not delete code shared by `/create` or `/wall`.

---

# 22. Quality gates

## Gate 1 — Horizon spawn

Pass only if the next composition is visibly present far down the Film Road before it becomes readable.

FAIL if it simply fades into the middle of the viewport.

## Gate 2 — Approach

Pass only if scrolling makes the composition clearly travel from far distance toward the camera.

The user should perceive depth even with placeholder geometry.

## Gate 3 — Camera pass

Pass only if the composition continues past normal scale, becomes foreground, crops/exits the viewport, and feels like the user moved past it.

FAIL if it stops at scale 1 and fades out.

## Gate 4 — Convoy overlap

Pass only if while one beat leaves the foreground, the next beat is already visible approaching from the horizon.

FAIL if there is a blank transition or hard scene replacement.

## Gate 5 — Minimal demo

Pass only if each beat has roughly 1 title + 1 simple object (+ optional short label).

FAIL if the page is still full of cards, stickers, tokens, and decorative demo clutter.

## Gate 6 — Reverse

Pass only if scrolling upward makes the entire depth journey reverse naturally.

## Gate 7 — Film synchronization

Pass only if the Film Road feels like the spatial track carrying the user through the beats.

---

# 23. Explicit failure conditions

V3.1 is incorrect if any of these are true:

```text
major beats mainly use fade in / fade out
composition appears at normal size in center screen
composition never grows beyond readable size
next beat is invisible until old beat is gone
sections feel like flat slides
Film Road moves but content does not share the same depth world
there are many decorative demo elements
multiple independent pinned sections return
depth travel only works scrolling downward
mobile becomes ordinary stacked cards
```

---

# 24. Definition of Done

V3.1 is successful when a first-time viewer can describe the experience approximately as:

> “I feel like I’m moving forward on the film road. The next message starts far away, comes toward me, gets large, I pass through it, then the next one comes from the distance.”

They should NOT primarily describe it as:

> “Different sections appear as I scroll.”

For this pass, prioritize **depth motion correctness over visual decoration**.

Final FLASH styling, photography, content, and extra objects will be added after this travel illusion is approved.
