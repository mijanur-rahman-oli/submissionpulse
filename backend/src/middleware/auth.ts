import type { NextFunction, Request, Response } from "express";

import { verifyToken } from "../lib/jwt";

export interface AuthedRequest extends Request {
  user?: { id: string; role: "STUDENT" | "MENTOR" };
}

export function requireAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    // no detail — prevent probing
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = header.slice(7).trim();
  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
}

// requireRole MUST be used AFTER requireAuth. Never mount it standalone.
export function requireRole(
  role: "STUDENT" | "MENTOR",
): (req: AuthedRequest, res: Response, next: NextFunction) => void {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (req.user.role !== role) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  };
}
