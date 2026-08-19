# FLASH 10 — SuperPlay Scroll Choreography Contract

This file is an **authoritative addendum** to `INSTRUCTIONS_FILMSTRIP_LANDING.md` for route `/`.

Read both files before changing landing code.

If there is any ambiguity about how scroll should feel, this file wins for:

- pinning behavior
- scrub timing
- stage continuity
- scene progress mapping
- object handoff
- filmstrip feed/rewind behavior
- transition pacing

The goal is not to copy SuperPlay source code or assets. The goal is to reproduce the same **type of scroll experience**: the viewport behaves like an animated stage, scroll acts as the playhead, and compositions transform inside that stage instead of behaving like ordinary stacked sections.

---

# 1. Non-negotiable scroll principle

The final page must NOT behave like:

```text
scroll
→ section moves upward
→ text fades in
→ next section appears
```

It MUST behave closer to:

```text
scroll input
→ current stage remains visually controlled
→ internal composition transforms
→ filmstrip advances / bends / opens
→ typography and supporting objects react
→ foreground transition occurs
→ one object/frame survives
→ next composition forms
→ stage releases or re-pins
```

The user should often feel that the camera/viewport is nearly stationary while the composition changes inside it.

Use `pin` where necessary to create this feeling.

---

# 2. Master stage model

Each major story beat is a **stage**, not a normal section.

Recommended conceptual structure:

```text
[ incoming transition ]
        ↓
[ settle state ]
        ↓
[ pinned transformation ]
        ↓
[ takeover / handoff ]
        ↓
[ next stage ]
```

Each stage should have one primary ScrollTrigger timeline.

Do not attach separate unrelated ScrollTriggers to every tiny object.

Use timeline labels and nested tweens where useful.

Suggested pattern:

```ts
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: scene,
    start: "top top",
    end: "+=2200",
    pin: true,
    scrub: 0.8,
    anticipatePin: 1,
    invalidateOnRefresh: true,
  },
});
```

The exact `end` distance must be tuned per scene.

Do not blindly use `+=2200` everywhere.

---

# 3. Universal progress contract for pinned scenes

For every major pinned scene, design the choreography around these approximate progress bands.

These are choreography percentages, not exact hard-coded numbers.

```text
0% ───────────────────────────────────────── 100%
│
├─ 00–15%  HOLD / ORIENT
├─ 15–35%  REACT
├─ 35–60%  TRANSFORM
├─ 60–82%  TAKEOVER
├─ 82–95%  HANDOFF
└─ 95–100% RELEASE / NEXT STATE
```

## 00–15% — Hold / orient

The user should understand the current composition before it changes dramatically.

Allowed motion:

- subtle film feed
- small parallax
- tiny object drift
- active frame focus
- minor text tension / scale

Do not immediately destroy the composition at progress 0.01.

## 15–35% — React

The current scene visibly reacts to scroll.

Examples:

- film bends open
- adjacent frames move apart slightly
- focal word translates or rotates
- foreground objects start entering
- active frame begins scaling

This is where the page should stop feeling like ordinary document scroll.

## 35–60% — Transform

The composition changes substantially.

Examples:

- large typography crosses the viewport
- active film frame enlarges
- filmstrip changes curve or orientation
- image fragment crosses foreground
- background color begins takeover

Multiple elements may move simultaneously, but there must still be a focal point.

## 60–82% — Takeover

One dominant visual action prepares the next beat.

Examples:

- giant `10` grows beyond viewport
- active film frame expands toward camera
- colored shape covers most of screen
- film loop sweeps across viewport
- giant word becomes the next background field

Avoid simply fading the old scene out.

## 82–95% — Handoff

At least one object survives into the next scene.

Examples:

```text
film frame A
→ remains visible
→ moves into Scene B

photo fragment
→ crosses boundary
→ becomes connection node

identity sticker
→ enlarges
→ becomes Memory Cat reveal frame
```

This is a key part of the SuperPlay-like continuous feel.

## 95–100% — Release / next state

