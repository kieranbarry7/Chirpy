import { Request, Response } from "express";
import { createUser, getUserByEmail } from "./db/queries/users.js";
import { hashPassword, checkPasswordHash } from "./auth.js";
import { makeJWT } from "./auth.js";
import { config } from "./config.js";

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
  const { email, password, expiresInSeconds } = req.body;

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

    let expiresIn = 3600;
    if (expiresInSeconds !== undefined) {
      const requested = Number(expiresInSeconds);
      if (!isNaN(requested) && requested > 0) {
        expiresIn = Math.min(requested, 3600);
      }
    }

    const token = makeJWT(user.id, expiresIn, config.jwtSecret);

    return res.status(200).json({
      id: user.id,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      email: user.email,
      token: token,
    });
  } catch (error) {
    console.error("DETAILED LOGIN ERROR:", error);
    return res.status(500).json({ error: "Failed to login" });
  }
}
