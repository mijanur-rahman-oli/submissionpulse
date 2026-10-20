import bcrypt from "bcryptjs";

const ROUNDS = 12;

// Precomputed bcrypt hash of "dummy-password-do-not-use" at 12 rounds.
// DUMMY_HASH is used in login to make user-not-found and wrong-password take the
// same time (prevents user enumeration via timing).
export const DUMMY_HASH =
  "$2b$12$W7tu82w5Vaere1T96DHEEeLvxdyeKjc3L3xtVImT0eo29IQSBYvRC";

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, ROUNDS);
}

export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
