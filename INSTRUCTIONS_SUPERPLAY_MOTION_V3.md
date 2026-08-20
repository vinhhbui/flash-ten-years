# FLASH 10 — SuperPlay Motion V3: One Master Stage

> **Authoritative motion specification for route `/`.**
>
> This document supersedes the motion/scene architecture in `INSTRUCTIONS_SUPERPLAY_FILMROAD_V2.md`, `INSTRUCTIONS_SUPERPLAY_SCROLL_CHOREOGRAPHY.md`, `INSTRUCTIONS_FILMSTRIP_LANDING.md`, and older landing motion notes whenever there is a conflict.
>
> Keep the current Film Road concept and current `/create` + `/wall` product flows. The main correction in V3 is the **motion architecture of the landing compositions**.

---

# 0. Why V3 exists

The current V2 implementation improved the central Film Road, but the page still reads too much like a conventional website because it is implemented as a sequence of separate scene sections:

```text
HeroScene
↓
ManifestoScene
↓
MediaScene
↓
TakeoverScene
↓
CultureScene
↓
FinalScene
```

and each scene currently owns its own pinned ScrollTrigger timeline.

That architecture is maintainable in code, but visually it still encourages this feeling:

```text
section A
→ section A finishes
→ section B begins
→ section B finishes
→ section C begins
```

The new target, based on the supplied SuperPlay screen recording, is:

```text
ONE FULLSCREEN STAGE
        │
        ├─ composition A
        │    transforms
        ├─ typography takeover
        ├─ background takeover
        ├─ foreground object crosses camera
        ├─ composition B forms inside same viewport
        │    transforms
        ├─ media field expands
        ├─ giant word becomes transition
        └─ composition C forms
```

The viewer should feel like they are controlling an animation timeline, not scrolling through stacked webpage sections.

---

# 1. Core V3 rule — one master pinned stage

## 1.1 Do not create six independent pinned scenes

For the main animated portion of `/`, use **one master stage** and **one master scroll timeline**.

Do not use one independent `ScrollTrigger({ pin: true })` per major composition.

The V2 pattern below is no longer the desired architecture:

```text
Hero ScrollTrigger
Manifesto ScrollTrigger
Media ScrollTrigger
Takeover ScrollTrigger
Culture ScrollTrigger
Final ScrollTrigger
```

Replace it with:

```text
Landing scroll track
        │
        ▼
ONE Master ScrollTrigger
        │
        ▼
ONE pinned viewport stage
        │
        ├─ StageBackground
        ├─ FilmRoad
        ├─ BackgroundTypographyLayer
        ├─ MainTypographyLayer
        ├─ MediaLayer
        ├─ ObjectLayer
        ├─ ForegroundLayer
        └─ CTA layer
```

The master timeline is the single source of truth for the main motion sequence.

## 1.2 Code may still use composition components

It is acceptable to keep components such as:

```text
HeroComposition
ManifestoComposition
MediaComposition
ObjectFieldComposition
FinalComposition
```

for maintainability.

However, render them **inside the same master stage as absolute composition layers**, not as six vertically stacked page sections.

Conceptual React structure:

```tsx
<main className="landing-experience">
  <LandingHeader />

  <div className="landing-scroll-track" ref={trackRef}>
    <section className="landing-master-stage" ref={stageRef}>
      <StageBackground />
      <FilmRoad ref={filmRef} />

      <div className="stage-layer stage-layer--background-type" />
      <div className="stage-layer stage-layer--main-type" />
      <div className="stage-layer stage-layer--media" />
      <div className="stage-layer stage-layer--objects" />
      <div className="stage-layer stage-layer--foreground" />
      <div className="stage-layer stage-layer--cta" />
    </section>
  </div>
</main>
```

The names may differ, but the visual model must remain one stage.

---

# 2. Viewport/camera behavior

The master animated stage should behave like a nearly stationary camera.

During most of the main experience:

```text
browser viewport ≈ camera
background fills viewport
header can remain stable
film remains persistent
objects move through the camera
composition transforms inside viewport
```

The user should NOT repeatedly see the top/bottom boundary of each scene.

Avoid visible patterns like:

```text
[ composition A ]
      ↑ leaves viewport
-------------------------
[ composition B ]
      ↑ enters from bottom
```

Instead:

```text
[ same viewport ]
composition A
   ↓ transforms
objects leave frame
text scales beyond camera
background changes
composition B is already forming
```

