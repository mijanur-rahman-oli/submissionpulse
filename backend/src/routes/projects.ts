import { Router } from "express";

import { prisma } from "../lib/prisma";
import { requireAuth, requireRole, type AuthedRequest } from "../middleware/auth";
import { submissionLimiter } from "../middleware/rateLimit";
import { AppError } from "../middleware/error";
import { createProjectSchema, paginationQuerySchema, updateStatusSchema } from "../validators/project";

const router = Router();

// POST /projects — student submits a project
router.post(
  "/",
  requireAuth,
  requireRole("STUDENT"),
  submissionLimiter,
  async (req: AuthedRequest, res, next) => {
    try {
      const input = createProjectSchema.parse(req.body);
      const studentId = req.user!.id;

      // Layer 2: friendly pre-check. Layer 3 is the DB unique constraint
      // (P2002 → DuplicateProjectName / DuplicateRepoUrl in error.ts) below,
      // which also covers the race window between these two reads and the write.
      const dupName = await prisma.project.findFirst({
        where: { studentId, name: input.name },
      });
      if (dupName) throw new AppError(409, "DuplicateProjectName");

      const dupRepo = await prisma.project.findFirst({
        where: { studentId, repoUrl: input.repoUrl },
      });
      if (dupRepo) throw new AppError(409, "DuplicateRepoUrl");

      const project = await prisma.project.create({
        data: {
          studentId,
          name: input.name,
          repoUrl: input.repoUrl,
          liveUrl: input.liveUrl ?? null,
          description: input.description,
        },
        include: {
          student: { select: { id: true, name: true, email: true } },
        },
      });

      return res.status(201).json({ project });
    } catch (err) {
      return next(err);
    }
  },
);

// GET /projects/mine — a student sees only their own submissions
router.get(
  "/mine",
  requireAuth,
  requireRole("STUDENT"),
  async (req: AuthedRequest, res, next) => {
    try {
      const projects = await prisma.project.findMany({
        where: { studentId: req.user!.id },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          repoUrl: true,
          liveUrl: true,
          description: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      })
      return res.json({ projects })
    } catch (err) { return next(err) }
  }
)

// GET /projects — mentor list with server-side pagination, filter, search
router.get(
  "/",
  requireAuth,
  requireRole("MENTOR"),
  async (req: AuthedRequest, res, next) => {
    try {
      const { page, pageSize, status, q } = paginationQuerySchema.parse(req.query)

      const where: any = {}
      if (status !== "ALL") where.status = status
      if (q && q.length > 0) {
        where.OR = [
          { name: { contains: q, mode: "insensitive" } },
          { student: { name: { contains: q, mode: "insensitive" } } },
          { student: { email: { contains: q, mode: "insensitive" } } },
        ]
      }

      const [total, data] = await Promise.all([
        prisma.project.count({ where }),
        prisma.project.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
          include: { student: { select: { id: true, name: true, email: true } } },
        }),
      ])

      const totalPages = Math.max(1, Math.ceil(total / pageSize))
      return res.json({ data, meta: { page, pageSize, total, totalPages } })
    } catch (err) { return next(err) }
  }
)

// GET /projects/stats — mentor aggregated counts
router.get(
  "/stats",
  requireAuth,
  requireRole("MENTOR"),
  async (_req, res, next) => {
    try {
      const [total, pending, approved, rejected] = await Promise.all([
        prisma.project.count(),
        prisma.project.count({ where: { status: "PENDING" } }),
        prisma.project.count({ where: { status: "APPROVED" } }),
        prisma.project.count({ where: { status: "REJECTED" } }),
      ])
      return res.json({ total, pending, approved, rejected })
    } catch (err) { return next(err) }
  }
)

// PATCH /projects/:id/status — mentor approves, rejects, or reopens
router.patch(
  "/:id/status",
  requireAuth,
  requireRole("MENTOR"),
  async (req: AuthedRequest, res, next) => {
    try {
      const { status } = updateStatusSchema.parse(req.body)
      const { id } = req.params

      if (typeof id !== "string" || id.length === 0 || id.length > 64)
        throw new AppError(400, "InvalidId")

      const before = await prisma.project.findUnique({
        where: { id },
        select: { id: true, status: true, name: true },
      })
      if (!before) throw new AppError(404, "ProjectNotFound")

      // Idempotent no-op: return current state without a write
      if (before.status === status) {
        const unchanged = await prisma.project.findUnique({
          where: { id },
          include: { student: { select: { id: true, name: true, email: true } } },
        })
        return res.json({ project: unchanged })
      }

      const project = await prisma.project.update({
        where: { id },
        data: { status },
        include: { student: { select: { id: true, name: true, email: true } } },
      })

      // Lightweight audit — no PII, ids only
      console.log(`[audit] project ${id} "${project.name}" ${before.status} -> ${status} by mentor ${req.user!.id}`)

      return res.json({ project })
    } catch (err) { return next(err) }
  }
)

export default router;
