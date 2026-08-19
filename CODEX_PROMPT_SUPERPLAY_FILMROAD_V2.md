# Codex Task — Implement SuperPlay-Style Film Road Landing V2

## Mission

Implement the new `/` landing page now.

The authoritative design contract is:

`INSTRUCTIONS_SUPERPLAY_FILMROAD_V2.md`

Read that file completely before editing code. Also inspect the current implementation before making changes.

This task is a **landing-page replacement**, not a restyle of the current landing.

The final result should reproduce the interaction language of the public SuperPlay website — pinned stage choreography, scroll-as-playhead, oversized kinetic typography, layered parallax, foreground takeovers, continuous transitions, and object handoffs — while using an original FLASH 10 visual system and a central perspective photographic filmstrip road.

Do not copy SuperPlay proprietary assets, characters, source code, logo, or exact copywriting.

---

# 1. Repository safety boundary

Only redesign route `/` and landing-specific code.

Preserve these existing product flows unchanged:

- `/create`
- `/wall`
- drawing/template logic
- scanner/live-wall logic
- Socket.IO
- API behavior
- persistence/storage
- server behavior

Do not migrate frameworks.

Keep the current stack:

- React
- Vite
- TypeScript
- React Router
- GSAP
- ScrollTrigger

Do not add Next.js.
Do not add Three.js/WebGL for this version.
Do not add another animation library.
Do not add Lenis until the native-scroll implementation is already stable; preferably do not add it in this task.

Before changing shared CSS, confirm the selector is landing-only.

---

# 2. First action — audit, then replace

Inspect at minimum:

- `client/src/App.tsx`
- `client/src/pages/LandingPage.tsx`
- `client/src/styles.css`
- `client/package.json`
- existing landing-related components/config/visuals if present

Identify what belongs only to the old landing.

Then remove the old landing design language instead of building on top of it.

The new `/` must no longer rely on the old concepts such as:

- `routePath`
- thin page-wide SVG path
- `Character` runner/reader/walker placeholders
- orbit/planet/sun/board illustrations
- old editorial cards
- generic `[data-landing-reveal]`
- repeated fade-up section reveals

Do not leave dead legacy landing layers underneath the new experience.

Do not delete shared application behavior.

---

# 3. Required architecture

Do not place the entire implementation inside `LandingPage.tsx`.

Create a maintainable landing module. A recommended shape is:

```text
client/src/landing/
├── film/
│   ├── FilmRoad.tsx
│   ├── filmRoadGeometry.ts
│   └── filmRoadConfig.ts
│
├── scenes/
│   ├── HeroScene.tsx
│   ├── ManifestoScene.tsx
│   ├── MediaScene.tsx
│   ├── TakeoverScene.tsx
│   ├── CultureScene.tsx
│   └── FinalScene.tsx
│
├── animation/
│   ├── useLandingScroll.ts
│   ├── createHeroTimeline.ts
│   ├── createManifestoTimeline.ts
│   ├── createMediaTimeline.ts
│   ├── createTakeoverTimeline.ts
│   ├── createCultureTimeline.ts
│   ├── createFinalTimeline.ts
│   └── motionConfig.ts
│
└── components/
    ├── KineticText.tsx
    ├── FloatingObject.tsx
    └── SceneStage.tsx
```

This exact tree is not mandatory if the repository suggests a cleaner equivalent, but preserve these responsibilities:

- Film Road geometry is isolated.
- Motion configuration is isolated from JSX.
- Major scenes have their own choreography.
- `LandingPage.tsx` mainly composes the experience.
- GSAP lifecycle cleanup is safe.

Avoid React state updates on every scroll frame.
Use refs, transforms, SVG attributes, GSAP timelines, and normalized progress instead.

---

# 4. Quality Gate 1 — Film Road first

Do not begin decorative scene polish until the Film Road itself works.

Build one persistent perspective photographic filmstrip running near the center of the viewport.

The supplied visual direction is a road that narrows toward a horizon near the upper center and widens toward the viewer near the bottom.

The result must immediately read as **photographic film**, not two road lines.

Required visual anatomy:

- dark continuous film body
- central frame windows
- frame separators
- sprocket/perforation holes on both sides
- perspective scaling from far to near
- enough visible depth layers to create travel
- reusable active-frame concept

Starting desktop composition:

```text
horizon Y              ≈ 18–30vh
far film width          ≈ 12–18vw
near film width         ≈ 48–62vw
center X                ≈ 50vw
```

These are tuning ranges, not hard requirements.

Scrolling down must visibly feed the film toward the viewer:

