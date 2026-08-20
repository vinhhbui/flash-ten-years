export type SpatialObject = "ten" | "ring" | "disc" | "frame" | "star";

export interface SpatialNodeConfig {
  id: string;
  type: "label" | "title" | "object" | "accent" | "action";
  worldX: number;
  worldY: number;
  localZ: number;
  rotation?: number;
  passDepth?: number;
  object?: SpatialObject;
}

export interface SpatialSceneConfig {
  id: string;
  title: string;
  label: string;
  worldZ: number;
  cta?: boolean;
  nodes: SpatialNodeConfig[];
}

const sharedNodes = {
  label: { id: "label", type: "label", worldX: 0, worldY: -120, localZ: -160, passDepth: 1000 },
  title: { id: "title", type: "title", worldX: 0, worldY: -10, localZ: 0, passDepth: 1000 },
  action: { id: "action", type: "action", worldX: 0, worldY: 300, localZ: 120, passDepth: 360 },
} as const;

export const spatialScenes: SpatialSceneConfig[] = [
  {
    id: "flash10",
    title: "F L A S H 1 0",
    label: "THE ROAD STARTS HERE",
    worldZ: 3500,
    nodes: [
      sharedNodes.label,
      sharedNodes.title,
      { id: "object", type: "object", object: "ten", worldX: 300, worldY: 135, localZ: 180, rotation: -10, passDepth: 760 },
      { id: "accent", type: "accent", object: "disc", worldX: -330, worldY: 285, localZ: -620, rotation: 12, passDepth: 1050 },
    ],
  },
  {
    id: "ten-years",
    title: "TEN YEARS",
    label: "2016 — 2026",
    worldZ: 5900,
    nodes: [
      sharedNodes.label,
      sharedNodes.title,
      { id: "object", type: "object", object: "ring", worldX: -320, worldY: 130, localZ: 180, rotation: 8, passDepth: 760 },
      { id: "accent", type: "accent", object: "frame", worldX: 350, worldY: 280, localZ: -620, rotation: -10, passDepth: 1050 },
    ],
  },
  {
    id: "connected",
    title: "CONNECTED",
    label: "ONE ROAD / MANY FRAMES",
    worldZ: 8300,
    nodes: [
      sharedNodes.label,
      sharedNodes.title,
      { id: "object", type: "object", object: "disc", worldX: 320, worldY: 120, localZ: 200, rotation: -7, passDepth: 760 },
      { id: "accent", type: "accent", object: "ring", worldX: -350, worldY: 290, localZ: -640, rotation: 12, passDepth: 1050 },
    ],
  },
  {
    id: "flashback",
    title: "FLASHBACK",
    label: "THE ARCHIVE IS MOVING",
    worldZ: 10700,
    nodes: [
      sharedNodes.label,
      sharedNodes.title,
      { id: "object", type: "object", object: "frame", worldX: -320, worldY: 130, localZ: 190, rotation: 10, passDepth: 760 },
      { id: "accent", type: "accent", object: "star", worldX: 350, worldY: 285, localZ: -620, rotation: -8, passDepth: 1050 },
    ],
  },
  {
    id: "memory",
    title: "MAKE A MEMORY",
    label: "YOUR NEXT FRAME IS READY",
    worldZ: 13100,
    cta: true,
    nodes: [
      sharedNodes.label,
      sharedNodes.title,
      { id: "object", type: "object", object: "star", worldX: 290, worldY: 115, localZ: 180, rotation: 8, passDepth: 760 },
      { id: "accent", type: "accent", object: "ring", worldX: -310, worldY: 280, localZ: -520, rotation: -12, passDepth: 1000 },
      sharedNodes.action,
    ],
  },
];
