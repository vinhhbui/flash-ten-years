# FLASH 10 — SuperPlay-Style Film Road Landing V2

> **Authoritative implementation instruction for route `/`.**
>
> This document supersedes the landing-page direction in `INSTRUCTIONS_FILMSTRIP_LANDING.md`, `INSTRUCTIONS_SUPERPLAY_SCROLL_CHOREOGRAPHY.md`, and any older landing-specific implementation notes whenever there is a conflict.
>
> `/create`, `/wall`, scanner/live-wall behavior, template extraction, server APIs, Socket.IO, persistence, and all non-landing flows remain outside this redesign and must continue working unchanged.

---

# 0. Mission

Replace the current landing page completely.

Do **not** iterate on the current editorial/story-card landing. Do **not** keep the current thin abstract `routePath` as the visual spine. Do **not** keep the current CSS placeholder people/planet/orbit visuals.

Build a new landing experience whose interaction language is inspired by the public SuperPlay website:

- scroll behaves like a playhead;
- the viewport often behaves like a stage rather than a normal document;
- major scenes are pinned and transform internally;
- oversized typography is part of the motion system;
- floating 2D objects create depth through parallax;
- scenes hand objects into one another;
- transitions use scale, direction, typography, foreground wipes, and background takeover instead of repeated fade-up reveals;
- the whole page should feel like one continuous animated journey.

The unique FLASH 10 element is a **central perspective filmstrip road**.

The filmstrip road must visually resemble the supplied sketch:

```text
                    horizon / center

                    \       /
                     \     /
                      \   /
                       \ /

                 road widens toward viewer
```

However, those two edges are not ordinary road lines. Together they define one continuous **photographic film strip** with frame windows and sprocket holes.

When the user scrolls down, the film appears to unroll and travel toward the viewer like moving forward on a road. When the user scrolls up, the film rewinds naturally.

For V2, the page should first nail the SuperPlay-like layout rhythm and scroll choreography. Detailed FLASH 10 decoration, final photos, final copy, event-specific graphic assets, and section-by-section art direction can be replaced later.

---

# 1. Current repository ground truth

The frontend is already React + Vite + TypeScript.

The `/` route already points to `client/src/pages/LandingPage.tsx`.

GSAP and `ScrollTrigger` are already available through the existing `gsap` dependency.

Therefore:

- do not migrate frameworks;
- do not introduce Next.js;
- do not replace React Router;
- do not add Three.js for V2;
- do not add a second animation framework;
- do not modify `/create` or `/wall` just to support the landing redesign.

Native browser scrolling must work first.

Lenis or another smooth-scroll layer is optional polish and must not be added until the core pinned ScrollTrigger choreography is stable.

---

# 2. Hard reset of the current landing

`client/src/pages/LandingPage.tsx` is disposable for this redesign.

Remove the old landing-only implementation including the concepts represented by:

```text
routePath
Character
landing-character--runner
landing-character--reader
landing-character--walker
landing-orbit
landing-sun-disc
landing-board
landing-planet
landing-image-card
landing-illustration-card
landing-window-shape
landing-scroll-svg
landing-scroll-path
[data-landing-reveal]
generic fade + translateY reveals
```

Also remove obsolete CSS selectors that are only used by the old landing after the new implementation compiles.

Do not delete shared/global CSS required by `/create` or `/wall`.

Do not delete React Router routes.

The final landing must not contain the old thin page-wide SVG path hidden underneath the new design.

The redesign is a replacement, not an overlay.

---

# 3. Design principle — clone the interaction language, not the copyrighted content

The target is to reproduce the **experience grammar** of SuperPlay, not its proprietary content.

Clone the following qualities:

```text
bold composition
oversized typography
high contrast
kinetic scene changes
playful floating objects
foreground/background depth
scrubbed scroll animation
pinned stage sequences
objects entering from outside the viewport
objects surviving transitions
scene takeover moments
continuous visual flow
large crops
controlled visual chaos
```

