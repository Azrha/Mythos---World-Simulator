# MYTHOS — Reality Compiler

You don't program steps. You program **laws**.

Write laws in the MYTHOS DSL → compile → a world emerges.

## Run (single command)
~~~bash
./run_stack.sh
~~~
If you get permissions errors, fix ownership first:
~~~bash
sudo chown -R $USER:$USER ~/Mythos
~~~
This script installs Node 20.19 via `nvm`, creates the Python venv, starts the backend, waits for `/api/health`, then launches the React dev server.

## Manual dev (optional)
~~~bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn server.main:app --reload --port 8000

cd frontend
npm install
npm run dev
~~~
Open `http://localhost:5173` and connect to the backend at `http://localhost:8000`.
If you need to change the backend URL, copy `frontend/.env.example` to `frontend/.env`.
Frontend requires Node 20.19+ (see `frontend/.nvmrc`).
If Vite was upgraded or dependencies drifted, reset:
~~~bash
./RESET_FRONTEND_DEPS.sh
~~~

## Optional GPU acceleration
GPU acceleration is supported for field diffusion and heatmaps via CuPy.
~~~bash
pip install cupy-cuda12x
~~~
Enable `GPU acceleration` in the sidebar.

## Database
Set `DATABASE_URL` to use PostgreSQL (recommended). A Docker template is provided:
~~~bash
docker compose up -d
export DATABASE_URL=postgresql+psycopg://mythos:mythos@localhost:5432/mythos
~~~
Default SQLite DB is stored at `~/.mythos/data.sqlite3`.

## 3D mode
The React client includes a custom WebGL engine with a popup 3D view.

## Quick start
1) Open the app, pick `real_world.law`, and click `Apply laws`.
2) Hit `Run` to simulate; use `Step` for single ticks.
3) Adjust `Seed`, `Entities`, and observer settings, then `Reset world` to re-seed.

## UI overview
- Left: editor + examples + export.
- Right: world view, metrics, export, and diagnostics.
- The app auto-refreshes while running without manual reruns.

## DSL overview (quick)
- Define constants:
  ~~~
  const G = 0.35
  const MAX_SPEED = 4.0
  ~~~
  - Optional: `SUBSTEPS` for stability, `W`, `H`, `DT` for world config, `DAY_CYCLE` for lighting
  - Optional: `WEATHER_CYCLE`, `SEASON_CYCLE`, `TERRAIN_SEED`, `TERRAIN_SCALE`, `TERRAIN_SMOOTH`, `WIND_X`, `WIND_Y`
- Define laws:
  ~~~
  law gravity priority 10
    when true
    do vy += G
  end
  ~~~

- Entity fields you can use in `when`:
  - `x,y,z,vx,vy,vz,mass,hardness,color,age,seen,alive,sound,energy,wealth,terrain,water,fertility,season,climate,rain,latitude,road,settlement,home,farm,market`
- Effects you can use in `do`:
  - `x += expr`, `y += expr`, `vx += expr`, `vy += expr`
  - `mass *= expr`, `hardness += expr`, `sound += expr`
  - `seen = expr`, `alive = expr`, `color = expr`
  - `emit_sound(expr)` (adds sound energy to entity + local field)
  - `attract(radius, strength, selector)` (field interaction)
  - `repel(radius, strength, selector)`
  - `decay_unseen(rate)` (kills entities not observed)
  - `fade_color(rate)` (towards gray)
  - `clamp_speed(MAX_SPEED)`
  - `drag(rate)` (velocity damping)
  - `bounce([W, H, restitution])` (reflect off bounds)
  - `collide([radius, restitution, friction])` (entity collisions)
  - `wander(strength)` (random drift)
  - `seek(x, y, strength)`, `avoid(x, y, strength)`
  - `cohere(radius, strength, selector)` (boids)
  - `align(radius, strength, selector)` (boids)
  - `separate(radius, strength, selector)` (boids)
  - `emit_food(amount)`, `consume_food(rate, gain)`, `metabolize(rate)`
  - `wind(strength)`, `gust(strength)`
  - `emit_water(amount)`, `consume_water(rate, gain)`
  - `emit_road(amount)`, `follow_road(strength)`, `emit_settlement(amount)`
  - `emit_home(amount)`, `emit_farm(amount)`, `emit_market(amount)`
  - `seek_home(strength)`, `seek_farm(strength)`, `seek_market(strength)`
  - `trade(rate)`
  - `wrap(W, H)` (toroidal world)

## Data & metrics
- The Metrics tab shows per-frame timing and step counts.
- The Metrics tab can inspect recorded snapshots when enabled.
- The Export tab provides a JSON snapshot of the current world state and optional JSONL history.

## Paradox
MYTHOS highlights:
- Static paradoxes (conflicting constant redefinitions; invalid effects)
- Dynamic instability (runaway acceleration; exploding sound; conflicting hardening/softening loops)

## Examples
- `examples/real_world.law`
- `examples/basic.law`
- `examples/weird_physics.law`
- `examples/paradox.law`
 - `examples/worldpacks/living_world.json`

## WorldPacks (custom worlds)
WorldPacks are JSON files that bundle lore, laws, and spawn profiles.
Key fields:
- `name`, `description`, `seed`
- `consts` (W, H, DT, G, MAX_SPEED, SUBSTEPS, ...)
- `profiles` (name, color, count, mass_range, hardness_range, speed_range, depth_range, static)
- Optional: `energy_range`, `wealth_range` per profile
- `laws` (name, priority, when, actions)

Example profile:
~~~json
{"name":"Citizens","color":"human","count":80,"mass_range":[0.8,1.2],"hardness_range":[0.6,1.0],"speed_range":[-0.7,0.7]}
~~~

To model story worlds (Game of Thrones / One Piece), define profiles for factions and locations, then encode their interactions as laws.

## Tests
~~~bash
.venv/bin/python -m unittest tests/test_examples.py tests/test_backend.py tests/test_sim.py tests/test_worldpack.py tests/test_actions.py
~~~