A normal final footer/outro can release from the pin after the high-energy sequence is complete.

---

# 3. Keep the current Film Road — change how it is driven

The current Film Road direction is approved enough to preserve.

Do not rebuild it from zero unless required to make it compatible with the master stage.

The important V3 change is control flow:

## V2 behavior to retire

```text
scene local progress
→ set film state for hero
scene ends
→ next scene local progress starts from 0
→ set film state for manifesto
...
```

## V3 behavior

```text
MASTER LANDING PROGRESS 0.00 → 1.00
                │
                ├─ background state
                ├─ typography choreography
                ├─ media choreography
                ├─ object choreography
                └─ FILM ROAD STATE
```

The Film Road must receive a **continuous global progress** and must never visually reset at a composition boundary.

Scrolling down:

```text
film continuously feeds toward viewer
→ distant frames approach
→ perspective grows
→ local bend/offset changes during transitions
→ film survives every composition
```

Scrolling up:

```text
same master timeline reverses
→ film rewinds continuously
→ previous composition restores
```

Do not use React state for frame-by-frame progress updates.

---

# 4. Stage depth model

The supplied reference video strongly depends on layered depth.

Use a consistent visual stacking model:

```text
z0   full-screen background field
z10  oversized / background typography
z20  Film Road
z30  primary readable content
z40  floating photos / medium objects
z50  foreground takeover objects
z60  navigation / critical CTA when appropriate
```

These are conceptual layers, not mandatory literal z-index values.

At least three visible depth speeds should exist in active motion passages:

```text
far layer       slow translation / smaller scale change
mid layer       medium translation / medium scale change
foreground      fast translation / strong scale growth
```

This creates the feeling that the camera travels through a graphic world even though the implementation remains DOM/SVG/2D.

---

# 5. Motion grammar extracted from the reference recording

The V3 experience should reproduce these motion patterns.

Do not copy SuperPlay art or text. Reproduce the **motion grammar** only.

## Pattern A — Typography takeover

Readable text becomes a giant graphic object:

```text
readable headline
→ scale increases
→ letters crop outside viewport
→ text stops behaving like conventional content
→ giant letterforms become foreground/transition shape
→ next composition appears through/behind it
```

Use this at least **two times** in the master sequence.

Do not simply fade the headline out.

## Pattern B — Full-screen background takeover

Background color/field should transform while the same stage remains pinned.

Use at least three distinct placeholder fields during V3, for example:

```text
Field A
→ Field B
→ Field C
→ Field D
```

These are temporary FLASH-original colors, not exact SuperPlay brand colors.

The background transition must not expose a section boundary.

## Pattern C — Floating media field

Photos/cards/placeholders should live in absolute stage coordinates, not a conventional grid.

Example visual distribution:

```text
       [photo A]

  object                  [photo B]

              MAIN COPY

 [photo C]

                       object

             [photo D]
```

Elements enter, separate, cross the viewport, and leave at different depth speeds.

Do not use a static CSS grid as the main visual behavior.

## Pattern D — Foreground pass

At least two objects should travel very close to the virtual camera:

```text
small object
→ approaches
→ scale grows strongly
→ crosses foreground
→ exits beyond viewport
```

It is acceptable for the object to become heavily cropped.

Objects should be allowed to travel outside the viewport:

```text
x < -100vw
x > 100vw
y < -100vh
y > 100vh
scale > 2
```

when compositionally useful.

Do not constrain the animated landing to a conventional `max-width: 1200px` content box.

## Pattern E — Object handoff

A visual from one composition survives into the next.

For FLASH, the Film Road is always the permanent handoff object.

In addition, at least two transitions should hand off another object:

```text
photo / frame / graphic token / giant word
→ survives transition
→ changes role in next composition
```

## Pattern F — Calm/read windows

The reference does not remain chaotic at all times.

Use rhythm:

```text
ACTION
→ SETTLE
→ READ
→ ACTION
→ TAKEOVER
→ SETTLE
```

Every major copy beat should receive a short readable hold window before the next aggressive transition.

Do not keep all objects continuously drifting forever.

---

# 6. Master progress map

Use one normalized master progress from `0.00` to `1.00`.

The following ranges are choreography targets, not exact mandatory numbers.

