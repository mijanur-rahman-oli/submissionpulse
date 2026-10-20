import jwt, { type JwtPayload } from "jsonwebtoken";

import { env } from "../config/env";

export type TokenPayload = {
  sub: string;
  role: "STUDENT" | "MENTOR";
};

export type VerifiedPayload = TokenPayload & {
  iat: number;
  exp: number;
  iss: string;
  aud: string;
};

const ISSUER = "submissionpulse";
const AUDIENCE = "submissionpulse-app";

export function signToken(payload: TokenPayload): string {
  // jsonwebtoken types `expiresIn` as `number | StringValue` where `StringValue`
  // is a template-literal type from `ms` and isn't re-exported. The runtime API
  // accepts any duration string (e.g. "1d", "12h"); widen at the boundary.
  return jwt.sign(payload, env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: env.JWT_EXPIRES_IN as unknown as number,
    issuer: ISSUER,
    audience: AUDIENCE,
  });
}

export function verifyToken(token: string): VerifiedPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET, {
    algorithms: ["HS256"], // pin — prevents alg confusion attacks
    issuer: ISSUER,
    audience: AUDIENCE,
  }) as JwtPayload;

  if (
    typeof decoded.sub !== "string" ||
    (decoded.role !== "STUDENT" && decoded.role !== "MENTOR") ||
    typeof decoded.iat !== "number" ||
    typeof decoded.exp !== "number" ||
    decoded.iss !== ISSUER ||
    decoded.aud !== AUDIENCE
  ) {
    throw new Error("Invalid token payload");
  }

  return {
    sub: decoded.sub,
    role: decoded.role,
    iat: decoded.iat,
    exp: decoded.exp,
    iss: decoded.iss,
    aud: decoded.aud,
  };
}
