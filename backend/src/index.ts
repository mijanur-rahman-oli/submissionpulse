import "dotenv/config";

import express, { type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";

import { env } from "./config/env";
import { prisma } from "./lib/prisma";

const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json({ limit: "10kb" }));

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok", ts: Date.now() });
});

app.get("/health/db", async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: "ok" });
  } catch {
    res.status(503).json({ status: "db_down" });
  }
});

const port = env.PORT;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(
    `[server] listening on http://localhost:${port} (${env.NODE_ENV})`,
  );
});