```text
far frame approaches
→ grows
→ perforations advance
→ active frame travels through stage
→ frame exits near foreground
→ next frame follows
```

Scrolling up must rewind the same system naturally.

Do not fake this with a one-time entrance animation.
It must be tied to scroll progress.

Prefer SVG + DOM + GSAP.

Gate 1 passes only when:

1. film is unmistakably photographic film;
2. perspective reads clearly;
3. scroll down advances it;
4. scroll up rewinds it;
5. animation is smooth without React render loops.

If Gate 1 fails, fix it before proceeding.

---

# 5. Quality Gate 2 — SuperPlay-like Hero stage

Build the Hero as the primary motion-quality test.

The Hero must be a stage, not an ordinary 100vh block that scrolls away.

Use a pinned ScrollTrigger timeline with scrub.

Initial composition should include:

- large `FLASH 10` typography or equivalent original FLASH placeholder copy
- Film Road already visible
- 3–6 simple original graphic objects at different depth layers
- one short manifesto line

Use local CSS/SVG geometric placeholders if final event artwork does not exist yet.
Do not fetch or reuse SuperPlay assets.

Hero motion should approximately follow:

```text
0–15%   HOLD / ORIENT
15–35%  REACT
35–60%  TRANSFORM
60–82%  TAKEOVER
82–95%  HANDOFF
95–100% NEXT SCENE FORMS
```

The Film Road must visibly participate during every major phase.

Hero failure conditions:

- whole hero simply scrolls upward
- film remains static
- typography only fades out
- all objects use the same movement speed
- next scene enters like a normal stacked section

Gate 2 passes only if the first scroll already feels like controlling an animated campaign sequence.

---

# 6. Quality Gate 3 — Build the full scene chain

After the Hero works, implement this temporary V2 scene sequence:

```text
01 Hero
   ↓
02 Manifesto
   ↓
03 Floating Media
   ↓
04 Graphic Takeover
   ↓
05 Culture / Memory
   ↓
06 Final CTA
```

These are motion scaffolds. Final FLASH event decorations and final content will be replaced later.

Do not create six isolated cards.
The page must visually behave as one connected world.

Use at least four distinct transition patterns across the page:

- scale takeover
- foreground directional sweep
- typography replacement
- object/frame handoff
- background color takeover
- film bend/loop/opening transition

At least two transitions must use an actual handoff where an element from Scene A remains visible and becomes part of Scene B.

Example:

```text
active film frame in Hero
→ enlarges
→ survives the transition
→ becomes image/media frame in Manifesto
```

Another example:

```text
floating media fragment
→ crosses foreground
→ remains on screen
→ becomes graphic token in Takeover
```

Do not use `opacity: 0` + `translateY(...)` as the main transition language.

---

# 7. SuperPlay-style motion grammar

Use these principles throughout.

## Scroll as playhead

Main scene choreography should be deterministic from scroll position.

Prefer one primary ScrollTrigger timeline per major pinned stage rather than many unrelated triggers for tiny elements.

Typical structure:

```ts
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: scene,
    start: "top top",
    end: "+=...",
    pin: true,
    scrub: 0.6,
    anticipatePin: 1,
    invalidateOnRefresh: true,
  },
});
```

Tune scene distances. Do not blindly use the same `end` for every stage.

## Depth

Use at least three perceptual depth layers where appropriate:

```text
background       slow
midground        medium
foreground       fast / larger travel
```

Use transform and scale to create depth.

## Typography

Typography is part of the choreography.

Allow large words to:

- crop outside viewport
- rotate
- scale beyond viewport
- slide through foreground
- replace another composition
- become a transition surface

Avoid long marketing paragraphs in V2.
Use short placeholder manifesto copy.

## Controlled chaos

The composition can be energetic, but each scene needs one clear focal action.
Do not move everything randomly.

---

# 8. Film Road scene behavior

The Film Road is persistent and should change character between scenes.

Allow controlled variants such as:

```text
perspective road
→ wider bend
→ active frame straight zone
→ loose curve
→ compressed section
→ road-like perspective again
```

Do not recreate a completely separate film object for every scene.

Scene code may control local film parameters such as:

- center offset
- horizon offset
- perspective width
- frame spacing
- bend amount
- active frame emphasis
- depth travel

Centralize these parameters in config where practical.

The same scroll position should resolve to approximately the same film composition regardless of scroll velocity.

Velocity may only add small transient overshoot after the base system works.

---

# 9. Visual direction for V2

The user will decorate each section later, so prioritize composition and motion quality over final illustration work.

For now use:

- bold high-contrast backgrounds
- oversized sans-serif display type
- simple circles, stars, rectangles, stickers, fragments, fake photo cards, abstract symbols
- 2D objects at varied depth
- original placeholder imagery generated from CSS/SVG/local shapes

