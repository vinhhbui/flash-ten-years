# FLASH 10 — SuperPlay-Inspired Filmstrip Landing Instructions

This file is the **authoritative design and implementation specification for the public landing route `/`**.

The application is already implemented. Do not treat this as a greenfield project.

For route ownership:

- `/` follows this file.
- `/create`, `/wall`, API, Socket.IO, persistence, scanning, and LAN behavior continue to follow the product-specific instructions in the repository.
- Redesigning `/` must not break the existing Memory Cat flow.

Reference interaction language:

- https://www.superplay.co/

The target is to borrow **SuperPlay's energy, motion rhythm, kinetic typography, playful staging, and scroll choreography**, while using an original FLASH 10 visual system.

The original FLASH 10 signature object is a **continuous filmstrip path running through the center of the page**.

Do not copy SuperPlay logos, game art, characters, text, proprietary illustrations, or source code.

---

# 1. Design reset — retire the old landing language

The current landing implementation is a disposable prototype.

When Codex begins implementation, it should remove the old landing-specific visual language rather than trying to preserve it.

Retire these patterns from `/`:

```text
CSS runner / reader / walker characters
planet / orbit illustrations
sun-disc / board placeholder graphics
unrelated pastel editorial cards
warm nostalgic paper-first art direction
muted anniversary palette as the primary look
one thin page-wide abstract routePath
one global strokeDashoffset animation as the whole experience
generic [data-landing-reveal] fade + translateY behavior
repeated static section layouts
large blocks of conventional marketing body copy
```

Keep only reusable technical ideas:

```text
React route structure
GSAP
ScrollTrigger
React lifecycle-safe cleanup
reduced-motion handling
SVG geometry utilities
responsive architecture
```

Do not interpret this redesign as:

> Keep the current landing and place a filmstrip decoration on top.

The old landing composition should be replaced.

---

# 2. New design language

The new landing should feel closer to the interaction language of SuperPlay:

```text
bold
high-energy
playful
kinetic
graphic
surprising
scroll-driven
high-contrast
controlled chaos
continuous
```

Avoid making the main page primarily:

```text
nostalgic beige
vintage scrapbook
soft editorial cards
quiet photo album
retro grain everywhere
```

FLASH 10 can still reference memory and film, but the experience should feel **alive and contemporary**, not like a static vintage archive.

## Visual hierarchy

Use:

- oversized display typography
- short manifesto-like copy
- strong crops
- intentional overlaps
- simple graphic shapes
- selected floating FLASH assets
- photo/media fragments
- sharp composition changes
- high-contrast backgrounds
- strong accent colors

Typography may move, stretch, rotate, overshoot, crop outside the viewport, or temporarily become part of a transition.

The filmstrip remains the permanent visual spine underneath this motion language.

---

# 3. Core concept — the filmstrip is the path

The center of the page contains **one continuous filmstrip-shaped path**.

It is not a thin SVG line.

It must visually read as actual photographic film:

- dark strip body
- repeating rectangular frame windows
- sprocket / perforation holes on both edges
- visible strip thickness
- continuous bends and curves
- occasional loops / coils
- frames that can contain photos, color, text, or interactive states

Conceptually:

```text
                 content / image
                       ↘

        ╭────── FILM FRAME ──────╮
        │  ▫ ▫ ▫ ▫ ▫ ▫ ▫ ▫      │
        │  [   IMAGE / TEXT   ]   │
        │  ▫ ▫ ▫ ▫ ▫ ▫ ▫ ▫      │
        ╰────────╮
                 │
                 ╰──── curved film path
                           │
                           │
                 next active frame
                           │
                         scroll
```

The path should remain near the center of the composition on desktop, but it may bend left and right to create space for content.

The user should feel that all sections belong to **one continuous reel**.

---

# 4. One continuous world, not stacked cards

Components may be separated in code, but visually the page must feel continuous.

Do not create seven isolated rectangular sections with different background cards.

The intended experience is:

```text
composition A
    ↓
film continues moving
    ↓
frame bends / shifts
    ↓
text or media enters
    ↓
object survives the transition
    ↓
composition B emerges
```

