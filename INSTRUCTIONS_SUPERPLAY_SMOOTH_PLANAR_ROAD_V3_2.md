# FLASH 10 — Smooth Planar Film Road V3.2

> **Authoritative refinement for the landing route `/`.**
>
> This file supersedes V3.1 wherever there is a conflict about Film Road geometry, road styling, beat travel, camera feel, scroll smoothing, or demo visual density.
>
> Preserve `/create`, `/wall`, scanner/live-wall logic, APIs, Socket.IO, persistence, and server behavior unchanged.

---

# 0. Goal

The V3.1 direction is closer, but the landing still feels too much like a sequence of animation effects.

V3.2 must make the experience feel simpler, cleaner, smoother, and more spatial.

The intended sensation is:

```text
user scrolls
→ camera feels like it moves forward
→ one straight Film Road stays under the journey
→ next composition is already visible near the horizon
→ it approaches gradually
→ becomes readable
→ passes the viewer mostly through depth, not sideways
→ following composition continues from the same vanishing point
```

The Film Road must now be visually minimal and planar:

```text
ONE STRAIGHT AXIS
ONE FLAT FILM SURFACE
NO OUTER STROKE
NO DROP SHADOW
NO FLOATING FRAME WINDOWS
NO ROAD BENDS
NO DIAGONAL ROAD VARIANTS
```

The visual should read like photographic film printed directly onto one perspective plane.

---

# 1. Preserve the current good architecture

Keep:

- one scroll track;
- one pinned master stage;
- one primary ScrollTrigger;
- one master GSAP timeline;
- the current depth-beat concept;
- CSS/SVG/DOM approach;
- Film Road as persistent world element;
- five simple demo beats.

Do not return to multiple pinned sections.

Do not introduce Three.js or WebGL.

---

# 2. Film Road geometry — make it completely straight

## 2.1 One vanishing axis

The Film Road center must remain fixed at the center of the stage.

Desktop baseline:

```text
centerX = 500
bend = 0
tilt = 0
```

Every Film Road pose/variant must resolve to the same straight center axis.

Do not animate:

- left/right bend;
- S curve;
- diagonal tilt;
- rotational road changes;
- lateral road drift.

If the existing `FilmRoadVariant` API is useful for compatibility, variants may remain in TypeScript, but their geometry must no longer bend or tilt the road.

Prefer eventually simplifying the variants rather than maintaining fake visual differences.

## 2.2 Narrow the road slightly

The current road is too wide near the viewer.

Reduce width approximately 15–22% while preserving perspective.

Recommended desktop starting range:

```text
farWidth   ≈ 108–125
nearWidth  ≈ 455–500
horizonY   ≈ 225–245
```

Recommended compact/mobile starting range:

```text
farWidth   ≈ 155–180
nearWidth  ≈ 610–670
horizonY   ≈ 225–250
```

Tune visually, but the road should feel elegant and secondary to the main content, not like a giant carpet covering the bottom half of the viewport.

The width must still grow toward the viewer to preserve the forward-depth illusion.

---

# 3. Film Road styling — flat plane, no outline

The Film Road must visually feel like one printed flat surface.

Remove the current visual treatments that make it look extruded or sticker-like.

## Remove

```text
outer body stroke
stroke-width on the road body
drop shadow / offset shadow
film-road shadow path if no longer needed
active-frame scale pop
active-frame thick outline
floating highlight effect
any filter/drop-shadow used on the road
```

The road body should be approximately:

```css
fill: #171722;
stroke: none;
```

Do not replace the stroke with another outline.

The edge of the dark film body should be defined by the contrast between the body fill and the background only.

---

# 4. Film frames must be printed on the SAME plane

This is non-negotiable.

The photographic frame pattern, separators, and sprocket holes must visually belong to the same flat road surface.

The viewer should NOT perceive:

```text
road surface
    +
frames floating above it
```

The viewer SHOULD perceive:

```text
one film plane
with frame graphics printed/cut into it
```

Implementation rules:

- frame groups remain inside the same SVG road group;
- no translateZ for individual film slices;
- no shadow per frame;
- no independent active-frame scale;
- no perspective transform separate from the road plane;
- frame size changes only because its position on the road has different perspective width/depth;
- sprocket holes follow the exact same slice transform as the frame window;
- separators follow the same plane;
- frame artwork should be flat graphic fills for the demo.

For V3.2, simplify `SliceArtwork`.

Preferred demo content:

```text
[ flat frame window ]
[ 2 simple graphic shapes ]
[ sprocket holes ]
```

