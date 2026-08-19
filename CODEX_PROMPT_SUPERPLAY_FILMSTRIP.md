# Codex Run Prompt — FLASH 10 SuperPlay-Inspired Filmstrip Landing

Use this prompt in Codex from the root of the `flash-ten-years` repository.

```text
Implement the new landing experience for route `/` in this repository.

Before touching code, read these files completely and treat them as authoritative for landing work:

1. INSTRUCTIONS_FILMSTRIP_LANDING.md
2. INSTRUCTIONS_SUPERPLAY_SCROLL_CHOREOGRAPHY.md

Also inspect INSTRUCTIONS.md so you understand what must remain unchanged for `/create`, `/wall`, API, Socket.IO, persistence, scanning, and LAN behavior.

Do not treat this as a greenfield project. Audit the existing implementation first, especially:

- client/src/pages/LandingPage.tsx
- client/src/styles.css
- client/package.json
- existing landing-related components/animations/assets

GOAL

Replace the old landing design language completely.

Use SuperPlay only as a reference for:

- scroll choreography
- stage-like pinning
- kinetic typography
- bounce / overshoot
- playful high-energy motion
- continuous scene transitions
- object handoff
- controlled visual chaos

Do not copy SuperPlay brand assets, game assets, text, characters, proprietary illustrations, or source code.

The unique FLASH 10 visual system must be one continuous filmstrip path running through the center of the experience.

The filmstrip is not decoration. It is the landing-page architecture.

REMOVE OLD LANDING LANGUAGE

Remove or replace landing-only code/styles related to:

- the old page-wide routePath
- the old global strokeDashoffset-only experience
- CSS runner / reader / walker characters
- orbit / planet / sun-disc / board visuals
- pastel editorial cards
- generic [data-landing-reveal] fade + translateY reveals
- repeated conventional marketing section layouts

Do not remove styles or logic needed by `/create` or `/wall`.

FILMSTRIP REQUIREMENTS

Build a real film ribbon with:

- dark/high-contrast film body
- repeated frame windows
- sprocket/perforation holes on both edges
- visible thickness
- bends
- loops / coil gestures
- active frames that can contain images/text/milestones/CTA states

Use one geometry source for the shared film path.

Frames must follow path position and tangent instead of being manually scattered with arbitrary top/left values.

Keep the system data-driven so sections can add:

- text
- buttons
- images
- photos
- milestones / years
- CTA
- multiple film frames
- Memory Cat states

without rewriting filmstrip internals.

SCROLL CONTRACT

Follow INSTRUCTIONS_SUPERPLAY_SCROLL_CHOREOGRAPHY.md strictly.

Treat each major beat as an animated stage, not a normal section.

Scroll is the playhead.

Use scene-local GSAP + ScrollTrigger timelines with pin/scrub where appropriate.

Use this approximate choreography rhythm for major pinned scenes:

0–15%   hold / orient
15–35%  react
35–60%  transform
60–82%  takeover
82–95%  object/frame handoff
95–100% release / next state

The viewport should often feel nearly stationary while the composition transforms inside it.

Do not create this behavior:

scroll → section moves up → content fades → next section

Create this behavior instead:

scroll → film advances/bends → typography/assets react → composition transforms → takeover → object/frame survives transition → next composition forms

Reverse scrolling must restore previous visual states naturally.

FILM REEL RESPONSE

Scroll down:

- film feeds forward
- local bends open
- adjacent frames spread slightly
- active frame advances

Scroll up:

- film rewinds
- bends tighten
- adjacent frames compress slightly
- previous composition returns

Keep this controlled and deterministic with GSAP first. Do not add a physics engine for V1.

IMPLEMENTATION ORDER

Phase A — Audit
- inspect current code
- identify obsolete landing classes/components
- confirm route boundaries

Phase B — Static filmstrip proof
- make film unmistakably recognizable
- include ribbon body, frame windows, perforations, bends and at least one loop
- render 3+ sample frame types

STOP AND SELF-CHECK GATE 1.
Do not proceed if the film still looks like a thick SVG line.

Phase C — Path-following system
- make reusable frames follow path position + tangent
- centralize film geometry
- avoid per-frame React state

Phase D — Feed / rewind
- add ScrollTrigger-controlled film movement
- verify forward and reverse behavior

Phase E — HERO ONLY
- build the Hero as the main fidelity checkpoint
- use high-impact FLASH 10 typography
- film must already be visible and dominant
- add only a small number of intentional supporting FLASH assets
- first scroll must transform the internal composition immediately
- do not simply scroll the hero upward

STOP AND SELF-CHECK GATE 2.
Do not continue until Hero already feels like an animated campaign stage.

Phase F — Hero → Timeline handoff
- one frame/object must survive from Hero into Timeline
- next composition must begin forming before the previous pin fully releases
- no blank gap

STOP AND SELF-CHECK GATE 3.

Phase G — Timeline + Kết Nối
- Timeline uses film as the memory timeline
- Kết Nối forms separated pieces into one composition through motion
- prove text/button/image/milestone content can be added data-first
- reverse scroll must restore prior state

STOP AND SELF-CHECK GATE 4.
Hero → Timeline → Kết Nối must feel like one uninterrupted animation sequence, not three sections.

Only after Gate 4 passes continue with:

Phase H — Bản Sắc
Phase I — Flashback / gallery
Phase J — Memory Cat reveal
Phase K — Final CTA
Phase L — responsive + reduced motion
Phase M — optional smooth-scroll polish
Phase N — validation

Do not add Lenis before native ScrollTrigger behavior is stable.

If you add Lenis later, initialize it once, synchronize with ScrollTrigger, destroy it on unmount, and verify touch/mobile behavior.

REACT / GSAP RULES

- React + Vite + TypeScript remains the stack
- use GSAP + ScrollTrigger
- use gsap.context() and reliable cleanup
- do not use React state for per-frame animation values
- avoid dozens of unrelated ScrollTriggers
- prefer one main timeline per major scene
- avoid nested pins
- use transforms/opacity for animated DOM elements where possible
- use `ease: none` or restrained easing for scrubbed motion
- use back.out / elastic.out / power3.out / power4.out for non-scroll impact motion

RESPONSIVE

Do not remove the filmstrip on mobile.

Simplify:

- loop radius
- pin distance
- number of simultaneous objects
- parallax depth
- travel distance

Preserve:

- scroll-as-playhead
- film feed/rewind
- active frame focus
- continuous scene handoff

SAFETY / PRODUCT BOUNDARY

Do not break or redesign:

- /create
- /wall
- server API
- uploads
- persistence
- Socket.IO realtime flow
- scanner/live-wall behavior

VALIDATION

Before final handoff run the repository's existing type-check and build commands. At minimum verify the client check/build scripts used by this repository.

Also verify manually in code/logic that:

- no old routePath architecture remains as the main landing system
- old CSS characters/orbits/cards are no longer part of `/`
- film is visually active in every beat
- Hero is pinned and reactive
- at least four transition patterns are used across the full landing
- at least two transitions use object/frame handoff
- reverse scroll works
- no long blank pinned zones exist
- CTA remains clickable before decorative animation ends
- mobile still uses filmstrip architecture
- reduced-motion mode preserves all content

When finished, give me:

1. concise summary of what you changed
2. files created/modified/deleted
3. important animation architecture decisions
4. what old landing code was removed
5. check/build results
6. any remaining visual assets/placeholders I should replace later

Do not ask me to restate the design. Use the two authoritative landing instruction files above.
```