Use techniques such as:

- object handoff
- scale takeover
- typography replacement
- foreground wipe
- film loop opening into the next beat
- a frame traveling from one beat into the next
- background color takeover

A user should visually perceive one long animation sequence rather than individual webpage sections.

---

# 5. SuperPlay-inspired motion grammar

## 5.1 Scroll is the playhead

Scrolling should control animation progress, not just document position.

Use GSAP + ScrollTrigger.

Important scenes may use:

```text
pin
scrub
labels
scene-local timelines
transform choreography
```

Scrolling down:

```text
film feeds forward
film loosens / extends
frames advance
active frame comes into focus
text / image reacts
next composition forms
```

Scrolling up:

```text
film rewinds
film contracts slightly
frames move backward
content reverses naturally
previous composition restores
```

Do not add wheel-direction hacks for normal reversal.

## 5.2 Spring / reel behavior

The film should feel flexible rather than rigid.

The user previously described it like a spring / reel. Preserve that physical feeling.

During forward scroll:

```text
bend opens
curve lengthens
adjacent frame spacing expands slightly
```

During reverse scroll:

```text
bend tightens
curve compresses
adjacent frames settle closer together
```

This should be a controlled visual response, not a full physics engine.

Prefer ScrollTrigger scrub plus GSAP transform interpolation before introducing Matter.js or custom physics.

## 5.3 Kinetic typography

Important words act like graphic objects.

Allow:

```text
translateX / translateY
rotate
scale
scaleX / scaleY
skew
clip / mask
viewport overflow
```

Examples:

```text
FLASH slams into frame
10 stretches and overshoots
KẾT NỐI crosses behind the film
BẢN SẮC rotates into a cropped composition
MEMORY grows until it becomes a scene transition
```

Do not animate every paragraph.

Use this behavior for focal words only.

## 5.4 Bounce / overshoot

Use SuperPlay-like energetic motion for short impact moments.

Example sequence:

```text
scale 0.65
→ 1.10
→ 0.97
→ 1.00
```

or:

```text
scaleX 1.16 / scaleY 0.84
→ scaleX 0.95 / scaleY 1.06
→ 1 / 1
```

Suggested easing families for non-scrub animation:

```text
back.out
elastic.out
power3.out
power4.out
```

For scroll-scrub transforms, prefer `ease: "none"` or restrained easing so the motion remains tied to scroll.

## 5.5 Supporting visual objects

Use a small number of original FLASH objects around the film.

Examples:

```text
FlashShape
MemoryFragment
PhotoCard
Arrow
Spark
StickerToken
AnniversaryToken
CatToken
Ribbon
```

They may:

- fly into the composition
- cross in front of the film
- pass behind typography
- rotate while traveling
- temporarily wipe the screen
- become the next scene's visual anchor

Do not recreate SuperPlay's coin/cube/domino assets literally.

---

# 6. Filmstrip geometry and rendering

## Required principle

Use one central path as the geometry source, then render film features along that path.

Preferred V1:

```text
SVG centerline geometry
+
film body / ribbon representation
+
DOM or SVG film frames
+
perforations
+
GSAP ScrollTrigger
```

Do not jump to Three.js or Canvas for V1 unless DOM/SVG is proven insufficient.

## Path sampling

Conceptually:

```text
SVGPathElement.getTotalLength()
        ↓
getPointAtLength(distance)
        ↓
position each film frame
        ↓
sample nearby point
        ↓
calculate tangent angle
        ↓
rotate frame to follow film
```

A frame should follow both the position and tangent of the filmstrip.

Perforations should also follow the strip edges.

Do not create thousands of DOM nodes for sprocket holes. Use a repeated SVG pattern, mask, CSS background strategy, or another efficient repeated representation where possible.

## Path shape

The path should not be one gentle vertical S-curve.

It should include recognizable reel-like gestures:

```text
small loop
large bend
compressed coil
open curve
straight-ish active frame zone
next loop
```

The active content area should remain readable even when the path becomes expressive.

---

# 7. Section system — content must be easy to add

Every scene/section must support adding content without rewriting film internals.

A section may contain:

```text
heading
subheading
body text
button
CTA
image
photo
illustration
video/GIF placeholder
milestone / year
quote
badge
multiple film frames
```

Content may appear:

```text
left of film
right of film
overlapping film edge
inside film frame
inside an enlarged active frame
behind film
in foreground crossing film
```

The film itself is the shared layout anchor.

## Recommended data model

```ts
type FilmFrameType =
  | "photo"
  | "text"
  | "milestone"
  | "cta"
  | "memory-cat"
  | "blank";

interface FilmFrameContent {
  id: string;
  type: FilmFrameType;
  image?: string;
  alt?: string;
  year?: string;
  title?: string;
  caption?: string;
  href?: string;
}

interface FilmAction {
  label: string;
  href: string;
}

interface FilmSection {
  id: string;
  eyebrow?: string;
  title: string;
  body?: string;
  side?: "left" | "right" | "center";
  frames?: FilmFrameContent[];
  media?: {
    type: "image" | "video" | "illustration";
    src: string;
    alt?: string;
  };
  primaryAction?: FilmAction;
  secondaryAction?: FilmAction;
}
```

Not every scene has to render through one generic component, but the content model must remain reusable.

Adding a new image, text block, button, or milestone should mainly be a data/config change.

---

# 8. Recommended story beats

Use 6 core beats plus final CTA.

The exact copy can change later.

## Beat 1 — Hero / FLASH 10

Suggested message:

```text
FLASH 10
TEN YEARS IN MOTION
KẾT NỐI · BẢN SẮC · FLASHBACK
```

Behavior:

- film enters already recognizable
- part of the strip may begin in a loose coil
- `FLASH 10` enters with strong impact / overshoot
- 3–6 supporting objects zip into the composition
- first scroll immediately moves the film and typography

Do not open with a paragraph-heavy conventional hero.

## Beat 2 — 10 Years / Timeline

The film becomes a timeline.

Possible placeholder years:

```text
2016
2018
2020
2022
2024
2026
```

Do not invent factual company milestones unless real content is available.

Each timeline point can be a film frame containing:

- photo
- year
- short heading
- short caption

One active frame can enlarge while nearby frames remain smaller.

## Beat 3 — Kết Nối

Suggested message:

```text
KẾT NỐI
EVERY MEMORY CONNECTS
```

Motion:

```text
frames arrive separately
→ film bends through them
→ nearby visual pieces connect
→ giant KẾT NỐI crosses composition
→ one frame survives into next beat
```

## Beat 4 — Bản Sắc

Suggested message:

```text
BẢN SẮC
LEAVE YOUR MARK
```

This is the strongest graphic section.

Use:

- oversized typography
- strong accent color
- custom stickers / visual marks
- portraits or identity fragments
- overlap with the filmstrip
- quick snap + overshoot animation

One active film frame may temporarily expand into a large visual stage.

## Beat 5 — Flashback / Memory Gallery

This is the photo-heavy reel moment.

Possible behavior:

```text
film opens into a wider curve
→ several frames become visible
→ active frame scales toward viewer
→ vertical scroll drives slight horizontal film travel
→ frames collapse back into the main path
```

Use data-driven content.

Do not download random permanent copyrighted images merely to fill placeholders.

## Beat 6 — Memory Cat handoff

Suggested message:

```text
ADD YOUR FRAME
MAKE A MEMORY
BRING IT TO LIFE
```

Transition:

```text
photo frame
→ empty frame
→ frame highlights
→ Memory Cat silhouette enters
→ sample cats pop / float / hop
→ CTA appears
```

Primary CTA:

```text
CREATE YOUR MEMORY → /create
```

Secondary CTA:

```text
VIEW LIVE WALL → /wall
```

Buttons must remain usable before decorative animation finishes.

## Beat 7 — Final CTA

End cleaner after the high-energy sequence.

Suggested copy:

```text
YOUR MEMORY
BECOMES PART OF THE FILM
```

The strip may flatten, gently unwind, or continue offscreen.

Keep final navigation obvious and stable.

---

# 9. Composition rules

Desktop baseline:

```text
content zone      film zone       content zone
   25–32%          36–46%            25–32%
```

