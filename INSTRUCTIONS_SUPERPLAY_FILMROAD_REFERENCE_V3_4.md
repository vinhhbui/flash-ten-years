# FLASH 10 — Landing Film Road Reference V3.4

> **Authoritative visual correction for the Film Road on route `/`.**
>
> This file supersedes the Film Road rendering/geometry rules in `INSTRUCTIONS_SUPERPLAY_FLAT_FILMROAD_DEPTHFADE_V3_3.md` whenever they conflict.
>
> Keep the V3.3 depth/fade choreography, the single pinned master stage, and the current `/create` + `/wall` behavior unchanged unless a small layering adjustment is required for the Film Road.

---

# 0. Latest user intent

The road at the bottom of the landing page must visually match the latest reference image much more closely.

Reference mental model:

```text
                         soft horizon / haze

                           |       |
                          /         \
                         /           \
                        /             \
                       /               \
                      /                 \
                     /                   \
                    /                     \
                   /                       \
                  /                         \
                 /                           \
                /                             \
               /                               \
              /                                 \
             /                                   \
            /                                     \
           /                                       \
          /                                         \
         /                                           \
        /                                             \
       /                                               \
      /                                                 \
     /                                                   \
    /                                                     \
   /                                                       \
  /                                                         \
 /                                                           \

viewer / foreground
```

But those two dark tapered sides are not separate rails floating beside an empty road.
They are the **perforated edge bands of one long filmstrip plane**.
The center belongs to the same film plane and stays visually clean/light/open.

The result should feel like one long film roll lying flat on the ground and extending from the horizon toward the viewer.

---

# 1. What changes from V3.3

V3.3 described the road as one mostly dark central film surface with frame artwork embedded in it.
For V3.4, the new reference image is more important.

## New visual rule

The Film Road should read as:

```text
[ dark perforated edge ] [ clean/light film center ] [ dark perforated edge ]
```

all on **one shared flat ground plane**.

Do not interpret this as three floating strips.
It is one film sheet with two dark edge bands and one central film area.

The visual silhouette must look close to the supplied reference:

- two dark tapered edge bands;
- repeating rectangular sprocket holes;
- a clean center plane between them;
- strong perspective convergence;
- no outer stroke;
- no chunky shadow;
- no raised ribbon shape;
- no colorful mini artwork inside every film frame.

---

# 2. Current repository ground truth

The current implementation already has the correct high-level architecture:

```text
client/src/landing/film/FilmRoad.tsx
client/src/landing/film/filmRoadConfig.ts
client/src/landing/landing.css
client/src/landing/animation/useLandingScroll.ts
client/src/landing/animation/createMasterTimeline.ts
```

Keep the current imperative `FilmRoadHandle` / `setState({ reel })` approach if possible.
Do not rewrite the entire landing just to change the road.

The current `FilmRoad.tsx` still contains demo artwork in `SliceArtwork`:

- colored frame windows;
- mountain shapes;
- sun circles;
- dark matte blocks;
- large repeated slice artwork.

That is no longer the target.

V3.4 should simplify the film rendering substantially.

---

# 3. Film Road structure

## 3.1 One continuous plane

The entire road is one continuous object.

Correct:

```text
single film plane
├── left dark edge band
│   └── repeating sprocket holes
├── clean central film area
└── right dark edge band
    └── repeating sprocket holes
```

Wrong:

```text
left floating rail
+ empty page background
+ right floating rail
```

Wrong:

```text
many detached frame cards stacked toward the horizon
```

Wrong:

```text
thick black trapezoid with colorful images printed in every slice
```

## 3.2 Center film area

The center should be visually calm.

Preferred desktop look:

- near-white / paper tone, or a very subtle translucent light plane;
- no large dark matte filling the center;
- no rainbow frame colors;
- no mountain/sun demo illustrations;
- optional frame separators only if they are very subtle and remain coplanar.

If frame segmentation is kept to help the film identity, use extremely restrained separators, approximately `5–12%` visual opacity.

The road must still read from far away as one clean geometric film path.

## 3.3 Edge bands

The two edge bands carry most of the film identity.

They should be:

- dark charcoal / near-black;
- straight;
- flat;
- tapered by perspective;
- part of the same plane as the center;
- free of visible outer stroke.

Sprocket holes should be:

- rectangular with slightly softened corners;
- light/transparent cutouts against the dark band;
- repeated continuously;
- smaller and more compressed near the horizon;
- larger and more separated near the viewer.

Match the supplied reference more closely than the current chunky sprocket blocks.

---

# 4. Ground-plane / perspective behavior

The road must feel **printed onto the floor plane**.

It must not feel like:

- a vertical billboard;
- a ribbon standing up;
- a floating bridge;
- a filmstrip with thick extrusion;
- two side objects with different depth from the center.

Use one shared perspective projection for center + both edge bands + sprocket holes.

SVG is still acceptable and is preferred if it can produce the correct result cleanly.
CSS 3D is also acceptable for the road plane if it reduces complexity.
Do not add WebGL / Three.js.

Important visual cues:

```text
near foreground = wide + large hole spacing
midground       = narrower + tighter spacing
far distance    = strongly compressed
horizon         = soft fade into distance
```

The perspective compression should be stronger than the current simple linear-looking repetition.

---

# 5. Placement — keep the road in the lower half

The reference leaves a large amount of empty composition space above the road.
The Film Road should therefore feel like a ground element below the main content, not a giant central vertical object.

Desktop target:

```text
visual road emergence / haze begins ≈ 46–54vh
clearly visible narrow film         ≈ 52–58vh
foreground road reaches             > 100vh
bottom width                         ≈ 52–60vw
apparent far width                   ≈ 10–15vw
center X                             ≈ 50vw
```

These are visual targets, not strict pixel constants.

Important:
- do not blindly move the whole depth-world horizon if that breaks the V3.3 choreography;
- it is acceptable for the mathematical road geometry to continue farther toward the existing horizon while a soft mask/haze makes the visible road appear from the lower half;
- content should still have room to approach from depth above the road.

A subtle top fade/mask is preferred over a hard cut.

Example concept:

```css
mask-image: linear-gradient(
  to bottom,
  transparent 0%,
  transparent 34%,
  rgba(0,0,0,.35) 44%,
  #000 52%,
  #000 100%
);
```

Exact percentages must be tuned visually.

---

# 6. Geometry tuning guidance

The current desktop config uses approximately:

```text
farWidth  = 132
nearWidth = 408
horizonY  = 232
```

Do not preserve those values just because they already compile.
Tune toward the latest reference.

For the existing `viewBox="0 0 1000 1160"`, a better starting search range is:

```text
centerX   ≈ 500
farWidth  ≈ 90–140
nearWidth ≈ 520–610
```

For `horizonY`, tune together with the top mask/haze rather than forcing one magic value.
The final visual position matters more than the numeric value.

The width interpolation should create stronger compression near the top.
A power curve around `1.9–2.4` is a reasonable tuning region.

Do not hard-code these exact numbers if a better responsive function produces the target.

Mobile target:

```text
bottom width ≈ 70–82vw
far width    ≈ 18–24vw
road remains centered
fewer visible sprocket repetitions
```

Do not turn mobile into a normal vertical strip.

---

# 7. Remove the current decorative film artwork

The current road should stop behaving like a stack of illustrated cards.

In `FilmRoad.tsx`, remove or replace the concepts represented by:

```text
film-road__frame-matte
colored film-road__frame-window fills
film-road__image-mountain
film-road__image-sun
large decorative per-slice artwork
```

Do not keep those elements hidden under the new design.
Clean up obsolete CSS after the replacement is working.

The road should become visually simpler and more premium.

---

# 8. Recommended rendering model

A low-risk implementation is:

```text
FilmRoad SVG
├── one center film-plane polygon/path
├── one left edge-band polygon/path
├── one right edge-band polygon/path
├── repeated left sprocket cutouts
├── repeated right sprocket cutouts
└── optional subtle center frame separators
```

The repeated pieces can still be depth-sampled and updated from `reel`.

Alternative:

```text
one long CSS 3D plane
+ pseudo/repeating patterns for sprockets
+ transform/texture offset driven by reel
```

Use whichever is easier to keep smooth with the current architecture.

