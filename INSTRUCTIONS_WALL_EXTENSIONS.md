# FLASH 10 — Live Wall Extension Contract

## 0. Purpose

This document complements `INSTRUCTIONS_SCANNER_LIVE_WALL.md` and defines how the visual system must be structured so future changes to **animations** and **artwork frames/templates** remain easy and safe.

The scanner workflow must remain independent from visual presentation.

Future work should be possible without rewriting:

- scanner folder watching;
- PNG validation;
- deduplication;
- persistence;
- Socket.IO delivery;
- the base Live Wall route.

The design goal is:

> **Scanner produces a Submission → Live Wall resolves frame + animation from registries.**

Adding a new animation or a new frame should normally mean **adding one implementation and registering it**, not editing conditionals throughout the application.

---

# 1. Core extension principle

Do not hardcode visual behavior like this across components:

```ts
if (animation === "float") {
  // ...
} else if (animation === "hop") {
  // ...
} else if (animation === "spin") {
  // ...
}
```

Do not hardcode frame/template selection like this either:

```ts
if (frameId === "cat") {
  // ...
} else if (frameId === "film") {
  // ...
}
```

Instead, create two centralized registries:

```text
Animation Registry
Frame Registry
```

The rest of the Live Wall asks the registries for an implementation by ID.

---

# 2. Recommended structure

```text
client/src/
├── animations/
│   ├── animationRegistry.ts
│   ├── floatAnimation.ts
│   ├── hopAnimation.ts
│   └── ...future animations
│
├── frames/
│   ├── frameRegistry.ts
│   ├── catFrame.ts
│   ├── filmFrame.ts
│   └── ...future frames
│
├── components/
│   ├── CatSprite.tsx
│   ├── ArtworkSprite.tsx
│   └── LiveWall.tsx
│
└── types/
    └── submission.ts
```

The exact filenames may change, but the registry boundaries must remain.

---

# 3. Animation Registry

Create one central animation registration API.

Recommended contract:

```ts
export interface WallAnimationContext {
  element: HTMLElement;
  viewportWidth: number;
  viewportHeight: number;
  random?: () => number;
}

export interface WallAnimationDefinition {
  id: string;
  label: string;
  run(context: WallAnimationContext): () => void;
}
```

The return value of `run()` should be a cleanup function so GSAP timelines/listeners can be killed when a sprite unmounts.

Create a registry such as:

```ts
const animations = new Map<string, WallAnimationDefinition>();

export function registerAnimation(definition: WallAnimationDefinition) {
  if (animations.has(definition.id)) {
    throw new Error(`Animation already registered: ${definition.id}`);
  }

  animations.set(definition.id, definition);
}

export function getAnimation(id: string): WallAnimationDefinition {
  return animations.get(id) ?? animations.get("float")!;
}

export function listAnimations(): WallAnimationDefinition[] {
  return [...animations.values()];
}
```

Existing animations should be registered once:

```ts
registerAnimation(floatAnimation);
registerAnimation(hopAnimation);
```

Later, adding an animation should look like:

```ts
registerAnimation(spinAnimation);
```

or:

```ts
registerAnimation(bounceAnimation);
```

Do not require edits to scanner ingestion or Socket.IO for new animation types.

---

# 4. Animation implementation rule

Each animation owns its motion logic.

Example:

```ts
export const spinAnimation: WallAnimationDefinition = {
  id: "spin",
  label: "Spin",
  run({ element }) {
    const tween = gsap.to(element, {
      rotation: 360,
      duration: 4,
      repeat: -1,
      ease: "none",
    });

    return () => tween.kill();
  },
};
```

An animation module may control:

- position;
- rotation;
- scale;
- squash/stretch;
- opacity;
- path movement;
- looping GSAP timelines;
- idle motion.

It must not directly modify scanner state, submission storage, or Socket.IO.

---

# 5. Animation assignment must become registry-driven

The scanner instruction currently supports:

```text
float
hop
random
```

Refactor the assignment policy so `random` chooses from registered animations that are enabled for scanner use.

Do not permanently encode:

```ts
Math.random() > 0.5 ? "float" : "hop"
```

Prefer metadata in the animation definition or a configuration list.

Example:

```ts
export interface WallAnimationDefinition {
  id: string;
  label: string;
  enabledForScanner?: boolean;
  run(context: WallAnimationContext): () => void;
}
```

