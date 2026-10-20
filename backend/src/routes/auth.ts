import { Router } from "express";

import { prisma } from "../lib/prisma";
import { DUMMY_HASH, hashPassword, verifyPassword } from "../lib/password";
import { signToken } from "../lib/jwt";
import { loginSchema, signupSchema } from "../validators/auth";
import { type AuthedRequest, requireAuth } from "../middleware/auth";
import { loginLimiter, signupLimiter } from "../middleware/rateLimit";
import { AppError } from "../middleware/error";

const router = Router();

// POST /auth/signup
router.post("/signup", signupLimiter, async (req, res, next) => {
  try {
    const input = signupSchema.parse(req.body);
    // FORCE role: STUDENT — even if .strict() allowed it (it doesn't), we
    // discard any other value from the client here.
    const existing = await prisma.user.findUnique({
      where: { email: input.email },
    });
    if (existing) throw new AppError(409, "EmailAlreadyInUse");

    const passwordHash = await hashPassword(input.password);
    const user = await prisma.user.create({
      data: {
        email: input.email,
        name: input.name,
        passwordHash,
        role: "STUDENT", // HARD-CODED — prevents privilege escalation
      },
      select: { id: true, email: true, name: true, role: true }, // never leak passwordHash
    });
    const token = signToken({ sub: user.id, role: user.role });
    res.status(201).json({ token, user });
  } catch (err) {
    next(err);
  }
});

// POST /auth/login
router.post("/login", loginLimiter, async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });
    // TIMING-SAFE: always run a bcrypt compare, even if user is missing.
    const hash = user?.passwordHash ?? DUMMY_HASH;
    const ok = await verifyPassword(input.password, hash);
    if (!user || !ok) {
      // Uniform error — do not reveal whether email exists.
      throw new AppError(401, "InvalidCredentials");
    }
    const token = signToken({ sub: user.id, role: user.role });
    res.status(200).json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (err) {
    next(err);
  }
});

// GET /auth/me (protected)
router.get("/me", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, name: true, role: true },
    });
    if (!user) throw new AppError(404, "UserNotFound");
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// POST /auth/logout — client clears token. This endpoint is a placeholder
// for future server-side token revocation (jti blacklist / refresh tokens).
router.post("/logout", requireAuth, (_req, res) => {
  res.json({ ok: true });
});

export default router;