Do not create hundreds of React elements.
A practical visible sprocket/frame sample count is roughly `24–32` depth samples on desktop and fewer on compact layouts.

---

# 9. Scroll behavior — the film must feel long

The film is not a static perspective decoration.
It is a **long roll**.

Scrolling down:

```text
new sprocket holes emerge from the horizon
→ travel toward the viewer
→ grow with perspective
→ pass below the viewport
→ next holes continue seamlessly
```

Scrolling up must reverse this exactly.

Keep using deterministic master timeline progress.
Do not add velocity-dependent geometry as the primary animation.

The current `reel` model can remain, but fix any visible wrapping/pop.
Wrap/recycle samples only in:

- the masked horizon zone; or
- below the viewport.

There must be no obvious teleport in the readable middle of the road.

---

# 10. Relationship with depth beats

Keep the V3.3 beat choreography:

```text
far + faint
→ approach + fade in
→ readable
→ near foreground
→ pass + fade out
```

This update is mainly about the road.
Do not redesign all five beats again unless required to prevent visual overlap.

Layering target:

```text
background
Film Road ground plane
major depth content
foreground passing content
navigation
```

The road should support the forward-travel illusion without competing with the titles.

---

# 11. Color / styling

The reference is monochrome and clean.
Follow that restraint.

Preferred road palette:

```text
edge bands  = near-black / charcoal
center      = paper white / neutral light / subtle translucent neutral
holes       = center/background tone so they read as cutouts
```

Do not use the current multi-color film thumbnails on the road.
The surrounding landing can keep its FLASH colors in titles/background accents.

No dominant:

```text
stroke
neon glow
drop shadow
bevel
3D extrusion
```

A tiny horizon blur/fade is allowed because the reference has a soft distant transition.

---

# 12. Performance

Keep transforms/attribute updates lightweight.

Do not:

- put `setState` into React for every scroll tick;
- render hundreds of SVG nodes;
- add Three.js;
- add a physics library;
- add another scroll library.

The current GSAP + ScrollTrigger + imperative FilmRoad update path is already appropriate.

---

# 13. Files likely to change

Expected primary files:

```text
client/src/landing/film/FilmRoad.tsx
client/src/landing/film/filmRoadConfig.ts
client/src/landing/landing.css
```

Only change these if genuinely needed:

```text
client/src/landing/animation/motionConfig.ts
client/src/landing/animation/createMasterTimeline.ts
client/src/landing/animation/useLandingScroll.ts
```

Do not modify `/create`, `/wall`, scanner workflow, templates, server APIs, Socket.IO, or persistence for this task.

---

# 14. Acceptance gates

## Gate A — screenshot silhouette

At a normal desktop viewport, the road should immediately resemble the latest reference:

- large empty composition area above;
- film visible mostly in the lower half;
- narrow at distance;
- broad at the bottom;
- dark tapered edge bands;
- repeated light sprocket holes;
- clean central plane;
- soft horizon fade.

## Gate B — one physical film plane

Even though the visual identity is concentrated in the two dark edge bands, the result must still feel like one continuous film sheet.

It must NOT look like two unrelated black rails.

## Gate C — flat to the ground

Everything on the Film Road shares one perspective plane.
No frame, rail, hole, or separator should look lifted above the road.

## Gate D — long-roll motion

On scroll, the sprockets/film pattern must continuously travel toward the viewer and rewind on reverse scroll.
No visible popping in the midground.

## Gate E — clean art direction

No colorful mini mountains/suns/cards remain in the film road.
No heavy outline, glow, or drop shadow dominates the road.

---

# 15. Explicit failure conditions

V3.4 fails if any of these are true:

- the road still looks like a thick dark filled trapezoid;
- the center still contains colorful per-frame demo artwork;
- the road begins too high and occupies the whole screen;
- sprocket holes are too large/chunky compared with the reference;
- perspective spacing looks uniform instead of compressed toward the horizon;
- the road looks like a standing ribbon instead of a flat floor plane;
- the left and right edge bands appear detached from the center plane;
- scrolling only moves the page/content while the film pattern remains static;
- frame/sprocket recycling visibly teleports in the midground;
- `/create` or `/wall` regress because of this landing-only change.
