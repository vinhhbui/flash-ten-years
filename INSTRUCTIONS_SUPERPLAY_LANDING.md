# FLASH 10 — SuperPlay Motion Clone Landing Instructions

## 0. Authority and scope

This file is the **authoritative implementation instruction for the public landing route `/`** in `flash-ten-years`.

It is scoped to the landing experience only.

Precedence:

1. `INSTRUCTIONS.md` remains authoritative for the Memory Cat product flow, `/create`, `/wall`, API, Socket.IO, persistence, scanning-related product work, and event/LAN behavior.
2. **This file is authoritative for `/`, landing architecture, visual direction, scroll choreography, motion system, responsive behavior, and landing performance.**
3. `INSTRUCTIONS_GSAP_SCROLL_REFERENCE.md` is a technical reference experiment only. Its long SVG path is not the production landing architecture.
4. Do not break `/create`, `/wall`, server behavior, uploads, persistence, or Socket.IO while redesigning `/`.

The task is not greenfield. The application already exists.

---

# 1. Mission

Replace the current landing page with an **original FLASH 10 animated playground whose interaction rhythm is strongly inspired by the SuperPlay homepage**.

Reference:

- https://www.superplay.co/

The target is **high behavioral fidelity, not brand copying**.

Clone:

```text
motion rhythm
scroll staging
kinetic typography
asset choreography
playful depth
visual interruptions
scene-to-scene continuity
bounce / overshoot character
```

Do not copy:

```text
SuperPlay logo
SuperPlay copy
SuperPlay game art
SuperPlay coin/cube/domino images
SuperPlay characters
SuperPlay proprietary illustrations
SuperPlay source code
```

Use original FLASH 10 visuals and placeholders that can later be replaced with real event assets.

---

# 2. Reference audit — researched before implementation

This section records the verified characteristics of the current reference so Codex does not reduce the brief to a generic animated landing page.

## 2.1 What is visible on the current SuperPlay homepage

The homepage uses a short manifesto rather than many conventional marketing sections.

Observed content beats include:

```text
It's only fun if you're winning

BEING SUPER
means we love to
PUSH OUR LIMITS

And
we aim to
find people who
feel the same way

Because
it takes
winners to build
winning games

Get exploring!
```

Between these text beats, the page contains many visual assets instead of plain whitespace.

The live page exposes asset groups with names such as:

```text
HPcoin_*.png
fragments-box-img-*.jpg
HPcube_*.png
slide-unit_*.png
HPdomino_*.png
hello-unit.gif
```

These filenames are evidence of the **visual grammar** only: repeated families of collectible/game-like objects, image fragments, sprite units, and animated media surrounding the typography.

Do not copy those assets.

## 2.2 Design intent from the design studio

The design case study describes:

- animated titles that bounce
- game elements that move quickly around the screen
- playful interactive challenges
- bold typography
- direct graphic language guiding the user through the manifesto
- energetic, joyful, unapologetic visual behavior

Therefore the target cannot be reproduced with only `fade + translateY` reveals.

## 2.3 Development characteristics from the implementation studio

The development case study identifies:

- a custom front-end
- WordPress as the CMS/platform
- advanced scroll and hover animations
- animation-rich layouts
- image/video-heavy storytelling
- performance and responsive requirements

We do **not** need to copy WordPress. The existing FLASH React/Vite application is the correct implementation platform.

## 2.4 Technical implementation note

The public sources above do not prove that SuperPlay itself uses GSAP or Lenis.

Do not claim that it does.

For FLASH 10 we choose GSAP + ScrollTrigger because:

- GSAP already exists in this repository
- ScrollTrigger supports `scrub` and `pin`, which fit the required choreography
- it avoids replacing the existing frontend stack

Lenis is an optional smooth-scroll layer for our implementation, not a claim about SuperPlay's source stack.

Reference sources for Codex:

```text
https://www.superplay.co/
https://www.awesome-deloitte.com/project/superplay
https://group107.com/case-studies/super-play/
https://gsap.com/docs/v3/Plugins/ScrollTrigger/
https://github.com/darkroomengineering/lenis
```

---

# 3. Current repository baseline

Before editing, inspect the actual repository.

Current frontend stack:

```text
React 18
Vite
TypeScript
React Router
GSAP
ScrollTrigger
react-konva
Socket.IO client
```

Current routes:

