import "server-only";
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;

export interface PasswordHash {
  salt: string;
  hash: string;
}

export async function hashPassword(password: string): Promise<PasswordHash> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
  return { salt, hash: derived.toString("hex") };
}

export async function verifyPassword(
  password: string,
  stored: PasswordHash,
): Promise<boolean> {
  const derived = (await scrypt(password, stored.salt, KEY_LENGTH)) as Buffer;
  const storedBuffer = Buffer.from(stored.hash, "hex");
  if (derived.length !== storedBuffer.length) return false;
  return timingSafeEqual(derived, storedBuffer);
}
