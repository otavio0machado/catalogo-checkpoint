import { SignJWT, jwtVerify } from 'jose';

export const AUTH_COOKIE_NAME = 'auth-token';

class MissingEnvError extends Error {
  constructor(name: string) {
    super(`${name} não configurado`);
    this.name = 'MissingEnvError';
  }
}

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value || !value.trim()) throw new MissingEnvError(name);
  return value;
}

function getJwtSecret(): Uint8Array {
  return new TextEncoder().encode(requiredEnv('JWT_SECRET'));
}

export function hasAdminAuthConfig(): boolean {
  return Boolean(
    process.env.JWT_SECRET?.trim() &&
    process.env.ADMIN_EMAIL?.trim() &&
    process.env.ADMIN_PASSWORD
  );
}

/**
 * Comparação de strings em tempo constante (não vaza, pelo tempo de resposta,
 * o tamanho do prefixo correto). Implementação pura para rodar tanto no
 * runtime Node quanto no Edge sem depender de `node:crypto`.
 */
function timingSafeEqual(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const bufA = encoder.encode(a);
  const bufB = encoder.encode(b);
  // Compara sempre o mesmo número de bytes; diferença de tamanho ainda conta
  // como mismatch, mas o laço não encurta para o menor dos dois.
  const length = Math.max(bufA.length, bufB.length);
  let mismatch = bufA.length ^ bufB.length;
  for (let i = 0; i < length; i++) {
    mismatch |= (bufA[i] ?? 0) ^ (bufB[i] ?? 0);
  }
  return mismatch === 0;
}

export function validateAdminCredentials(email: unknown, password: unknown): boolean {
  if (typeof email !== 'string' || typeof password !== 'string') return false;
  if (!hasAdminAuthConfig()) return false;

  const emailMatches =
    email.trim().toLowerCase() === process.env.ADMIN_EMAIL!.trim().toLowerCase();
  const passwordMatches = timingSafeEqual(password, process.env.ADMIN_PASSWORD!);
  // Avalia ambas as condições sempre (sem short-circuit) para não vazar timing.
  return emailMatches && passwordMatches;
}

export async function createAdminToken(): Promise<string> {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(getJwtSecret());
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getJwtSecret());
    return true;
  } catch {
    return false;
  }
}
