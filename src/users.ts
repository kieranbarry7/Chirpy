import { Request, Response } from "express";
import { createUser, getUserByEmail } from "./db/queries/users.js";
import { hashPassword, checkPasswordHash } from "./auth.js";

export async function handlerCreateUser(req: Request, res: Response) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const hashedPassword = await hashPassword(password);
    const newUser = await createUser({ email, hashedPassword });
    return res.status(201).json({
      id: newUser.id,
      email: newUser.email,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    });
  } catch (error) {
    console.error("DETAILED ERROR:", error);
    return res.status(500).json({ error: "Failed to create user" });
  }
}

export async function handlerLogin(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "incorrect email or password" });
    }

    const isPasswordValid = await checkPasswordHash(password, user.hashedPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "incorrect email or password" });
    }

    return res.status(200).json({
      id: user.id,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      email: user.email,
    });
  } catch (error) {
    console.error("DETAILED LOGIN ERROR:", error);
    return res.status(500).json({ error: "Failed to login" });
  }
}
