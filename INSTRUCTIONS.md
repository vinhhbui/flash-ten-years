# FLASH 10 — Memory Cat Interactive Wall

## 0. Codex mission

Build the **first digital prototype** of an interactive event memory wall.

A guest opens the site on a phone, decorates a predefined cat-shaped canvas, chooses one of two animations, submits the artwork, and the exact decorated cat appears almost immediately on a fullscreen Live Wall running on a laptop/projector.

This first prototype exists to prove one core experience:

> **Create on phone → Submit → Realtime delivery → Artwork comes alive on the main screen.**

Do not overengineer. Do not add AI, accounts, cloud services, paper scanning, complex physics, or admin systems until the core flow below works end-to-end.

---

# 1. Definition of Done

The prototype is considered successful only when all of these steps work:

1. A phone on the same Wi-Fi can open `/create`.
2. The user can decorate a cat silhouette.
3. Drawing is clipped to the cat shape.
4. The user can select `Float` or `Hop`.
5. Pressing **Bring Me To Life** exports a transparent PNG and submits it.
6. The server saves the PNG and metadata.
7. `/wall` receives the submission through Socket.IO without refreshing.
8. The exact submitted cat appears with a spawn/pop effect.
9. The selected animation starts automatically.
10. Refreshing `/wall` restores previous submissions.

Do not move to optional polish until these 10 items pass.

---

# 2. MVP scope

## In scope

- Mobile-first `/create` page
- Predefined cute cat silhouette
- Brush
- Eraser
- Brush size
- Color selection
- Text tool
- Small sticker set
- Undo
- Clear
- Animation selector
- `Float` animation
- `Hop` animation
- Transparent PNG export
- Local Node/Express backend
- Local filesystem image storage
- JSON metadata storage
- Socket.IO realtime broadcast
- Fullscreen `/wall`
- Restore previous submissions on wall load
- LAN support for phone + laptop testing

## Explicitly out of scope for this version

- Paper scanning
- OpenCV
- QR check-in
- Authentication
- User accounts
- Database
- Supabase/Firebase
- AI image understanding
- AI-generated animation
- Cloud deployment
- Moderation dashboard
- Complex collisions
- Three.js
- Multi-character templates
- Photo upload
- Production security hardening

Leave extension points where reasonable, but do not implement these yet.

---

# 3. Required stack

## Frontend

- React
- Vite
- TypeScript
- React Router
- `react-konva` / Konva.js for drawing
- GSAP for sprite animation
- Socket.IO client

## Backend

- Node.js
- Express
- TypeScript
- Socket.IO
- Local filesystem

## Storage

Artwork images:

```text
server/uploads/
```

Submission metadata:

```text
server/data/submissions.json
```

No database for MVP.

---

# 4. Recommended repository structure

```text
flash-ten-years/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CatCanvas.tsx
│   │   │   ├── DrawingToolbar.tsx
│   │   │   ├── AnimationSelector.tsx
│   │   │   ├── CatSprite.tsx
│   │   │   └── LiveWall.tsx
│   │   ├── pages/
│   │   │   ├── CreatePage.tsx
│   │   │   └── WallPage.tsx
│   │   ├── animations/
│   │   │   ├── floatAnimation.ts
│   │   │   └── hopAnimation.ts
│   │   ├── assets/
│   │   │   └── cat-template.svg
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   └── socket.ts
│   │   ├── types/
│   │   │   └── submission.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── server/
│   ├── src/
│   │   ├── index.ts
│   │   ├── storage.ts
│   │   └── types.ts
│   ├── uploads/
│   ├── data/
│   │   └── submissions.json
│   └── package.json
│
├── INSTRUCTIONS.md
└── README.md
```

Codex may adjust small structural details if needed, but keep the separation between create UI, wall UI, animations, socket handling, and server storage.

---

# 5. Core experience

## Route A — `/create`

Target device: phone.

Primary flow:

```text
Open /create
    ↓
Enter nickname (optional but recommended)
    ↓
Decorate cat
    ↓
Choose animation
    ↓
Preview
    ↓
Bring Me To Life
    ↓
Export transparent PNG
    ↓
POST to server
    ↓
Success state
```

The page should be simple enough that a first-time event attendee understands it immediately.

### Suggested visual hierarchy