```text
/         -> LandingPage
/create   -> CreatePage
/wall     -> WallPage
```

Current landing implementation is mainly in:

```text
client/src/pages/LandingPage.tsx
client/src/styles.css
```

The current landing already has:

- full-height vertical sections
- editorial headline blocks
- CSS-built decorative characters
- one page-wide SVG route
- path drawing with `strokeDashoffset`
- generic `[data-landing-reveal]` fade/translate animation

Treat this as a disposable prototype.

The production target must move from:

```text
STACKED SECTIONS
+ GLOBAL SVG PATH
+ FADE-UP REVEALS
```

to:

```text
ONE CONTINUOUS ANIMATED PLAYGROUND
+ MANIFESTO-LIKE STORY BEATS
+ SCROLL-CONTROLLED TIMELINES
+ LARGE TYPOGRAPHY AS OBJECTS
+ CHOREOGRAPHED VISUAL SWARMS
+ STRONG OBJECT HANDOFFS
```

Do not preserve the old DOM simply to minimize the diff.

---

# 4. FLASH 10 story mapping

Do not copy SuperPlay's literal manifesto.

Map its **rhythm** to FLASH 10.

Recommended narrative:

## Beat A — Opening promise

```text
FLASH 10
TEN YEARS IN MOTION
```

Optional small line:

```text
KẾT NỐI · BẢN SẮC · FLASHBACK
```

Purpose:

- immediate identity hit
- no paragraph-heavy hero
- first visual impression should be motion and scale

## Beat B — Flashback / 10 years

```text
10 YEARS
OF MOMENTS
THAT KEEP MOVING
```

Purpose:

- map to the first major manifesto beat
- introduce memory fragments/photos/timeline tokens

## Beat C — Kết Nối

```text
KẾT NỐI
EVERY PIECE
BECOMES ONE STORY
```

Purpose:

- many separated visual objects gather and connect
- emphasize people/connections rather than company marketing

## Beat D — Bản Sắc

```text
BẢN SẮC
LEAVE YOUR MARK
```

Purpose:

- individual colors/shapes/stickers become distinct
- prepare the visual language for attendee-created artwork

## Beat E — Memory Cat handoff

```text
MAKE A MEMORY
BRING IT TO LIFE
```

Primary CTA:

```text
CREATE YOUR MEMORY -> /create
```

Secondary CTA:

```text
VIEW LIVE WALL -> /wall
```

The Memory Cat is the payoff of the landing journey.

---

# 5. Core composition rule — one playground, not six cards

This is a critical requirement.

Do **not** implement the landing as six visually isolated rectangular sections with independent card layouts.

The experience should feel like one continuous world.

Use sections/components for code organization, but visually connect them using:

- shared background fields
- objects that cross section boundaries
- scale takeovers
- persistent floating tokens
- typography replacement
- color transitions
- foreground wipes

A user should not strongly perceive:

```text
section ends
new section starts
section ends
new section starts
```

Instead they should perceive:

```text
one composition transforms
-> becomes another composition
-> objects carry forward
-> new message emerges from the previous state
```

---

# 6. Required motion grammar

## 6.1 Scroll is the playhead

Scroll should control animation progress.

Use scene-local GSAP timelines with ScrollTrigger.

Core tools:

```text
pin
scrub
start/end tuning
labels
transform choreography
```

Important beats may remain pinned for roughly `150–280vh` of scroll, but tune based on visual pacing rather than copying one fixed value.

Scrolling upward must rewind naturally.

Do not write wheel-direction handlers for basic reversal.

## 6.2 Kinetic typography

Large words must behave as graphical objects.

Allowed transforms:

```text
translateX
translateY
rotate
scale
scaleX
scaleY
skew
clip/mask
viewport overflow
```

Examples:

```text
FLASH slams in from below
10 stretches vertically then settles
KẾT NỐI travels horizontally across the viewport
BẢN SẮC rotates into a cropped composition
MEMORY scales until it becomes a transition layer
```

Split important headings into words/lines where useful.

Keep accessible reading order/labels.

Do not animate every body paragraph word-by-word.

## 6.3 Bounce, squash and overshoot

The motion should feel physical and game-like.

Use short impact states such as:

```text
0.65 scale
-> 1.10 overshoot
-> 0.97 recoil
-> 1.00 settle
```

or:

```text
scaleX 1.18 / scaleY 0.82
-> scaleX 0.94 / scaleY 1.07
-> 1 / 1
```

