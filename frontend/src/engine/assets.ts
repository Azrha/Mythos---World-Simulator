export type AssetStyle = "assets" | "procedural";

export type AssetSpec = {
  url: string;
  scale: number;
  yOffset?: number;
  rotateY?: number;
};

export const ASSET_MANIFEST: Record<string, AssetSpec> = {
  settler: { url: "/assets/models/external/neil_armstrong.glb", scale: 0.9, yOffset: 0.0 },
  tribe: { url: "/assets/models/external/soldier.glb", scale: 0.9, yOffset: 0.0 },
  pilot: { url: "/assets/models/external/astronaut.glb", scale: 0.9, yOffset: 0.0 },
  fae: { url: "/assets/models/external/astronaut.glb", scale: 0.85, yOffset: 0.0 },
  fauna: { url: "/assets/models/external/horse.glb", scale: 0.7, yOffset: 0.0 },
  beast: { url: "/assets/models/external/horse.glb", scale: 0.75, yOffset: 0.0 },
  outsider: { url: "/assets/models/generated/alien.glb", scale: 0.9, yOffset: 0.0 },
  voidborn: { url: "/assets/models/generated/alien.glb", scale: 0.95, yOffset: 0.0 },
  synth: { url: "/assets/models/external/robot_expressive.glb", scale: 0.8, yOffset: 0.0 },
  habitat: { url: "/assets/models/generated/habitat.glb", scale: 1.0, yOffset: 0.0 },
  obelisk: { url: "/assets/models/generated/obelisk.glb", scale: 1.1, yOffset: 0.0 },
  station: { url: "/assets/models/external/rocket_ship.glb", scale: 1.4, yOffset: 0.0, rotateY: Math.PI },
  grove: { url: "/assets/models/generated/tree.glb", scale: 1.1, yOffset: 0.0 },
  cycad: { url: "/assets/models/generated/cycad.glb", scale: 1.1, yOffset: 0.0 },
  saurian: { url: "/assets/models/generated/dino.glb", scale: 1.05, yOffset: 0.0 },
  raptor: { url: "/assets/models/generated/dino.glb", scale: 0.85, yOffset: 0.0 },
  wyrm: { url: "/assets/models/generated/dino.glb", scale: 1.2, yOffset: 0.0 },
};

export const ASSET_KIND_FALLBACK: Record<string, string> = {
  humanoid: "settler",
  animal: "fauna",
  alien: "outsider",
  machine: "synth",
  building: "habitat",
  tree: "grove",
  dino: "saurian",
};
