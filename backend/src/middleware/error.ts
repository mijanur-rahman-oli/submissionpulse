import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export class AppError extends Error {
  public readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    res.status(400).json({ error: "ValidationError", issues: err.issues });
    return;
  }

  const anyErr = err as { code?: unknown; meta?: { target?: unknown } };
  if (anyErr?.code === "P2002") {
    res.status(409).json({ error: "Duplicate", field: anyErr.meta?.target });
    return;
  }
  if (anyErr?.code === "P2025") {
    res.status(404).json({ error: "NotFound" });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // Never leak stack to client; log server-side.
  // eslint-disable-next-line no-console
  console.error("[unhandled]", err);
  res.status(500).json({ error: "InternalServerError" });
}