Remove unnecessary frame numbers if they visually clutter the road.

Avoid detailed fake-photo illustrations until the final art direction phase.

---

# 5. Film Road should be visually calm

The road is a permanent navigation spine.

It should not compete with every content beat.

Do not animate road shape per scene.

The main Film Road animation is only:

```text
continuous forward feed on scroll down
continuous rewind on scroll up
```

Optional subtle changes:

- very small contrast shift;
- very small reel speed modulation;
- tiny active-zone brightness change.

Do NOT:

- bend the road;
- scale the entire road dramatically;
- rotate it;
- move it left/right;
- make one film frame pop off the plane.

---

# 6. Smooth forward camera model

The current V3.1 beat motion changes depth too abruptly and exits too far sideways.

V3.2 must make depth the dominant motion axis.

Every non-final beat should follow approximately this depth journey:

```text
FAR HORIZON
z ≈ -1100
scale ≈ 0.10–0.14

    ↓

APPROACH
z ≈ -620
scale ≈ 0.28–0.38

    ↓

READABLE
z ≈ -100 to -40
scale ≈ 0.92–1.00

    ↓

NEAR
z ≈ +180 to +260
scale ≈ 1.55–1.90

    ↓

PASS CAMERA
z ≈ +650 to +900
scale ≈ 4.5–6.0
```

The exact scale should be tuned with the CSS perspective so that z and scale feel consistent rather than like two independent special effects.

---

# 7. Reduce lateral exits dramatically

Current beats move too aggressively toward the sides of the viewport.

That breaks the feeling that the user is travelling straight forward on one road.

During FAR → APPROACH → READABLE:

```text
x should stay within roughly ±4vw
```

During NEAR → PASS CAMERA:

```text
x may drift only roughly ±8–18vw
```

Do not use `exitX` values around ±60–75vw as the default motion.

Objects should disappear because the viewer passes them, not because they fly away sideways.

For most beats, the best exit may simply be:

```text
z increases dramatically
scale increases dramatically
y moves slightly downward
clip/overflow removes it after camera pass
```

---

# 8. Reduce rotation

The current demo does not need large Y/X rotations.

Use rotation only as subtle depth polish.

Recommended ranges:

```text
rotationY: -4deg to +4deg
rotationX: -2deg to +2deg
rotationZ: -2deg to +2deg
```

The main motion must come from depth and perspective.

Do not make every beat rotate differently just to make it look animated.

---

# 9. Smoothness and scroll response

The landing must feel fluid under normal mouse wheel and trackpad input.

Use ScrollTrigger numeric scrub as smoothing.

Recommended baseline:

```ts
scrub: 1.1
```

Tune within approximately:

```text
0.9–1.4
```

Do not add Lenis yet unless native scroll + ScrollTrigger cannot achieve acceptable quality.

The master timeline should remain deterministic from scroll position.

Avoid sudden `.set()` changes during visible regions.

`.set()` is allowed for:

- initial hidden state;
- cleanup after an object is well beyond the camera;
- pointer-event changes after a beat has passed.

It must not be perceptible as a visual transition.

---

# 10. Use overlapping depth windows

The journey should never look like:

```text
Beat A disappears
blank frame
Beat B appears
```

Instead:

```text
A = readable
B = already tiny at horizon

A = near foreground
B = approaching
C = tiny at horizon

A = passing camera
B = readable
C = approaching
```

At least two depth beats should normally coexist in the stage.

This overlap is what creates the feeling of a continuous road/world.

Recommended overlap:

```text
25–40% of adjacent beat travel duration
```

---

# 11. Calm/read moment

Each beat still needs a readable interval.

At readable depth:

```text
z ≈ -100 to -40
scale ≈ 0.95–1.0
rotation nearly 0
x nearly centered
```

Hold this composition long enough that it feels intentional before moving toward the camera again.

Do not literally stop the timeline; use a shallow depth progression for a small progress range.

The rhythm should be:

```text
approach
→ settle/read
→ accelerate toward viewer
→ pass camera
```

This is smoother and more cinematic than constant-speed zooming.

---

# 12. Perspective tuning

Current CSS perspective is around 1200px.

Test in this range:

```text
perspective: 1000px–1300px
perspective-origin: 50% 27%–31%
```

The vanishing point of content and Film Road should visually align.

If content appears to travel from a different horizon than the road, fix the stage transform origin / beat start Y instead of adding arbitrary x/y offsets.

The horizon is one shared spatial anchor.

---

# 13. Demo content remains minimal

Keep only five simple beats:

