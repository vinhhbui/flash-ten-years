import { wallVisualConfig } from "../config/wallVisualConfig";
import { floatAnimation } from "./floatAnimation";
import { hopAnimation } from "./hopAnimation";

export interface WallAnimationContext {
  element: HTMLElement;
  origin: { x: number; y: number };
  viewportWidth: number;
  viewportHeight: number;
  random?: () => number;
}

export interface WallAnimationDefinition {
  id: string;
  label: string;
  enabledForScanner?: boolean;
  run(context: WallAnimationContext): () => void;
}

const animations = new Map<string, WallAnimationDefinition>();

export function registerAnimation(definition: WallAnimationDefinition) {
  if (animations.has(definition.id)) {
    throw new Error(`Animation already registered: ${definition.id}`);
  }
  animations.set(definition.id, definition);
}

export function getAnimation(id: string): WallAnimationDefinition {
  return animations.get(id) ?? animations.get(wallVisualConfig.defaultAnimationId)!;
}

export function listAnimations(): WallAnimationDefinition[] {
  return [...animations.values()];
}

registerAnimation(floatAnimation);
registerAnimation(hopAnimation);
