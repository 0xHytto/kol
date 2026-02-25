# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

Web3 KOL Twitter Account Generator — a Yarn 4 + Turborepo monorepo with two apps (`apps/web` Next.js 14, `apps/api` Express.js) and four shared packages under `packages/`.

### Services

| Service | Port | How to run |
|---------|------|------------|
| Next.js frontend | 3000 | `yarn dev:web` |
| Express.js API | 8000 | `yarn dev:api` |
| Both together | 3000/8000 | `yarn dev` |
| MongoDB | 27017 | `mongod --fork --logpath /tmp/mongod.log --dbpath /data/db` |

### Non-obvious caveats

- **Node version**: Must use Node 20 (see `.nvmrc`). Run `nvm use` before any yarn command.
- **Yarn 4 with node-modules linker**: The `.yarnrc.yml` must set `nodeLinker: node-modules` for TypeScript workspace resolution to work. Without this, PnP mode breaks `tsc` resolution of `@kol/*` workspace packages.
- **Shared packages must be built first**: Run `yarn workspace @kol/shared-types build` before other packages. `shared-constants` and `shared-utils` depend on `shared-types`. Build order: `shared-types` → `shared-constants` / `shared-utils`. Alternatively, `yarn build` handles this via Turborepo's `dependsOn: ["^build"]` pipeline.
- **MongoDB must be running** before starting the API. The API will crash on startup if it can't connect to `mongodb://localhost:27017/kol_generator`.
- **Redis is disabled**: Redis code is commented out in `server.ts`. The app runs without Redis.
- **Gemini API key**: Tweet generation requires a valid `GEMINI_API_KEY` in `apps/api/.env`. Without it, the full generation flow works but returns an API error. Get a free key at https://aistudio.google.com/apikey.
- **dotenv load order**: `server.ts` uses `require('dotenv').config()` before any `import` to ensure env vars are available at module load time. See `docs/REVIEW.md` for details.
- **Seeding data**: Run `yarn workspace @kol/api seed` to populate the database with 6 KOL profiles. Required for the tweet generator UI to display selectable KOLs.
- **Root scripts need `-A` flag**: The root `package.json` scripts use `yarn workspaces foreach -pt` which requires `-A` (all) flag in Yarn 4. Run individual workspace commands instead: `yarn workspace @kol/api lint`, `yarn workspace @kol/web lint`.

### Lint/Test/Build commands

See `README.md` "Available Scripts" section. Key commands:
- **Lint**: `yarn workspace @kol/api lint` / `yarn workspace @kol/web lint`
- **Type-check**: `yarn workspace @kol/api type-check` / `yarn workspace @kol/web type-check`
- **Test**: `yarn workspace @kol/api test` (no test files exist yet; use `--passWithNoTests` to avoid exit code 1)
- **Build**: `yarn build` (builds all packages via Turborepo)

### Env files

- `apps/api/.env` — copy from `apps/api/.env.example`
- `apps/web/.env.local` — copy from `apps/web/.env.local.example`
