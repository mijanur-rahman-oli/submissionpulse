# SubmissionPulse

A small submission + review system: students submit learning artifacts, mentors review them.

- `backend/` — Node + Express + Prisma API (port 4000)
- `frontend/` — Next.js 16 App Router (App Router, `src/`)

## Quick start

```bash
# Backend
cd backend
cp .env.example .env          # fill DATABASE_URL / DIRECT_URL / JWT_SECRET / FRONTEND_ORIGIN
npm install
npx prisma migrate dev
npm run dev                   # http://localhost:4000

# Frontend (new terminal)
cd ../frontend
cp .env.example .env.local    # NEXT_PUBLIC_API_URL=http://localhost:4000
npm install
npm run dev                   # http://localhost:3000
```

## Security

This section is the authoritative description of the auth surface. Future audits should compare the implementation against the bullets below; if anything drifts, update both code and this section.

### Tokens

- **Algorithm:** HS256, pinned in `verifyToken` (`backend/src/lib/jwt.ts`) — prevents `alg: none` and HS/RS confusion attacks.
- **Expiry:** `JWT_EXPIRES_IN` defaults to `1d`. Configure via env.
- **Issuer / audience:** every token carries `iss = "submissionpulse"` and `aud = "submissionpulse-app"`. `verifyToken` re-checks both; mismatches reject.
- **Secret strength:** `JWT_SECRET` is enforced to be ≥32 characters at boot in `backend/src/config/env.ts`. The server refuses to start otherwise (`console.error` + `process.exit(1)`).
- **Logging:** tokens, passwords, and request bodies are never written to logs or responses — verified in `backend/src/routes/auth.ts` and `backend/src/middleware/error.ts`.

### Passwords

- **Hashing:** `bcryptjs`, 12 rounds (`backend/src/lib/password.ts`).
- **Truncation:** bcrypt silently truncates input at 72 bytes. The signup validator caps `password` at 72 chars upstream so behaviour is explicit, not implementation-defined.
- **Timing-safe login:** `login` always runs a `bcrypt.compare`, comparing against a precomputed `DUMMY_HASH` when the email is unknown — a missing user and a wrong password take identical wall time, defeating user-enumeration via response timing.

### Authorization (RBAC)

- `requireAuth` (`backend/src/middleware/auth.ts`) parses the `Authorization: Bearer <jwt>` header and populates `req.user = { id, role }`. Returns `401 Unauthorized` on any failure — no detail that would help probing.
- `requireRole(role)` is a factory used **only as a chained middleware after `requireAuth`** (e.g. `requireAuth, requireRole("MENTOR")`). Used standalone, `req.user` is undefined and the request 401s — by design.
- **Privilege escalation closed at signup:** the `POST /auth/signup` route hard-codes `role: "STUDENT"` on insert regardless of any client input. The validator also `.strict()`-rejects unknown keys, so the client cannot smuggle `role` into the body.

### Rate limiting

- `loginLimiter` — 5 failed attempts per 15 min per IP. `skipSuccessfulRequests: true` so a legitimate user logging in repeatedly on their own device is not punished.
- `signupLimiter` — 3 signups per IP per hour. Successes count; signups are rare for a single user.
- `globalLimiter` — 100 requests per 15 min per IP. Backstop across the whole app.
- All limiters emit `TooManyRequests` with `RateLimit-*` (RFC draft-7) headers.
- **In-memory store.** `express-rate-limit`'s default `MemoryStore` does not share state between processes. **For horizontal scaling, migrate to the Redis store.** See *Known limitations* below.

### Error handling

- Uniform `InvalidCredentials` regardless of whether the email exists — no user enumeration.
- 4xx errors flow through `AppError` and the central error handler; the client never sees a stack trace. `500` returns `{ error: "InternalServerError" }` and the full error is logged server-side.
- Validation failures from Zod are reshaped into `{ error: "ValidationError", issues: [...] }`.

### CORS

- A single configured origin (`FRONTEND_ORIGIN`), `credentials: true`, explicit method + header allowlist. No wildcard, no `*`.

### Body size

- `express.json({ limit: "10kb" })`. Anything larger is rejected at parse time, before any handler runs.

### Headers

- `helmet()` applied globally.
- `app.disable("x-powered-by")` — Express fingerprint header removed.

## Known limitations (and the production migration path)

### 1. Tokens live in localStorage — XSS-attacker-readable

Currently the JWT is stored in the browser's `localStorage` (`frontend/src/lib/api.ts`, `frontend/src/lib/auth.ts`). Any successful XSS on the app origin can read it. **This is the deliberate tradeoff for the assessment scope:** it kept the assessment purely localStorage-based — no SSR cookie dance, no CSRF token, no `__Host-` prefix work, and worked identically in dev, prod, and tests with zero infra.

**Production migration path:**

- Issue the JWT as an `HttpOnly; Secure; SameSite=Lax` cookie (`Set-Cookie` from `/auth/login`).
- Add a server-side session store (Redis) keyed by a random server-only session ID; the cookie carries the ID, not the JWT.
- Add a separate short-lived access token + a refresh token flow (rotation, single-use).
- Add CSRF protection (double-submit cookie or origin-check header) since the browser now sends credentials cross-tab.
- Replace the client-side `AuthGuard` with edge middleware that reads the cookie.

These are documented here so the next engineer knows the path; the assessment version does not include them.

### 2. Rate-limit store is in-memory — does not scale horizontally

The current `MemoryStore` is per-process. Two replicas = two quotas.

**Production migration path:**

- Stand up Redis (or any shared store the team has a quota for).
- Swap in `rate-limit-redis` and switch `loginLimiter`, `signupLimiter`, `globalLimiter` to use it with `redis://...` URL from env.
- Pin limits and windowMs unchanged so behaviour is preserved across the cutover.
- Same migration applies if we later move sessions to Redis.

## Endpoints

| Method | Path             | Auth        | Notes                                |
| ------ | ---------------- | ----------- | ------------------------------------ |
| POST   | `/auth/signup`   | public      | Always creates `STUDENT`.            |
| POST   | `/auth/login`    | public      | Rate-limited (5/15min).              |
| GET    | `/auth/me`       | bearer      | Returns the current user.            |
| POST   | `/auth/logout`   | bearer      | Placeholder for future revocation.   |
| GET    | `/health`        | public      | Liveness.                            |
| GET    | `/health/db`     | public      | DB-aware readiness.                  |
