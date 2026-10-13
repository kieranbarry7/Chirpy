import argon2 from "argon2";

/**
 * Hashes a plain-text password using argon2.
 */
export async function hashPassword(password: string): Promise<string> {
  return await argon2.hash(password);
}

/**
 * Compares a plain-text password against a hashed password.
 */
export async function checkPasswordHash(
  password: string,
  hash: string
): Promise<boolean> {
  return await argon2.verify(hash, password);
}
