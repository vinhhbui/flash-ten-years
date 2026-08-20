# FLASH 10 — Superplay Landing Update V3.3 (Flat Film Road + Depth Fade)

This file is the current authoritative instruction for the landing page at `/`.
When it conflicts with older landing instructions, **V3.3 wins**.

## Goal
Refine the current landing so it feels closer to the Superplay-style scrolling experience, but with a custom **film road** concept.

The user feedback to satisfy:
1. the **road itself must be a flat filmstrip**, not two side rails with empty space in the middle;
2. the content needs **fade in / fade out** layered with motion;
3. the stage still needs **depth / perspective** so it feels like the user is moving forward.

---

## 1. Core visual rule
The road must read as **one continuous flat film surface** receding into the horizon.

Correct mental model:
- one central dark strip;
- sprocket holes on both edges;
- frame windows embedded in the middle of the same strip;
- the strip lies flat like a road going from horizon to viewer.

Wrong mental model:
- left film edge + empty center + right film edge;
- floating detached frames;
- a lifted ribbon with heavy outline/shadow.

---

## 2. Film Road requirements
Implement / refactor the Film Road so that:

- it is a **single planar ribbon in perspective**;
- it stays mostly **straight** for this version;
- `bend = 0` and `tilt = 0` conceptually;
- it is slightly **narrower** than before;
- the road has **no dominant outer stroke**;
- the road has **no dominant drop shadow**;
- frame windows, separators, and sprocket holes all feel printed into the same plane.

### Visual structure
Think of the surface as:

`[ sprockets ] [ frame area ] [ sprockets ]`

all on the same film surface.

### Geometry guidance
Desktop starting ranges:
- `farWidth ≈ 120–145`
- `nearWidth ≈ 360–430`
- `horizonY ≈ 210–245`

Mobile starting ranges:
- `farWidth ≈ 170–210`
- `nearWidth ≈ 420–500`

These are tuning guides, not hard requirements.

---

## 3. Motion direction
Keep the main motion language as **forward travel**.

Each beat should feel like it follows:

`horizon → approach → readable → near → pass camera`

The user should feel like they are moving forward through the scene, not that elements are merely appearing in place.

Reduce aggressive sideways throw-away motion.

Recommended drift:
- readable drift: `±2–5vw`
- near/pass drift: `±8–16vw`

Avoid the previous extreme side exits.

---

## 4. Fade in / fade out choreography
Add opacity choreography to every major beat.

Use this lifecycle:
- far / horizon: low opacity
- approaching: fade in
- readable zone: highest opacity
- near foreground: soften slightly
- pass / exit: fade out

Important:
- fade must **support depth motion**;
- fade must **not** become a simple static opacity transition.

Correct:
- element is small + faint at horizon;
- it moves forward while becoming clearer;
- it fades away only after passing / exiting.

Incorrect:
- element stays mostly in place and just fades in/out.

---

## 5. 3D / depth feeling
The 3D effect should come mainly from:
- perspective;
- translateZ;
- scale;
- controlled Y movement toward the viewer.

Keep rotations subtle:
- `rotationY ≈ ±2° to ±5°`
- `rotationX ≈ ±1° to ±3°`
- `rotationZ ≈ ±1° to ±3°`

Use rotation only as seasoning, not as the main effect.

---

## 6. Beat overlap
The stage should feel continuous.

While one beat is readable / near, the next beat should already be visible near the horizon.

That means:
- current beat in foreground or midground;
- next beat already arriving in the background.

Avoid hard isolated transitions.

---

## 7. Demo simplification
Keep the landing demo minimal for testing motion.
Do not add decorative clutter.

Keep only simple beats such as:
- FLASH 10
- TEN YEARS
- CONNECTED
- FLASHBACK
- MAKE A MEMORY

Each beat should contain only:
- one large title;
- one simple shape or simple card;
- optional tiny label;
- CTA only on the last beat.

---

## 8. Implementation guidance
Keep the current stack and architecture:
- React + Vite + TypeScript
- GSAP + ScrollTrigger
- existing single pinned master stage approach

Do **not** add Three.js / WebGL / another animation library.

Refactor the existing Film Road implementation rather than rewriting the entire landing architecture if possible.

### Motion tuning
Recommended ScrollTrigger tuning:
- `scrub ≈ 1.0–1.25`

Per beat rough phases:
- 0–20%: spawn at horizon
- 20–40%: fade-in approach
- 40–60%: readable zone
- 60–82%: near pass
- 82–100%: fade-out exit

---

## 9. Quality gates
Implementation passes only if:

### Gate A — Film Road
- clearly reads as one flat filmstrip road;
- no twin-rail look;
- no floating frame look;
- no heavy stroke / shadow dominating it.

### Gate B — Motion
- beats come from the horizon;
- beats fade in while approaching;
- beats become readable in mid-stage;
- beats continue forward and fade out after passing.

### Gate C — Overall feel
- motion feels smoother;
- transitions overlap;
- layout is less cluttered;
- landing feels more premium and intentional.

---

## 10. Explicit failure conditions
The implementation is still wrong if any of these are true:
- the road still looks like two side strips;
- the film surface is not flat enough;
- frame windows look detached;
- fade is used without real depth motion;
- elements still exit too violently sideways;
- the stage is cluttered with unnecessary demo elements.
