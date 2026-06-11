import * as argon2 from 'argon2';
import * as crypto from 'node:crypto';

export const hashPassword = async (password: string) => {
  return await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });
};

export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export interface DecodedCursor {
  id: string;
  createdAt: string;
}

export function encodeCursor(id: string, createdAt: Date): string {
  const payload: DecodedCursor = { id, createdAt: createdAt.toISOString() };
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

export function decodeCursor(cursor: string): DecodedCursor {
  return JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));
}
