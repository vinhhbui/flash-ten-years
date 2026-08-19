# FLASH 10 — Filmstrip Path Landing Instructions

## 0. Authority and scope

This file is the authoritative implementation instruction for the public landing route `/` in `flash-ten-years`.

It replaces the previous SuperPlay/game-playground visual direction. Do not preserve the old landing design language merely because some code or documentation already exists.

Precedence:

1. `INSTRUCTIONS.md` remains authoritative for the Memory Cat product flow, `/create`, `/wall`, API, Socket.IO, persistence, scanning-related product work, and event/LAN behavior.
2. This file is authoritative for `/`, landing architecture, visual language, scroll choreography, filmstrip path behavior, responsive behavior, and landing performance.
3. The previous SuperPlay-inspired playground direction is obsolete.
4. The old page-wide abstract SVG route is obsolete unless reused as implementation scaffolding for the new filmstrip path.
5. Do not break `/create`, `/wall`, server behavior, uploads, persistence, or Socket.IO while redesigning `/`.

The application already exists. This is a redesign of the landing experience, not a greenfield rebuild.

---

# 1. New design language

The landing page must now be built around one clear visual metaphor:

```text
A LONG CONTINUOUS FILMSTRIP
RUNNING THROUGH THE CENTER OF THE PAGE
```

The filmstrip is the visual spine of the entire landing experience.

It should feel like a physical strip of film that stores memories from the last 10 years.

The user scrolls through the page as if they are following the filmstrip through a sequence of memories.

The page should feel:

```text
nostalgic
cinematic
playful
handmade
warm
continuous
memory-driven
```

Do not return to the previous visual language of:

```text
game-like object swarms
coin/cube/domino-inspired objects
heavy kinetic typography everywhere
random flying collectibles
independent marketing cards
SuperPlay-like playground composition
```

Those concepts are no longer the landing design target.

---

# 2. Core layout principle

The landing must feel like one continuous vertical journey.

At the center of the page is a filmstrip-shaped path.

Conceptually:

```text
       text / image
            \
             \
        ╔══════════╗
        ║  frame   ║
        ╠══════════╣
        ║  frame   ║
        ╠══════════╣
        ║  frame   ║
        ╚══════════╝
             /
            /
      button / copy
```

The filmstrip can bend, wave, curve, coil, compress, or stretch as it travels down the page.

It should not be a perfectly straight vertical rectangle from top to bottom.

The strip should behave like a flexible physical object.

Recommended visual behavior:

```text
wide curve
-> narrow curve
-> left bend
-> right bend
-> loose coil
-> stretched transition
-> final unwind
```

The filmstrip remains visually recognizable throughout the experience.

---

# 3. Filmstrip anatomy

The path must look unmistakably like a filmstrip.

Required characteristics:

- continuous dark or high-contrast strip body
- repeated rectangular frames
- repeated perforation/sprocket holes along both edges
- rounded or slightly imperfect bends
- visible inner image/content area
- consistent physical width through most of the page
- perspective/scale changes only when intentionally animated

Do not represent the filmstrip as only a thin SVG line.

The user should immediately understand:

```text
this is a strip of film
```

A practical DOM/SVG structure could be:

```text
FilmstripPath
├── strip body
├── left perforations
├── right perforations
├── frame windows
└── optional shadow/highlight
```

Implementation details may vary, but the visual result matters more than the exact technique.

---

# 4. Main interaction concept

Vertical page scroll controls the filmstrip.

The strip should appear to move through the viewport like a reel being pulled.

Primary behaviors:

```text
scroll down
-> filmstrip extends / feeds forward
-> next frames become visible
-> nearby section content enters

scroll up
-> filmstrip retracts / rolls backward
-> previous frames return
-> nearby content rewinds naturally
```

The motion must be reversible with normal scroll.

Do not use autoplay as the primary navigation mechanism.

Do not require the user to finish one animation before continuing.

---

# 5. Filmstrip as the section anchor

Every major section must attach visually to the central filmstrip.

Each section may contain any combination of:

```text
text
heading
short paragraph
button
image
photo
illustration
milestone
quote
badge
memory card
CTA
```

But the content should appear to belong to the filmstrip journey.