Suggested easing families for non-scrub impact motion:

```text
back.out
elastic.out
power3.out
power4.out
```

For scrubbed timeline motion, prefer predictable easing such as `none` or restrained power easing.

## 6.4 Visual swarms

Each major beat should have a **small family of related visual objects** around the headline.

For FLASH 10, create original families such as:

```text
AnniversaryToken
MemoryFragment
PhotoCard
FlashShape
ConnectionDot
StickerToken
CatToken
Spark
Arrow
Ribbon
```

Do not render all families at once.

Use 4–10 meaningful objects per active composition rather than dozens of noisy particles.

## 6.5 Depth

Use intentional depth layers:

```text
background
midground
foreground
focal
```

Suggested relative motion magnitude:

```text
background -> 0.10–0.18
midground  -> 0.22–0.35
foreground -> 0.45–0.70
```

These are design ratios, not literal required API values.

Foreground objects may cross the viewport faster and temporarily crop offscreen.

## 6.6 Object handoff

At least **two transitions** must reuse one visual object across beats.

Examples:

```text
giant 10
-> expands
-> becomes circular field in Flashback

photo fragment
-> flies across transition
-> becomes a connection node

identity sticker
-> enlarges
-> reveals Memory Cat silhouette
```

This is a key technique for making the landing feel continuous.

---

# 7. Recommended production beats

Use 5 core motion beats plus a final stable CTA state.

## Scene 1 — Hero playground

Target: strongest fidelity checkpoint.

Visual hierarchy:

```text
small FLASH 10 identifier
very large FLASH
very large 10
supporting KẾT NỐI · BẢN SẮC · FLASHBACK
4–7 floating original FLASH objects
```

Entrance choreography:

```text
background field reveals
-> FLASH slams in
-> 10 enters compressed
-> 10 overshoots / stretches
-> floating tokens zip into frame from mixed directions
-> all settle into a deliberately imperfect composition
```

First scroll movement:

- do not translate the whole hero upward
- separate the tokens
- move/rotate the word FLASH
- enlarge `10`
- let one foreground object cross camera
- begin takeover into Scene 2

The hero must already feel convincing before Codex proceeds to the rest of the page.

## Scene 2 — 10 Years / Flashback

Pin this beat.

Use the giant `10` as a visual anchor.

Memory/photo fragments orbit, cross, stack, or slide around it.

Possible movement:

```text
10 stabilizes center
-> fragments enter one by one
-> one row shifts horizontally while vertical scroll continues
-> one photo comes toward camera using scale
-> fragments clear rapidly
-> one fragment survives into Connection
```

Use placeholders if no real anniversary imagery exists.

Clearly mark them as replaceable.

Do not download random copyrighted photos for permanent use.

## Scene 3 — Kết Nối / Connection

Start with objects dispersed around the viewport.

During scroll:

```text
pieces approach one another
-> line/node relationships appear
-> pieces form one temporary cluster
-> giant KẾT NỐI crosses behind or through the cluster
-> cluster compresses
-> cluster releases into Scene 4
```

The existing SVG path-drawing technique may be reused **only here** if it strengthens the connection metaphor.

If used:

- make it local to this scene
- do not keep the existing page-wide route
- the SVG must support the scene rather than dominate the entire page

## Scene 4 — Bản Sắc / Identity

This is the most graphic and contrast-heavy beat.

Use:

- huge cropped text
- rotated blocks
- original sticker shapes
- identity color tiles
- strong overlaps
- quick snapping composition

Progression:

```text
BẢN SẮC enters oversized
-> tokens snap into individual positions
-> composition compresses
-> selected tokens rotate/stretch
-> pieces burst outward
-> one central piece remains
-> central piece becomes Memory Cat reveal
```

Colors must be centralized through landing CSS variables or token objects.

Do not scatter unrelated hard-coded colors through components.

## Scene 5 — Memory Cat reveal

This beat should visually explain the event mechanism without becoming a tutorial screen.

Main object:

```text
large Memory Cat silhouette / original cat asset
```

Supporting motion:

- sample cat tokens pop in
- use Float/Hop vocabulary from `/wall`
- small stickers orbit or cross
- cat uses squash/stretch on entry

Message:

```text
MAKE A MEMORY
BRING IT TO LIFE
```

Primary CTA must become clickable before all decorative motion completes.

Do not gate navigation behind a timeline.