```text
MAKE YOUR CAT

[ large cat canvas ]

[ drawing tools ]
[ colors ]

Choose how your cat moves
[ Float ] [ Hop ]

[ BRING ME TO LIFE ]
```

Mobile-first controls must be touch-friendly.

---

# 6. Cat template specification

Create a single SVG template at:

```text
client/src/assets/cat-template.svg
```

Requirements:

- Cute sticker-like silhouette
- White interior
- Black outline around `5–6px`
- Rounded body
- Two pointed ears
- Curved tail
- No predefined face
- No predefined eyes
- No predefined mouth
- Transparent exterior
- Easy to recognize at small sizes on the Live Wall

The user should feel like they are decorating a blank character rather than coloring a finished illustration.

## Drawing mask rule

The user must only be able to draw **inside the cat silhouette**.

Implement clipping/masking in Konva.

When exported:

- outside cat = transparent
- cat interior = user artwork
- cat outline remains visible
- no editor UI appears in export

The result should be usable directly as a sprite on the Live Wall.

---

# 7. Drawing tools

Implement only the following tools for MVP:

| Tool | Requirement |
|---|---|
| Brush | Freehand drawing inside cat mask |
| Eraser | Remove user-drawn content |
| Brush size | At least 3 practical sizes |
| Colors | Quick palette + optional color input |
| Text | Short draggable text inside cat |
| Stickers | Add draggable emoji/simple graphic stickers |
| Undo | Undo latest editor action |
| Clear | Reset decoration while keeping template |

Suggested sticker set:

- ❤️
- ⭐
- 🌸
- 🔥
- ✨
- 🎀
- 😎
- ⚡

Do not build layer panels, advanced transforms, filters, or Photoshop-style tooling.

---

# 8. Animation system

The animation choice must be stored as metadata, not baked into the PNG.

Supported values for MVP:

```ts
type AnimationType = "float" | "hop";
```

Keep animation functions separated so additional animation types can be added later.

---

# 9. Animation 1 — Float & Wiggle

Name in UI:

```text
Float
```

Behavior:

- gentle vertical movement
- slight rotation
- slow horizontal drift
- infinite loop
- smooth easing

Suggested motion range:

```text
y: currentY - 12px ↔ currentY + 12px
rotation: -3deg ↔ +3deg
```

Use GSAP with a sine-like easing.

The sprite should slowly move around the wall without permanently leaving the viewport.

Goal: feel like a floating handmade sticker.

---

# 10. Animation 2 — Hop Around

Name in UI:

```text
Hop
```

Behavior:

The cat repeatedly hops to nearby positions using a cartoon-like motion.

Each hop must include:

### Anticipation

```text
scaleX ≈ 1.10
scaleY ≈ 0.90
```

### Airborne stretch

```text
scaleX ≈ 0.95
scaleY ≈ 1.08
```

### Landing squash

```text
scaleX ≈ 1.15
scaleY ≈ 0.85
```

### Recovery

```text
scaleX = 1
scaleY = 1
```

Movement should follow a visible upward arc with horizontal travel.

Do not let the final target position fall outside the viewport.

Goal: feel playful and noticeably different from `Float`.

---

# 11. Submission data contract

Use a simple shared model.

```ts
interface Submission {
  id: string;
  name?: string;
  image: string;
  animation: "float" | "hop";
  createdAt: string;
}
```

Example:

```json
{
  "id": "cat_001",
  "name": "Thien",
  "image": "/uploads/cat_001.png",
  "animation": "hop",
  "createdAt": "2026-08-17T15:00:00.000Z"
}
```

Do not put base64 image data inside `submissions.json`.

---

# 12. API requirements

Minimum endpoints:

## `POST /api/submissions`

Purpose:

- accept exported artwork image
- validate animation type
- generate unique ID
- save PNG to `server/uploads/`
- append metadata to `server/data/submissions.json`
- broadcast `new_artwork`
- return the saved Submission object

## `GET /api/submissions`

Purpose:

- return all saved submissions
- allow `/wall` to restore artwork after refresh

## Static artwork route

Serve:

```text
/uploads/*
```

through Express.

---

# 13. Socket.IO contract

Server broadcasts:

```text
new_artwork
```

Payload:

```ts
Submission
```

Example:

