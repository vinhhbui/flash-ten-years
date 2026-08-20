# Codex Task — Rebuild Landing Motion as One Master Stage V3

Implement the V3 landing motion architecture now.

Read this file completely first:

`INSTRUCTIONS_SUPERPLAY_MOTION_V3.md`

It is the authoritative motion contract for route `/` and wins over older landing motion instructions when they conflict.

Also inspect the current landing implementation before editing.

---

## Mission

The current Film Road direction is acceptable enough to preserve.

The main problem is that the landing still behaves like several normal webpage sections because the current architecture uses separate scene components and separate pinned ScrollTrigger timelines.

Refactor the animated landing into:

```text
ONE scroll track
→ ONE primary master ScrollTrigger
→ ONE pinned fullscreen master stage
→ ONE master GSAP timeline
→ multiple composition layers transform inside the same viewport
→ persistent Film Road runs continuously through the whole sequence
```

Do not redesign `/create` or `/wall`.

Do not rebuild the Film Road from zero unless required for integration.

Do not spend this pass creating final FLASH decoration.

Motion fidelity comes first.

---

## Current code to inspect first

Inspect at minimum:

```text
client/src/landing/LandingExperience.tsx
client/src/landing/landing.css
client/src/landing/animation/useLandingScroll.ts
client/src/landing/animation/createStageTimeline.ts
client/src/landing/animation/createHeroTimeline.ts
client/src/landing/animation/createManifestoTimeline.ts
client/src/landing/animation/createMediaTimeline.ts
client/src/landing/animation/createTakeoverTimeline.ts
client/src/landing/animation/createCultureTimeline.ts
client/src/landing/animation/createFinalTimeline.ts
client/src/landing/animation/motionConfig.ts
client/src/landing/film/*
client/src/landing/scenes/*
```

Confirm which code is landing-only before deleting it.

---

## Architecture change required

The current mental model:

```text
HeroScene + pin
ManifestoScene + pin
MediaScene + pin
TakeoverScene + pin
CultureScene + pin
FinalScene + pin
```

must no longer be the primary architecture.

Replace it with something conceptually equivalent to:

```text
LandingExperience
├── LandingHeader
└── ScrollTrack
    └── MasterStage (pinned)
        ├── StageBackground
        ├── FilmRoad
        ├── BackgroundTypographyLayer
        ├── MainTypographyLayer
        ├── MediaLayer
        ├── ObjectLayer
        ├── ForegroundLayer
        └── FinalCtaLayer
```

Composition components may remain as React components, but render them as absolute layers/states inside the same master stage rather than vertically stacked sections.

Use one main GSAP timeline controlled by one primary ScrollTrigger.

Do not create one primary pin per composition.

---

## Preserve the Film Road

Keep the working Film Road component/geometry as much as possible.

Change its control model from scene-local progress to continuous master landing progress.

Required behavior:

```text
master progress 0 → 1
→ film continuously feeds forward
→ never resets at composition boundaries
→ local bend/offset/perspective can react to transitions
```

Reverse scroll must naturally rewind the same deterministic timeline.

Do not use React state on every scroll frame.

---

## Master motion sequence

Implement approximately this choreography:

```text
0.00–0.13  HERO / ORIENT
0.13–0.23  HERO TYPOGRAPHY TAKEOVER
0.23–0.37  MANIFESTO / READ
0.37–0.54  FLOATING MEDIA FIELD
0.54–0.64  MEDIA → GRAPHIC TAKEOVER
0.64–0.77  OBJECT / CULTURE FIELD
0.77–0.89  FINAL MANIFESTO + GIANT TYPE
0.89–1.00  FINAL HANDOFF / CTA
```

These ranges may be tuned visually.

Transitions must overlap.

The next composition should start forming before the previous composition completely disappears.

---

## Required motion grammar

### 1. Typography takeover

At least two times:

```text
readable headline
→ scales very large
→ crops outside viewport
→ becomes graphic transition object
→ reveals/forms next composition
```

Do not primarily fade text out.

### 2. Background takeover

Use one persistent full-screen background layer.

Animate through at least three temporary FLASH-original background states without revealing section boundaries or body gaps.

