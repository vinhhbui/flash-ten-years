# FLASH 10 — SuperPlay-Inspired Animated Landing Page

## 0. Authority and scope

This file is the **authoritative implementation instruction for the public landing route `/`** in `flash-ten-years`.

It is intentionally scoped to the landing experience only.

Precedence:

1. `INSTRUCTIONS.md` remains authoritative for the Memory Cat product flow, `/create`, `/wall`, API, Socket.IO, persistence, and LAN behavior.
2. **This file is authoritative for `/`, landing architecture, motion design, visual storytelling, scroll behavior, responsive behavior, and landing performance.**
3. `INSTRUCTIONS_GSAP_SCROLL_REFERENCE.md` is a technical reference only. Its long SVG route is **not** the production landing architecture.
4. Do not break `/create`, `/wall`, the server, uploads, persistence, or Socket.IO while redesigning `/`.

Reference experience:

- https://www.superplay.co/

Goal: reproduce the **motion grammar, pacing, scene staging, kinetic typography, depth, and playful interaction language** of the reference while using original FLASH 10 content and assets.

Do **not** copy SuperPlay logos, text, illustrations, proprietary assets, or source code.

---

# 1. Current repository baseline — read before editing

The project is already implemented. Do not treat this as a greenfield build.

Current stack:

```text
React 18
Vite
TypeScript
React Router
GSAP + ScrollTrigger
react-konva
Socket.IO client
Express + Socket.IO server
```

Current app routes:

```text
/         -> LandingPage
/create   -> CreatePage
/wall     -> WallPage
```

Current landing implementation:

```text
client/src/pages/LandingPage.tsx
client/src/styles.css
```

The current `/` page already contains:

- several vertically stacked full-height sections
- large editorial text
- CSS-built decorative characters/shapes
- one long SVG route through the page
- `strokeDashoffset` drawing tied to scroll
- generic `fade + translateY` reveal animation

This is a valid prototype, but it is **not the final target**.

The production redesign must move from:

```text
long editorial page
+ one global SVG line
+ reveal-on-scroll sections
```

to:

```text
scene-based scrollytelling
+ pinned cinematic beats
+ kinetic typography
+ choreographed objects
+ layered depth
+ strong transitions
```

The SVG route may be reused as a supporting effect in one scene, but it must no longer define the entire landing experience.

---

# 2. Product goal

Turn `/` into an immersive FLASH 10 anniversary experience that feels closer to an animated game intro / interactive campaign page than a conventional marketing site.

The landing should communicate:

```text
FLASH 10
#ketnoi
#bansac
#flashback
```

and then naturally lead into the Memory Cat experience.

Primary CTA:

```text
CREATE YOUR MEMORY
```

Destination:

```text
/create
```

Secondary CTA:

```text
VIEW LIVE WALL
```

Destination:

```text
/wall
```

The Memory Cat experience should feel like the **payoff of the landing story**, not a separate tool linked from a generic homepage.

---

# 3. Core design principle

Do not clone the visual identity of SuperPlay.

Clone the **interaction system**:

- scroll-driven scene progress
- oversized typography used as moving objects
- pinning
- parallax depth
- exaggerated overshoot
- squash/stretch
- directional motion
- foreground objects crossing the viewport
- section takeovers
- playful visual interruptions
- transitions where one scene physically becomes the next

The final page must not feel like:

```text
section
fade-up
section
fade-up
section
fade-up
```

If most content still enters using identical `opacity + y`, the redesign is not complete.

---

# 4. Motion grammar to reproduce

## 4.1 Scrollytelling

Scroll is a timeline controller, not just navigation.

Important scenes should use:

```text
ScrollTrigger
pin
scrub
scene-local timelines
```

A scene can remain visually fixed while its internal state changes over 150–300vh of scroll.

Scrolling upward must naturally rewind the scene.

Do not build custom wheel-direction logic unless truly necessary.

---

## 4.2 Kinetic typography

Large words are visual objects.

Allow:

- `translateX/Y`
- rotation
- `scaleX`
- `scaleY`
- skew
- clipping
- viewport overflow
- replacement of one word by another

Important headings should be split into lines or words when needed.

Use accessible labels when visual splitting would otherwise produce poor screen-reader output.

Primary heading motion should use strong physical character:

```text
back.out
elastic.out
power3.out
power4.out
```