```json
{
  "id": "cat_001",
  "name": "Thien",
  "image": "/uploads/cat_001.png",
  "animation": "hop",
  "createdAt": "2026-08-17T15:00:00.000Z"
}
```

The wall must not require refresh to show the new sprite.

Avoid inventing additional socket events unless necessary.

---

# 14. Live Wall `/wall`

Target device: laptop connected to projector / large screen.

Requirements:

- fullscreen-friendly
- no conventional gallery grid
- clean background
- artwork is the main focus
- load existing submissions on startup
- listen for `new_artwork`
- place sprites at varied positions
- execute each sprite's selected animation

## New submission entrance

When `new_artwork` arrives:

1. preload image
2. select safe spawn position
3. create sprite at scale `0`
4. animate scale up with a quick pop/overshoot
5. optionally show a short `New Memory!` label
6. start the selected animation

Entrance should feel immediate.

Target perceived latency on LAN: ideally under ~1 second after the server finishes receiving the image.

---

# 15. Sprite behavior rules

For this MVP:

- sprites may overlap occasionally
- no full physics engine is required
- avoid sprites being permanently fully offscreen
- use reasonable random positions
- keep sizes readable on a large display
- keep animation smooth with at least 30–50 sprites

Do not add Matter.js unless the simple GSAP approach proves insufficient.

---

# 16. LAN support

The prototype must support this physical test:

```text
PHONE
   │
   │ same Wi-Fi
   ↓
LAPTOP running app
   │
   └── projector / external display
```

Configure Vite with host access:

```ts
server: {
  host: "0.0.0.0"
}
```

Configure Express and Socket.IO CORS for LAN development.

Example test addresses:

```text
Phone:
http://192.168.x.x:5173/create

Laptop:
http://localhost:5173/wall
```

Document exact commands and how to find/use the laptop local IP in `README.md`.

Do not hardcode one LAN IP into application source.

---

# 17. Implementation board

Codex should implement in this order.

| Phase | Priority | Work | Exit condition |
|---|---:|---|---|
| 0 | P0 | Bootstrap client/server | Both apps run locally |
| 1 | P0 | Build cat SVG + create canvas | Cat renders correctly on phone-sized viewport |
| 2 | P0 | Brush + mask + erase + undo/clear | User can decorate only inside cat |
| 3 | P0 | Export transparent PNG | Export contains only final cat artwork |
| 4 | P0 | Server upload + JSON persistence | Submission survives server request and is retrievable |
| 5 | P0 | `/wall` loads stored cats | Refreshing wall restores prior submissions |
| 6 | P0 | Socket.IO realtime | New submission appears without wall refresh |
| 7 | P0 | `Float` animation | Float loops smoothly and stays visible |
| 8 | P0 | `Hop` animation | Hop visibly includes squash/stretch and arc |
| 9 | P1 | Text + stickers | Tools work inside intended artwork region |
| 10 | P1 | Spawn/pop polish | New submission feels visually rewarding |
| 11 | P1 | LAN phone/laptop test | Real phone submission appears on laptop wall |
| 12 | P1 | README + cleanup | Fresh clone can be run from documented steps |

Do not start a lower-priority phase if a P0 exit condition is broken.

---

# 18. Detailed task checklist

## Phase 0 — Bootstrap

- [ ] Initialize React + Vite + TypeScript client
- [ ] Initialize Node + Express + TypeScript server
- [ ] Add React Router
- [ ] Add Konva/react-konva
- [ ] Add GSAP
- [ ] Add Socket.IO server/client
- [ ] Create `/create` route
- [ ] Create `/wall` route
- [ ] Add basic dev scripts
- [ ] Add `.gitignore`

### Acceptance criteria

- client starts without errors
- server starts without errors
- both routes render

---

## Phase 1 — Cat canvas

- [ ] Create `cat-template.svg`
- [ ] Render template in `CatCanvas`
- [ ] Make canvas responsive for mobile
- [ ] Define clipping/masking path
- [ ] Separate template outline from editable artwork layer

### Acceptance criteria

- cat is clearly recognizable
- outside area remains transparent/non-drawable
- outline remains visible above user drawing

---

## Phase 2 — Drawing basics

- [ ] Brush drawing
- [ ] Eraser
- [ ] Brush size
- [ ] Color palette
- [ ] Undo stack
- [ ] Clear action

