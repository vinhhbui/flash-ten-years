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
  label: { id: "label", type: "label", worldX: 0, worldY: 42, localZ: -120, passDepth: 360 },
  title: { id: "title", type: "title", worldX: 0, worldY: -10, localZ: 0, passDepth: 430 },
  action: { id: "action", type: "action", worldX: 0, worldY: 400, localZ: 120, passDepth: 360 },
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
      { id: "object", type: "object", object: "ten", worldX: 335, worldY: 105, localZ: 250, rotation: -10, passDepth: 690 },
      { id: "accent", type: "accent", object: "disc", worldX: -360, worldY: 300, localZ: -850, rotation: 12, passDepth: 960 },
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
      { id: "object", type: "object", object: "ring", worldX: -360, worldY: 112, localZ: 210, rotation: 8, passDepth: 720 },
      { id: "accent", type: "accent", object: "frame", worldX: 395, worldY: 304, localZ: -840, rotation: -10, passDepth: 980 },
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
      { id: "object", type: "object", object: "disc", worldX: 360, worldY: 80, localZ: 270, rotation: -7, passDepth: 690 },
      { id: "accent", type: "accent", object: "ring", worldX: -390, worldY: 308, localZ: -860, rotation: 12, passDepth: 980 },
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
      { id: "object", type: "object", object: "frame", worldX: -360, worldY: 105, localZ: 235, rotation: 10, passDepth: 710 },
      { id: "accent", type: "accent", object: "star", worldX: 380, worldY: 300, localZ: -850, rotation: -8, passDepth: 980 },
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
      { id: "object", type: "object", object: "star", worldX: 330, worldY: 95, localZ: 220, rotation: 8, passDepth: 700 },
      { id: "accent", type: "accent", object: "ring", worldX: -350, worldY: 295, localZ: -610, rotation: -12, passDepth: 930 },
      sharedNodes.action,
    ],
  },
];