The current pinned scene resolves cleanly.

The next scene should already feel visually connected before the old pin releases.

Avoid a blank gap between scenes.

---

# 4. Filmstrip motion contract

The filmstrip is the permanent visual spine.

It must respond to the same scroll progress as the stage.

## Scroll down

```text
feed forward
→ active frame advances
→ local curve opens
→ nearby frame spacing expands slightly
→ next bend becomes visible
```

## Scroll up

```text
rewind
→ active frame moves backward
→ curve tightens
→ nearby frame spacing compresses slightly
→ prior composition restores
```

The effect should feel springy / reel-like but controlled.

Do not use a full physics engine for V1.

Use GSAP interpolation and scroll-linked progress first.

The film must never feel like a static decoration while only text animates.

---

# 5. Filmstrip deformation rules

The film cannot be one rigid SVG path that never changes visually.

Per scene, the film may animate through controlled variants such as:

```text
compressed coil
→ open curve
→ straight-ish active frame zone
→ large bend
→ next coil
```

Implementation options:

1. interpolate wrapper transforms around local path segments;
2. swap between a small set of compatible path shapes;
3. use MotionPath-like sampling from a single geometry source while animating frame offsets and local ribbon transforms;
4. animate a dedicated local loop/coil component that visually connects to the shared film spine.

Do not rebuild hundreds of coordinates on every scroll event.

Do not use React state per frame.

---

# 6. Scroll velocity response

The base animation must be deterministic from scroll progress.

Optional enhancement after the base experience works:

Use ScrollTrigger velocity only for **small transient reactions**, for example:

- slight extra film stretch
- tiny rotational overshoot
- quick foreground object impulse

Do not let velocity determine layout state.

The same scroll position should always resolve to approximately the same main composition.

---

# 7. Hero choreography contract

The Hero is the quality gate.

Do not continue to other scenes until the Hero already feels like an animated campaign stage.

Suggested initial state:

```text
FLASH 10
large filmstrip already visible
3–6 supporting original FLASH objects
short manifesto line
```

## Entrance before scroll

Use a short non-scroll intro:

```text
background field appears
→ film snaps / uncoils into recognizable position
→ FLASH enters with impact
→ 10 overshoots
→ supporting objects zip in
→ settle
```

Avoid long loader-like animation.

## Hero scroll progress

### 0–15%

- composition holds
- film feeds slightly
- subtle depth movement

### 15–35%

- `FLASH` begins translating/rotating
- film bend opens
- 1–2 foreground assets start crossing

### 35–60%

- `10` enlarges strongly
- film frames advance
- supporting objects separate at different depth speeds

### 60–82%

- giant `10`, film frame, or colored shape becomes takeover element
- most old composition exits without generic fade

### 82–95%

- one film frame remains visible and becomes the first Timeline frame

### 95–100%

- Timeline composition is already readable before Hero releases

Hero failure conditions:

- whole hero simply moves upward
- text only fades out
- film remains static
- next section enters from below like normal document flow

---

# 8. Timeline / 10 Years choreography

Main anchor:

```text
filmstrip + active memory frame + year / 10-year typography
```

Suggested progress:

### 0–15%

- inherited Hero frame settles
- timeline years become legible

### 15–35%

- frames advance along film
- one active frame enlarges
- neighboring frames parallax subtly

### 35–60%

- vertical scroll drives partial horizontal film travel
- years / short labels replace one another
- one image comes toward camera

### 60–82%

- active frame shrinks back into film
- one photo fragment detaches from the reel
- film creates a larger bend leading into Connection

### 82–95%

- detached fragment survives
- becomes a node/card in Connection

### 95–100%

- Connection composition already formed

Do not create a conventional horizontal carousel with manual buttons as the main behavior.

---

# 9. Kết Nối choreography

Goal:

```text
separate pieces become one connected composition
```

Suggested progress:

### 0–15%

- inherited fragment enters
- film stabilizes through center

### 15–35%

