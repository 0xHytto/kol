# Security Review (Pre-Publish)

This document summarizes the security review performed on the committed codebase before publishing. Apply these recommendations in production.

---

## Critical: Secrets & Environment

### .env and API keys

- **Committed:** Only `.env.example` and `.env.local.example` are in the repo (placeholder values only). ✅
- **.gitignore** correctly excludes `.env`, `.env*.local`, and other env files. ✅
- **Action required:**  
  - Never commit real `.env` or any file containing secrets.  
  - If `apps/api/.env` (or any real key) was ever committed in the past (e.g. before .gitignore), **rotate all exposed keys immediately** (Anthropic, OpenAI, Twitter, Stripe, AWS, JWT secrets, etc.) and revoke old ones.  
  - In production, use a secrets manager or platform env vars; do not rely on `.env` files on disk.

---

## Fixes Applied in This Review

1. **Rate limiting**  
   - `express-rate-limit` was in dependencies but not used.  
   - **Fix:** Global rate limiter added in `apps/api/src/app.ts` (configurable via `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX_REQUESTS`).  
   - **Recommendation:** For production, consider stricter limits for `/api/*/tweet-generator/generate` (e.g. 10–20 per 15 min per IP or per user).

2. **Regex injection / ReDoS (KOL profile search)**  
   - User-controlled `search` was used in MongoDB `$regex` without escaping.  
   - **Fix:** In `apps/api/src/controllers/kol-profile.controller.ts`, search input is escaped with `escapeRegex()` and length capped (e.g. 100 chars). List `limit` is capped at 100.

3. **Input validation and caps**  
   - **Fix:**  
     - KOL list: `limit` capped at 100.  
     - KOL `getById`: `id` validated with `mongoose.Types.ObjectId.isValid()`.  
     - Tweet generator: `topic` max length 2000 chars; `kolId` validated as ObjectId when present.  
     - Generations list: `limit` capped (e.g. 50), `offset` validated.

---

## Recommendations (No Code Change)

- **CORS:** `CORS_ORIGIN` is used; in production set it to the exact frontend origin(s). Avoid `*` with credentials.
- **Auth:** Tweet generation and history currently allow `userId = 'anonymous'`. Before opening to untrusted users, add authentication and bind usage to a user/session and enforce quotas.
- **Body size:** `express.json({ limit: '10mb' })` is large. Consider a lower limit (e.g. 256kb) for API routes if you don’t need large payloads.
- **Error messages:** Production already hides internal error details (generic “An error occurred”). Ensure stack traces and internal errors are never sent to the client.
- **Logging:** Avoid logging request bodies or tokens. Current logger usage (path, method, error message/stack) is acceptable; keep it that way.
- **Dependencies:** Run `yarn audit` (or `npm audit`) and fix high/critical issues before publish. Keep dependencies up to date.

---

## Checklist Before Publish

- [ ] No real secrets in repo history (if any were ever committed, rotate them).
- [ ] Production env uses strong `JWT_SECRET` and `REFRESH_TOKEN_SECRET` (min 32 random bytes).
- [ ] `CORS_ORIGIN` set to actual frontend origin(s).
- [ ] Rate limiting enabled and tuned for production.
- [ ] `yarn audit` / `npm audit` reviewed and critical/high issues resolved.
- [ ] Database (MongoDB) and Redis use TLS and strong credentials in production.

---

*Last review: applied rate limiting, regex escaping, and input validation/caps as above.*