For pure scroll-scrub transformations, prefer restrained or `none` easing so progress remains predictable.

---

## 4.3 Squash, stretch, overshoot

Short entrance and impact moments should behave like game/cartoon motion.

Examples:

```text
compressed -> overshoot -> settle
wide -> narrow -> settle
scale 0 -> 1.10 -> 0.97 -> 1
```

Do not animate every element elastically.

Reserve exaggerated motion for focal objects, section titles, and transitions.

---

## 4.4 Layered parallax

Use a small number of intentional depth layers:

```text
background
midground
foreground
hero/focal object
```

Typical relative movement:

```text
background  -> subtle
midground   -> medium
foreground  -> large
```

Desktop pointer parallax is optional and should affect only selected elements.

Use GSAP `quickTo()` or transform-based motion rather than React state updates per frame.

---

## 4.5 Flying / crossing objects

Decorative elements may:

- enter from outside viewport
- cross behind text
- cross in front of text
- rotate while traveling
- act as a wipe into the next scene
- briefly overshoot before settling

Objects must be choreographed to the scene.

Do not add random perpetual motion to everything.

---

## 4.6 Scene transitions

Use at least three distinct transition types across the page.

Required pool:

### Scale takeover

A word, number, cat, photo, or colored shape grows until it fills the viewport and becomes the next background.

### Directional sweep

Foreground elements exit rapidly in one direction while the next scene enters from the opposite direction.

### Typography replacement

One giant word exits and another takes its exact visual position.

### Color takeover

A panel/blob expands until it becomes the next scene background.

### Object handoff

One visual object survives the section boundary and changes role in the next scene.

Do not use the same transition repeatedly.

---

# 5. Final landing scene architecture

Use **6 major visual beats**.

Do not collapse the experience into fewer than 5 meaningful scenes.

Recommended production structure:

```text
Scene 1  Hero / FLASH 10
Scene 2  Ten Years / Flashback
Scene 3  Kết Nối / Connection
Scene 4  Bản Sắc / Identity
Scene 5  Memory Cat Reveal
Scene 6  Final CTA
```

Each scene must have its own visual purpose and motion system.

---

# 6. Scene 1 — Hero / FLASH 10

## Message

Primary:

```text
FLASH
10 YEARS
```

Supporting idea:

```text
10 YEARS OF CONNECTIONS, IDENTITIES & FLASHBACKS
```

## Behavior

Hero should occupy the full viewport.

Initial entrance sequence should feel physical:

```text
background arrives
-> FLASH slams in
-> 10 YEARS stretches / overshoots
-> small objects fly into composition
-> settle
```

The first wheel/trackpad movement should immediately transform the hero.

Do not let the first scroll simply move the hero upward like a normal page.

Suggested scrub sequence:

```text
0.00  hero fully composed
0.20  foreground objects begin separating
0.40  FLASH translates / rotates
0.60  10 grows beyond viewport
0.80  background/color begins takeover
1.00  transition into Scene 2
```

The giant `10` may become the bridge into the next scene.

---

# 7. Scene 2 — Ten Years / Flashback

## Theme

```text
10 YEARS
ONE CONTINUOUS STORY
```

## Behavior

Pin the section.

Use the number `10` or `10 YEARS` as the main visual anchor.

During scroll:

- visual fragments orbit or pass around the number
- dates such as `2016` and `2026` may appear
- photo/card placeholders can cross the viewport
- the large number may scale beyond screen bounds
- depth layers move at different speeds

Do not invent company-history facts.

If real anniversary photos/milestones are not available, use clearly replaceable placeholders.

A horizontal-memory-strip effect is allowed here if vertical scroll drives it.

---

# 8. Scene 3 — Kết Nối / Connection

## Theme

```text
KẾT NỐI
CONNECTION
```

## Visual concept

Separate pieces gradually become one shared composition.

Possible elements:

- photos
- sticker cards
- dots/nodes
- short lines
- arrows
- cat silhouettes
- FLASH shapes

## Motion

At scene start, items are spatially separated.

During scroll, they:

```text
enter independently
-> move toward shared center/path
-> overlap/connect
-> briefly lock into one composition
-> explode/release into next transition
```

This is the best place to reuse the old SVG path technique.

If reused:

- keep the path local to this scene
- use it as a connection device
- do not stretch one SVG path through the whole page

---

# 9. Scene 4 — Bản Sắc / Identity

