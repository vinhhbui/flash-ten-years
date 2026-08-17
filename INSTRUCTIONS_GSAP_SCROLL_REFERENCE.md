# FLASH 10 — GSAP SVG Scroll Reference Prototype

## 0. Purpose

This document is a **secondary implementation instruction** for the `flash-ten-years` repository.

The repository already has a primary `INSTRUCTIONS.md` describing the FLASH 10 Memory Cat Interactive Wall. **Do not replace or reinterpret that main product specification.**

This file exists for one focused task:

> Recreate the UI and scroll-driven SVG animation from the Codegrid tutorial as faithfully as possible, first as an isolated reference prototype, so the interaction can later be reused inside FLASH 10.

Reference tutorial:

- YouTube: https://www.youtube.com/watch?v=PAf8gN7p2eg
- GSAP ScrollTrigger docs: https://gsap.com/docs/v3/Plugins/ScrollTrigger/
- SVG `stroke-dashoffset`: https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/stroke-dashoffset

The target is a **visual and behavioral recreation**, not a copy of the creator's proprietary source code.

---

# 1. Relationship to the main FLASH 10 project

The primary project remains:

```text
React
Vite
TypeScript
react-konva / Konva.js
GSAP
Socket.IO
Node / Express
```

Do not rewrite the main application as vanilla HTML because of this experiment.

For the first pass, reproduce the tutorial in an isolated folder:

```text
flash-ten-years/
├── INSTRUCTIONS.md
├── INSTRUCTIONS_GSAP_SCROLL_REFERENCE.md
│
├── prototypes/
│   └── codegrid-svg-scroll/
│       ├── index.html
│       ├── style.css
│       ├── script.js
│       ├── REFERENCE_NOTES.md
│       └── assets/
│           ├── images/
│           └── svg/
│
├── client/
└── server/
```

The prototype must not break `/create`, `/wall`, server APIs, Socket.IO, or any existing project functionality.

Only after the prototype is visually accepted should selected techniques be ported into the React application.

---

# 2. Codex mission

Recreate the reference tutorial in four dimensions:

1. **Layout**
   - section heights
   - content placement
   - whitespace
   - SVG position
   - image/text relationships

2. **Visual design**
   - typography
   - font sizes
   - background
   - foreground colors
   - SVG stroke color
   - stroke width
   - line caps and joins
   - spacing and scale

3. **Animation**
   - path draw progression
   - scroll start
   - scroll end
   - scrub feel
   - smooth reversal when scrolling upward
   - any secondary text/image motion visible in the reference

4. **Scroll feel**
   - drawing progress must feel attached to scroll position
   - no sudden jumps
   - no autoplay replacing scroll-linked behavior
   - scroll upward must rewind the drawing naturally

The reference video is the visual source of truth.

Do not redesign the page before a faithful reference version exists.

---

# 3. Technology for the reference prototype

Use only:

```text
HTML
CSS
JavaScript
SVG
GSAP
ScrollTrigger
```

Do not use for the isolated prototype:

- React
- Next.js
- Vue
- Three.js
- Canvas
- WebGL
- jQuery
- Framer Motion
- custom scroll engines

Reason: the goal is to isolate the technique and make visual matching/debugging easy.

This restriction applies only to `prototypes/codegrid-svg-scroll/`, not to the production FLASH 10 app.

---

# 4. Reference-analysis phase

Before coding the final animation, create:

```text
prototypes/codegrid-svg-scroll/REFERENCE_NOTES.md
```

Record observations from the tutorial:

```text
Approximate reference viewport:
Approximate section count:
Approximate total page height:
Background color:
Primary text color:
SVG stroke color:
SVG stroke width:
SVG linecap:
Primary font style:
Heading scale:
Body scale:

Section 1:
Section 2:
Section 3:
...

SVG begins drawing when:
SVG finishes drawing when:

Secondary animations:
- ...
```

If exact values are not visible, estimate from proportions, then refine by side-by-side comparison.

Do not invent complex behavior that cannot be observed.

---

# 5. Suggested HTML structure

A conceptual starting point:

