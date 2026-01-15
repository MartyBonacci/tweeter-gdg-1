import { hash, verify } from '@node-rs/argon2';

/**
 * Hash a password using Argon2id
 * @param password - Plain text password to hash
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, {
    memoryCost: 65536, // 64MB
    timeCost: 3,
    outputLen: 32,
    parallelism: 1,
  });
}

/**
 * Verify a password against its hash
 * @param hash - Stored password hash
 * @param password - Plain text password to verify
 * @returns True if password matches, false otherwise
 */
export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    return await verify(hash, password);
  } catch {
    return false;
  }
}