Then:

```ts
function chooseScannerAnimation(): string {
  const candidates = listAnimations().filter(
    (animation) => animation.enabledForScanner !== false,
  );

  return randomItem(candidates).id;
}
```

This keeps future additions simple.

---

# 6. Frame / template concept

A **frame** is the visual definition that determines how a scanned artwork is presented on the wall.

A frame can include:

- outer silhouette;
- crop/mask shape;
- artwork bounding box;
- aspect ratio;
- decorative border;
- overlay SVG/PNG;
- shadow;
- default scale;
- anchor point;
- optional scan crop coordinates;
- optional preprocess profile.

Examples of possible future frames:

```text
cat-v1
cat-v2
film-frame
polaroid
flash-logo
cloud
star
custom-event-frame
```

A frame is not an animation. Keep them independent.

The same frame should be able to use multiple animations, and the same animation should work with multiple frames when physically reasonable.

---

# 7. Frame Registry

Create one central frame registration API.

Recommended contract:

```ts
export interface FrameDefinition {
  id: string;
  label: string;

  aspectRatio: number;

  defaultWidth: number;
  defaultHeight: number;

  artworkInset?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };

  maskAsset?: string;
  overlayAsset?: string;

  preprocessProfile?: string;
}
```

Registry:

```ts
const frames = new Map<string, FrameDefinition>();

export function registerFrame(definition: FrameDefinition) {
  if (frames.has(definition.id)) {
    throw new Error(`Frame already registered: ${definition.id}`);
  }

  frames.set(definition.id, definition);
}

export function getFrame(id?: string): FrameDefinition {
  return frames.get(id ?? "cat-v1") ?? frames.get("cat-v1")!;
}

export function listFrames(): FrameDefinition[] {
  return [...frames.values()];
}
```

Example registration:

```ts
registerFrame({
  id: "cat-v1",
  label: "Original Cat",
  aspectRatio: 1,
  defaultWidth: 220,
  defaultHeight: 220,
  overlayAsset: "/frames/cat-v1-outline.svg",
});
```

Later, adding another frame should mainly be:

```ts
registerFrame({
  id: "polaroid",
  label: "Polaroid",
  aspectRatio: 4 / 5,
  defaultWidth: 220,
  defaultHeight: 275,
  overlayAsset: "/frames/polaroid.svg",
});
```

Do not add another large conditional branch to `LiveWall.tsx` for every new frame.

---

# 8. Submission model extension

The submission model must support identifying the selected frame independently from animation.

Recommended backward-compatible evolution:

```ts
interface Submission {
  id: string;
  name?: string;
  image: string;

  animation: string;
  frameId?: string;

  createdAt: string;

  source?: "digital" | "scanner";
  sourceHash?: string;
  originalFileName?: string;
}
```

Compatibility rule:

```text
missing frameId → use default frame
```

For old submissions:

```ts
frameId ?? "cat-v1"
```

Do not invalidate old `submissions.json` records.

The current values `float` and `hop` must continue to work.

---

# 9. One visual resolution function

Create one central function that resolves all visual properties of a Submission.

Recommended boundary:

```ts
export interface ResolvedWallVisual {
  frame: FrameDefinition;
  animation: WallAnimationDefinition;
}

export function resolveWallVisual(
  submission: Submission,
): ResolvedWallVisual {
  return {
    frame: getFrame(submission.frameId),
    animation: getAnimation(submission.animation),
  };
}
```

This is the preferred **single function used by Live Wall sprites when deciding how an item should look and move**.

The rendering path becomes:

```text
Submission
    ↓
resolveWallVisual(submission)
    ↓
frame definition + animation definition
    ↓
ArtworkSprite
    ↓
Live Wall
```

Future visual changes should enter through this boundary instead of spreading logic across the application.

---

# 10. One place to change event defaults

Create a simple event visual configuration.

Recommended file:

```text
client/src/config/wallVisualConfig.ts
```

Example:

```ts
export const wallVisualConfig = {
  defaultFrameId: "cat-v1",
  scannerAnimationMode: "random",
  scannerAnimationIds: ["float", "hop"],
};
```

or keep scanner-side defaults in the server if necessary, but maintain one obvious configuration boundary.

