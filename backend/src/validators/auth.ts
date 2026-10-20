// Password max 72 (bcrypt truncates at 72 bytes). Email lowercased+trimmed for
// duplicate prevention.

import { z } from "zod";

export const signupSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(8).max(72),
  })
  .strict();
// .strict() rejects extra keys (e.g. {"role":"MENTOR"} would 400 at schema level).
// We still force role STUDENT on the server side for defense-in-depth.

export const loginSchema = z
  .object({
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(1).max(72),
  })
  .strict();

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;