- multiple memory pieces approach the film
- local connection lines/nodes appear

### 35–60%

- pieces cluster
- giant `KẾT NỐI` crosses behind or through film
- film bend becomes tighter / more energetic

### 60–82%

- cluster compresses into one central arrangement
- typography grows/crops

### 82–95%

- cluster releases
- one colored identity token remains

### 95–100%

- identity token becomes the starting object of Bản Sắc

The old page-wide thin SVG route must not return here.

A local connection path is allowed only as supporting visual language.

---

# 10. Bản Sắc choreography

This should be the most graphic scene.

Suggested progress:

### 0–15%

- inherited identity token settles
- `BẢN SẮC` appears oversized

### 15–35%

- visual marks / stickers snap around the film
- selected colors activate

### 35–60%

- large word rotates / stretches / crops
- active film frame expands into visual stage

### 60–82%

- composition bursts outward
- film briefly becomes simpler and straighter to expose one central frame

### 82–95%

- central frame survives and transforms toward Flashback gallery

### 95–100%

- gallery state is visible before release

Do not make this a static grid of identity cards.

---

# 11. Flashback choreography

This is the strongest photo-reel moment.

Suggested progress:

### 0–15%

- gallery composition settles
- multiple frames visible

### 15–35%

- film opens wider
- active frame comes toward viewer

### 35–60%

- scroll produces controlled horizontal travel
- neighboring frames move with different depth

### 60–82%

- active frame recedes
- frames collapse back into continuous film
- one blank frame enters

### 82–95%

- blank frame highlights
- becomes Memory Cat reveal frame

### 95–100%

- Memory Cat stage already formed

---

# 12. Memory Cat choreography

Suggested progress:

### 0–15%

- blank frame settles
- cat silhouette appears

### 15–35%

- cat pops with squash/stretch
- 2–4 sample cats/stickers appear

### 35–60%

- samples demonstrate Float / Hop vocabulary
- film continues feeding behind them

### 60–82%

- main CTA becomes visually dominant
- supporting motion calms down

### 82–95%

- film straightens / unwinds toward final CTA

### 95–100%

- final stable CTA state is already present

Critical rule:

`CREATE YOUR MEMORY` must be clickable before decorative animation is complete.

Do not gate navigation behind scroll progress.

---

# 13. Final CTA choreography

This is intentionally calmer.

The user should arrive at a stable end state after the high-energy sequence.

The film may:

- flatten slightly
- gently continue offscreen
- leave one final frame visible

Keep:

```text
CREATE YOUR MEMORY → /create
VIEW LIVE WALL → /wall
```

Hover motion is allowed.

Do not keep the entire outro in constant chaotic movement.

---

# 14. Transition pattern requirement

Across the landing, use at least **four** different transition patterns.

Required pool:

```text
1. scale takeover
2. foreground directional sweep
3. typography replacement
4. object/frame handoff
5. background color takeover
6. film loop / coil opening
```

At least two transitions must use **object/frame handoff**.

Do not transition every scene with `opacity: 0` + `y: 40`.

---

# 15. Scrub and easing rules

For scroll-linked main transforms:

```text
scrub ≈ 0.6–1.0
```

Tune visually.

Use:

```text
ease: "none"
```

for progress-critical scrub motion unless a restrained easing improves readability.

For non-scroll impact moments:

```text
back.out
elastic.out
power3.out
power4.out
```

Do not use elastic easing on continuously scrubbed transforms.

---

# 16. Pinning rules

Pin only where it improves stage-like choreography.

Recommended:

- Hero: pinned
- Timeline: pinned
- Kết Nối: pinned
- Bản Sắc: pinned
- Flashback: pinned or semi-pinned depending on gallery implementation
- Memory Cat: pinned briefly
- Final CTA: normal stable flow is acceptable

Avoid nested pinned sections.

Avoid pinning extremely long empty scroll distances.

The user should always see meaningful visual change while scrolling through a pin.

---

# 17. Smooth-scroll rule

Native scroll must work first.