```html
<body>
  <main class="page">
    <section class="hero section">...</section>

    <section class="story story--01 section">...</section>
    <section class="story story--02 section">...</section>
    <section class="story story--03 section">...</section>

    <div class="svg-layer" aria-hidden="true">
      <svg class="scroll-svg" viewBox="..." preserveAspectRatio="...">
        <path class="path-base" d="..." />
        <path class="path-progress" d="..." />
      </svg>
    </div>

    <section class="outro section">...</section>
  </main>
</body>
```

This is not mandatory structure. Adjust the section count and ordering to match the video.

Keep the DOM semantic and small.

---

# 6. SVG architecture

The animated line must be a real SVG `<path>`.

Do not fake the route with dozens of positioned `<div>` elements.

If the reference visibly shows a faint track behind the animated line, use two copies of the same path:

```html
<path class="path-base" d="..." />
<path class="path-progress" d="..." />
```

Conceptual CSS:

```css
.path-base,
.path-progress {
  fill: none;
  vector-effect: non-scaling-stroke;
}

.path-base {
  opacity: 0.15;
}

.path-progress {
  stroke-linecap: round;
  stroke-linejoin: round;
}
```

If no background track is visible in the reference, do not add one merely for decoration.

---

# 7. Recreate the SVG route

The visual route of the path matters as much as the animation.

Recommended workflow:

1. Identify major bends, loops, and direction changes from video frames.
2. Recreate the route in SVG coordinates.
3. Use Bézier curves for smooth sections.
4. Keep the exported path clean: avoid unnecessary nested transforms/groups.
5. Match where the path passes relative to text/images.
6. Test the static full path before adding animation.

The path must stay aligned to the content after resize.

Fix coordinate/layout architecture instead of compensating with many arbitrary `top`, `left`, or transform offsets.

---

# 8. Core drawing technique

The default implementation should use native SVG stroke properties plus GSAP.

Core mechanism:

```text
SVG path
    ↓
getTotalLength()
    ↓
strokeDasharray = pathLength
strokeDashoffset = pathLength
    ↓
GSAP animates strokeDashoffset
    ↓
ScrollTrigger maps tween progress to scroll
    ↓
strokeDashoffset → 0
```

Baseline implementation:

```js
gsap.registerPlugin(ScrollTrigger);

const path = document.querySelector(".path-progress");
const pathLength = path.getTotalLength();

gsap.set(path, {
  strokeDasharray: pathLength,
  strokeDashoffset: pathLength
});

gsap.to(path, {
  strokeDashoffset: 0,
  ease: "none",
  scrollTrigger: {
    trigger: ".page",
    start: "top top",
    end: "bottom bottom",
    scrub: true
  }
});
```

The values above are only a baseline.

Tune `trigger`, `start`, `end`, and `scrub` to match the reference.

---

# 9. Do not assume DrawSVGPlugin

The visual effect can be implemented without GSAP DrawSVGPlugin.

Start with:

```text
path.getTotalLength()
strokeDasharray
strokeDashoffset
```

Do not add DrawSVGPlugin merely because the effect resembles it.

If later evidence from the tutorial/source clearly proves it is required, it may be substituted, but the visible result matters more than an invisible implementation detail.

---

# 10. ScrollTrigger tuning

During development use markers:

```js
gsap.to(path, {
  strokeDashoffset: 0,
  ease: "none",
  scrollTrigger: {
    trigger: ".page",
    start: "top top",
    end: "bottom bottom",
    scrub: true,
    markers: true
  }
});
```

Remove markers before finalizing.

Test at minimum:

```js
scrub: true
scrub: 0.5
scrub: 1
```

Use whichever feels closest to the tutorial.

`ease: "none"` is the default choice for the main scroll-linked path because drawing progress should map predictably to scrollbar progress.

Do not add wheel-direction handlers unless there is a demonstrated reason.

Correct behavior should happen automatically:

```text
scroll down
→ path draws forward

scroll up
→ path retracts backward
```

---

# 11. CSS positioning strategy

First determine whether the reference SVG behaves as:

- an absolute layer over one long page/section
- a sticky layer
- a fixed layer

Do not default to `position: fixed` without observing the video.

A likely base architecture is:

```css
.page {
  position: relative;
  overflow: clip;
}

.section {
  position: relative;
  min-height: 100vh;
}

.svg-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.scroll-svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}
```

Change this only to reproduce the observed result.

---

# 12. Development order

Follow this sequence.

## Phase 1 — Static skeleton

Build all page sections without GSAP.

Exit condition:

- content flow resembles the video
- section heights are approximately correct
- typography and spacing are directionally correct

## Phase 2 — Static SVG

Render the complete path with no draw animation.

Exit condition:

- major curves match the tutorial
- path passes content in the correct places
- resize does not destroy alignment

Do not proceed until static geometry is credible.

## Phase 3 — Hidden/revealed stroke states

Verify manually:

```js
strokeDashoffset = pathLength;
```

hides the progress path, and:

```js
strokeDashoffset = 0;
```

shows it completely.

## Phase 4 — Time-based test

Temporarily test:

```js
gsap.to(path, {
  strokeDashoffset: 0,
  duration: 3,
  ease: "none"
});
```

This isolates path/stroke bugs from ScrollTrigger bugs.

## Phase 5 — ScrollTrigger

Replace timed playback with scroll-driven progress.

Tune:

```text
trigger
start
end
scrub
```

## Phase 6 — Secondary animations

Only after the main path is correct, reproduce visible text/image entrances or motion.

## Phase 7 — Visual matching

Refine:

- typography
- stroke weight
- colors
- image scale
- section heights
- whitespace
- exact path route
- animation timing

## Phase 8 — Responsive

Desktop fidelity comes first if desktop is what the tutorial demonstrates.

Then adapt for:

```text
1440 × 900
1366 × 768
1024 × 768
768 × 1024
390 × 844
```

## Phase 9 — Cleanup

Remove:

- ScrollTrigger markers
- debug logs
- unused CSS
- abandoned experiments
- duplicate animation instances

---

# 13. Visual comparison workflow

Do not judge fidelity from memory.

Compare local screenshots to video frames at approximately:

```text
0%
10%
25%
50%
75%
90%
100%
```

At each checkpoint inspect:

1. how much of the SVG is drawn
2. position of the draw head
3. path geometry
4. location of major text/images
5. typography scale
6. whitespace
7. section boundaries

If the draw head is spatially wrong, fix the SVG/layout.

If the draw head is consistently ahead or behind while geometry is correct, tune ScrollTrigger `start`/`end`.

---

# 14. Secondary animations

Keep secondary animations separate from the main SVG tween.

Example pattern:

```js
gsap.from(".story-title", {
  y: 40,
  opacity: 0,
  duration: 1,
  scrollTrigger: {
    trigger: ".story-title",
    start: "top 80%"
  }
});
```

Do not invent secondary motion if the reference does not show it.

The SVG path remains the primary interaction.

---

# 15. Resize and refresh handling

After fonts/images/layout are loaded:

```js
window.addEventListener("load", () => {
  ScrollTrigger.refresh();
});
```

If path geometry changes by breakpoint, recalculate `getTotalLength()`.

Do not create duplicate ScrollTrigger instances on every resize event.

If rebuilding an animation, kill the previous instance first.

---

# 16. Performance rules

Prefer:

- transforms
- opacity
- SVG stroke properties required for the path

Avoid expensive custom scroll listeners such as:

```js
window.addEventListener("scroll", () => {
  // repeated layout reads/writes on every scroll event
});
```

when ScrollTrigger can manage the lifecycle.

The prototype should remain smooth on a normal modern laptop and mobile browser.

---

# 17. Reduced motion

Respect:

```css
@media (prefers-reduced-motion: reduce)
```

For reduced motion:

- show the complete SVG route
- disable or minimize decorative scrub animations
- preserve all information/content

The scroll animation must enhance the page, not gate required content.

---

# 18. Debugging checklist

Before blaming ScrollTrigger, test in this order:

1. `document.querySelector()` returns the path.
2. `path.getTotalLength()` returns a positive value.
3. the path has a visible `stroke`.
4. the path has `fill: none` if appropriate.
5. dasharray/dashoffset hide the line correctly.
6. setting dashoffset to `0` shows the full line.
7. a normal 3-second GSAP tween draws it correctly.
8. ScrollTrigger is loaded and registered.
9. ScrollTrigger markers appear in the expected place.
10. `start`/`end` are tuned against the reference.

Common failures:

```text
Full line visible immediately
→ dash initialization is wrong.

Nothing draws
→ inspect stroke, path length, GSAP loading, plugin registration.

Animation plays once instead of following scroll
→ scrub is missing.

Animation feels disconnected
→ scrub duration/start/end/easing are wrong.

SVG drifts away from content
→ page and SVG use incompatible coordinate systems.
```

---

# 19. Definition of done for the prototype

The reference prototype is not done merely because an SVG line animates.

All of these must pass:

- [ ] page structure visibly resembles the tutorial
- [ ] SVG route resembles the tutorial
- [ ] initial unrevealed state is correct
- [ ] downward scroll progressively draws the path
- [ ] upward scroll retracts the path naturally
- [ ] ScrollTrigger controls the animation
- [ ] progress feels synchronized with scroll
- [ ] no obvious animation jumps
- [ ] section timing is close to the reference
- [ ] typography is close
- [ ] colors are close
- [ ] image/content placement is close
- [ ] desktop layout is visually faithful
- [ ] responsive behavior is acceptable
- [ ] no console errors
- [ ] no debug markers remain
- [ ] existing FLASH 10 application behavior is untouched

---

# 20. Porting into the React/Vite FLASH 10 app

Do **not** perform this step until the isolated prototype has been accepted.

When porting later:

1. preserve existing React/Vite/TypeScript architecture
2. convert the relevant page/sections into React components
3. keep the SVG as an inline SVG or dedicated component when DOM path access is required
4. initialize GSAP inside lifecycle-safe React code
5. scope selectors using refs or `gsap.context()`
6. clean up ScrollTrigger instances on component unmount
7. preserve the tuned path geometry and animation timing from the prototype

Conceptual React cleanup pattern:

```ts
useLayoutEffect(() => {
  const ctx = gsap.context(() => {
    // GSAP + ScrollTrigger setup
  }, rootRef);

  return () => ctx.revert();
}, []);
```

Do not rebuild the animation from scratch during the React migration unless necessary.

---

# 21. Potential FLASH 10 use after validation

Once the reference technique is working, it can be adapted into the event experience without changing the original tutorial-clone milestone.

Possible future uses:

```text
FLASH 10 timeline
→ SVG line draws through milestones as the guest scrolls.

Memory journey
→ line connects submitted artworks / memories.

Event landing page
→ scrolling reveals a continuous visual path through sections.

Live memory archive
→ the route connects artwork cards, photos, and anniversary moments.
```

These are **future adaptation ideas**, not requirements for the first prototype.

Do not mix them into the reference clone until the clone is complete.

---

# 22. Codex execution instruction

When working on this task:

1. Read the root `INSTRUCTIONS.md` first to understand the main project.
2. Read this file completely.
3. Do not modify main product behavior for the reference experiment.
4. Create `prototypes/codegrid-svg-scroll/`.
5. Create `REFERENCE_NOTES.md` from tutorial observations.
6. Build the static layout first.
7. Build the static SVG path second.
8. Verify path geometry and alignment.
9. Implement dasharray/dashoffset drawing.
10. Test the path with a simple timed tween.
11. Add ScrollTrigger.
12. Tune `start`, `end`, and `scrub` against the video.
13. Add only the secondary animations that are visible in the reference.
14. Compare several scroll checkpoints side-by-side with the video.
15. Fix console/runtime errors.
16. Remove debug markers/logs.
17. Report remaining visual differences.

Do not stop after boilerplate.

Do not declare completion merely because scrolling changes `strokeDashoffset`.

The goal is a visually convincing recreation of the reference tutorial while keeping the existing FLASH 10 project safe and ready for later integration.