Allowed composition patterns:

## Pattern A — content left, film center

```text
[ text / CTA ]   [ FILMSTRIP ]
```

## Pattern B — film center, content right

```text
[FILMSTRIP]   [ image / copy ]
```

## Pattern C — frame becomes hero image

```text
      [ FILMSTRIP FRAME ]
        contains photo

       title below/above
```

## Pattern D — content overlaps the strip

```text
      [ text badge ]
           ↓
      [ FILMSTRIP ]
```

## Pattern E — strip widens into a content stage

```text
normal strip
-> widens
-> becomes large frame/gallery
-> narrows again
```

Do not make each section a disconnected card with its own unrelated layout.

---

# 6. Recommended narrative structure

Use 5–7 meaningful content sections.

Recommended first version:

```text
Scene 1  Opening / FLASH 10
Scene 2  10 Years / Timeline
Scene 3  Kết Nối
Scene 4  Bản Sắc
Scene 5  Flashback / Memory Gallery
Scene 6  Memory Cat Handoff
Scene 7  Final CTA
```

The exact copy can change, but the filmstrip remains the shared visual spine.

---

# 7. Scene 1 — Opening / FLASH 10

Purpose:

- establish the filmstrip metaphor immediately
- introduce FLASH 10
- encourage the user to start scrolling

Suggested copy:

```text
FLASH 10
TEN YEARS OF MEMORIES
```

Optional support:

```text
KẾT NỐI · BẢN SẮC · FLASHBACK
```

Visual behavior:

- filmstrip enters from above or from a rolled/coiled state
- first visible frames may be empty placeholders or contain anniversary visuals
- hero text sits beside or partially overlaps the strip
- first scroll begins feeding the film forward

Avoid a conventional centered hero followed by a hard section break.

---

# 8. Scene 2 — 10 Years / Timeline

Purpose:

Use the filmstrip literally as a 10-year timeline.

Frame content examples:

```text
2016
2018
2020
2022
2024
2026
```

or real milestones later when available.

Do not invent factual history if real milestone data has not been provided.

Behavior:

- dates can appear inside or next to film frames
- frame images can enter as the strip scrolls
- the strip may form a gentle S-curve
- one or more frames may enlarge slightly when they reach the visual focal area

This section can support image, text, button, and milestone content.

---

# 9. Scene 3 — Kết Nối

Theme:

```text
KẾT NỐI
EVERY MEMORY CONNECTS
```

Visual concept:

The filmstrip represents the connection between individual memories.

Possible behavior:

- strip bends between left and right content blocks
- small images appear in consecutive frames
- text fragments sit on alternating sides
- connector annotations/arrows may point to specific frames

The visual focus is the continuity of the strip, not floating independent objects.

---

# 10. Scene 4 — Bản Sắc

Theme:

```text
BẢN SẮC
LEAVE YOUR MARK
```

This section can be more colorful and graphic.

Possible content:

- individual colors
- handwritten notes
- stickers
- portraits
- mini identity cards
- visual patterns

These should appear inside frames or immediately around the filmstrip.

The strip itself can briefly change treatment:

```text
monochrome strip
-> color accents appear
-> frames become more personalized
```

Do not abandon the film metaphor during this scene.

---

# 11. Scene 5 — Flashback / Memory Gallery

Theme:

```text
FLASHBACK
```

This is where the filmstrip becomes most literal.

Possible behavior:

- multiple frames contain photos
- current focal frame scales up
- neighboring frames remain smaller
- vertical scroll may drive a short horizontal drift inside the frame sequence
- frame content may fade/cross-dissolve as if changing film

The filmstrip may temporarily widen to create a cinematic gallery area.

This scene must be easy to populate later with real event photos.

Use a data-driven structure such as:

```ts
const memories = [
  { image, year, title, caption },
  ...
]
```

Do not hardcode each photo into unrelated JSX if a reusable frame component can handle it.

---

# 12. Scene 6 — Memory Cat handoff

Purpose:

Connect the anniversary film journey to the actual event interaction.

Suggested copy:

```text
ADD YOUR FRAME
MAKE A MEMORY
BRING IT TO LIFE
```

