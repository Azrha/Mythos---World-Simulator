# Mythos Roadmap — Alive World (Magnum Opus)

## Definition of "100% Alive"
An alive world is a system where autonomous agents exhibit persistent motion, social behavior, environmental response, resource loops (growth/consumption), temporal cycles, and observable emergent patterns. It should include visual depth, interaction feedback, and data/metrics to verify stability and realism.

## Phase 1 — Core Life Systems (Done)
- [x] Autonomous motion (wander/seek/avoid)
- [x] Social behavior (cohere/align/separate)
- [x] Day/night cycle and atmosphere lighting
- [x] Food field + metabolism + energy + survival
- [x] Living World preset (humans/animals/aliens/buildings/trees)
- [x] WorldPack format + loader + UI integration

## Phase 2 — Visual Depth & 3D (In Progress)
- [x] Add Z axis to entities and velocity
- [x] 3D render mode (interactive)
- [x] Depth-aware palette + visual cues (size/opacity)
- [x] Custom WebGL engine (React client)
- [x] Real 3D asset pipeline (GLTF loader + caching + UI toggle)
- [x] Per-world asset mapping (humanoids, fauna, dinos, structures)

## Phase 3 — Environment Complexity
- [x] Terrain/heightmap and biomes (foundation)
- [x] Weather system (wind + day/night + cloudiness)
- [x] Seasonal cycles (growth modulation)
- [x] Climate zones and rainfall gradients
- [x] Water/river flow and soil fertility (affects food)

## Phase 4 — Society & Economy
- [x] Settlements (basic emitters + fields)
- [x] Migration and route selection (road following)
- [x] Zoning (homes, markets, farms) foundation
- [x] Scarcity dynamics + trade loops (energy/wealth exchange)

## Phase 5 — Narrative WorldPacks
- [ ] Faction templates for lore worlds (e.g., “kingdoms”, “pirate fleets”)
- [ ] WorldPack tooling: schema validation + editor helpers
- [ ] Behavior libraries (role-based behaviors)

## Phase 5.1 — World Identity & Differentiation (New)
- [ ] Distinct visual themes per worldpack (sky/terrain palettes, water tint, fog, lighting)
- [ ] Unique species rosters per worldpack (avoid reusing human/alien/building defaults)
- [ ] World-specific physics profiles (gravity/drag/collision ranges tuned per setting)
- [ ] Terrain + climate signatures per world (seed/scale, rainfall, fertility bias)
- [ ] Per-world sound/mood profiles (ambient emitters + seasonal intensity curves)
- [ ] Validation rule: each worldpack must change at least 3 axes (visual, species, physics, terrain)

## Phase 5.2 — 3D Asset Integration Plan (New)
- [x] Establish asset folder + attribution
- [x] Import CC0/Apache-2.0 models and generate custom GLB assets
- [x] Asset style switch (real assets vs procedural)
- [ ] Model fidelity pass (higher detail trees, buildings, dinos)
- [ ] Animated rigs per species (walk cycles and idle loops)
- [ ] World-specific asset sets (fantasy vs dino vs space visuals)

## Phase 6 — Observability & QA
- [ ] Diagnostics overlays (energy, density, motion)
- [ ] Performance tests and reproducibility report
- [ ] Snapshot render diffs for regressions

## Future Ideas to Add (Review and Expand)
- Ecosystem reproduction and aging curves
- Predation chains and fear/avoidance
- Day/night behaviors (sleep cycles)
- Events system (meteor strikes, plagues, discovery)
- Road/river pathing with attract/repel layers
- Fire/wildfire dynamics and recovery
- Ocean currents + tidal effects
- Multi-species memory/learning traits
- Procedural city generation with districts
- Neural “moods” that shift behavior over time
- Trade routes and caravan movement
- Infrastructure decay and repair loops
- Cultural diffusion and influence fields
- Ocean/river shipping lanes

## Current Findings (Post-Move Review)
- WorldPacks share too many defaults (humans/aliens/buildings), so worlds feel visually similar.
- Terrain/lighting themes are not explicitly tied to worldpack identity.
- Behavior sets overlap heavily; unique ecology loops per world are limited.