Do not copy:

```text
SuperPlay logo
SuperPlay game characters
SuperPlay game artwork
SuperPlay exact copywriting
SuperPlay proprietary illustrations
SuperPlay source code
SuperPlay exact branded colors as a requirement
```

For V2, use original FLASH 10 placeholder copy and simple local geometric/graphic objects where final decoration is not ready.

The user will decorate the sections later.

---

# 4. The signature object — central Film Road

## 4.1 It is one continuous object

There must be one persistent filmstrip road running through the landing.

It must visually read as one continuous physical ribbon, not six unrelated filmstrip illustrations.

The film road should normally stay around the horizontal center of the viewport but may bend left or right during transitions.

Conceptually:

```text
           far / horizon

              ▪ ▪       ▪ ▪
             /-------------\
            / | [ FRAME ] | \
           /  | [ FRAME ] |  \
          /   | [ FRAME ] |   \
         /_____________________\
        ▪ ▪ ▪ ▪ ▪ ▪ ▪ ▪ ▪ ▪ ▪ ▪

            near / foreground
```

It must contain enough visual information to be recognized immediately as photographic film:

- dark film body;
- left and right edges;
- repeating sprocket/perforation holes on both sides;
- repeating frame windows in the middle;
- subtle frame separators;
- perspective scaling;
- bends/curves when a scene needs them.

Do not ship a result that looks like only two black perspective lines.

## 4.2 Perspective geometry

The supplied sketch has a narrow opening near the upper center and a much wider opening near the bottom.

Use this as the default camera composition:

```text
horizon Y                 ≈ 18–30vh
film width at horizon     ≈ 12–18vw
film width near bottom    ≈ 48–62vw
film center X             ≈ 50vw
foreground exit Y         > 100vh when useful
```

These are starting ratios, not fixed pixel values.

On desktop, the result should resemble a road receding into depth.

On mobile, keep the same concept with a narrower foreground width and fewer visible frame windows.

## 4.3 Travel illusion

Scrolling down must create the illusion that the film road is feeding from the distance toward the viewer.

The user should perceive:

```text
scroll down
→ far film frames approach
→ frames grow in perspective
→ perforations move toward viewer
→ active film frame crosses the stage
→ next scene forms around the road
```

Reverse scrolling must produce the inverse:

```text
scroll up
→ film rewinds
→ frame sequence moves back toward horizon
→ prior scene restores
```

Do not implement the road as a static background while only text animates.

## 4.4 Recommended implementation

Prefer SVG + DOM + GSAP for V2.

Do not introduce WebGL unless a later requirement genuinely needs it.

Recommended conceptual structure:

```text
FilmRoad
├── film body / mask
├── left sprocket rail
├── right sprocket rail
├── frame windows
├── frame separators
├── active-frame layer
└── foreground continuation
```

A good implementation is a reusable `FilmRoad` component driven by normalized progress rather than React state on every scroll event.

Possible approaches, in order of preference:

1. SVG geometry with a small repeated set of film slices/frames transformed by depth;
2. SVG path variants plus frame groups positioned along the center spline;
3. CSS 3D perspective for a straight road combined with SVG/local transforms when scenes bend the film.

Avoid rendering hundreds of React elements or updating React state every scroll frame.

Use GSAP transforms, CSS custom properties, `quickSetter`, or other direct animation-safe mechanisms.

## 4.5 Film road must participate in transitions

Per scene the film may transform through variants such as:

```text
straight perspective road
→ gentle S bend
→ open loop
→ centered flat active-frame zone
→ diagonal sweep
→ perspective road again
```

The visual connection between variants must remain obvious.

Never make the film disappear for an entire major scene.

---

# 5. New landing scene sequence

The exact final content will be decorated later.

For V2, construct the following six scenes to reproduce the pacing and visual variety of a SuperPlay-like scrollytelling page.

The sections may be React components, but visually they must behave like one animation sequence.

## Scene 01 — Hero / Opening Stage

Purpose:

- establish high-energy graphic language;
- immediately reveal the film road;
- demonstrate that scrolling controls the stage.

Initial composition:

```text
oversized FLASH 10 title
short one-line manifesto
film road already visible from center horizon
3–6 simple floating graphic objects
one clear scroll cue
```

Use original placeholder objects, for example:

- star;
- flash bolt;
- circle;
- photo frame;
- number `10`;
- sticker-like label.

Non-scroll intro should be short:

```text
background snaps in
→ film road settles from a compressed state
→ title enters with impact
→ supporting objects overshoot slightly
→ stage settles
```

Hero scroll:

```text
00–15%  hold composition
15–35%  road begins feeding, objects react
35–60%  giant type moves/scales, road widens
60–82%  one dominant object or word takes over viewport
82–95%  that object hands into Scene 02
95–100% next scene is already readable
```

Hero is pinned.

If Hero feels like an ordinary 100vh section scrolling upward, stop and fix it before building later scenes.

## Scene 02 — Manifesto / Giant Type Stage

Purpose:

Recreate the feeling of a SuperPlay manifesto beat using original FLASH copy.

Example placeholder copy:

```text
10 YEARS.
ONE STORY STILL MOVING.
```

Use very large text that can:

- crop outside viewport;
- move behind/in front of the film;
- rotate slightly;
- stretch or scale;
- become a transition surface.

The road should remain central but may bend aside to create composition space.

Required transition:

One word or one active film frame must survive into Scene 03.

## Scene 03 — Floating Media / Collage Stage

Purpose:

Create the playful floating-media depth seen in high-energy scrollytelling sites.

Use placeholder media blocks now.

Composition:

```text
film road through center
2–5 image/media cards around road
large cropped type in background
small foreground graphic crossing camera
```

Use different parallax rates.

Example depth model:

```text
background typography   0.25
far media cards         0.45
film road               0.75–1.00
near media card         1.10
foreground object       1.30
```

These values are conceptual multipliers, not a mandatory formula.

The section must not become a normal image grid.

## Scene 04 — Graphic Takeover / `10` Stage

Purpose:

Create a strong mid-page visual takeover.

Use a giant `10`, FLASH wordmark placeholder, or large graphic symbol.

Suggested choreography:

```text
giant 10 enters
→ film road passes through / behind it
→ 10 grows beyond viewport
→ background color is replaced
→ film active frame emerges from the takeover
```

This scene should demonstrate at least:

- scale takeover;
- background color takeover;
- object handoff.

## Scene 05 — People / Culture / Memory Stage

Purpose:

Provide a photo-driven scene similar in rhythm to SuperPlay's culture/media moments while remaining visually original.

For V2 use placeholder images or styled blank cards if final photography is unavailable.

Requirements:

- cards float at different depths;
- at least one card crosses the foreground;
- film road continues to feed underneath/through the composition;
- one active frame on the film becomes the seed of the final scene.

Do not build a static masonry gallery.

## Scene 06 — Final CTA Stage

Purpose:

Resolve the kinetic journey into a calmer stable ending.

Keep the real product navigation:

```text
CREATE YOUR MEMORY → /create
VIEW LIVE WALL      → /wall
```

The final film road may straighten, flatten slightly, or continue offscreen.

One last film frame may remain visible as a final visual anchor.

The CTA must be usable even if decorative animation has not fully completed.

---

# 6. Scroll choreography contract

## 6.1 Scroll is the playhead

Use one main GSAP timeline per major scene.

Recommended base pattern:

```ts
const timeline = gsap.timeline({
  scrollTrigger: {
    trigger: scene,
    start: "top top",
    end: "+=1800",
    pin: true,
    scrub: 0.8,
    anticipatePin: 1,
    invalidateOnRefresh: true,
  },
});
```

Tune scroll distance per scene.

Do not blindly use the same distance for every scene.

Recommended desktop ranges:

```text
Hero             180–240vh worth of scroll
Manifesto        150–220vh
Media collage    180–260vh
Graphic takeover 150–220vh
Culture          180–240vh
Final CTA        normal flow or short pin
```

## 6.2 Standard stage timing

Design most pinned scenes around:

```text
00–15% HOLD
15–35% REACT
35–60% TRANSFORM
60–82% TAKEOVER
82–95% HANDOFF
95–100% RELEASE
```

This prevents the scene from immediately exploding at progress 0.01 and creates enough time for the user to understand each composition.

## 6.3 Main scroll motion uses deterministic progress

The same scroll position should resolve to approximately the same composition.

Main layout state must not depend on current scroll velocity.

Velocity may only add subtle transient effects after the base timeline works, such as:

- tiny film stretch;
- small rotation overshoot;
- slight foreground impulse.

## 6.4 Avoid generic reveal animation

Do not use the same pattern throughout the page:

```text
opacity 0 → 1
y 40 → 0
```

Small supporting elements may fade when appropriate, but main scene transitions must use stronger mechanisms.

Across the landing, use at least four of these transition types:

```text
scale takeover
foreground directional sweep
typography replacement
object/frame handoff
background color takeover
film bend / loop opening
active frame expanding toward camera
```

At least two transitions must use an object/frame handoff.

---

# 7. Architecture

Do not keep all new choreography in one giant `LandingPage.tsx` effect.

Recommended structure:

```text
client/src/
├── pages/
│   └── LandingPage.tsx
│
├── landing/
│   ├── LandingExperience.tsx
│   ├── landing.css
│   │
│   ├── film/
│   │   ├── FilmRoad.tsx
│   │   ├── filmRoadGeometry.ts
│   │   └── filmRoadConfig.ts
│   │
│   ├── scenes/
│   │   ├── HeroScene.tsx
│   │   ├── ManifestoScene.tsx
│   │   ├── MediaScene.tsx
│   │   ├── TakeoverScene.tsx
│   │   ├── CultureScene.tsx
│   │   └── FinalScene.tsx
│   │
│   ├── animation/
│   │   ├── useLandingScroll.ts
│   │   ├── createHeroTimeline.ts
│   │   ├── createManifestoTimeline.ts
│   │   ├── createMediaTimeline.ts
│   │   ├── createTakeoverTimeline.ts
│   │   ├── createCultureTimeline.ts
│   │   └── motionConfig.ts
│   │
│   └── components/
│       ├── KineticText.tsx
│       ├── FloatingObject.tsx
│       └── MediaCard.tsx
```

Codex may adjust naming, but keep these responsibilities separate:

```text
page orchestration
film geometry
scene markup
scene animation
global motion configuration
```

Do not mix Live Wall sprite animation files with landing choreography.

The existing `client/src/animations/` folder already serves application animation logic; a landing-specific namespace is preferred so the redesign does not accidentally couple with `/wall`.

---

# 8. Film-road state model

The film road should expose a small set of logical scene states instead of hard-coded geometry scattered across components.

Example:

```ts
type FilmRoadVariant =
  | "perspective"
  | "open-bend"
  | "s-curve"
  | "active-frame"
  | "diagonal"
  | "outro";
```

And centralized config:

```ts
const filmRoadConfig = {
  perspective: { /* geometry / transform parameters */ },
  openBend: { /* ... */ },
  sCurve: { /* ... */ },
  activeFrame: { /* ... */ },
};
```

Scene timelines should animate between controlled variants.

Do not scatter hundreds of unexplained magic numbers across TSX files.

---

# 9. Visual system for V2

The final art direction will be decorated later.

For this implementation pass, prioritize composition and animation quality.

Use a temporary but deliberate visual system:

- high-contrast background fields;
- oversized bold sans-serif typography using available/system fonts;
- 3–5 strong colors maximum on one stage;
- simple original graphic shapes;
- dark filmstrip body with clearly visible perforations;
- media placeholders with enough contrast to verify depth/parallax.

Do not spend time inventing final anniversary illustrations.