## Scene 6 — Stable final CTA

After high-energy motion, finish with a readable end state.

Actions:

```text
CREATE YOUR MEMORY -> /create
VIEW LIVE WALL     -> /wall
```

The final CTA can still have hover motion, but it should not be visually chaotic.

---

# 8. Required React architecture

The current `LandingPage.tsx` should become a lightweight orchestrator.

Refactor approximately toward:

```text
client/src/
├── pages/
│   └── LandingPage.tsx
│
├── components/
│   └── landing/
│       ├── LandingHeader.tsx
│       ├── KineticText.tsx
│       ├── MotionAsset.tsx
│       ├── ParallaxLayer.tsx
│       ├── SceneFrame.tsx
│       ├── visual/
│       │   ├── AnniversaryToken.tsx
│       │   ├── MemoryFragment.tsx
│       │   ├── FlashShape.tsx
│       │   └── CatToken.tsx
│       └── scenes/
│           ├── HeroScene.tsx
│           ├── FlashbackScene.tsx
│           ├── ConnectionScene.tsx
│           ├── IdentityScene.tsx
│           ├── MemoryCatScene.tsx
│           └── FinalCtaScene.tsx
│
├── animations/
│   └── landing/
│       ├── motionPresets.ts
│       ├── heroTimeline.ts
│       ├── flashbackTimeline.ts
│       ├── connectionTimeline.ts
│       ├── identityTimeline.ts
│       └── memoryCatTimeline.ts
│
├── hooks/
│   ├── useReducedMotion.ts
│   └── useLandingSmoothScroll.ts
│
└── styles/
    └── landing.css
```

Small changes are allowed to match repository conventions.

Rules:

- one scene component should be understandable in isolation
- one primary ScrollTrigger timeline per scene
- keep temporary hover/entrance tweens local to their component
- use refs and `gsap.context()`
- reliably clean everything on unmount
- do not create one giant global timeline for the whole site
- do not create dozens of unrelated ScrollTriggers for every small object

---

# 9. Styling architecture

Move landing-specific styles out of the global product styling where practical.

Target:

```text
client/src/styles.css
  -> shared/create/wall styles

client/src/styles/landing.css
  -> landing-only styles
```

Import `landing.css` only from the landing module or main stylesheet according to the existing convention.

Landing style rules:

- full-bleed compositions
- allow intentional clipping
- use responsive `clamp()` for giant type
- keep CTA hit areas touch-friendly
- use CSS variables for palette
- prefer transform animation
- avoid heavy box-shadow/filter animation

Do not reproduce a normal card-grid marketing layout.

---

# 10. Remove from the current landing

Remove or demote these patterns:

## Remove as primary architecture

```text
const routePath = "...huge global SVG path..."
[data-landing-reveal] on most content
generic repeated fade + y reveals
repeated editorial two-column sections
CSS-built human characters as main visual language
page-wide SVG scroll layer
```

## Keep only if useful

```text
React Router links
GSAP setup
ScrollTrigger lifecycle patterns
reduced-motion handling
SVG stroke-draw technique for Connection scene
Memory Cat links
```

Do not keep old elements simply because they already exist.

---

# 11. GSAP / ScrollTrigger implementation rules

GSAP ScrollTrigger supports `pin` and `scrub`; use them intentionally.

Conceptual scene pattern:

```ts
useLayoutEffect(() => {
  const root = rootRef.current;
  if (!root) return;

  const ctx = gsap.context(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: root,
        start: "top top",
        end: "+=2200",
        pin: true,
        scrub: 0.8,
        invalidateOnRefresh: true,
      },
    });

    // scene choreography here
  }, root);

  return () => ctx.revert();
}, []);
```

Important:

- tune `end` per scene
- do not blindly use `+=2200` everywhere
- animate children inside a pinned scene rather than moving the pinned wrapper itself
- avoid nested pinned sections
- use labels for complex choreography
- use `ScrollTrigger.refresh()` after critical assets/fonts load
- use `will-change` only on elements actively benefiting from it
- do not use React state for per-frame animation values

---

# 12. Smooth scroll / Lenis

The current client does not include Lenis.

Do **not** install Lenis as the first step.

Implementation order:

```text
native scroll + ScrollTrigger works correctly
-> pin/scrub choreography is approved
-> then evaluate Lenis
```

If smooth scrolling improves the page, add:

