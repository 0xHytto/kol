# Project Review: Why Basics Were Missed & What Was Fixed

## 1. Why the dotenv bug happened

### Root cause: **import hoisting**

In Node/TypeScript, **all `import` statements are evaluated before any other top-level code**. So in `app.ts` we had:

```ts
import routes from './routes';   // ← runs first (hoisted)
// ...
dotenv.config();                 // ← runs after all imports
```

When `routes` was loaded, it pulled in controllers → services → **config/ai-providers.ts**. That file does `process.env.ANTHROPIC_API_KEY` at **module load time**. So at that moment `dotenv.config()` had not run yet, and `ANTHROPIC_API_KEY` was always `undefined` → 503.

### Fix

- **server.ts** (entry point) now runs `require('dotenv').config(...)` **before** any `import`.
- `require()` is synchronous and runs in place, so env is set before any module that reads `process.env` is loaded.
- Comment added in server.ts so future changes don’t reorder this.

---

## 2. Other issues found and fixed

| Item | Problem | Fix |
|------|--------|-----|
| **README** | Said "PostgreSQL (primary)", "Run database migrations" | Updated to MongoDB, "Seed KOL data" with `yarn seed`. Prerequisites and env docs updated. |
| **apps/api/.env.example** | `DATABASE_URL=postgresql://...`, `DATABASE_POOL_*` | Set to `mongodb://localhost:27017/kol_generator`. Removed pool vars (Mongoose doesn’t use them). |
| **seed.ts** | No dotenv; `yarn seed` didn’t load `apps/api/.env` | Added `require('dotenv').config({ path: ... })` at top so seed uses same env as API. |

---

## 3. Checked and left as-is

- **api-client / generator page**: Use `tweet-generator` (no typo). Response handling (`response.data`, `response.data.variants`) matches API shape.
- **Redis/database config**: Read `process.env` only inside `initRedis()` / `initDatabase()`, which run after server startup and after dotenv. No load-order issue.
- **Logger**: Reads `process.env` at load time but is only imported after dotenv in server.ts, so OK.
- **Next.js**: Loads `.env.local` and bakes `NEXT_PUBLIC_*` at build/dev. No change needed.

---

## 4. Takeaways for this repo

1. **Env loading**: Any script or entry point that uses `process.env` (e.g. `tsx src/db/seed.ts`, `node dist/server.js`) must load `.env` **before** importing modules that read env at top level.
2. **Docs vs code**: README and `.env.example` had been written for PostgreSQL; the app was already on MongoDB. Keep docs and examples in sync with the real stack.
3. **Entry points**: For the API, the single place that must load dotenv first is **server.ts**. Other scripts (e.g. seed) need their own dotenv at the top if they’re run directly.

---

*Last updated: after dotenv load-order fix and project review.*
