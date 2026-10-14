import { db } from "../index.js";
import { refreshTokens } from "../schema.js";
import { eq } from "drizzle-orm";

export async function createRefreshToken(data: {
  token: string;
  userId: string;
  expiresAt: Date;
  revokedAt?: Date | null;
}) {
  const result = await db.insert(refreshTokens).values(data).returning();
  return result[0];
}

export async function getRefreshToken(token: string) {
  const result = await db.select().from(refreshTokens).where(eq(refreshTokens.token, token));
  return result[0];
}

export async function revokeRefreshToken(token: string) {
  await db
    .update(refreshTokens)
    .set({
      revokedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(refreshTokens.token, token));
}