Do not reintroduce the old pastel editorial card language just because real assets are missing.

Add comments or config labels where final decoration can be replaced later.

Example:

```ts
// DECOR-LATER: replace placeholder media with final FLASH 10 photography.
```

---

# 10. Typography motion

Typography is an animation object, not only static content.

Important lines should be split by line/word/span when required by the timeline.

Allowed motion:

```text
translate
scale
rotate
clip
crop
stagger
overshoot on non-scroll intro
move behind/through film
become a transition surface
```

Avoid heavy per-character animation everywhere.

Use per-word or per-line motion for most scenes and reserve character-level animation for one or two hero moments if needed.

For scrubbed transforms prefer `ease: "none"` or restrained easing.

For non-scroll entrance impact, `power3.out`, `power4.out`, `back.out`, or restrained elastic motion is acceptable.

Do not use elastic easing continuously inside scrubbed timelines.

---

# 11. Parallax and depth

The SuperPlay-like feeling comes partly from objects moving at different apparent depths.

Each scene should define clear depth layers:

```text
background field / giant type
far supporting objects
film road
active content
near foreground object
```

Do not animate everything at the same speed.

Do not use blur as the primary depth mechanism.

Prefer transform/scale/translation.

Use `will-change: transform` only on elements that actually animate.

---

# 12. Mobile behavior

Do not replace the mobile version with static stacked cards.

Preserve the concept:

```text
scroll = playhead
film road = central spine
objects = handoff between scenes
```

Simplify for mobile:

- 2–4 simultaneous floating objects instead of 5–8;
- shorter pin distances;
- smaller typography takeover scale;
- fewer film frames visible at once;
- smaller road foreground width;
- reduced parallax distance;
- fewer overlapping foreground cards.

Suggested film geometry on mobile:

```text
horizon width     ≈ 18–24vw
foreground width  ≈ 70–86vw
```

Tune visually.

Touch scroll must remain stable.

If a long pin feels poor on mobile, shorten the pin rather than removing the choreography completely.

---

# 13. Reduced motion

Respect `prefers-reduced-motion: reduce`.

Reduced-motion mode should:

- remove long pinned scrub sequences where necessary;
- preserve all content in correct order;
- keep the film road visually recognizable;
- show final scene states without requiring animation;
- remove large fly-through/takeover motion;
- keep `/create` and `/wall` links immediately usable.

Do not hide content just because animation is disabled.

---

# 14. Performance rules

Main animated properties should primarily be:

```text
transform
opacity
clip-path only where justified
```

Avoid scroll-frame animation of:

```text
top
left
width
height
box-shadow blur radius
large CSS filters
```

Do not use React state for raw scroll progress.

Do not create one independent ScrollTrigger for every sprocket hole or film frame.

Prefer:

- one scene timeline;
- one film-road controller;
- grouped transforms;
- reusable placeholder assets;
- lazy loading for non-critical media.

No large GIF backgrounds.

If animation media is later needed, prefer optimized WebM/WebP/AVIF assets.

---

# 15. Implementation order — mandatory

Codex must implement in this order.

## Phase A — protect existing product flows

Before editing:

1. confirm `/`, `/create`, `/wall` routes;
2. confirm build is currently able to run;
3. identify old landing-only CSS;
4. do not touch server logic.

## Phase B — delete old landing composition

Replace the old `LandingPage` composition.

At the end of this phase there should be no:

```text
old CSS characters
old planets/orbits
old editorial cards
old routePath
old page-wide thin SVG route
old generic data-landing-reveal system
```

## Phase C — static Film Road quality gate

Build the film road before advanced scene animation.

Do not continue until it passes:

- unmistakably reads as photographic film;
- perspective resembles a road;
- narrow at horizon;
- wide at foreground;
- perforations visible;
- frame windows visible;
- responsive geometry works.

## Phase D — Hero quality gate

Build Hero + first pinned ScrollTrigger timeline.

Do not continue until:

- viewport feels like a stage;
- film visibly feeds with scroll;
- main typography transforms;
- floating objects react at different depths;
- scrolling backward restores the composition.

## Phase E — Hero → Manifesto handoff

Build the first continuous transition.

Do not continue until:

- no blank gap;
- at least one object/frame persists across scene boundary;
- next composition forms before previous scene fully releases.

## Phase F — remaining scenes

Build Media, Takeover, Culture, Final.

Reuse the motion system instead of inventing a different architecture for every scene.

## Phase G — responsive + reduced motion

Tune desktop, tablet, mobile and reduced-motion behavior.

## Phase H — cleanup

Remove dead landing code and obsolete landing CSS.

Run typecheck/build.

---

# 16. Acceptance criteria

The implementation is accepted only if all of these are true.

## Structural

- `/` uses the new landing experience.
- `/create` still works.
- `/wall` still works.
- existing server/API behavior is untouched unless absolutely required.
- old landing placeholder characters and old thin route path are gone.

## Film Road

- road is centered by default;
- road is narrow toward the upper center/horizon;
- road widens toward the bottom/foreground;
- it visibly contains film frame windows;
- it visibly contains edge perforations;
- scrolling down makes the film appear to feed/unroll toward the viewer;
- scrolling up rewinds it naturally;
- film participates in transitions rather than sitting static behind content.

## SuperPlay-like choreography

- at least five distinct visual beats before final CTA;
- at least four different transition mechanisms;
- at least two object/frame handoffs;
- at least three major pinned scenes;
- oversized typography participates in animation;
- media/graphic objects use multiple parallax depths;
- major sections do not behave like ordinary stacked cards;
- the page does not rely mainly on fade-up reveals.

## Quality

- reverse scroll is stable;
- no visible blank pin gaps;
- no horizontal scrollbar caused by offscreen animation objects;
- no repeated ScrollTrigger registration leaks on route navigation;
- ScrollTriggers are cleaned up on unmount;
- resize refreshes geometry correctly;
- touch scroll remains usable;
- reduced-motion mode preserves content and links.

## Build

From `client/`:

```bash
npm run check
npm run build
```

Both must pass before the task is considered complete.

---

# 17. Failure conditions

The implementation is wrong if any of these remain true:

```text
current LandingPage composition is merely restyled
old routePath still powers the page
film is only a thin line
film is static while text moves
film has no perforations or frame windows
page is mostly standard vertical sections
scene transitions are mostly fade + y
hero simply scrolls out of view
all objects move at the same speed
no object persists between scenes
mobile becomes a static card stack
scroll down works but reverse scroll breaks
landing changes break /create or /wall
Three.js/WebGL is added without a demonstrated need
```

---

# 18. What NOT to implement yet

Do not use this V2 pass to finalize:

- exact FLASH event photography;
- final decorative illustrations;
- all final section copy;
- CMS/editor tooling;
- WebGL;
- real-time user photos inside the landing film;
- scanner ingestion on the landing;
- admin controls;
- complex physics;
- custom shaders;
- full page audio.

Leave clean extension points for later decoration.

The goal of this pass is:

> **Get the SuperPlay-like scrollytelling engine, scene rhythm, and perspective film-road spine working beautifully first. Decorate it later.**

---

# 19. Final Codex self-check

Before declaring completion, Codex must answer these questions internally and fix any `no`:

```text
1. Did I truly replace the old landing rather than decorate it?
2. Does the first viewport already look like a designed animated stage?
3. Does the central element unmistakably look like photographic film?
4. Does that film look like a road receding into the center?
5. Does scroll make the film travel/unroll toward the viewer?
6. Does reverse scroll rewind the same visual states?
7. Are sections connected through handoffs and takeovers?
8. Is typography part of the animation system?
9. Are there multiple visual depths and parallax rates?
10. Do /create and /wall remain intact?
11. Does mobile preserve the core concept?
12. Do typecheck and production build pass?
```

If any answer is `no`, the landing is not finished.
