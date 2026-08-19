# FLASH 10 — SuperPlay-Inspired Animated Landing Page

## 0. Status and precedence

This file is the **authoritative implementation instruction for the public landing page `/`** of the `flash-ten-years` project.

It supplements, but does not replace, the root `INSTRUCTIONS.md`.

Precedence rules:

1. `INSTRUCTIONS.md` remains the source of truth for the Memory Cat product flow, `/create`, `/wall`, API, persistence, Socket.IO, and event LAN behavior.
2. **This file is the source of truth for route `/`, landing-page layout, storytelling, visual motion, scroll behavior, and landing-page performance.**
3. `INSTRUCTIONS_GSAP_SCROLL_REFERENCE.md` is only a technical reference experiment. Do not treat its Codegrid layout as the final landing design.
4. If there is a conflict about `/`, follow this file.
5. Do not break `/create` or `/wall` while implementing the landing page.

Reference website:

- https://www.superplay.co/

The target is to recreate the **interaction language and motion quality**, not to copy SuperPlay brand assets, proprietary source code, text, illustrations, logos, or game IP.

---

# 1. Product goal

Turn `/` into an immersive anniversary landing page for FLASH 10.

The page should feel like an animated interactive experience rather than a conventional marketing page.

The primary emotional flow is:

```text
ENTER
  ↓
FLASH 10 identity appears with impact
  ↓
scroll becomes a controlled journey
  ↓
large typography + objects react to scroll
  ↓
10-year story / connection / identity / flashback themes emerge
  ↓
Memory Cat experience is introduced
  ↓
strong CTA
  ↓
/create
```

The landing page must make the existing Memory Cat interaction feel like the destination of the story, not a disconnected tool.

Primary CTA:

```text
CREATE YOUR MEMORY
```

Route target:

```text
/create
```

Secondary optional CTA:

```text
VIEW LIVE WALL
```

Route target:

```text
/wall
```

Do not make `/wall` visually dominant on the public landing page.

---

# 2. What to clone from SuperPlay

Clone the **motion grammar**, not the literal design.

Required characteristics:

1. **Scrollytelling**
   - scrolling controls scene progress
   - sections feel staged, not merely stacked
   - important scenes can pin while animation continues

2. **Oversized expressive typography**
   - large words become visual objects
   - text may scale, rotate, stretch, compress, enter from outside the viewport, or overlap intentionally

3. **Cartoon/game-like easing**
   - overshoot
   - elastic recovery
   - squash and stretch
   - fast directional movement followed by soft settling

4. **Layered parallax**
   - foreground moves more strongly
   - midground moves moderately
   - background moves subtly
   - pointer motion may add a small additional depth response on desktop

5. **Floating/flying visual objects**
   - decorative FLASH objects, photos, sticker shapes, memory fragments, stars, arrows, anniversary elements, or cat-related assets may travel through the scene
   - objects should feel choreographed, not randomly animated noise

6. **Pinned cinematic scenes**
   - some sections stay in place while text and objects transform through multiple states

7. **Strong transitions between scenes**
   - scale takeover
   - object wipe
   - color-panel takeover
   - typography moves out while the next scene arrives

8. **High-energy but controlled composition**
   - intentional overlap is allowed
   - large-scale motion is encouraged
   - content must remain readable

Do not reduce the reference to a generic fade-up landing page.

---

# 3. What NOT to clone

Do not copy:

- SuperPlay logo
- SuperPlay wording
- game screenshots
- proprietary illustrations
- characters
- exact color palette unless FLASH branding independently uses it
- exact section copy
- exact art assets
- source code from the website

Do not attempt pixel-identical brand replication.

Use the reference to reproduce:

```text
energy
scroll rhythm
motion density
staging
parallax depth
kinetic typography
scene transitions
```

---

# 4. Required app routes after landing work

The React app must support:

```text
/         → LandingPage
/create   → existing Memory Cat creator
/wall     → existing Live Wall
```

The landing route must never replace the create/wall product logic.

If the project has not yet been bootstrapped, include all three routes from the beginning.

---

# 5. Frontend stack for the landing page

Use the existing primary stack:

```text
React
Vite
TypeScript
React Router
GSAP
ScrollTrigger
```

Add:

```text
lenis
```

for smooth scrolling if the project does not already have a smooth-scroll solution.

