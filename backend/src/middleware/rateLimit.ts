// Rate-limit policy for the SubmissionPulse API.
//
// - loginLimiter: 5 attempts per 15 minutes per IP, *failed requests only*
//   (`skipSuccessfulRequests: true`). A genuine user logging in repeatedly on
//   their own device will not be locked out; an attacker brute-forcing a
//   stolen/leaked email will burn through 5 attempts quickly. Pairs with the
//   login flow comparing against DUMMY_HASH for unknown emails so a
//   "user not found" probe and a "wrong password" probe cost the same.
//
// - signupLimiter: 3 new accounts per IP per hour. Signups are legitimate but
//   rare; tighter limits here block mass account-creation abuse. Successes
//   *do* count, so a single human can still register normally.
//
// - globalLimiter: 100 requests per IP per 15 minutes across the whole app.
//   Backstop against crawlers / scrapers / runaway clients; sits behind the
//   strict auth/route limiters so /health and other cheap endpoints stay cheap.
import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "TooManyRequests" },
  // only failed attempts count toward the limit
  skipSuccessfulRequests: true,
});

export const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "TooManyRequests" },
});

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "TooManyRequests" },
});

// Per-user. MUST be mounted AFTER requireAuth so req.user is populated. Falls
// back to req.ip if unauthenticated (which the route guards against anyway).
export const submissionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => (req as unknown as { user?: { id?: string } }).user?.id ?? req.ip ?? "unknown",
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "TooManySubmissions" },
});
