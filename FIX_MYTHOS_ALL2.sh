#!/usr/bin/env bash
set -euo pipefail

# FIX_MYTHOS_ALL.sh
# Run from repo root:  ./FIX_MYTHOS_ALL.sh
# What it does:
# 1) Restores a valid frontend/src/engine/assets.ts (fixes your current esbuild parse error).
# 2) Patches frontend/src/engine/Renderer.ts to auto-normalize GLB sizes (per-asset bounding-box normalization, NOT one global scale).
# 3) Optionally downloads known-safe public sample GLBs if missing (RobotExpressive is CC0 per three.js; other sample models are from Khronos sample repos—check their per-model README/license). :contentReference[oaicite:0]{index=0}

ROOT="$(pwd)"

ASSETS_TS="frontend/src/engine/assets.ts"
RENDERER_TS="frontend/src/engine/Renderer.ts"

mkdir -p "$(dirname "$ASSETS_TS")"
mkdir -p "$(dirname "$RENDERER_TS")"

backup() {
  local f="$1"
  if [[ -f "$f" ]]; then
    cp -a "$f" "$f.bak.$(date +%Y%m%d_%H%M%S)"
  fi
}

backup "$ASSETS_TS"
backup "$RENDERER_TS"

# -------------------------
# 1) Restore assets.ts
# -------------------------
cat > "$ASSETS_TS" <<'TS'
export type AssetStyle = "assets" | "procedural";

export type AssetSpec = {
  url: string;
  scale: number;
  yOffset?: number;
  rotateY?: number;
  tint?: string;
  emissive?: string;
  roughness?: number;
  metalness?: number;
};

export type AssetSet = Record<string, AssetSpec>;

const BASE_ASSETS: AssetSet = {
  settler: { url: "/assets/models/external/neil_armstrong.glb", scale: 0.9 },
  tribe: { url: "/assets/models/external/soldier.glb", scale: 0.9 },
  pilot: { url: "/assets/models/external/astronaut.glb", scale: 0.9 },
  fae: { url: "/assets/models/external/astronaut.glb", scale: 0.85 },
  fauna: { url: "/assets/models/external/horse.glb", scale: 0.7 },
  beast: { url: "/assets/models/external/horse.glb", scale: 0.75 },
  outsider: { url: "/assets/models/generated/alien.glb", scale: 0.9 },
  voidborn: { url: "/assets/models/generated/alien.glb", scale: 0.95 },
  synth: { url: "/assets/models/external/robot_expressive.glb", scale: 0.8 },
  habitat: { url: "/assets/models/generated/habitat.glb", scale: 1.0 },
  obelisk: { url: "/assets/models/generated/obelisk.glb", scale: 1.1 },
  station: { url: "/assets/models/external/rocket_ship.glb", scale: 1.4, rotateY: Math.PI },
  grove: { url: "/assets/models/generated/tree.glb", scale: 1.1 },
  cycad: { url: "/assets/models/generated/cycad.glb", scale: 1.1 },
  saurian: { url: "/assets/models/generated/dino.glb", scale: 1.05 },
  raptor: { url: "/assets/models/generated/dino.glb", scale: 0.85 },
  wyrm: { url: "/assets/models/generated/dino.glb", scale: 1.2 },
};

