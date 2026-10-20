// Project validators. zod v4.
// HTTPS-only URL guard — prevents javascript: scheme XSS via liveUrl and forces
// mixed-content-safe links on the frontend.
import { z } from "zod";

const httpsUrl = z
  .string()
  .trim()
  .url("Must be a valid URL")
  .refine((u) => u.startsWith("https://"), "URL must use HTTPS");

export const createProjectSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Name must be at least 3 characters")
      .max(100, "Name must be 100 characters or fewer"),
    repoUrl: httpsUrl,
    // Accept either omitted or empty string. Anything else: schema rejects.
    liveUrl: httpsUrl.optional().or(z.literal("").transform(() => undefined)),
    description: z
      .string()
      .trim()
      .min(20, "Description must be at least 20 characters")
      .max(2000, "Description must be 2000 characters or fewer"),
  })
  .strict();

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "ALL"]).default("ALL"),
  q: z.string().trim().max(100).optional(),
});

export const updateStatusSchema = z
  .object({
    status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
  })
  .strict();

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
