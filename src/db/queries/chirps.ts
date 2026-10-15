import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { chirps } from "../schema.js";

export async function createChirp({ body, userId }: { body: string; userId: string }) {
  const [newChirp] = await db
    .insert(chirps)
    .values({
      body,
      userId,
    })
    .returning();
  return newChirp;
}

export async function getChirps(authorId?: string) {
  if (authorId) {
    return await db
      .select()
      .from(chirps)
      .where(eq(chirps.userId, authorId))
      .orderBy(chirps.createdAt);
  }
  return await db.select().from(chirps).orderBy(chirps.createdAt);
}

export async function getChirpById(chirpId: string) {
  const [chirp] = await db.select().from(chirps).where(eq(chirps.id, chirpId));
  return chirp;
}

export async function deleteChirp(chirpId: string) {
  await db.delete(chirps).where(eq(chirps.id, chirpId));
}