### Acceptance criteria

- rapid touch strokes work on phone
- no drawing leaks outside silhouette
- undo does not corrupt the editor

---

## Phase 3 — Export

- [ ] Export decorated cat as PNG
- [ ] Transparent background
- [ ] Exclude editor chrome/tools
- [ ] Preserve visible black outline
- [ ] Confirm export image dimensions are suitable for wall sprites

### Acceptance criteria

Open exported PNG independently and verify:

- cat is visible
- user decoration is visible
- outside is transparent
- no UI controls are included

---

## Phase 4 — Persistence

- [ ] Implement `POST /api/submissions`
- [ ] Save PNG to `server/uploads`
- [ ] Append metadata safely to JSON
- [ ] Implement `GET /api/submissions`
- [ ] Serve upload directory statically
- [ ] Handle missing JSON file gracefully on first run

### Acceptance criteria

- submit returns a valid Submission
- image URL is reachable
- metadata remains after refresh/restart

---

## Phase 5 — Initial wall

- [ ] Fetch submissions when `/wall` loads
- [ ] Render each as independent sprite
- [ ] Randomize safe starting positions
- [ ] Size sprites consistently
- [ ] Add fullscreen-friendly layout

### Acceptance criteria

- at least 10 stored submissions render without layout failure
- wall uses free positioning, not grid layout

---

## Phase 6 — Realtime

- [ ] Connect Socket.IO client
- [ ] Broadcast after successful persistence
- [ ] Receive `new_artwork` on wall
- [ ] Prevent duplicate insertion if needed
- [ ] Preload image before entrance animation

### Acceptance criteria

With `/wall` already open:

- submit from `/create`
- new artwork appears without refresh

---

## Phase 7 — Float animation

- [ ] Implement `floatAnimation.ts`
- [ ] vertical bob
- [ ] slight rotation
- [ ] horizontal drift
- [ ] viewport safety
- [ ] cleanup GSAP timeline on unmount

### Acceptance criteria

- animation loops continuously
- movement is gentle, not jittery
- sprite remains visible

---

## Phase 8 — Hop animation

- [ ] Implement `hopAnimation.ts`
- [ ] anticipation squash
- [ ] upward arc
- [ ] airborne stretch
- [ ] landing squash
- [ ] recovery
- [ ] random safe next destination

### Acceptance criteria

The motion visually reads as a cartoon jump, not simple linear movement.

---

## Phase 9 — Text and stickers

- [ ] Add short text
- [ ] Keep text movable inside practical bounds
- [ ] Add fixed sticker palette
- [ ] Support sticker repositioning
- [ ] Ensure both export correctly

### Acceptance criteria

Text and stickers appear in exported PNG and on the wall sprite.

---

## Phase 10 — Entrance polish

- [ ] spawn scale from 0
- [ ] overshoot/pop effect
- [ ] optional short `New Memory!` indicator
- [ ] prevent entrance and loop animation fighting over transform state

### Acceptance criteria

New submission is easy to notice on a busy wall.

---

## Phase 11 — Real LAN test

Test with two physical devices.

- [ ] laptop runs client + server
- [ ] phone connects through laptop LAN address
- [ ] `/create` works on phone
- [ ] `/wall` remains open on laptop
- [ ] draw on phone
- [ ] select Hop
- [ ] submit
- [ ] cat appears on laptop
- [ ] repeat with Float

### Acceptance criteria

Both animation choices successfully complete the full real-device flow.

---

# 19. Test matrix

| Test | Expected result |
|---|---|
| Draw near cat edge | Stroke is clipped cleanly |
| Erase drawing | Template outline remains |
| Undo multiple actions | Actions revert in correct order |
| Clear canvas | User decoration clears, base template stays |
| Export untouched cat | Valid transparent PNG |
| Export decorated cat | Decoration matches editor |
| Submit Float | Wall receives Float cat |
| Submit Hop | Wall receives Hop cat |
| Refresh wall | Existing cats reload |
| Restart server | Saved metadata/images remain |
| Submit from phone on LAN | Laptop wall updates realtime |
| 30 sprites | Animation remains reasonably smooth |
| Sprite approaches edge | It does not disappear permanently |

---

# 20. Error handling required for MVP

Handle these cases cleanly:

- server unavailable
- upload fails
- invalid animation value
- malformed base64/blob upload
- missing submissions JSON file
- missing artwork file
- socket reconnect
- wall receives duplicate event

User-facing create page should show a simple retryable failure state rather than silently failing.

---

# 21. UI direction

## Create page

Visual mood:

- playful
- warm
- minimal
- event-friendly
- large touch targets
- rounded controls
- artwork is visually dominant

Suggested copy:

```text
MAKE YOUR CAT
Decorate it. Bring it to life.
```

Primary CTA:

```text
BRING ME TO LIFE
```

Avoid a generic admin/dashboard look.

## Live Wall

Visual mood:

- immersive
- clean
- fullscreen
- minimal chrome
- animated artwork is the focus

Do not use cards around every cat.

---

# 22. Performance guidance

Target MVP:

```text
30–50 simultaneous sprites
```

Prefer:

- GPU-friendly transforms (`x`, `y`, `scale`, `rotation`)
- one timeline per sprite
- cleanup timelines on removal/unmount
- reasonable source image dimensions
- preload new artwork

Avoid:

- excessive React state updates every animation frame
- rerendering the entire wall during GSAP motion
- giant PNG exports
- unnecessary physics engine

---

# 23. README requirements

Create a root `README.md` after the functional flow works.

It must include:

1. What Memory Cat is
2. Architecture overview
3. Prerequisites
4. Installation
5. Client command
6. Server command
7. Local URLs
8. LAN testing instructions
9. How to find laptop local IP
10. `/create` usage
11. `/wall` usage
12. Current limitations
13. Screenshot/GIF section placeholder for later documentation

Do not write misleading instructions that have not been tested.

---

# 24. Codex working rules

1. Inspect the repository before every major implementation step.
2. Keep changes incremental and testable.
3. Prefer working code over architectural abstraction.
4. Do not introduce a database in MVP.
5. Do not introduce authentication in MVP.
6. Do not add AI in MVP.
7. Do not add Paper Mode in MVP.
8. Do not replace Konva + GSAP unless there is a demonstrated blocker.
9. Keep animation metadata independent from artwork image data.
10. Keep animation implementations modular.
11. Test the complete user flow after every P0 phase.
12. Fix core-flow regressions before adding polish.
13. Do not use mock submissions as a substitute for the real upload/socket path.
14. Never mark a phase complete unless its acceptance criteria pass.

---

# 25. Preferred implementation sequence for Codex sessions

If Codex is working over multiple sessions, use these milestones.

## Milestone A — Editor proof

Deliver:

```text
/create → decorate cat → export transparent PNG
```

Stop and verify export quality.

## Milestone B — Realtime proof

Deliver:

```text
/create → POST → server persistence → Socket.IO → /wall
```

At this milestone, static cats on the wall are acceptable.

## Milestone C — Living wall proof

Deliver:

```text
Float + Hop + spawn/pop + restore saved cats
```

## Milestone D — Event-device proof

Deliver:

```text
real phone → same Wi-Fi → laptop wall
```

Only after Milestone D is stable should UI polish continue.

---

# 26. Future extension — DO NOT IMPLEMENT YET

The architecture should later be able to support Paper Mode:

```text
Physical paper artwork
        ↓
Phone camera scan
        ↓
Perspective correction / crop
        ↓
Artwork extraction
        ↓
Same Submission model
        ↓
Same Animation Engine
        ↓
Same Live Wall
```

Future Paper Mode should join the system **before** the Submission/Animation layer so the Live Wall does not care whether artwork came from digital drawing or physical paper.

Other future possibilities:

- multiple character templates
- QR memory IDs
- event gallery/archive
- AI-based animation selection
- computer vision paper scan
- physics interactions
- finale where all artworks assemble into the FLASH 10 logo

These are roadmap items, not MVP requirements.

---

# 27. Final Codex instruction

Start by implementing only the smallest complete vertical slice:

```text
/create
   ↓
decorate one cat
   ↓
export PNG
   ↓
POST to server
   ↓
Socket.IO
   ↓
/wall
   ↓
show exact submitted cat
```

Once that slice works reliably, add `Float`, then `Hop`, then editor polish.

The demo is successful when a person can draw a cat on their phone and immediately see that exact cat come alive on the large screen.