Do not add another animation framework such as Framer Motion just for the landing page.

Do not use React state for per-frame animation values.

Three.js / React Three Fiber is **not required for landing V1**.

Use DOM + CSS + SVG + optimized image assets first. Add WebGL only if a specific visual cannot be reproduced credibly with DOM/SVG and the base landing already passes performance targets.

---

# 6. Recommended landing architecture

Recommended structure:

```text
client/src/
├── pages/
│   ├── LandingPage.tsx
│   ├── CreatePage.tsx
│   └── WallPage.tsx
│
├── components/
│   └── landing/
│       ├── LandingHeader.tsx
│       ├── SceneShell.tsx
│       ├── FloatingAsset.tsx
│       ├── KineticText.tsx
│       ├── scenes/
│       │   ├── HeroScene.tsx
│       │   ├── TenYearsScene.tsx
│       │   ├── ConnectionScene.tsx
│       │   ├── IdentityScene.tsx
│       │   ├── FlashbackScene.tsx
│       │   ├── MemoryCatScene.tsx
│       │   └── FinalCtaScene.tsx
│       └── assets/
│           └── ...
│
├── animations/
│   └── landing/
│       ├── heroTimeline.ts
│       ├── tenYearsTimeline.ts
│       ├── connectionTimeline.ts
│       ├── identityTimeline.ts
│       ├── flashbackTimeline.ts
│       ├── memoryCatTimeline.ts
│       └── motionPresets.ts
│
├── hooks/
│   ├── useLenis.ts
│   └── useReducedMotion.ts
│
└── styles/
    └── landing.css
```

Small structural adjustments are allowed if the repository already has a different convention.

Keep each major scene independently understandable and independently cleanable.

Avoid one giant `LandingPage.tsx` containing every timeline and every asset.

---

# 7. Landing page scene plan

The following is the baseline storytelling structure.

Codex may tune copy and layout, but do not collapse the page into fewer than 5 meaningful visual beats.

## Scene 0 — Entry / preload state

Goal:

- prevent assets popping in during the first hero animation
- establish premium presentation

Behavior:

- lightweight loading treatment only if real asset preload is needed
- fade/scale into hero when critical assets are ready
- do not add a fake long loader

Reduced-motion mode may skip this animation.

---

## Scene 1 — Hero: FLASH 10

Primary message:

```text
FLASH
10 YEARS
```

Optional supporting line:

```text
10 YEARS OF CONNECTIONS, IDENTITIES & FLASHBACKS
```

Visual behavior:

- hero fills the viewport
- typography is oversized and can extend outside screen bounds
- title enters with strong squash/stretch + overshoot
- several decorative objects enter from different directions
- scroll indicator should be subtle
- first scroll movement should immediately transform the hero instead of simply moving the page down

Suggested entrance sequence:

```text
background arrives
→ FLASH word slams in
→ 10 YEARS stretches upward
→ small objects overshoot into place
→ page settles
```

Do not use a simple opacity fade as the primary hero entrance.

---

## Scene 2 — Ten Years

Theme:

```text
10 YEARS
ONE CONTINUOUS STORY
```

Behavior:

- pin section for a controlled scroll distance
- large `10` or `10 YEARS` becomes the central visual anchor
- text and visual fragments orbit/pass around it
- number can scale beyond viewport boundaries during transition
- nearby objects use different parallax depths

Possible content fragments:

```text
2016
...
2026
```

or anniversary milestones if real content/assets exist.

Do not invent company history as factual copy. Use placeholders or generic anniversary language until real milestones are provided.

---

## Scene 3 — Connection

Theme:

```text
KẾT NỐI / CONNECTION
```

Goal:

Show many individual pieces becoming one experience.

Behavior options:

- multiple floating photo/sticker/card objects enter separately
- scroll gradually pulls them toward a shared center/path
- lines or SVG paths may visually connect objects
- depth/parallax creates the sense of many layers

The old GSAP SVG reference technique may be reused here if useful, but the SVG path is a supporting device, not the whole landing page.

---

## Scene 4 — Identity

Theme:

```text
BẢN SẮC / IDENTITY
```

Behavior:

- bold typography changes scale and orientation
- individual visual blocks can use different shapes/patterns
- objects may snap into a temporary composition, then break apart
- use high contrast and playful motion

If real FLASH brand colors/assets exist in the repository, use them.

