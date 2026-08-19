import { getAnimation, type WallAnimationDefinition } from "../animations/animationRegistry";
import { getFrame, type FrameDefinition } from "../frames/frameRegistry";
import type { Submission } from "../types/submission";

export interface ResolvedWallVisual {
  frame: FrameDefinition;
  animation: WallAnimationDefinition;
}

export function resolveWallVisual(submission: Submission): ResolvedWallVisual {
  return {
    frame: getFrame(submission.frameId),
    animation: getAnimation(submission.animation),
  };
}
