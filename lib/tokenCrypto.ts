import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const PREFIX = "v1:";
const ALGORITHM = "aes-256-gcm";

function getKey(): Buffer {
  const hex = process.env.GMAIL_TOKEN_ENCRYPTION_KEY;
  if (!hex) throw new Error("Falta GMAIL_TOKEN_ENCRYPTION_KEY en el entorno.");
  const key = Buffer.from(hex, "hex");
  if (key.length !== 32) {
    throw new Error("GMAIL_TOKEN_ENCRYPTION_KEY debe ser un hex de 32 bytes (64 caracteres).");
  }
  return key;
}

/** Cifra un refresh token de Gmail antes de guardarlo en la base. */
export function encryptToken(plainText: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${PREFIX}${Buffer.concat([iv, authTag, encrypted]).toString("base64")}`;
}

/**
 * Descifra un token guardado con encryptToken. Los tokens guardados antes
 * de que existiera este cifrado quedan en texto plano (sin el prefijo "v1:")
 * — se devuelven tal cual para no romper las cuentas ya conectadas.
 */
export function decryptToken(stored: string): string {
  if (!stored.startsWith(PREFIX)) return stored;

  const raw = Buffer.from(stored.slice(PREFIX.length), "base64");
  const iv = raw.subarray(0, 12);
  const authTag = raw.subarray(12, 28);
  const encrypted = raw.subarray(28);

  const decipher = createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}
