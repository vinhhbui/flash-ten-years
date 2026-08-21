# FLASH 10 — Final Destination Wall

> Authoritative override for the final beat of the `/` landing experience.
>
> This document only overrides the previous final Live Wall presentation. It does not replace the scanner/upload workflow, `/wall` standalone behavior, realtime Socket.IO contract, or the rest of the Film Road motion architecture.

## Core idea

The Live Wall is not another section after the journey.

**The Live Wall is the physical destination the entire Film Road has been moving toward.**

The last part of the landing experience must read spatially as:

```text
camera / viewer
      ↓
straight Film Road
      ↓
small wall on the horizon
      ↓ scroll forward
wall grows in perspective
      ↓
Film Road meets the base of the wall
      ↓
FULL FINAL MEMORY WALL
```

## Required behavior

- Keep the final wall inside the same master pinned stage.
- Do not render it as a monitor, browser frame, TV, gallery card, or separate conventional webpage section.
- The wall starts very small and distant near the horizon.
- During roughly the final 10% of master progress, the camera approaches it continuously.
- The wall scales from distant to almost full viewport while perspective/blur resolves.
- The existing Film Road remains continuous during the approach and visually terminates at the base of the wall.
- Previous depth-scene content may pass in front of the wall while the wall is still distant.
- At the final state, the wall becomes the dominant composition and the journey is visually complete.

## Live artwork behavior on the destination wall

The landing destination wall must not reuse the roaming behavior of the standalone `/wall` page.

For the destination variant:

- each submitted artwork is attached to a stable position on the wall surface;
- stable placement should derive from the submission ID so reloads do not completely reshuffle the wall;
- artwork must not travel freely around the viewport;
- existing artwork may use only a very small idle wiggle/float to stay alive;
- a new realtime submission should feel like it travels from the viewer/camera toward the wall, then snaps into its final wall position;
- after landing, the artwork remains attached to that position.

The visual metaphor is **sticker / drawing / memory attached to a physical archive wall**, not a swarm of sprites.

## Preserve `/wall`

`/wall` remains the standalone realtime event/projector experience.

Do not remove or downgrade:

- Socket.IO realtime delivery;
- stored submission restoration;
- existing frame resolver;
- Float/Hop or other configured standalone artwork animations;
- fullscreen wall route.

The implementation should keep separate visual behavior through variants:

```text
LiveWall variant="page"
→ standalone fullscreen wall
→ existing free animation behavior

LiveWall variant="destination"
→ landing final destination
→ artwork pinned to wall surface
```

## Spatial layering

Use the existing master-stage depth model.

Conceptually:

```text
background
Film Road
Final Destination Wall
passing depth-scene content
navigation / UI
```

The wall should be able to sit behind the final passing content while distant, then become dominant after that content passes the camera.

## Final progress target

```text
0.90
wall first becomes readable in the distance

0.94
wall grows and camera visibly approaches

0.98
wall dominates the frame; road meets wall base

1.00
full destination wall; calm final state
```

Do not end with a generic fade to the wall.
The approach must be driven primarily by scale, perspective, depth, and continuous camera motion.

## Non-goals

Do not use this change as a reason to refactor unrelated systems.
Do not modify scanner ingestion, upload persistence, API contracts, template/frame architecture, or standalone `/wall` behavior unless required to preserve compatibility.