```text
lenis
```

Official integration pattern:

```ts
const lenis = new Lenis();

lenis.on("scroll", ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);
```

Use lifecycle-safe React integration.

Cleanup must:

- destroy Lenis
- remove the GSAP ticker callback
- revert relevant GSAP contexts

Do not create multiple Lenis instances in React Strict Mode.

If touch/mobile feels worse with Lenis, use native scroll there.

Lenis is polish, not a dependency for correctness.

---

# 13. Motion presets

Centralize shared motion intent.

Example:

```ts
export const LANDING_MOTION = {
  scrub: {
    soft: 0.55,
    cinematic: 0.85,
  },
  impact: {
    enterScale: 0.62,
    overshootScale: 1.09,
    recoilScale: 0.975,
  },
  parallax: {
    back: 0.14,
    mid: 0.28,
    front: 0.56,
  },
  pointerTilt: {
    maxRotation: 5,
  },
};
```

These are starting values, not immutable design constants.

Tune against the visual target.

Avoid unexplained magic numbers spread through every scene.

---

# 14. Hover and pointer interaction

Desktop may include small pointer responses.

Examples:

- CTA compress/overshoot
- one or two nearby tokens tilt toward pointer
- image fragment shifts a few pixels in depth
- nav item gets playful translate/rotate response

Use efficient transform updates such as `gsap.quickTo()`.

Do not make the entire page chase the cursor.

Pointer interaction is secondary to scroll choreography.

---

# 15. Asset strategy

For V1 prefer:

```text
DOM
CSS
SVG
WebP/AVIF/PNG assets
small GIF/video only when justified
```

Do not add Three.js / React Three Fiber in V1.

The reference's energy can be reproduced without WebGL.

Use WebGL only later if a specific approved visual cannot be achieved credibly with the existing stack.

Original placeholder assets should be easy to replace.

Recommended folders:

```text
client/src/assets/landing/photos/
client/src/assets/landing/stickers/
client/src/assets/landing/shapes/
```

Do not hotlink SuperPlay assets.

---

# 16. Responsive strategy

Desktop is the primary motion-fidelity target.

Test at minimum:

```text
1440 x 900
1366 x 768
1024 x 768
768 x 1024
390 x 844
```

## Desktop

Allow:

- giant clipped typography
- pinned sequences
- deeper travel distances
- foreground crossings
- optional pointer parallax

## Tablet

Reduce:

- object count
- travel distances
- pin duration where necessary

Preserve:

- narrative order
- primary kinetic text
- strong transitions

## Mobile

Prioritize usability over desktop choreography fidelity.

May simplify:

- pointer effects
- long horizontal movement
- expensive parallax
- number of floating assets
- pin duration

Do not create horizontal page overflow.

CTA must remain easily tappable.

---

# 17. Reduced motion

Respect:

```text
prefers-reduced-motion: reduce
```

Reduced-motion mode must:

- preserve all text and CTAs
- avoid long pin/scrub experiences
- remove large zipping/crossing movements
- keep decorative objects mostly static
- use simple short opacity/scale transitions if needed

Motion must never gate navigation or information.

---

# 18. Performance constraints

Target a smooth event-laptop experience.

Prefer:

```text
transform
opacity
optimized image assets
scene-local animation
limited active visual layers
```

Avoid:

```text
layout properties animated every frame
large blur/filter animations
continuous React setState during scroll
hundreds of particles
multiple videos autoplaying together
unbounded requestAnimationFrame loops
```

Only active scenes should do meaningful motion work.

For image-heavy scenes:

- size source images close to display needs
- use WebP/AVIF where possible
- preload only genuinely critical hero assets
- lazy-load later imagery when practical

---

# 19. Fidelity gates

Do not judge completion only by whether the code runs.

## Gate A — Hero

At 1440×900, the first viewport must immediately read as an interactive campaign experience.

Pass only if:

- giant typography dominates composition
- at least 3 depth layers are visually apparent
- several original visual tokens are choreographed around the type
- entrance has physical overshoot/squash character
- first scroll transforms the composition rather than merely scrolling it away

If Hero still resembles the current editorial landing, stop and improve it before proceeding.

## Gate B — Continuous world

After implementing the first 3 scenes:

- boundaries should not feel like normal stacked website sections
- at least one object handoff should connect scenes
- at least two transition patterns should already be visible

## Gate C — Motion variety

