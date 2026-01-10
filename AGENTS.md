# Repository Guidelines

## Project Structure & Module Organization
- `engine/`: core simulation engine, DSL compiler, kernel, and backends.
- `server/`: FastAPI service (`server/main.py`) and runtime services for the engine.
- `frontend/`: React + Vite client (`frontend/src`), styles, and assets.
- `tests/`: Python `unittest` suites (`test_*.py`).
- `examples/`: sample `.law` programs and worldpacks (`examples/worldpacks`).
- `assets/`, `server_data/`: static assets and local server data.

## Build, Test, and Development Commands
- `./run_stack.sh`: one-shot dev bootstrap (Node via nvm, Python venv, backend, frontend).
- `python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt`: set up backend env.
- `uvicorn server.main:app --reload --port 8000`: run API server locally.
- `cd frontend && npm install && npm run dev`: run the React dev server.
- `cd frontend && npm run build`: production build for the frontend.
- `docker compose up -d`: optional Postgres container for `DATABASE_URL`.

## Coding Style & Naming Conventions
- Python: 4-space indentation, `snake_case` for functions/vars, `PascalCase` for classes.
- TypeScript/React: 2-space indentation, double quotes, `.tsx` components in `frontend/src`.
- Tests: file names `tests/test_*.py`, test classes like `*Tests`.

## Testing Guidelines
- Framework: `unittest` (see `tests/`).
- Run selected tests:
  - `.venv/bin/python -m unittest tests/test_examples.py tests/test_backend.py tests/test_sim.py tests/test_worldpack.py tests/test_actions.py`
- Keep new tests small and deterministic; prefer engine-level unit tests over UI-only coverage.

## Commit & Pull Request Guidelines
- No Git history available in this repo; use short, imperative commit subjects (e.g., `Fix preset loading`).
- PRs should include: purpose/summary, testing notes, and screenshots for UI changes.

## Configuration Notes
- Backend URL can be overridden by copying `frontend/.env.example` to `frontend/.env`.
- For Postgres, set `DATABASE_URL` (default SQLite lives at `~/.mythos/data.sqlite3`).