A future event adjustment should ideally require changing this config plus registering new assets/functions—not editing core wall logic.

---

# 11. Future frame update workflow

When the user asks to **adjust the existing frame**, Codex should:

1. locate the relevant `FrameDefinition`;
2. update its size/mask/overlay/inset values;
3. update the associated SVG/PNG asset if necessary;
4. verify existing submissions still render;
5. avoid modifying scanner ingestion unless the physical scan crop itself changed.

When the user asks to **add a frame**, Codex should:

1. add the frame asset(s);
2. add one `FrameDefinition`;
3. call `registerFrame()` once;
4. optionally expose the frame in operator/event config;
5. verify it using existing wall rendering.

Do not duplicate the wall component.

---

# 12. Future animation update workflow

When the user asks to **adjust an animation**, Codex should:

1. locate its `WallAnimationDefinition`;
2. modify only that animation implementation where possible;
3. keep the animation ID stable if existing submissions reference it;
4. verify cleanup on unmount;
5. verify sprites remain inside usable viewport bounds.

When the user asks to **add an animation**, Codex should:

1. create one new animation module;
2. expose a stable ID;
3. call `registerAnimation()` once;
4. optionally enable it for scanner random assignment;
5. test it with the existing `ArtworkSprite` / Live Wall;
6. do not modify scanner ingestion or Socket.IO contracts.

---

# 13. Optional combined preset layer

If later the event needs curated combinations such as:

```text
Cat + Hop
Film Frame + Float
Polaroid + Drift
Star + Spin
```

add a lightweight preset layer instead of coupling frame and animation implementations.

Example:

```ts
export interface WallPreset {
  id: string;
  frameId: string;
  animationIds: string[];
}
```

Possible registry:

```ts
registerWallPreset({
  id: "flash-cat",
  frameId: "cat-v1",
  animationIds: ["float", "hop"],
});
```

This is optional and should not be implemented until actual preset switching is requested.

---

# 14. Image preprocessing and frames

Keep scan preprocessing behind the existing boundary:

```ts
async function preprocessScan(inputPath: string): Promise<Buffer>
```

If future physical paper templates require different crop regions or masks, allow `preprocessScan()` to receive a profile/frame ID rather than branching throughout scanner watcher code.

Possible future contract:

```ts
async function preprocessScan(
  inputPath: string,
  profileId: string,
): Promise<Buffer>
```

or:

```ts
async function preprocessScan(
  inputPath: string,
  frame: FrameDefinition,
): Promise<Buffer>
```

Do not implement this complexity until actual scan extraction is requested.

---

# 15. Rules Codex must preserve

- Scanner ingestion must not know GSAP implementation details.
- Scanner ingestion must not render frames.
- Animation modules must not read scanner folders.
- Frame definitions must not manage Socket.IO.
- Live Wall must resolve visual behavior through registries.
- New animation IDs must not require a new socket event.
- New frame IDs must not require a new socket event.
- Existing submissions must continue to render.
- Unknown animation IDs should safely fall back to a default.
- Unknown frame IDs should safely fall back to the default frame.
- Registration IDs must be unique.
- Animation cleanup must be explicit.
- Avoid giant switch/if chains for animation or frame selection.

---

# 16. Future Definition of Done

The extension architecture is considered successful when these changes are possible independently:

### Add animation

```text
create animation implementation
        ↓
registerAnimation(...)
        ↓
optionally enable in event config
        ↓
works on Live Wall
```

No scanner refactor required.

### Add frame

```text
add SVG/PNG/frame configuration
        ↓
registerFrame(...)
        ↓
optionally select in event config
        ↓
works on Live Wall
```

No scanner refactor required.

### Adjust frame

```text
update one FrameDefinition / asset
        ↓
Live Wall uses new geometry
```

### Adjust animation

```text
update one WallAnimationDefinition
        ↓
Live Wall uses new motion
```

---

# 17. Final instruction to Codex

When implementing or refactoring the Live Wall, preserve these extension points even if only `float`, `hop`, and one cat frame currently exist.

The target developer experience is:

> **One new animation = one implementation + one `registerAnimation()` call.**
>
> **One new frame = one definition/assets + one `registerFrame()` call.**
>
> **Live Wall consumes both through `resolveWallVisual(submission)`.**

Do not overbuild a plugin framework. A small typed registry is enough for this project.