export const ASSET_SETS: Record<string, AssetSet> = {
  living: {
    ...BASE_ASSETS,
    settler: { ...BASE_ASSETS.settler, tint: "#d8c2a5" },
    fauna: { ...BASE_ASSETS.fauna, tint: "#5e8b5a" },
    outsider: { ...BASE_ASSETS.outsider, tint: "#6ad4c5", emissive: "#6ad4c5" },
    habitat: { ...BASE_ASSETS.habitat, tint: "#c2b3a3" },
    grove: { ...BASE_ASSETS.grove, tint: "#4c7f56" },
  },
  fantasy: {
    ...BASE_ASSETS,
    fae: { ...BASE_ASSETS.fae, tint: "#c9a6ff", emissive: "#c9a6ff" },
    beast: { ...BASE_ASSETS.beast, tint: "#9ed37a" },
    obelisk: { ...BASE_ASSETS.obelisk, tint: "#c6a8ff", emissive: "#c6a8ff", metalness: 0.3 },
    wyrm: { ...BASE_ASSETS.wyrm, tint: "#a67cff", emissive: "#7b5aff" },
    grove: { ...BASE_ASSETS.grove, tint: "#3d6f50" },
  },
  dino: {
    ...BASE_ASSETS,
    tribe: { ...BASE_ASSETS.tribe, tint: "#c49a6c" },
    saurian: { ...BASE_ASSETS.saurian, tint: "#6f9c62" },
    raptor: { ...BASE_ASSETS.raptor, tint: "#9bbd5a" },
    cycad: { ...BASE_ASSETS.cycad, tint: "#6b8f4f" },
  },
  space: {
    ...BASE_ASSETS,
    pilot: { ...BASE_ASSETS.pilot, tint: "#bcd7ff" },
    synth: { ...BASE_ASSETS.synth, tint: "#7fd0ff", emissive: "#2aa5ff", metalness: 0.8 },
    station: { ...BASE_ASSETS.station, tint: "#cfd7e6", metalness: 0.5, roughness: 0.35 },
    outsider: { ...BASE_ASSETS.voidborn, tint: "#7affd6", emissive: "#7affd6" },
  },
};

export const ASSET_KIND_FALLBACK: Record<string, keyof AssetSet> = {
  humanoid: "settler",
  animal: "fauna",
  alien: "outsider",
  machine: "synth",
  building: "habitat",
  tree: "grove",
  dino: "saurian",
};
TS

# -------------------------
# 2) Patch Renderer.ts (auto-normalize base asset size by bounding box)
# -------------------------
python3 - <<'PY'
from pathlib import Path
import re

p = Path("frontend/src/engine/Renderer.ts")
s = p.read_text(encoding="utf-8")

if "MYTHOS_ASSET_NORMALIZE_v1" in s:
    print("OK: Renderer.ts already patched (MYTHOS_ASSET_NORMALIZE_v1).")
    raise SystemExit(0)

# Insert helper method into class (after applyAssetMaterial method block)
# We locate "private applyAssetMaterial" and insert after its closing brace.
m = re.search(r"\n\s*private applyAssetMaterial\([\s\S]*?\n\s*\}\n", s)
if not m:
    raise SystemExit("ERROR: Could not find applyAssetMaterial() in Renderer.ts to insert normalization helper.")

insert_at = m.end()

helper = r'''
  // MYTHOS_ASSET_NORMALIZE_v1
  // Normalize each loaded GLB to an expected world-space size using bounding boxes.
  // This fixes inconsistent authoring units (cm vs m) without applying one global scale.
  private normalizeLoadedAsset(key: string, root: THREE.Object3D) {
    // Target “heights” in meters-ish units (tuned for your sim scale).
    // If a model is not upright / has weird bounds, we fall back to max dimension.
    const TARGET: Record<string, number> = {
      // humanoids
      settler: 1.7,
      tribe: 1.7,
      pilot: 1.7,
      fae: 1.7,
      // animals
      fauna: 1.5,
      beast: 1.5,
      // aliens/robots
      outsider: 1.8,
      voidborn: 1.9,
      synth: 1.7,
      // structures/foliage
      habitat: 3.0,
      obelisk: 4.0,
      station: 6.0,
      grove: 5.0,
      cycad: 4.0,
      // dinos
      saurian: 3.0,
      raptor: 2.0,
      wyrm: 4.0,
    };

    const target = TARGET[key] ?? 2.0;

    const box = new THREE.Box3().setFromObject(root);
    const size = new THREE.Vector3();
    box.getSize(size);

    const h = size.y if hasattr(size, "y") else 0.0
  }
'''
# The above contains Python-incompatible "hasattr" because it's TS; fix by writing proper TS.
helper = '''
  // MYTHOS_ASSET_NORMALIZE_v1
  // Normalize each loaded GLB to an expected world-space size using bounding boxes.
  // This fixes inconsistent authoring units (cm vs m) without applying one global scale.
  private normalizeLoadedAsset(key: string, root: THREE.Object3D) {
    // Target “heights” in meters-ish units (tuned for your sim scale).
    // If a model is not upright / has weird bounds, we fall back to max dimension.
    const TARGET: Record<string, number> = {
      // humanoids
      settler: 1.7,
      tribe: 1.7,
      pilot: 1.7,
      fae: 1.7,
      // animals
      fauna: 1.5,
      beast: 1.5,
      // aliens/robots
      outsider: 1.8,
      voidborn: 1.9,
      synth: 1.7,
      // structures/foliage
      habitat: 3.0,
      obelisk: 4.0,
      station: 6.0,
      grove: 5.0,
      cycad: 4.0,
      // dinos
      saurian: 3.0,
      raptor: 2.0,
      wyrm: 4.0,
    };

    const target = TARGET[key] ?? 2.0;

    // Compute bounds
    const box = new THREE.Box3().setFromObject(root);
    const size = new THREE.Vector3();
    box.getSize(size);

    const height = size.y > 0 ? size.y : Math.max(size.x, size.z);
    if (!Number.isFinite(height) || height <= 0) return;

    // Scale to target, clamp to avoid crazy spikes
    let factor = target / height;
    factor = Math.min(100, Math.max(0.001, factor));
    root.scale.multiplyScalar(factor);

    // Recompute bounds and place on ground (feet at y=0)
    const box2 = new THREE.Box3().setFromObject(root);
    const minY = box2.min.y;
    if (Number.isFinite(minY)) {
      root.position.y -= minY;
    }
  }
'''