The filmstrip can contain a blank frame that transforms into or reveals the Memory Cat interaction.

Possible transition:

```text
normal photo frame
-> empty frame arrives
-> frame highlights
-> cat silhouette appears inside
-> CTA appears beside it
```

Primary CTA:

```text
CREATE YOUR MEMORY
```

Route:

```text
/create
```

Secondary CTA:

```text
VIEW LIVE WALL
```

Route:

```text
/wall
```

Do not gate either CTA behind animation completion.

---

# 13. Scene 7 — Final CTA

The filmstrip can slowly unwind, flatten, or disappear toward the bottom.

Finish with a calm and readable composition.

Suggested message:

```text
YOUR MEMORY
BECOMES PART OF THE FILM
```

Actions:

```text
CREATE YOUR MEMORY -> /create
VIEW LIVE WALL     -> /wall
```

The final scene should feel like the end of a reel.

---

# 14. Filmstrip path geometry

This is the most important technical design requirement.

Do not hardcode one giant arbitrary path without a clear geometry system.

Recommended architecture:

```text
scroll progress
     ↓
filmstrip centerline/path
     ↓
strip body derived from centerline
     ↓
frame positions sampled along path
     ↓
perforations sampled along path
```

Possible implementation approaches:

## Option A — SVG path + repeated transformed frame groups

Useful when:

- precise curved path matters
- frame positions must follow Bézier geometry
- DOM/SVG accessibility is manageable

## Option B — DOM sections with CSS transform/rotate

Useful when:

- implementation speed matters
- the path only needs several controlled bends
- frames can be grouped per scene

## Option C — Canvas/WebGL

Not required for V1.

Do not jump to Canvas or Three.js unless DOM/SVG cannot achieve the intended quality.

Preferred V1:

```text
SVG for path geometry
+
DOM/SVG film frames
+
GSAP ScrollTrigger
```

---

# 15. Filmstrip frame component

Build a reusable component.

Conceptual API:

```ts
interface FilmFrameContent {
  image?: string;
  year?: string;
  title?: string;
  caption?: string;
  alt?: string;
  href?: string;
}
```

Suggested component:

```text
FilmFrame
├── media
├── overlay
├── year
├── title
└── optional action
```

A frame may be:

```text
photo frame
text frame
blank frame
CTA frame
memory-cat frame
```

Keep the system flexible enough that each section can add new content without rewriting the entire filmstrip.

---

# 16. Section content model

Prefer a data-driven section model where reasonable.

Example intent:

```ts
interface FilmSection {
  id: string;
  eyebrow?: string;
  title: string;
  body?: string;
  side?: "left" | "right" | "center";
  frames?: FilmFrameContent[];
  primaryAction?: {
    label: string;
    href: string;
  };
}
```

Not every scene must be generated from one generic component.

The goal is to make adding:

```text
text
button
image
new frame
milestone
```

easy and predictable.

---

# 17. Motion behavior

The filmstrip itself is the primary animated object.

Motion priorities:

1. filmstrip extension/retraction
2. filmstrip bend/coil transitions
3. active frame emphasis
4. nearby content reveal
5. subtle image/parallax polish

Do not make decorative animation compete with the strip.

Recommended GSAP/ScrollTrigger features:

```text
scrub
pin where useful
scene-local timelines
transform
scale
rotation
clip-path/mask where practical
```

The strip should feel elastic but not rubbery to the point of losing the film metaphor.

---

# 18. Spring / reel behavior

The filmstrip can react slightly like a physical reel.

When scrolling down:

```text
strip stretches forward
curve opens slightly
frames advance
```

When scrolling up:

```text
strip retracts
curve tightens slightly
frames rewind
```

Keep this effect subtle enough to preserve legibility.

Do not use chaotic physics.

A small lag/scrub value can help create a physical feel.

---

# 19. Active-frame emphasis

When a film frame reaches the main viewing region, it may receive a temporary active state.

Examples:

```text
scale 1 -> 1.06
small shadow increase
slight rotate correction toward 0deg
image opacity/contrast increase
caption appears
```

Neighboring frames remain visible but less dominant.

This creates a cinematic reading rhythm without turning the page into a carousel.