The film may temporarily break those proportions during transitions.

Recommended recurring layouts:

```text
TEXT       FILM       IMAGE
IMAGE      FILM       TEXT
           FILM + ACTIVE FRAME
BIG TYPE behind FILM
CTA overlapping FILM edge
```

Avoid conventional boxed cards unless the box is itself part of a film frame.

Do not center every section identically.

Alternation and overlap should create rhythm.

---

# 10. Color and typography direction

Retire the previous default styling direction of muted warm paper + soft pastel editorial cards.

New default direction:

```text
high-contrast neutral base
strong black / charcoal filmstrip
bold display typography
bright FLASH accent colors
clean solid background fields
occasional abrupt color takeover
```

Use centralized tokens, for example:

```css
--landing-bg
--landing-ink
--film-body
--film-frame
--accent-1
--accent-2
--accent-3
```

Do not scatter arbitrary color values across scene files.

Typography should be visually expressive.

Use a strong condensed or grotesk-like display treatment if available in the project or through a safe web-font choice.

Do not copy SuperPlay's proprietary brand font.

---

# 11. Recommended React architecture

Refactor the current monolithic landing toward:

```text
client/src/
├── pages/
│   └── LandingPage.tsx
│
├── components/
│   └── landing/
│       ├── LandingHeader.tsx
│       ├── FilmstripPath.tsx
│       ├── FilmRibbon.tsx
│       ├── FilmFrame.tsx
│       ├── FilmPerforations.tsx
│       ├── ActiveFilmFrame.tsx
│       ├── KineticText.tsx
│       ├── MotionAsset.tsx
│       └── scenes/
│           ├── HeroScene.tsx
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
│       ├── sceneMotion.ts
│       └── motionPresets.ts
│
├── data/
│   └── landingContent.ts
│
├── hooks/
│   ├── useReducedMotion.ts
│   └── useLandingScroll.ts
│
└── styles/
    └── landing.css
```

`LandingPage.tsx` should be a lightweight orchestrator.

Do not duplicate filmstrip geometry inside each scene.

The filmstrip system should be reusable and scene-independent.

---

# 12. GSAP architecture

Use scene-local timelines.

Do not use one unmaintainable mega-timeline for the entire page.

Recommended pattern:

```ts
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: scene,
    start: "top top",
    end: "+=2200",
    pin: true,
    scrub: 0.8,
    invalidateOnRefresh: true,
  },
});
```

Tune every scene independently.

Do not blindly use the same scroll distance everywhere.

Use `gsap.context()` with reliable cleanup.

Avoid React `setState` for per-frame animation values.

Native scroll first.

Optional Lenis/smooth-scroll integration should only be added after the base ScrollTrigger experience is stable.

---

# 13. Responsive behavior

The filmstrip must survive all breakpoints.

Desktop:

```text
film near center
larger loops
more simultaneous frames
content alternates left/right
strong foreground overlap
```

Tablet:

```text
reduce loop radius
reduce simultaneous frames
bring content closer to active frame
```

Mobile:

```text
film may shift slightly left/right from exact center
simplify curves
show fewer simultaneous frames
stack content beside/below active frame
reduce travel distance
keep CTA touch-friendly
```

Do not replace the filmstrip with a plain vertical line on mobile.

Test at minimum:

```text
1440 × 900
1366 × 768
1024 × 768
768 × 1024
390 × 844
```

---

# 14. Reduced motion

Respect `prefers-reduced-motion: reduce`.

Reduced-motion mode should:

- keep the film visually recognizable
- remove large spring compression
- remove extreme typography fly-ins
- minimize scrubbed transforms
- preserve section ordering
- keep every text/button/image accessible

Animation must never gate required content.

---

# 15. Performance rules

Prefer:

```text
transform
opacity
clip-path where reasonable
SVG geometry only where needed
GPU-friendly movement
optimized WebP / AVIF media
```

Avoid:

```text
React state on every scroll frame
thousands of DOM perforation elements
layout-thrashing scroll handlers
huge uncompressed image sequences
unbounded animation loops
premature Three.js
```