```text
0.00 ───────────────────────────────────────────── 1.00

0.00–0.13   HERO / ORIENT
0.13–0.23   HERO TYPOGRAPHY TAKEOVER
0.23–0.37   MANIFESTO / READ
0.37–0.54   FLOATING MEDIA FIELD
0.54–0.64   MEDIA → GRAPHIC TAKEOVER
0.64–0.77   OBJECT / CULTURE FIELD
0.77–0.89   FINAL MANIFESTO + GIANT TYPE
0.89–1.00   FINAL HANDOFF / CTA
```

Transitions overlap. Do not treat these as isolated blocks.

The next composition should start forming before the previous one fully disappears.

---

# 7. Detailed choreography

## 7.1 0.00–0.13 — Hero / orient

Initial state:

- full-screen stage already active;
- Film Road visible and readable;
- large FLASH 10 placeholder title;
- 2–4 original/simple supporting objects;
- short copy only.

Motion:

```text
0.00–0.05
intro settles
film feeds subtly
small parallax only

0.05–0.10
supporting objects separate by depth
hero title develops slight tension/scale
film perspective advances

0.10–0.13
hero composition prepares takeover
one dominant word/number becomes transition candidate
```

Do not make the hero simply scroll upward.

## 7.2 0.13–0.23 — Hero typography takeover

This is the first major quality gate.

Use oversized title/number as a transition object:

```text
scale 1
→ scale ~2
→ scale ~4+
→ crop beyond viewport
```

At the same time:

- 1–2 supporting objects move toward foreground edges;
- background begins changing;
- Film Road remains visible through or around the typography where compositionally possible;
- next manifesto composition appears before giant type completely exits.

No generic opacity crossfade as the primary transition.

## 7.3 0.23–0.37 — Manifesto / read

Create a calmer composition.

Characteristics:

- strong central or offset typography;
- Film Road still moving gently;
- 1–3 floating objects maximum;
- readable hold window;
- subtle parallax.

Then prepare the next media field by allowing small media fragments to enter near the end of this range.

## 7.4 0.37–0.54 — Floating media field

This should feel spatial, not grid-based.

Use approximately 5–8 placeholder media/graphic items on desktop.

Assign depth classes such as:

```text
data-depth="far"
data-depth="mid"
data-depth="near"
```

Suggested behavior:

```text
0.37–0.42
media fragments enter from multiple edges

0.42–0.48
composition spreads around Film Road
foreground item crosses faster
main copy remains readable near center/offset

0.48–0.52
several items leave
visual noise decreases
main message becomes strongest element

0.52–0.54
dominant typography/object prepares takeover
```

Do not leave all media items visible for the entire scene.

## 7.5 0.54–0.64 — Media → graphic takeover

Use a strong continuous transition.

Required ingredients:

- giant typography sweeps/scales across viewport;
- background field changes underneath;
- one media fragment or film frame survives;
- Film Road bends/offsets or visually reacts without resetting;
- next object-field composition forms inside the same camera.

Aim for the feeling:

```text
current scene collapses into one dominant object
→ dominant object fills camera
→ next world exists behind it
```

## 7.6 0.64–0.77 — Object / culture field

Use 3–6 original placeholder objects.

They should not behave as cards.

Use depth and directional travel:

```text
object A: far → slow diagonal
object B: mid → horizontal cross
object C: near → large scale foreground pass
object D: tied visually to Film Road
```

Create one calm/read point around the middle of this range.

Near the end, introduce final manifesto typography.

## 7.7 0.77–0.89 — Final manifesto + giant type

Start readable, then convert the typography into a transition device.

Example behavior:

```text
readable statement
→ short hold
→ line scales aggressively
→ letters crop beyond edges
→ Film Road remains visible in negative space / between letterforms
→ CTA composition appears
```

This is the second required typography takeover.

## 7.8 0.89–1.00 — Final handoff / CTA

The energy should resolve.

Use:

- one surviving object from previous beat;
- Film Road simplifying/straightening slightly;
- final FLASH 10 title or memory statement;
- CTA links to existing product routes.

Required routes to preserve:

```text
/create
/wall
```

CTA must become clickable before decorative motion fully settles.

The final state may release from the pinned stage into a small normal-flow footer if useful.

---

# 8. Master timeline implementation

Prefer one GSAP timeline:

```ts
const master = gsap.timeline({
  scrollTrigger: {
    trigger: track,
    start: "top top",
    end: () => `+=${window.innerHeight * MASTER_SCROLL_VH}`,
    pin: stage,
    scrub: 0.8,
    anticipatePin: 1,
    invalidateOnRefresh: true,
  },
});
```

The exact scroll distance must be tuned visually.

A reasonable initial desktop target is around:

```text
700vh–1000vh total scrub distance
```

Do not blindly hard-code a giant value without testing.

Use timeline labels for choreography:

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

Prefer adding tweens to the same master timeline rather than constructing six independent ScrollTriggers.

---

# 9. Background system

Create one persistent background layer.

Do not assign each composition an ordinary rectangular section background.

Conceptual:

```tsx
<StageBackground data-stage-background />
```

Then animate the field using the master timeline.

Background may use:

- color interpolation;
- giant CSS shape;
- clip-path takeover;
- foreground shape that expands to become the next background.

Do not reveal white/body gaps between palette states.

---

# 10. Typography implementation

Typography is an animation object, not just static content.

Structure headings so they can be animated by line/word where needed:

```tsx
<h2>
  <span className="line">TEN YEARS</span>
  <span className="line">IN MOTION</span>
</h2>
```

or word spans for selected takeover words.

Required typography behaviors across the sequence:

- line stagger;
- scale takeover;
- offscreen crop;
- translation beyond viewport;
- mild rotation where appropriate;
- readable hold states.

Do not animate every character individually unless it materially improves the result.

---

# 11. Media and object positioning

Animated stage objects should primarily use absolute coordinates and transforms.

Allowed:

```css
position: absolute;
transform: translate3d(...) scale(...) rotate(...);
will-change: transform;
```

Avoid animating layout-critical properties per frame:

```text
top
left
width
height
```

Use CSS variables/config for initial composition coordinates where helpful.

The goal is art-directed motion, not document layout.

---

# 12. Film Road integration points

Film Road should not dominate every readable moment, but it must remain a coherent visual spine.

Recommended master-progress responses:

```text
0.00–0.13   steady forward feed
0.13–0.23   slightly stronger perspective / local offset during takeover
0.23–0.37   calm feed
0.37–0.54   media frames visually align/cross with film where useful
0.54–0.64   bend/offset reacts to takeover
0.64–0.77   continuous travel; one object may attach to frame
0.77–0.89   simplify around giant typography
0.89–1.00   settle/straighten toward CTA
```

Do not reset the film at any percentage boundary.

---

# 13. Reverse scroll contract

The same master timeline must reverse naturally.

At a given scroll position, the visual state should be approximately deterministic.

Do not build separate `scroll up` choreography using direction conditionals for the main animation.

Do not use wheel handlers to fake rewind.

GSAP scrubbed timeline progress should be the source of reversal.

Small velocity-based overshoot may be added later, but not before the deterministic base works.

---

# 14. Current implementation migration guidance

The repository currently has:

```text
client/src/landing/LandingExperience.tsx
client/src/landing/scenes/*
client/src/landing/animation/createHeroTimeline.ts
client/src/landing/animation/createManifestoTimeline.ts
client/src/landing/animation/createMediaTimeline.ts
client/src/landing/animation/createTakeoverTimeline.ts
client/src/landing/animation/createCultureTimeline.ts
client/src/landing/animation/createFinalTimeline.ts
client/src/landing/animation/createStageTimeline.ts
client/src/landing/animation/useLandingScroll.ts
client/src/landing/film/*
```

Do not throw away working Film Road code.

Recommended migration:

```text
KEEP
FilmRoad and film geometry/helpers
LandingHeader
reduced-motion utility
useful reusable visual primitives
route integration

REFACTOR
LandingExperience → master track + master stage
scene components → composition layers inside master stage
useLandingScroll → one master timeline hook/controller
motionConfig → global progress labels and layer states

RETIRE OR REPURPOSE
createStageTimeline per-scene pin helper
six independent pinned timeline factories
scene-local film progress reset model
vertical section layout CSS
```

It is acceptable to keep old timeline files temporarily during refactor, but remove dead code before finishing.

---

# 15. Recommended V3 file architecture

Suggested structure:

```text
client/src/landing/
├── LandingExperience.tsx
├── landing.css
│
├── stage/
│   ├── MasterStage.tsx
│   ├── StageBackground.tsx
│   └── stageConfig.ts
│
├── compositions/
│   ├── HeroComposition.tsx
│   ├── ManifestoComposition.tsx
│   ├── MediaComposition.tsx
│   ├── ObjectFieldComposition.tsx
│   └── FinalComposition.tsx
│
├── animation/
│   ├── useMasterLandingTimeline.ts
│   ├── createMasterTimeline.ts
│   └── motionConfig.ts
│
├── film/
│   └── existing Film Road implementation
│
└── components/
    └── reusable visual primitives
```

Codex does not have to follow the names exactly.

Architecture quality is judged by behavior and clean ownership, not folder naming.

---

# 16. Responsive behavior

Desktop is the first quality target.

For compact/mobile:

- keep one-stage concept;
- reduce number of simultaneous objects;
- shorten total scrub distance;
- reduce foreground scale extremes;
- reduce Film Road width where necessary;
- shorten typography takeover duration;
- preserve at least one media field and one typography takeover;
- ensure touch scrolling remains native and stable.

Do not replace mobile with six static cards.

If full pinning is unstable on small touch devices, reduce pin duration or simplify choreography while preserving the stage concept.

---

# 17. Reduced motion

For `prefers-reduced-motion: reduce`:

- disable long scrub choreography;
- render compositions in a clear readable order;
- keep Film Road recognizable;
- avoid giant fly-through typography;
- keep `/create` and `/wall` CTA immediately accessible.

Accessibility mode may use normal document flow.

---

# 18. Performance rules

Prefer animating:

```text
transform
opacity
clip-path only when necessary
```

Use `will-change` selectively.

Do not update React state every scroll frame.

Do not create dozens of independent ScrollTriggers for tiny objects.

Use one master timeline and grouped tweens.

Do not add Three.js/WebGL for this V3 pass.

Do not add a smooth-scroll library until the native GSAP implementation is correct.

---

# 19. V3 quality gates

Codex must implement and self-check in this order.

## Gate 1 — Master stage architecture

PASS only if:

- one main pinned stage exists;
- Hero/Manifesto/Media/etc. no longer behave as vertically stacked page sections;
- there is one primary master ScrollTrigger controlling the main experience;
- Film Road remains visible and working.

FAIL if six major scene pins still exist.

## Gate 2 — Hero → Manifesto transition

PASS only if:

- hero does not scroll upward as a section;
- giant typography performs a real takeover;
- next composition forms inside the same viewport;
- Film Road does not reset;
- reverse scroll restores the transition.

Do not continue polishing later compositions until this passes.

## Gate 3 — Media field

PASS only if:

- media is absolute/spatial, not a normal grid;
- at least three depth speeds are visible;
- at least one foreground object passes close to camera;
- there is a readable calm window;
- the transition out uses takeover/handoff, not fade-up.

## Gate 4 — Full motion language

PASS only if all are present:

- at least 2 typography takeovers;
- at least 3 background field states;
- at least 2 non-film object handoffs;
- at least 2 foreground passes;
- persistent Film Road;
- deterministic reverse scroll;
- no visible blank gaps between major compositions.

## Gate 5 — Build and cleanup

Run:

```bash
cd client
npm run check
npm run build
```

Fix errors.

Remove dead scene/timeline CSS and code only after confirming it is landing-only.

Do not break `/create` or `/wall`.

---

# 20. Explicit failure conditions

V3 is considered incorrect if any of these remain true:

```text
six major sections still stack vertically
one pin per major scene remains the primary architecture
next composition enters mainly from bottom like a normal section
most transitions are opacity + y
background belongs to separate rectangular sections
Film Road resets between compositions
media is primarily a card/grid layout
all objects stay inside a centered max-width container
all motion is continuous with no calm/read windows
typography never grows beyond viewport
reverse scroll requires custom direction hacks
```

The final mental model must be:

```text
SCROLL
  ↓
MASTER PLAYHEAD
  ↓
ONE FULLSCREEN STAGE
  ↓
composition transforms
  ↓
takeover
  ↓
next composition forms
  ↓
Film Road continues through everything
```

---

# 21. Content scope for this pass

Do not spend significant time creating final FLASH event decoration yet.

Use original temporary visual placeholders for:

- photos;
- shapes;
- graphic tokens;
- supporting objects;
- short manifesto copy.

The user will art-direct/decorate individual compositions later.

The goal of V3 is **motion fidelity and stage architecture first**.

A visually simple composition with excellent SuperPlay-like motion is better than a fully decorated conventional webpage.