### 3. Floating media field

Create approximately 5–8 desktop placeholder media/graphic items positioned absolutely around the stage.

Use at least three obvious depth speeds:

```text
far
mid
near / foreground
```

Do not build the main media composition as a conventional CSS grid.

### 4. Foreground passes

At least two objects must approach the virtual camera strongly:

```text
small
→ large scale
→ crop through viewport
→ exit beyond screen
```

Objects may leave `±100vw`, `±100vh`, and scale above 2 when useful.

### 5. Object handoff

Film Road is the permanent handoff object.

Also implement at least two additional object/frame/typography handoffs between composition states.

### 6. Calm/read windows

Do not animate everything aggressively at all times.

Use this rhythm:

```text
ACTION
→ SETTLE
→ READ
→ ACTION
→ TAKEOVER
```

Every major message needs a readable hold.

---

## Depth model

Use a consistent stacking model equivalent to:

```text
background
background typography
Film Road
primary content
floating media / objects
foreground takeover objects
navigation / critical CTA
```

Do not constrain the animated world to a normal centered marketing container.

---

## GSAP implementation guidance

Prefer one master timeline such as:

```ts
const master = gsap.timeline({
  scrollTrigger: {
    trigger: track,
    start: "top top",
    end: () => `+=${window.innerHeight * MASTER_DISTANCE}`,
    pin: stage,
    scrub: 0.8,
    anticipatePin: 1,
    invalidateOnRefresh: true,
  },
});
```

Tune total desktop scroll distance around the range described in the instruction, not blindly.

Use labels, for example:

```text
heroHold
heroTakeover
manifestoRead
mediaEnter
mediaSettle
mediaTakeover
objectField
finalManifesto
finalTakeover
finalCTA
```

Prefer grouped tweens on the master timeline over many tiny ScrollTriggers.

---

## Quality gates — implement sequentially

### Gate 1 — One master stage

Do not continue until:

- one primary pinned master stage exists;
- six major vertically stacked scene pins are no longer the architecture;
- Film Road still works;
- no visible section boundaries appear during the main sequence.

### Gate 2 — Hero → Manifesto

Do not continue until:

- hero remains inside the same camera/stage;
- giant typography performs an actual takeover;
- manifesto begins forming before hero transition finishes;
- Film Road does not reset;
- reverse scroll restores the transition.

### Gate 3 — Media field

Do not continue until:

- media feels spatial, not grid-based;
- at least three depth speeds are visible;
- at least one foreground pass exists;
- there is a readable calm window;
- transition out is takeover/handoff, not generic fade-up.

### Gate 4 — Full V3 language

Verify:

- 2+ typography takeovers;
- 3+ background states;
- 2+ foreground passes;
- 2+ non-film object handoffs;
- persistent Film Road;
- deterministic reverse scroll;
- no blank gaps between compositions.

### Gate 5 — Cleanup/build

Run:

```bash
cd client
npm run check
npm run build
```

Fix errors before stopping.

Remove dead landing-only per-scene timeline/CSS code after the new master timeline works.

Do not break `/create` or `/wall`.

---

## Explicit failure conditions

The task is NOT complete if:

```text
six primary scene pins still exist
compositions visibly stack vertically
new scenes mainly enter from the bottom
transitions are mostly opacity + translateY
background is separate per rectangular section
Film Road resets at scene boundaries
media looks like normal cards/grid
all animated objects stay inside a centered content container
typography never exceeds viewport size
reverse scroll uses custom direction hacks
```

---

## Scope boundary

Use temporary original shapes, text, and photo placeholders where necessary.

Do not spend the pass on final FLASH event decoration.

The user will decorate each composition later.

The result of this task should prove one thing:

> The landing now feels like a SuperPlay-style interactive motion stage controlled by scroll, with the FLASH Film Road running continuously through it, rather than a normal website with animated sections.

Proceed with implementation, not just a plan.

When finished, report only:

1. architecture changes;
2. important files changed/removed;
3. quality gates passed;
4. `npm run check` result;
5. `npm run build` result;
6. up to 3 remaining visual tuning items.