Only after all pinned stages behave correctly may Codex add Lenis or another smooth-scroll layer.

If Lenis is added:

- initialize exactly once for landing lifecycle
- sync with ScrollTrigger
- destroy on unmount
- verify touch/mobile behavior
- disable it at breakpoints where it causes instability

Smooth scrolling is polish.

It is not the source of SuperPlay-like motion quality.

---

# 18. Mobile choreography

Do not remove the filmstrip concept on mobile.

Simplify:

- fewer foreground objects
- shorter pin distances
- smaller takeover scale
- smaller path loops
- fewer simultaneous frames
- reduced parallax depth

Preserve:

- scroll-as-playhead
- feed / rewind film behavior
- active frame focus
- at least one object handoff between major beats

If long pins feel poor on touch, shorten them rather than replacing the page with static stacked cards.

---

# 19. Reduced-motion choreography

With `prefers-reduced-motion: reduce`:

- remove long pinned scrub sequences where needed
- show full content in correct order
- keep filmstrip recognizable
- reduce film deformation
- disable large fly-ins / takeovers
- keep CTA access immediate

Reduced motion must preserve content, not preserve choreography.

---

# 20. Implementation quality gates

Codex must stop and self-check after each gate.

## Gate 1 — Static filmstrip

Pass only if:

- film looks unmistakably like film
- frame windows visible
- perforations visible
- bends/loops readable

## Gate 2 — Hero

Pass only if:

- Hero is stage-like
- first scroll transforms internal composition
- film responds visibly
- typography has impact
- Hero does not simply scroll away

## Gate 3 — Hero → Timeline handoff

Pass only if:

- no blank gap
- at least one frame/object persists across transition
- next scene forms before previous pin fully releases

## Gate 4 — First three beats

Pass only if:

- Hero / Timeline / Kết Nối feel like one animation sequence
- not three independent sections
- reverse scroll restores previous states naturally

Do not build the remaining scenes until Gate 4 passes.

---

# 21. Failure conditions

The implementation is considered incorrect if any of these are true:

```text
filmstrip is static while content animates
filmstrip behaves like a decorative background
page is mostly normal vertical flow
sections are isolated cards
most reveals are fade + translateY
whole pinned scene moves upward as one block
reverse scroll does not visually restore state
next scene appears only after a blank gap
no visual object survives between scenes
takeovers rely primarily on opacity fades
```

If any failure condition is present, fix choreography before adding more content.

---

# 22. Validation checklist

Before handoff, verify:

- [ ] scroll down transforms scenes rather than merely moving sections
- [ ] scroll up naturally reverses major stage state
- [ ] Hero is pinned and immediately reactive
- [ ] Timeline is scroll-driven, not an ordinary carousel
- [ ] Kết Nối is formed through motion
- [ ] Bản Sắc uses graphic takeover motion
- [ ] Flashback expands/collapses film frames
- [ ] Memory Cat CTA remains usable early
- [ ] film continuously feeds/rewinds
- [ ] film locally opens/tightens like a flexible reel
- [ ] at least four transition patterns are used
- [ ] at least two object/frame handoffs are visible
- [ ] there are no long blank pinned zones
- [ ] reverse scrolling remains stable
- [ ] mobile keeps the filmstrip concept
- [ ] reduced motion preserves all content
- [ ] `/create` and `/wall` remain unaffected

---

# 23. Final Codex choreography directive

> Treat each major beat as a pinned animated stage, not a normal webpage section. Scroll is the playhead. The viewport should often feel stationary while typography, film frames, supporting assets, and the central filmstrip transform inside it. Use the universal progress rhythm: hold/orient → react → transform → takeover → object handoff → release. The filmstrip must feed forward and loosen on downward scroll, rewind and tighten on upward scroll, and remain visually active in every beat. Transitions must be physical and continuous, not fade-based. At least two objects/frames must survive across scene boundaries. Build and validate Hero → Timeline → Kết Nối as one uninterrupted animation sequence before implementing the rest of the page.