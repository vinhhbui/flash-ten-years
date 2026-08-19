# FLASH 10 — Filmstrip Path Landing Instructions

This is the authoritative landing-page design specification for `/`.

The previous SuperPlay/game-playground visual language is retired.

The landing is now built around one continuous filmstrip-shaped path running through the center of the page. The filmstrip is the visual and animation spine. Every section attaches content to this path using text, buttons, images, milestones, memory frames, and CTAs.

## Core visual rule

The page must feel like one continuous reel, not stacked independent sections.

```text
scroll
  ↓
filmstrip advances
  ↓
frames move through center
  ↓
section content appears around/inside the strip
  ↓
next bend / next memory
```

The strip must be unmistakably film-like:

- repeated rectangular frame windows
- sprocket/perforation holes on both edges
- dark/high-contrast strip body
- flexible bends and curves
- occasional widening for large image/gallery moments

Do not implement it as a thin abstract SVG line.

## Design language

Target mood:

```text
nostalgic
cinematic
warm
handmade
playful
memory-driven
continuous
```

Remove the previous landing language:

```text
SuperPlay playground composition
coin/cube/domino motifs
object swarms
heavy squash/stretch typography
CSS runner/reader/walker characters
planet/orbit illustrations
unrelated colored card sections
page-wide abstract routePath
repeated generic fade-up reveals
```

Keep only reusable technical patterns such as GSAP lifecycle cleanup, ScrollTrigger, reduced-motion handling, React Router, and SVG measurement utilities.

## Sections

Recommended structure:

```text
1. Opening / FLASH 10
2. 10 Years / Timeline
3. Kết Nối
4. Bản Sắc
5. Flashback / Memory Gallery
6. Memory Cat handoff
7. Final CTA
```

Each section must visually attach to the central filmstrip.

A section may contain:

```text
heading
body text
button
image/photo
illustration
milestone/year
quote
badge
CTA
one or more film frames
```

Content should alternate naturally around the path rather than become disconnected cards.

## Content composition patterns

Allowed patterns:

```text
content left  | filmstrip center
filmstrip center | content right
large film frame containing hero image
text badge overlapping strip edge
strip widens into temporary gallery stage
```

## Scroll behavior

Scroll controls the filmstrip.

```text
scroll down
-> film feeds forward / extends
-> frames advance
-> bends open slightly
-> nearby content enters

scroll up
-> film rewinds / retracts
-> frames return
-> bends tighten slightly
-> content reverses naturally
```

Use GSAP + ScrollTrigger. Native scroll first. Smooth scrolling is optional later.

The filmstrip itself is the primary animated object. Secondary text/image motion must not compete with it.

## Scene 1 — Opening

Suggested copy:

```text
FLASH 10
TEN YEARS OF MEMORIES
KẾT NỐI · BẢN SẮC · FLASHBACK
```

Behavior:

- filmstrip enters from top or a loose rolled state
- first frames are immediately visible
- hero text sits beside/overlaps the strip
- first scroll starts feeding the film forward

## Scene 2 — 10 Years / Timeline

Use the filmstrip as a literal timeline.

Example placeholder years:

```text
2016
2018
2020
2022
2024
2026
```

Do not invent real company milestones unless supplied.

Frames may contain images, year labels, short title/caption, or placeholders.

## Scene 3 — Kết Nối

Theme:

```text
KẾT NỐI
EVERY MEMORY CONNECTS
```

The strip bends between left/right content blocks. Consecutive frames create a sense of connected memories.

## Scene 4 — Bản Sắc

Theme:

```text
BẢN SẮC
LEAVE YOUR MARK
```

Use color, handwritten notes, stickers, portraits, and visual patterns inside or immediately around frames.

Keep the film metaphor intact.

## Scene 5 — Flashback / Memory Gallery

This is the most literal photo-reel moment.

- multiple image frames
- focal frame can scale slightly
- neighboring frames stay smaller
- optional short horizontal drift driven by vertical scroll
- strip may widen into a temporary gallery

Use data-driven memory content.

Concept:

```ts
const memories = [
  { image, year, title, caption },
  ...
]
```

## Scene 6 — Memory Cat handoff

Suggested copy:

```text
ADD YOUR FRAME
MAKE A MEMORY
BRING IT TO LIFE
```

Transition idea:

```text
normal frame
-> blank frame
-> highlight
-> Memory Cat silhouette appears
-> CTA appears
```

Primary CTA:

```text
CREATE YOUR MEMORY -> /create
```

Secondary CTA:

```text
VIEW LIVE WALL -> /wall
```

Do not gate navigation behind animation completion.

## Scene 7 — Final CTA

The filmstrip slowly unwinds or flattens toward the end.

Suggested copy:

```text
YOUR MEMORY
BECOMES PART OF THE FILM
```

Finish calm and readable.

## Filmstrip technical architecture

Preferred V1:

```text
SVG centerline/path geometry
+
DOM/SVG film frames
+
GSAP ScrollTrigger
```

Conceptual geometry:

```text
scroll progress
     ↓
filmstrip centerline
     ↓
strip body
     ↓
frame positions sampled along path
     ↓
perforations sampled along path
```

Do not jump to Canvas/Three.js for V1.

## Reusable frame component

Conceptual type:

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

Frame variants may include:

```text
photo frame
text frame
blank frame
CTA frame
memory-cat frame
```

Adding content must not require rewriting the filmstrip system.

## Reusable section content model

Conceptual type:

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

Not every scene must use one generic component, but the content system should make text/button/image/milestone additions easy.

## Recommended React structure

```text
client/src/
├── pages/
│   └── LandingPage.tsx
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
├── animations/
│   └── landing/
│       ├── filmstripTimeline.ts
│       ├── frameMotion.ts
│       └── motionPresets.ts
├── data/
│   └── landingContent.ts
└── styles/
    └── landing.css
```

`LandingPage.tsx` should be a lightweight orchestrator. Do not duplicate filmstrip internals in each scene.

## Styling

Recommended visual treatment:

```text
warm off-white/paper background
black or charcoal filmstrip
subtle grain/dust
muted anniversary palette
small FLASH accents
```

Typography supports the filmstrip rather than dominating it.

Avoid excessive squash/stretch text motion from the previous design.

## Responsive behavior

Desktop:

```text
film near center
content alternates left/right
larger curves
more simultaneous frames
```

Tablet:

```text
smaller bends
content closer to strip
fewer visible frames
```

Mobile:

```text
film can shift slightly from center
content stacks near active frame
curves simplify
buttons stay touch friendly
```

Do not remove the filmstrip on mobile.

Test at least:

```text
1440 x 900
1366 x 768
1024 x 768
768 x 1024
390 x 844
```

## Reduced motion

Respect `prefers-reduced-motion: reduce`.

- keep complete filmstrip visible
- remove large spring/reel motion
- reduce scrub transforms
- keep all text/buttons/images accessible

## Performance

Prefer:

```text
transform
opacity
clip-path where reasonable
SVG attributes only where needed
```

Avoid:

```text
React setState per frame
huge DOM counts for perforations
large uncompressed image sequences
layout-thrashing scroll handlers
```

## Implementation order for Codex

### Phase A — Audit

Inspect current LandingPage/CSS and identify all obsolete landing classes/components. Preserve `/create`, `/wall`, server/API/Socket.IO behavior.

### Phase B — Static filmstrip prototype

Before animation, make the strip clearly look like film:

- frame windows
- sprocket holes
- curves/bends
- content attachment points

### Phase C — Scroll behavior

Add forward/rewind behavior with ScrollTrigger.

### Phase D — First 3 scenes

Build only:

```text
Opening
10 Years
Kết Nối
```

Validate the system before continuing.

### Phase E — Prove content flexibility

Demonstrate that sections can add:

```text
text
button
image
multiple frames
milestone
```

without rewriting filmstrip internals.

### Phase F — Remaining scenes

Implement:

```text
Bản Sắc
Flashback
Memory Cat
Final CTA
```

### Phase G — Responsive + reduced motion

### Phase H — Optional smooth-scroll polish

Only after native scrolling is stable.

### Phase I — Validation

Run:

```powershell
npm.cmd run check
npm.cmd run build
```

## Acceptance criteria

- previous SuperPlay/game-playground visual language is gone
- filmstrip is the dominant visual spine
- filmstrip is unmistakably recognizable
- frame windows and sprocket holes are visible
- strip remains continuous through the page
- sections attach visually to the strip
- page does not look like isolated cards
- section supports text/button/image/milestone content
- film frames are reusable
- scroll down advances film
- scroll up rewinds film
- active-frame emphasis works
- `/create` still works
- `/wall` still works
- API/Socket.IO remain unchanged
- responsive and reduced-motion modes work
- build/type-check pass

## Codex directive

> Replace the existing landing design language with a continuous filmstrip-path experience. The filmstrip is the central visual and animation spine. Build reusable frames and a section system that can attach text, buttons, images, milestones, and CTAs around the strip. Remove old SuperPlay/game-playground concepts instead of layering the filmstrip on top of them. Preserve `/create`, `/wall`, and backend/realtime behavior. Build the static filmstrip first, then scroll advance/rewind, then add sections incrementally.

Do not interpret this as “keep the old landing and add a filmstrip decoration.”

The filmstrip is the landing-page architecture.