If they do not exist, define centralized CSS variables and keep the palette easy to replace. Do not hardcode dozens of unrelated colors across components.

---

## Scene 5 — Flashback

Theme:

```text
FLASHBACK
```

Behavior:

- memories/photos move like physical fragments, film frames, stickers, or snapshots
- the scene may move horizontally while vertical scroll drives progress
- use overlap and cropping intentionally
- one or more frames can come toward the viewer with scale/parallax

If no real photos are available yet, use clearly labeled development placeholders and keep replacement trivial.

Do not use copyrighted/random web images as permanent assets.

---

## Scene 6 — Memory Cat reveal

Goal:

Connect the animated anniversary story to the core product.

Primary message concept:

```text
LEAVE YOUR MARK
BRING YOUR MEMORY TO LIFE
```

Behavior:

- cat silhouette or representative placeholder enters as a large central object
- simple demo stickers/cats can float around it
- use the same motion language as `/wall`: pop, float, hop, squash/stretch
- scene should visually explain that attendee-created artwork becomes animated

CTA:

```text
CREATE YOUR MEMORY
```

Navigate to:

```text
/create
```

This CTA must be easy to tap on mobile and must not require animation completion before becoming usable.

---

## Scene 7 — Final CTA / outro

Goal:

Provide a clean end-state after the high-energy scenes.

Suggested copy:

```text
MAKE A MEMORY.
WATCH IT COME ALIVE.
```

Actions:

```text
CREATE YOUR MEMORY → /create
VIEW LIVE WALL → /wall
```

Keep this scene readable and stable.

Do not end on a visually chaotic state where the CTA is hard to use.

---

# 8. Smooth-scroll engine

Preferred implementation:

```ts
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
```

Conceptual integration:

```ts
const lenis = new Lenis({
  smoothWheel: true,
  lerp: 0.08,
});

lenis.on("scroll", ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);
```

Use a lifecycle-safe React implementation.

On unmount:

- destroy Lenis instance
- remove ticker callback
- revert scene GSAP contexts
- kill any page-scoped ScrollTriggers that remain

Do not initialize multiple Lenis instances during React Strict Mode development.

If Lenis introduces instability on touch/mobile, use native scroll at the affected breakpoint rather than forcing it.

---

# 9. ScrollTrigger architecture

Use **one controlled timeline per major scene**, not one uncontrolled timeline for the entire site.

Conceptual pattern:

```ts
useLayoutEffect(() => {
  const ctx = gsap.context(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: rootRef.current,
        start: "top top",
        end: "+=2200",
        pin: true,
        scrub: 0.8,
        invalidateOnRefresh: true,
      },
    });

    // scene states
  }, rootRef);

  return () => ctx.revert();
}, []);
```

The exact `end` distance must be tuned visually.

Do not blindly use the same scroll distance for every scene.

Avoid nested pinned sections unless there is a clear reason.

---

# 10. Kinetic typography rules

Typography is a major animated element.

Do not animate only whole text blocks.

Split important headings into words or lines in the DOM when useful:

```tsx
<h2 aria-label="TEN YEARS OF FLASH">
  <span aria-hidden="true">TEN</span>
  <span aria-hidden="true">YEARS</span>
  <span aria-hidden="true">OF</span>
  <span aria-hidden="true">FLASH</span>
</h2>
```

Use transforms such as:

```text
translate
rotate
scaleX
scaleY
skew
```

Recommended easing families:

```text
back.out(...)
elastic.out(...)
power3.out
power4.out
```

For scrubbed transformations, often use `ease: "none"` or restrained easing so scroll progress remains predictable.

Use squash/stretch for short transitions, not continuously on every word.

---

# 11. Motion presets

Centralize reusable motion values.

Example intent:

```ts
export const MOTION = {
  pop: {
    fromScale: 0.55,
    overshootScale: 1.08,
  },
  parallax: {
    back: 0.12,
    mid: 0.28,
    front: 0.5,
  },
  tilt: {
    maxRotation: 6,
  },
};
```

Do not duplicate arbitrary values across every component.

The visual target is a coherent motion system.

---

# 12. Floating objects and parallax

Every decorative object must have a role in composition.

Recommended categories:

```text
background objects
midground objects
foreground objects
hero/primary objects
```

Suggested scroll response:

```text
background → small translation / scale change
midground  → moderate translation
foreground → larger translation + occasional rotation
```