Use `will-change` only on actively animated elements.

Call `ScrollTrigger.refresh()` after critical fonts/media are ready.

---

# 16. Codex implementation order

## Phase A — Audit and delete old landing language

Inspect current:

```text
client/src/pages/LandingPage.tsx
client/src/styles.css
```

Identify and remove landing-only code/classes related to:

```text
routePath
Character runner/reader/walker
landing-orbit
landing-sun-disc
landing-board
landing-planet
old visual cards
[data-landing-reveal]
old page-wide SVG layer
```

Do not remove styles used by `/create` or `/wall`.

## Phase B — Static filmstrip proof

Before adding animation, build one static filmstrip that clearly reads as film.

Must include:

```text
ribbon body
frame windows
perforation holes
multiple bends
at least one loop / coil gesture
3+ sample frame contents
```

If it looks like a thick SVG line, Phase B fails.

## Phase C — Path-following frame system

Make reusable frames follow path position and tangent.

Prove that adding/removing frames does not require manual top/left positioning throughout the page.

## Phase D — Scroll forward / rewind

Add ScrollTrigger-controlled feed/rewind behavior.

Verify:

```text
scroll down → film advances / loosens
scroll up   → film rewinds / tightens
```

## Phase E — Build hero only

Implement Hero with SuperPlay-like motion quality.

Do not continue until:

- typography has impact
- film is visually dominant
- supporting objects feel intentional
- scroll immediately transforms the composition

## Phase F — Timeline + Kết Nối

Add the next two beats and prove section content flexibility.

At this point demonstrate that a section can add:

```text
text
button
image
milestone
multiple frames
```

without changing filmstrip internals.

## Phase G — Bản Sắc + Flashback

Add graphic identity scene and memory gallery.

## Phase H — Memory Cat + final CTA

Connect landing to `/create` and `/wall`.

## Phase I — Responsive / reduced motion

## Phase J — Optional smooth-scroll polish

Only after native behavior is stable.

## Phase K — Validation

Run:

```powershell
npm.cmd run check
npm.cmd run build
```

---

# 17. Acceptance criteria

The landing is not complete unless all of these pass:

- [ ] old landing design language is removed rather than visually preserved
- [ ] SuperPlay-inspired energy/motion is clearly visible
- [ ] SuperPlay brand assets are not copied
- [ ] one continuous filmstrip is the dominant visual spine
- [ ] filmstrip stays near the center of the experience
- [ ] filmstrip has recognizable frames and perforations
- [ ] filmstrip includes expressive bends / loops / reel-like gestures
- [ ] page does not read as isolated marketing cards
- [ ] scroll down feeds/extends the film
- [ ] scroll up rewinds/compresses the film
- [ ] kinetic typography is used for focal words
- [ ] at least two transitions use object/frame handoff
- [ ] sections can add text without changing film internals
- [ ] sections can add buttons/CTAs without changing film internals
- [ ] sections can add images/media without changing film internals
- [ ] sections can add milestones/years without changing film internals
- [ ] film frames are reusable/data-driven
- [ ] `/create` still works
- [ ] `/wall` still works
- [ ] API and Socket.IO behavior remain unchanged
- [ ] desktop/tablet/mobile layouts work
- [ ] reduced-motion mode works
- [ ] type-check/build pass

---

# 18. Final Codex directive

> Replace the existing landing visual language completely. Use SuperPlay as the reference for energy, kinetic typography, playful staging, bounce/overshoot, scroll choreography, and continuous motion — but do not copy its brand assets. The unique FLASH 10 visual spine is one continuous filmstrip path running through the center of the page. Build the filmstrip as a real ribbon with frame windows and perforations, not a thin line. Every scene must attach to this same film system and be able to add text, buttons, images, milestones, media, and CTAs without rewriting the film internals. Scroll down should feed/extend the reel; scroll up should rewind/compress it. Remove the current routePath, CSS characters, orbit/planet art, generic fade-up reveals, and old editorial-card styling from the landing implementation while preserving `/create`, `/wall`, API, persistence, and realtime behavior.

The filmstrip is not decoration.

**The filmstrip is the landing-page architecture.**