s2 = s[:insert_at] + helper + s[insert_at:]

# Now call normalizeLoadedAsset() inside loadAssetBase right after "scene" is chosen.
# Find "const scene = gltf.scene || gltf.scenes[0];" and insert a call.
s2, n = re.subn(
    r"(const scene = gltf\.scene \|\| gltf\.scenes\[0\];\n)",
    r"\1          this.normalizeLoadedAsset(key, scene);\n",
    s2,
    count=1,
)
if n != 1:
    raise SystemExit("ERROR: Could not insert normalizeLoadedAsset() call in loadAssetBase().")

p.write_text(s2, encoding="utf-8")
print("OK: Patched Renderer.ts (MYTHOS_ASSET_NORMALIZE_v1).")
PY

# -------------------------
# 3) Optional: download missing sample models (only if the target paths are missing)
# -------------------------
mkdir -p frontend/public/assets/models/external
mkdir -p frontend/public/assets/models/generated

dl_if_missing () {
  local url="$1"
  local out="$2"
  if [[ -f "$out" ]]; then
    return 0
  fi
  echo "[DL] $out"
  curl -L --fail --retry 3 --retry-delay 1 -o "$out" "$url"
}

# These URLs are public sample assets.
# RobotExpressive is CC0 per three.js. :contentReference[oaicite:1]{index=1}
dl_if_missing "https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb" \
  "frontend/public/assets/models/external/robot_expressive.glb"

# If you already have your own models, these are ignored (they only download if missing).
# (Khronos sample repos contain many models; each model folder has its own README/license. :contentReference[oaicite:2]{index=2})
dl_if_missing "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Astronaut/glTF-Binary/Astronaut.glb" \
  "frontend/public/assets/models/external/astronaut.glb" || true
dl_if_missing "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/CesiumMan/glTF-Binary/CesiumMan.glb" \
  "frontend/public/assets/models/external/neil_armstrong.glb" || true
dl_if_missing "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Horse/glTF-Binary/Horse.glb" \
  "frontend/public/assets/models/external/horse.glb" || true

# Placeholder externals if you reference them but they aren't present; comment out if you don't want them.
dl_if_missing "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Soldier/glTF-Binary/Soldier.glb" \
  "frontend/public/assets/models/external/soldier.glb" || true
dl_if_missing "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Rocket/glTF-Binary/Rocket.glb" \
  "frontend/public/assets/models/external/rocket_ship.glb" || true

echo "OK: assets.ts restored + Renderer.ts normalized + optional downloads attempted."
