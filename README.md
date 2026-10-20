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

---

## Security

> Implementation checklist — every bullet should match the code; if it drifts, update both. The narrative above remains authoritative for design intent; the bullets below are the per-control summary used during review.

### Authentication

- JWT signed with HS256. Algorithm is pinned on verify (`algorithms: ["HS256"]`) to prevent algorithm-confusion attacks.
- Token payload contains only `sub` (user id) and `role`. No PII, no permissions list.
- Expiry: 1 day (configurable via `JWT_EXPIRES_IN`).
- Issuer and audience claims (`iss: "submissionpulse"`, `aud: "submissionpulse-app"`) are verified on every request.
- `JWT_SECRET` is validated at boot: minimum 32 characters. The server refuses to start with a weak secret.

### Passwords

- Hashed with bcrypt, 12 rounds.
- Max password length capped at 72 characters (bcrypt's truncation limit) — prevents user surprise where two "different" passwords would authenticate identically.
- Login is timing-safe: a `DUMMY_HASH` is compared against when the email is not found, so "user doesn't exist" and "wrong password" take the same time. Both return the identical `InvalidCredentials` body.

### Role-Based Access Control

- Two roles only: `STUDENT` and `MENTOR` (admin is seeded as `MENTOR` per assessment scope).
- Student signup endpoint **hard-codes** `role: "STUDENT"`. A client-supplied `role` is rejected at the schema layer (`.strict()`) AND discarded by the route — defense in depth against privilege escalation.
- Every protected route uses the `requireAuth → requireRole(...)` chain. `requireRole` is never used standalone.
- `/auth/me` returns only safe user fields (`id, email, name, role`). `passwordHash` is never selected in any response.

### Rate limiting

- Login: 5 **failed** attempts per 15 min per IP (`skipSuccessfulRequests: true` — legitimate users aren't locked out by normal usage).
- Signup: 3 per hour per IP.
- Submission: 5 per hour per authenticated student (keyed on `req.user.id`).
- Global: 100 requests per 15 min per IP.
- Backing store: `express-rate-limit` in-memory. **Production migration path:** Redis store (`rate-limit-redis`) for multi-instance deployments. Documented as future work.

### Input validation

- All request bodies and query strings are parsed through Zod schemas.
- Bodies use `.strict()` to reject unexpected keys — closes the door on mass-assignment / role-injection attacks.
- Payload size capped at 10 kB (`express.json({ limit: "10kb" })`).
- URLs are validated to require `https://` — avoids mixed-content on the frontend and prevents `javascript:` scheme XSS.

### Transport & headers

- `helmet()` sets standard security headers (HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy).
- `x-powered-by` header is disabled — no framework fingerprinting.
- CORS: single configured origin (`FRONTEND_ORIGIN`), `credentials: true`, only `Content-Type` and `Authorization` headers allowed.

### Error handling

- Errors never leak stack traces. Production responses are uniform `{ error: "<code>" }`.
- Validation errors return `{ error: "ValidationError", issues: [...] }` with field-level detail (safe — issues only reference user input).
- Login failures return the same body for "user not found" and "wrong password" (no user enumeration).
- Prisma `P2002` (unique violation) is mapped to `409 Duplicate<Field>` for user-friendly messages; the raw constraint name never reaches the client.

### Known limitations (with production migration path)

1. **Token storage** — tokens are stored in `localStorage`. This is XSS-readable. Trade-off chosen for assessment scope (no server-side session/refresh infrastructure). *Production path:* HttpOnly, `Secure`, `SameSite=Strict` cookies + CSRF token (double-submit cookie pattern) + short-lived access tokens with refresh rotation.
2. **In-memory rate limiter** — resets on process restart; not shared across replicas. *Production path:* Redis-backed store.
3. **No logout invalidation** — `POST /auth/logout` is a client-side clear. Tokens remain valid until expiry. *Production path:* JWT `jti` claim + short-lived blacklist in Redis, or 15-min access + refresh tokens.
4. **No email verification** — signup accepts any syntactically valid email. *Production path:* send verification link, gate the account until clicked. Out of scope for the assessment.
5. **Audit trail is console-only** — status transitions are logged (`[audit] project ... -> ...`) but not persisted. *Production path:* `AuditLog` Prisma model with `{ actorId, targetId, action, before, after, createdAt }`.