Pointer parallax is desktop-only enhancement.

Use `gsap.quickTo()` or a similarly efficient approach rather than frequent React setState calls.

Do not move every object on pointer input.

A few well-selected objects produce more convincing depth than dozens of noisy ones.

---

# 13. Scene transitions

Use at least 3 different transition patterns across the landing page.

Examples:

### Pattern A — Scale takeover

A word/object scales until it covers most of the viewport and becomes the bridge into the next section.

### Pattern B — Directional sweep

Foreground objects move rapidly in one direction while the next scene enters from the opposite side.

### Pattern C — Typography replacement

One oversized word leaves while the next occupies the same visual position.

### Pattern D — Color takeover

A large panel or shape expands to become the next scene background.

Do not transition every section with identical fade + translateY.

---

# 14. Mobile behavior

Desktop is the primary fidelity target for SuperPlay-like choreography, but the page must remain usable on phones.

Test at minimum:

```text
1440 × 900
1366 × 768
1024 × 768
768 × 1024
390 × 844
```

On smaller screens:

- reduce decorative object count
- reduce travel distance
- reduce oversized text clipping when readability suffers
- simplify pointer interactions
- shorten pinned scroll distances
- disable particularly expensive parallax layers
- allow some scenes to use normal flow instead of pinning

Do not simply scale the desktop page down with `transform: scale()`.

The CTA to `/create` must be easy to tap at 390px width.

---

# 15. Reduced motion and accessibility

Respect:

```css
@media (prefers-reduced-motion: reduce)
```

Reduced-motion behavior:

- disable Lenis smooth scrolling if it causes motion
- avoid long pinned sequences
- render scene content in normal document flow
- show important visual elements in stable final states
- keep CTA and navigation fully available

Do not gate content behind animation.

Important text must remain actual HTML text, not only text inside images/canvas.

Decorative objects should be `aria-hidden` where appropriate.

---

# 16. Performance requirements

Target:

```text
smooth perceived 60fps on a normal modern laptop
usable mobile performance
```

Prefer:

- `transform`
- `opacity`
- optimized SVG
- WebP/AVIF for raster images
- `will-change: transform` only on actively animated elements
- preloading only critical hero assets
- GSAP refs rather than per-frame React state

Avoid:

- huge PNG assets
- dozens of simultaneous blur filters
- CSS filters on large full-screen layers during scroll
- layout reads and writes inside raw scroll listeners
- React rerender loops driven by scroll progress
- WebGL before DOM/SVG version is stable

Use Chrome Performance tools if animation stutters.

---

# 17. Asset strategy

Before final visual polish, inspect repository assets.

Prefer this order:

1. real FLASH 10 brand assets
2. event photos supplied to the repository
3. project-owned stickers/illustrations
4. simple temporary placeholders created for development

Do not scrape SuperPlay assets.

Do not ship arbitrary web images as placeholders.

Create an asset manifest or keep assets organized by scene if the quantity becomes large.

---

# 18. Visual comparison workflow

Do not judge similarity only from memory.

Use the SuperPlay reference to evaluate these dimensions:

```text
motion density
scale of typography
parallax depth
speed contrast
scene pinning
overshoot quality
transition impact
scroll responsiveness
```

Create local screenshots/video captures at approximate scroll checkpoints:

```text
0%
15%
30%
50%
70%
85%
100%
```

Compare the **interaction qualities**, not copyrighted art details.

If the page feels like a normal landing page with some GSAP fades, it is not close enough.

---

# 19. Implementation phases

## Phase A — Audit and bootstrap

- inspect repository
- preserve existing product instructions
- ensure `/`, `/create`, `/wall` routing plan
- add landing dependencies only when needed

Exit condition:

- landing route exists
- create/wall routes remain intact

## Phase B — Static landing composition

- build all scenes
- establish typography hierarchy
- establish asset positions
- no complex scroll animation yet

Exit condition:

- page tells a coherent FLASH 10 story without animation

## Phase C — Smooth scroll + hero

- integrate Lenis safely
- build hero entrance
- build first hero scroll transformation

Exit condition:

- hero already feels playful and high-energy

## Phase D — Pinned scene timelines

- implement scene-specific ScrollTriggers
- tune pin duration and scrub behavior

Exit condition:

- major scenes have intentional scroll-controlled staging