---

# 20. Background and visual styling

Recommended direction:

```text
warm paper / off-white base
black or charcoal filmstrip
subtle film grain
slightly imperfect texture
muted anniversary colors
small FLASH brand accents
```

Optional effects:

- film grain overlay
- dust/scratch texture
- soft vignette
- paper texture
- subtle frame flicker

Keep effects lightweight.

Do not add heavy fake-VHS distortion unless explicitly requested later.

---

# 21. Typography

Typography should support the filmstrip rather than dominate it.

Use:

- bold condensed/display heading for major titles
- clean readable body text
- small mono/technical labels for year/frame numbers if useful

Typography can animate, but it is secondary to the strip.

Allowed:

```text
subtle slide
mask reveal
small scale
slight rotation
```

Avoid excessive squash/stretch typography from the previous design direction.

---

# 22. Required React architecture

Refactor the landing toward:

```text
client/src/
├── pages/
│   └── LandingPage.tsx
│
├── components/
│   └── landing/
│       ├── LandingHeader.tsx
│       ├── FilmstripPath.tsx
│       ├── FilmFrame.tsx
│       ├── FilmSection.tsx
│       ├── FilmPerforations.tsx
│       ├── ActiveFrame.tsx
│       └── scenes/
│           ├── OpeningScene.tsx
│           ├── TimelineScene.tsx
│           ├── ConnectionScene.tsx
│           ├── IdentityScene.tsx
│           ├── FlashbackScene.tsx
│           ├── MemoryCatScene.tsx
│           └── FinalCtaScene.tsx
│
├── animations/
│   └── landing/
│       ├── filmstripTimeline.ts
│       ├── frameMotion.ts
│       └── motionPresets.ts
│
├── data/
│   └── landingContent.ts
│
└── styles/
    └── landing.css
```

Small changes are allowed to match repository conventions.

Important:

- `LandingPage.tsx` should remain a lightweight orchestrator
- filmstrip logic should not be duplicated in every scene
- frame rendering should be reusable
- content data should be easy to edit
- cleanup of ScrollTrigger/GSAP must be reliable

---

# 23. Remove old landing implementation patterns

The following current patterns are obsolete and should be removed from the production landing:

```text
CSS-built runner/reader/walker characters
old landing planet/orbit visuals
global abstract routePath as the visual identity
generic repeated data-landing-reveal fade-ups
SuperPlay-style object swarm concepts
coin/cube/domino/game-token language
multiple unrelated colored card sections
```

Do not preserve them for visual continuity.

Only keep technical pieces that remain useful, such as:

```text
React Router structure
GSAP setup pattern
ScrollTrigger cleanup pattern
reduced-motion handling
SVG path measurement techniques
```

---

# 24. Styling isolation

Landing-specific CSS should be separated from `/create` and `/wall` styling where practical.

Target:

```text
client/src/styles.css
  -> shared/create/wall styles

client/src/styles/landing.css
  -> landing only
```

The landing redesign must not visually regress the product routes.

---

# 25. Smooth scrolling

Do not introduce a smooth-scroll library until the filmstrip works correctly with native scroll.

Order:

```text
native scroll + ScrollTrigger
-> correct geometry
-> correct frame positioning
-> correct reverse scrolling
-> then optional Lenis polish
```

If Lenis is added later:

- use it only where stable
- clean up correctly in React
- do not create multiple instances in Strict Mode
- disable it at breakpoints where touch behavior degrades

Lenis is optional.

---

# 26. Responsive behavior

The filmstrip metaphor must survive on mobile.

Desktop:

```text
filmstrip near center
content alternates left/right
larger bends
more visible frames
```

Tablet:

```text
smaller bends
content moves closer to strip
fewer simultaneous frames
```

Mobile:

```text
filmstrip can shift slightly left/right of center
content may stack above/below frames
curves become gentler
frame width reduces
buttons remain touch-friendly
```

Do not hide the filmstrip entirely on mobile.

Test at minimum:

```text
1440 x 900
1366 x 768
1024 x 768
768 x 1024
390 x 844
```

---

# 27. Reduced motion

Respect:

```text
prefers-reduced-motion: reduce
```

Reduced motion version should:

- show the full filmstrip structure
- remove large spring/reel movement
- reduce scrub transforms
- keep images/text/buttons readable
- preserve all routes and CTAs

Motion must never gate content.

---

# 28. Performance requirements

Prefer animation of:

```text
transform
opacity
clip-path where reasonable
SVG attributes only when necessary
```

Avoid:

```text
React setState per frame
large uncompressed PNG sequences
huge DOM counts for perforations
layout-thrashing scroll listeners
unbounded filter animations
```

For perforations, use efficient repetition strategies rather than hundreds of independently animated nodes where possible.

Optimize images with WebP/AVIF when appropriate.

---

# 29. Implementation order for Codex

Codex must implement in this order.

## Phase A — Audit

Before changing code:

- inspect current `LandingPage.tsx`
- inspect current landing CSS
- inspect `/create` and `/wall` route boundaries
- identify old landing-specific classes/components to remove

Do not change product logic.

## Phase B — Filmstrip static prototype

Build the filmstrip with no scroll animation first.

Exit condition:

- unmistakably looks like a filmstrip
- repeated frames visible
- sprocket holes visible
- bends/curves are credible
- content can be placed around it

## Phase C — Scroll path behavior

Add scroll-controlled advance/rewind.

Exit condition:

- scrolling down advances the strip
- scrolling up rewinds naturally
- no major geometry jumps
- no layout drift after resize

## Phase D — Build first 3 scenes

Implement:

```text
Opening
10 Years
Kết Nối
```

Do not build all scenes before validating the system.

## Phase E — Content flexibility

Prove that a section can add:

```text
text
button
image
multiple frames
milestone
```

without rewriting filmstrip internals.

## Phase F — Remaining scenes

Implement:

```text
Bản Sắc
Flashback
Memory Cat
Final CTA
```

## Phase G — Responsive + reduced motion

Tune all required breakpoints.

## Phase H — Optional smooth-scroll polish

Only if native scroll version is stable.

## Phase I — Validation

Run from repository root:

```powershell
npm.cmd run check
npm.cmd run build
```

Do not hand off with TypeScript or build failures.

---

# 30. Acceptance criteria

The landing redesign is complete only if all of the following pass:

## Design

- [ ] previous SuperPlay/game-playground visual language is gone
- [ ] the filmstrip is the dominant visual spine
- [ ] the filmstrip is clearly recognizable
- [ ] frame windows and perforations are visible
- [ ] the strip remains continuous through the landing
- [ ] sections visually attach to the strip
- [ ] page does not look like stacked independent cards

## Content system

- [ ] a section can contain text
- [ ] a section can contain a button
- [ ] a section can contain one or more images
- [ ] a section can contain milestone/year content
- [ ] film frames are reusable components
- [ ] content can be changed without rewriting animation internals

## Motion

- [ ] scroll down advances/extends the filmstrip
- [ ] scroll up rewinds/retracts it
- [ ] bends/curves feel intentional
- [ ] active frame emphasis works
- [ ] motion does not obscure text or buttons
- [ ] no generic fade-up system dominates the page

## Product safety

- [ ] `/create` still works
- [ ] `/wall` still works
- [ ] server/API/Socket.IO behavior remains unchanged
- [ ] CTAs navigate correctly

## Quality

- [ ] no console errors
- [ ] no ScrollTrigger debug markers
- [ ] responsive layouts tested
- [ ] reduced motion tested
- [ ] `npm.cmd run check` passes
- [ ] `npm.cmd run build` passes

---

# 31. Codex execution directive

When asked to implement the new landing, Codex should interpret the task as:

> Replace the existing landing design language with a continuous filmstrip-path experience. The filmstrip is the central visual and animation spine. Build reusable frames and a section system that can attach text, buttons, images, milestones, and CTAs around the strip. Remove old SuperPlay/game-playground visual concepts instead of layering the filmstrip on top of them. Preserve `/create`, `/wall`, and all backend/realtime behavior. Implement the static filmstrip first, validate scroll-driven advance/rewind, then build sections incrementally.

Do not reinterpret this as “keep the old landing and add a filmstrip decoration.”

The filmstrip is the landing page architecture.