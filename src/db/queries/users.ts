import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { users } from "../schema.js";

export async function createUser({ email, hashedPassword }: { email: string; hashedPassword: string }) {
  const [newUser] = await db
    .insert(users)
    .values({
      email,
      hashedPassword,
    })
    .returning();
  return newUser;
}

export async function getUserByEmail(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user;
}

export async function updateUser(userId: string, email: string, hashedPassword: string) {
  const [updatedUser] = await db
    .update(users)
    .set({
      email,
      hashedPassword,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();
  return updatedUser;
}

export async function deleteAllUsers() {
  await db.delete(users);
}