## Phase E — Parallax + floating assets

- add layered depth
- add choreographed object travel
- add subtle desktop pointer response

Exit condition:

- page has clear foreground/midground/background depth

## Phase F — Kinetic typography + squash/stretch

- refine word/line animation
- add overshoot and elastic recovery where appropriate

Exit condition:

- typography behaves as an animated visual object, not static copy

## Phase G — Transitions

- implement at least 3 transition patterns
- make section boundaries feel continuous

Exit condition:

- scroll journey does not feel like separate stacked slides

## Phase H — Memory Cat integration

- connect story to `/create`
- visually preview the living-memory concept
- preserve existing Memory Cat app contract

Exit condition:

- user understands why they should click `CREATE YOUR MEMORY`

## Phase I — Responsive + reduced motion

- tune desktop/tablet/mobile
- implement reduced-motion fallbacks

## Phase J — Performance + polish

- profile animation
- optimize assets
- remove debug markers/logging
- fix layout jumps

---

# 20. Acceptance criteria

The landing page is complete only when all of the following are true:

- [ ] `/` is a dedicated animated FLASH 10 landing page
- [ ] `/create` still works
- [ ] `/wall` still works
- [ ] hero has a strong non-generic entrance
- [ ] scrolling controls meaningful scene animation
- [ ] at least 2 scenes use tuned pin/scrub behavior on desktop
- [ ] typography uses expressive transform animation
- [ ] visual objects use layered parallax
- [ ] at least 3 distinct transition patterns are present
- [ ] main CTA leads to `/create`
- [ ] landing does not require Three.js to function
- [ ] no copied SuperPlay brand/IP assets are included
- [ ] no obvious console errors
- [ ] no ScrollTrigger debug markers remain
- [ ] GSAP/Lenis instances are cleaned up correctly
- [ ] mobile layout is usable
- [ ] reduced-motion mode preserves all content
- [ ] animation remains smooth on a normal laptop

---

# 21. Failure modes Codex must avoid

## Failure: generic SaaS landing page

Symptoms:

- centered hero
- cards below
- fade-up sections
- small conservative typography

Fix:

- increase scale contrast
- create pinned scenes
- use kinetic text
- stage objects through scroll

## Failure: animation overload

Symptoms:

- everything moves independently
- no visual hierarchy
- CTA becomes hard to find

Fix:

- reduce object count
- prioritize one dominant motion per scene
- keep transition choreography intentional

## Failure: pinning bugs

Symptoms:

- blank gaps
- jumps on refresh
- sections overlap incorrectly

Fix:

- check layout before animation
- use `invalidateOnRefresh: true`
- call `ScrollTrigger.refresh()` after critical assets/fonts load
- avoid unnecessary nested pins

## Failure: React animation leaks

Symptoms:

- duplicated animations in dev
- animation speed changes after route navigation
- ScrollTrigger instances remain after unmount

Fix:

- use refs
- use `gsap.context()`
- revert context on unmount
- destroy Lenis
- remove GSAP ticker callback

---

# 22. Codex execution instruction

When Codex receives the task to redesign the landing page:

1. Read root `INSTRUCTIONS.md` completely.
2. Read this file completely.
3. Read `INSTRUCTIONS_GSAP_SCROLL_REFERENCE.md` only as a technique reference.
4. Inspect the repository before installing or creating anything.
5. Confirm whether actual application code already exists.
6. Preserve `/create`, `/wall`, backend contracts, and Socket.IO behavior.
7. Implement `/` as `LandingPage`.
8. Build a static scene composition first.
9. Add Lenis + GSAP ScrollTrigger lifecycle safely.
10. Implement the hero before other animation.
11. Implement each major scene as an independent scroll timeline.
12. Add parallax and flying objects only after scene timing works.
13. Add kinetic typography and squash/stretch polish.
14. Add scene transitions.
15. Integrate the CTA to `/create`.
16. Test desktop and mobile.
17. Test reduced motion.
18. Profile performance.
19. Remove debug code.
20. Report what is visually still different from the SuperPlay interaction language.

Do not stop after boilerplate.

Do not claim the redesign is complete if the result is only a conventional page with fade-in animations.

The target is:

> **FLASH 10 content and identity presented through a SuperPlay-like high-energy scroll choreography, while preserving the existing Memory Cat product flow.**