Avoid returning to the old landing's visual language:

- soft editorial cards everywhere
- quiet pastel story page
- vintage scrapbook composition
- thin decorative route line
- CSS stick people

Do not spend most of the task drawing detailed illustrations.
The scroll engine and scene choreography are the priority.

---

# 10. Performance rules

Animate primarily:

- `transform`
- `opacity`
- SVG transform/geometry values where necessary

Avoid layout-thrashing scroll handlers.

Do not continuously animate `top`, `left`, `width`, or `height` from raw scroll listeners if transforms can solve it.

Use `will-change` selectively, not on every element forever.

Do not create hundreds of DOM nodes for film frames/perforations if a smaller recycled/repeated visual system works.

Use `gsap.context()` or equivalent scoped lifecycle cleanup.
Destroy all ScrollTriggers created by landing components on unmount.

Call `ScrollTrigger.refresh()` only where necessary after layout/assets settle.

---

# 11. Responsive behavior

Desktop is the art-direction reference, but mobile must remain functional.

Do not simply scale desktop down.

On mobile:

- preserve the Film Road concept
- preserve scroll-as-playhead
- shorten pin distances
- use fewer simultaneous floating objects
- reduce parallax distance
- reduce extreme typography scale
- keep film perspective readable
- ensure CTA remains tappable

Test at least representative widths around:

- 1440px
- 1024px
- 768px
- 390px

Do not remove the Film Road on mobile.

---

# 12. Reduced motion

Respect `prefers-reduced-motion: reduce`.

Reduced motion should:

- preserve all content
- keep Film Road recognizable
- remove or simplify long pinned scrub sequences where needed
- disable extreme fly-through/takeover movement
- keep navigation and CTA immediately usable

Do not hide important content when motion is reduced.

---

# 13. Final CTA and route safety

The landing must still provide working navigation to the existing product routes.

At minimum include functional links/buttons for:

```text
CREATE YOUR MEMORY → /create
VIEW LIVE WALL      → /wall
```

Use `Link` from React Router as appropriate.

Do not gate route navigation behind completion of decorative animation.

---

# 14. Validation commands

Before declaring completion, run from `client/`:

```bash
npm run check
npm run build
```

Fix all TypeScript/build errors caused by this task.

Also search the resulting landing implementation for obsolete old-landing concepts and remove dead code/styles when safe.

Manually reason through reverse scrolling and cleanup behavior.

Do not modify unrelated files merely to silence errors.

---

# 15. Definition of Done

The task is complete only when all of the following are true:

- `/` is no longer the old editorial/card landing.
- old thin `routePath` experience is gone.
- one continuous perspective Film Road is the visual spine.
- film includes frames and sprocket holes.
- film advances on scroll down and rewinds on scroll up.
- Hero uses pinned scrub choreography.
- there are six temporary motion scenes.
- scenes feel connected rather than stacked.
- at least four different transition patterns are used.
- at least two object/frame handoffs occur.
- layered parallax/depth is visible.
- oversized kinetic typography is used.
- native scrolling is stable.
- mobile still preserves the concept.
- reduced-motion behavior exists.
- `/create` still works.
- `/wall` still works.
- no SuperPlay proprietary assets/code are copied.
- `npm run check` passes.
- `npm run build` passes.

---

# 16. Implementation order — do not skip

Work in this order:

```text
1. audit existing landing
2. remove obsolete landing composition
3. create new landing module structure
4. build static Film Road
5. make Film Road travel forward/reverse with scroll
6. build Hero pinned choreography
7. verify Hero quality gate
8. implement Hero → Manifesto handoff
9. build remaining scene chain
10. add varied transition patterns
11. tune perspective/parallax/typography
12. responsive pass
13. reduced-motion pass
14. clean dead landing CSS/code
15. run typecheck + build
16. report changed files and remaining visual placeholders
```

Do not rush to Step 9 if the Film Road and Hero still feel like a normal scrolling website.

---

# 17. Final report format

When implementation is finished, respond with a concise engineering report containing:

### Implemented
Summarize the new Film Road, scenes, and motion system.

### Removed
List old landing concepts/files/styles removed or retired.

### Files changed
List the important files created/modified.

### Verification
Report results of:

```text
npm run check
npm run build
```

### Visual placeholders remaining
Explicitly identify which graphics/copy are temporary so they can be decorated later.

### Next recommended art-direction pass
Give at most 3 concrete next improvements after the motion foundation is stable.

Do not claim success if the build does not pass or if `/create` or `/wall` were broken.