Whole landing must include at least 3 clearly different transition patterns from:

```text
scale takeover
directional sweep
typography replacement
color takeover
object handoff
```

## Gate D — SuperPlay motion principles

Without copying brand art, a reviewer should recognize these characteristics:

```text
bouncy titles
fast traveling visual elements
bold cropped typography
playful composition
controlled visual chaos
scroll-led exploration
```

If the primary visible motion is still fade-up, fail the gate.

---

# 20. Implementation order for Codex

Follow this order strictly.

## Phase 0 — Audit

Before editing:

1. read `INSTRUCTIONS.md`
2. read this file
3. inspect `LandingPage.tsx`
4. inspect landing CSS in `styles.css`
5. inspect `App.tsx`
6. inspect `/create` and `/wall` imports/styles enough to avoid regressions
7. inspect available local assets

Do not rewrite backend code for this task.

## Phase 1 — Refactor skeleton

- extract landing-specific CSS
- create scene/components structure
- remove dependence on the page-wide SVG route
- keep routes unchanged

Exit condition:

- static page renders
- `/create` and `/wall` still work
- no animation complexity yet

## Phase 2 — Build Hero only

Implement full Hero composition and entrance.

Then implement first scroll-controlled Hero transformation.

Exit condition:

- Hero passes Fidelity Gate A
- no console errors
- scrolling upward reverses cleanly

**Do not build every scene before the Hero is convincing.**

## Phase 3 — Flashback

- giant `10`
- memory fragments
- pin/scrub timeline
- object handoff to Connection

Exit condition:

- first two scenes feel like one continuous sequence

## Phase 4 — Connection

- dispersed objects
- gathering cluster
- optional local SVG connection path
- transition into Identity

Exit condition:

- Gate B passes

## Phase 5 — Identity

- kinetic `BẢN SẮC`
- graphic tokens
- strong composition change
- handoff into Memory Cat

## Phase 6 — Memory Cat + CTA

- reveal cat
- connect visual vocabulary to `/wall`
- primary CTA to `/create`
- secondary `/wall`

## Phase 7 — Smooth-scroll polish

Only now evaluate/install Lenis.

Keep it only if it measurably improves the experience.

## Phase 8 — Responsive + reduced motion

Tune desktop, tablet, mobile, and reduced-motion behavior.

## Phase 9 — Validation

Run from repository root:

```text
npm run check
npm run build
```

Fix all new errors before handoff.

---

# 21. Definition of Done

Landing redesign is done only when all apply:

- [ ] `/` no longer resembles the old editorial/SVG-path prototype
- [ ] page feels like one animated playground rather than isolated marketing cards
- [ ] Hero passes Fidelity Gate A
- [ ] scroll controls meaningful scene transformations
- [ ] important scenes use pin/scrub where appropriate
- [ ] giant typography acts as a moving visual object
- [ ] bouncy/overshoot motion is clearly present but controlled
- [ ] multiple original object families move around the typography
- [ ] at least two object handoffs connect scene boundaries
- [ ] at least three distinct scene transition patterns are present
- [ ] generic fade-up is not the dominant animation
- [ ] old global `routePath` is removed from the production landing
- [ ] any SVG path drawing is local and purposeful
- [ ] no SuperPlay proprietary artwork/copy is copied
- [ ] no hotlinked SuperPlay assets are used
- [ ] `/create` behavior remains intact
- [ ] `/wall` behavior remains intact
- [ ] Socket.IO/backend behavior remains intact
- [ ] desktop layout is visually strong at 1440×900 and 1366×768
- [ ] tablet/mobile remain usable
- [ ] reduced-motion mode works
- [ ] no obvious horizontal overflow
- [ ] no console errors caused by the landing
- [ ] `npm run check` passes
- [ ] `npm run build` passes

---

# 22. Codex handoff report

When implementation is complete, Codex must report:

```text
1. Files created
2. Files modified
3. Old landing patterns removed
4. Scene architecture implemented
5. Motion system implemented
6. Where object handoffs occur
7. Where pin/scrub is used
8. Whether Lenis was added and why
9. Mobile/reduced-motion changes
10. npm run check result
11. npm run build result
12. Known visual limitations / assets still needing replacement
```

Do not report "SuperPlay cloned" merely because GSAP animations exist.

The target is achieved only when the **motion language and continuous animated-playground feeling** are visibly present while the page remains clearly FLASH 10.