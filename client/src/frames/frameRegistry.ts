import { wallVisualConfig } from "../config/wallVisualConfig";
import { catFrame } from "./catFrame";

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

const frames = new Map<string, FrameDefinition>();

export function registerFrame(definition: FrameDefinition) {
  if (frames.has(definition.id)) {
    throw new Error(`Frame already registered: ${definition.id}`);
  }
  frames.set(definition.id, definition);
}

export function getFrame(id?: string): FrameDefinition {
  return frames.get(id ?? wallVisualConfig.defaultFrameId) ?? frames.get(wallVisualConfig.defaultFrameId)!;
}

export function listFrames(): FrameDefinition[] {
  return [...frames.values()];
}

registerFrame(catFrame);