```text
FLASH 10
TEN YEARS
CONNECTED
FLASHBACK
MAKE A MEMORY
```

Each beat should contain at most:

```text
1 title
1 simple shape/object
optional 1 tiny label
```

No cards grid.
No floating sticker cloud.
No multiple tokens.
No decorative UI clutter.
No fake content panels.

The purpose of V3.2 is to judge:

```text
road geometry
perspective
forward travel
smoothness
beat overlap
camera pass
```

Not final decoration.

---

# 14. Film Road refactor guidance

Current code contains:

```text
shadowRef
bodyRef
makeFilmBody
pose.bend
pose.tilt
active frame scale/highlight
```

For V3.2:

1. Remove `shadowRef` and the shadow path if it has no functional purpose.
2. Keep one `bodyRef` path with flat fill and no stroke.
3. Set all pose bends/tilts to zero or simplify pose representation.
4. Remove active frame scale/highlight behavior.
5. Keep all slices transformed only by road-plane perspective sampling.
6. Reduce width values in `filmRoadConfig.ts`.
7. Ensure reel movement remains continuous and reversible.

Do not rewrite the Film Road in Canvas or WebGL.

---

# 15. Master timeline refactor guidance

Current depth-beat behavior uses large `exitX` and rotation values.

Refactor configuration away from expressive sideways exits.

Prefer a compact config such as:

```ts
interface DepthBeatConfig {
  id: string;
  start: number;
  laneX?: number;      // small only
  passDriftX?: number; // small only
  first?: boolean;
  settle?: boolean;
}
```

Recommended lane values:

```text
-3vw
0
+3vw
-2vw
0
```

Recommended pass drift:

```text
-10vw
+12vw
-8vw
+10vw
0
```

Avoid creating a left/right zig-zag carousel.

The user is travelling forward, not dodging cards.

---

# 16. Forward travel curve

The visual depth curve should feel nonlinear:

```text
far objects move slowly
mid objects become easier to perceive
after readable state, apparent speed increases
near-camera pass happens faster
```

This can be achieved through a combination of:

- perspective;
- z progression;
- scale progression;
- subtle segment easing.

For scrub-linked spatial movement, keep the master deterministic.

A good approach is GSAP keyframes or chained timeline segments:

```text
far → approach      longer
approach → readable medium
readable → near     medium-short
near → pass         shorter
```

Do not make near-camera pass linger for too long; giant content covering the screen should be transitional.

---

# 17. Background should be calmer

For this motion test, avoid frequent saturated color changes.

Use at most 2–3 background states across the whole journey.

Transitions should be slow and overlap the depth travel.

Suggested test palette:

```text
#10111b
#25254b
#10111b
```

The road and depth motion are the focus.

---

# 18. V3.2 quality gates

## Gate 1 — Road silhouette

Pass only if:

- road is perfectly straight;
- no bend or diagonal variant is visually present;
- road is visibly narrower than V3.1;
- no outer stroke;
- no road shadow;
- road reads as one clean plane.

## Gate 2 — Printed film surface

Pass only if:

- frame windows, separators, and sprockets lie visually on the road plane;
- no frame floats above the road;
- no active frame pops/scales independently;
- film pattern moves only through shared perspective feed/rewind.

## Gate 3 — Smooth depth

Pass only if one beat visibly performs:

```text
horizon → approach → readable → near → pass camera
```

without an obvious fade transition or sideways fly-out.

## Gate 4 — Overlap

Pass only if the next beat is already visible at the horizon before the current beat reaches foreground.

No empty state between beats.

## Gate 5 — Whole sequence

Pass only if all five beats feel like objects stationed along one road that the user is travelling through.

The final result should NOT feel like five slides with zoom transitions.

---

# 19. Failure conditions

Implementation fails V3.2 if any of these are true:

```text
Film Road still has an outer stroke
Film Road still has a drop shadow
Film Road bends or rotates between beats
road is still excessively wide
film frames pop above the road plane
active film frame has independent scale/highlight
beats mainly fade in/out
beats mainly exit left/right
content appears from different vanishing points
one beat fully disappears before next is visible
large rotations dominate the motion
visual clutter makes depth hard to judge
```

---

# 20. Definition of done

V3.2 is successful when the demo communicates this immediately:

```text
I am looking down one straight film road.
The film itself is flat and clean.
Things are waiting ahead of me in the distance.
As I scroll, I travel toward them.
They become readable, then I move past them.
The next thing is already waiting farther down the road.
Everything feels smooth and continuous.
```

Do not decorate further until this motion and Film Road geometry are approved.