## Theme

```text
BẢN SẮC
IDENTITY
```

## Behavior

This is the most graphic scene.

Use:

- oversized type
- strong crop
- rotated blocks
- sticker-like shapes
- palette cards / identity fragments
- temporary collisions/overlap

Suggested state progression:

```text
word enters oversized
-> shapes snap around it
-> composition compresses
-> word stretches / rotates
-> pieces burst outward
-> one central shape becomes the Memory Cat reveal
```

If real FLASH brand tokens exist, use them.

Otherwise define all landing colors as CSS variables in one place so brand replacement is easy.

Do not scatter arbitrary hard-coded colors across scene files.

---

# 10. Scene 5 — Memory Cat Reveal

## Goal

Explain the actual event interaction visually.

Primary copy concept:

```text
LEAVE YOUR MARK
BRING YOUR MEMORY TO LIFE
```

## Motion

A large cat silhouette becomes the central object.

Around it, show simplified examples of attendee-created cats or memory stickers.

Use the same motion vocabulary already present on `/wall`:

```text
pop
float
hop
squash/stretch
```

This visually connects the landing to the live product.

Primary CTA must become visible early enough that the user never has to finish every animation before using it.

CTA:

```text
CREATE YOUR MEMORY
```

Route:

```text
/create
```

---

# 11. Scene 6 — Final CTA

After several high-energy scenes, the outro should be cleaner and more stable.

Suggested message:

```text
MAKE A MEMORY.
WATCH IT COME ALIVE.
```

Actions:

```text
CREATE YOUR MEMORY -> /create
VIEW LIVE WALL     -> /wall
```

Do not end with a chaotic composition that makes buttons difficult to find or tap.

---

# 12. Required implementation architecture

The current `LandingPage.tsx` is too monolithic for the target motion system.

Refactor toward:

```text
client/src/
├── pages/
│   └── LandingPage.tsx
│
├── components/
│   └── landing/
│       ├── LandingHeader.tsx
│       ├── SceneShell.tsx
│       ├── KineticText.tsx
│       ├── FloatingAsset.tsx
│       ├── ParallaxLayer.tsx
│       └── scenes/
│           ├── HeroScene.tsx
│           ├── TenYearsScene.tsx
│           ├── ConnectionScene.tsx
│           ├── IdentityScene.tsx
│           ├── MemoryCatScene.tsx
│           └── FinalCtaScene.tsx
│
├── animations/
│   └── landing/
│       ├── motionPresets.ts
│       ├── heroTimeline.ts
│       ├── tenYearsTimeline.ts
│       ├── connectionTimeline.ts
│       ├── identityTimeline.ts
│       └── memoryCatTimeline.ts
│
├── hooks/
│   ├── useLenis.ts
│   └── useReducedMotion.ts
│
└── styles/
    └── landing.css
```

Small adjustments are allowed to match repository conventions.

Important requirements:

- one scene = one understandable component
- one major scene = one controlled GSAP timeline
- cleanup must be local and reliable
- avoid one global mega-timeline controlling the entire page
- avoid dozens of independent ScrollTriggers that are impossible to reason about

---

# 13. Remove / replace current landing patterns

The current implementation should be treated as a prototype to refactor, not something to preserve visually.

Specifically:

## Replace

- the giant hard-coded `routePath` as the page-wide animation spine
- generic `[data-landing-reveal]` fade-up as the primary animation system
- repeated static editorial section composition
- CSS-built placeholder characters as the main visual identity

## Keep only when useful

- React route structure
- GSAP + ScrollTrigger setup patterns
- reduced-motion handling
- SVG path-drawing technique as a local scene effect
- existing FLASH/Memory Cat product links

Do not preserve old DOM merely to minimize diff size if it blocks the new choreography.

---

# 14. Smooth scrolling

The current client does not include Lenis.

Add:

```text
lenis
```

only for the landing experience.

Recommended integration:

```ts
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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

Implementation must be lifecycle-safe in React.

On unmount:

- destroy Lenis
- remove GSAP ticker callback
- revert GSAP contexts
- remove scene-scoped ScrollTriggers

Do not create multiple Lenis instances in React Strict Mode.

If touch/mobile behavior becomes worse with Lenis, use native scrolling at the affected breakpoint.

Lenis is an enhancement, not a reason to break touch scrolling.

---

# 15. GSAP / ScrollTrigger rules

Use one main timeline per scene.

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

Rules:

- tune scroll distance per scene
- do not give every scene the same `end`
- avoid nested pinned scenes
- use `will-change: transform` sparingly on actively animated elements
- animate transforms and opacity whenever possible
- do not use React state for frame-by-frame values
- call `ScrollTrigger.refresh()` after critical fonts/assets are ready

---

# 16. Motion presets

Centralize reusable values.

Example:

```ts
export const LANDING_MOTION = {
  scrub: 0.8,
  impact: {
    enterScale: 0.55,
    overshoot: 1.08,
    settle: 1,
  },
  parallax: {
    back: 0.12,
    mid: 0.28,
    front: 0.5,
  },
  pointerTilt: {
    maxRotation: 5,
  },
};
```

The actual values should be tuned visually.

The point is consistency, not these exact numbers.

Do not duplicate arbitrary easing/distance values across every component.

---

# 17. Asset strategy

V1 should use:

```text
DOM
CSS
SVG
optimized WebP/AVIF/PNG assets
```

Do not add Three.js or React Three Fiber in the first implementation pass.

Only consider WebGL after the DOM/SVG version is visually strong and performance is stable.

Use original FLASH/event assets where available.

If real assets are missing:

- create obvious local placeholders
- keep replacement paths centralized
- do not pull random copyrighted web images into production

Do not reproduce SuperPlay artwork.

---

# 18. Landing CSS isolation

The current `styles.css` also styles `/create` and `/wall`.

Move new landing-specific rules to:

```text
client/src/styles/landing.css
```

or an equivalent isolated landing stylesheet.

Do not accidentally alter:

- `.create-page`
- drawing controls
- Konva canvas behavior
- `.live-wall`
- cat sprite behavior

Keep global typography resets minimal.

Landing styles should be scoped under a landing root when practical.

---

# 19. Responsive strategy

Desktop is the highest-fidelity motion target.

Test at minimum:

```text
1440 x 900
1366 x 768
1024 x 768
768 x 1024
390 x 844
```

On tablet/mobile:

- shorten pin distances
- reduce travel distance
- reduce decorative object count
- reduce excessive text clipping
- disable pointer parallax
- simplify expensive foreground layers
- use native scroll if smooth-scroll causes touch problems
- preserve CTA visibility

Do not simply scale the desktop layout down.

Mobile should feel like a designed alternate choreography.

---

# 20. Reduced motion

Respect:

```text
prefers-reduced-motion: reduce
```

Reduced-motion mode must:

- remove pin-heavy choreography when necessary
- show all content without requiring animation progress
- avoid large flying objects
- avoid repeated elastic motion
- keep navigation and CTA fully usable

Animation may enhance comprehension but must not gate it.

---

# 21. Performance requirements

Target smooth interaction on a normal event laptop and modern phone.

Prefer:

- transforms
- opacity
- optimized images
- a few strong parallax layers
- scene-local timelines

Avoid:

- large uncompressed PNGs
- continuous React rerenders during scroll
- dozens of mousemove-driven elements
- layout-reading loops inside scroll handlers
- too many simultaneous blur/filter animations
- WebGL before it is justified

Use browser performance tools if animation stutters.

First simplify motion density before adding more libraries.

---

# 22. Implementation sequence for Codex

Codex must implement in this order.

## Phase A — Audit and protect existing product

Before changing landing code:

1. run the project
2. confirm `/create` works
3. confirm `/wall` works
4. confirm routing works
5. run type-check/build

Do not redesign `/create` or `/wall` as part of this task.

Exit condition:

```text
existing product baseline is known and working
```

---

## Phase B — Landing skeleton refactor

Create scene components and move landing-only CSS out of the shared stylesheet.

No complex animation yet.

Exit condition:

- 6 scenes render in correct order
- primary and secondary CTAs work
- `/create` and `/wall` remain unchanged

---

## Phase C — Hero only

Build the Hero scene to full motion quality before animating the rest of the page.

Required hero features:

- oversized FLASH 10 typography
- impact entrance
- squash/stretch or overshoot
- at least 3 choreographed decorative objects
- first scroll immediately transforms the hero
- hero -> Scene 2 takeover transition

Exit condition:

The hero alone already feels substantially closer to the SuperPlay motion language than the current landing.

Do not proceed with generic fades for the remaining sections just to make the page look complete.

---

## Phase D — Scene timelines

Implement in order:

```text
TenYearsScene
ConnectionScene
IdentityScene
MemoryCatScene
FinalCtaScene
```

Each scene gets:

- clear start state
- clear end state
- one main timeline
- deliberate transition to next scene

---

## Phase E — Smooth scroll + polish

After ScrollTrigger choreography works with native scroll:

1. add Lenis
2. synchronize with ScrollTrigger
3. test touch behavior
4. tune scrub values
5. add limited pointer parallax

Do not debug GSAP and Lenis simultaneously from the start.

---

## Phase F — Responsive + reduced motion

Implement mobile choreography and reduced-motion fallback.

Do not leave this until after the desktop code becomes impossible to simplify.

---

## Phase G — Final verification

Run:

```bash
npm run check
npm run build
```

Also manually verify:

```text
/
/create
/wall
```

No console errors.

No ScrollTrigger debug markers.

No broken links.

---

# 23. Visual QA checkpoints

Do not judge the animation only at page load.

Capture or inspect approximately:

```text
Hero      0%, 50%, 100%
TenYears  0%, 50%, 100%
Connection 0%, 50%, 100%
Identity  0%, 50%, 100%
MemoryCat 0%, 50%, 100%
Outro
```

At each state inspect:

- composition balance
- readability
- overlap
- object depth
- whether movement feels scroll-linked
- whether the next transition is already visually prepared

If a section looks like a normal static card when paused mid-scroll, strengthen staging.

---

# 24. Acceptance criteria

The landing redesign is complete only when all of the following are true.

## Architecture

- [ ] `/` is split into scene components
- [ ] landing motion is not one giant page-wide timeline
- [ ] landing CSS is isolated from create/wall styling
- [ ] scene animations clean up correctly on unmount

## Motion

- [ ] at least 2 important scenes use pin + scrub
- [ ] first scroll transforms the hero instead of merely scrolling it away
- [ ] oversized typography participates in motion
- [ ] at least 3 transition patterns are used across the page
- [ ] foreground/midground/background depth is visible
- [ ] at least one focal element uses squash/stretch or overshoot
- [ ] scroll upward rewinds animations naturally
- [ ] generic fade-up is not the dominant animation language

## Product integration

- [ ] `/create` still works
- [ ] `/wall` still works
- [ ] primary CTA goes to `/create`
- [ ] secondary CTA goes to `/wall`
- [ ] Memory Cat reveal visually connects landing to the existing product

## Responsive/accessibility

- [ ] mobile layout is intentionally adapted
- [ ] reduced-motion mode is usable
- [ ] CTAs remain keyboard/touch accessible
- [ ] text remains readable at supported breakpoints

## Quality

- [ ] no console errors
- [ ] no duplicate ScrollTrigger/Lenis instances
- [ ] no debug markers
- [ ] `npm run check` passes
- [ ] `npm run build` passes

---

# 25. Non-goals

Do not use this landing redesign as a reason to add:

- authentication
- database
- cloud deployment
- moderation
- AI
- paper scanning
- new backend APIs
- Three.js/WebGL V1
- new Memory Cat animation types

This task is a **front-end landing experience redesign only**.

---

# 26. Codex execution prompt

When Codex starts this task, treat the following as the working directive:

```text
Read INSTRUCTIONS.md first to understand and protect the existing Memory Cat product.
Then read INSTRUCTIONS_SUPERPLAY_LANDING.md and treat it as authoritative for route `/`.

Audit the current LandingPage.tsx and landing-related CSS before editing.
Do not redesign /create or /wall.

Refactor the current page-wide SVG/fade-up landing into a scene-based GSAP ScrollTrigger experience inspired by the motion grammar of https://www.superplay.co/:
- pinned cinematic scenes
- kinetic oversized typography
- scroll-scrub timelines
- parallax depth
- choreographed flying objects
- squash/stretch and overshoot
- strong scene takeovers

Implement the Hero first and make its motion quality convincing before expanding the same system to the remaining scenes.
Keep the old SVG route only if it is useful as a local connection-scene effect.
Add Lenis only after native-scroll ScrollTrigger choreography is stable.

Protect all existing create/wall/backend behavior.
Finish by running npm run check and npm run build and report what changed, what remains placeholder, and any performance compromises.
```
