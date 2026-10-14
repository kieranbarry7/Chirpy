import { Request, Response } from "express";
import { createUser, getUserByEmail } from "./db/queries/users.js";
import { hashPassword, checkPasswordHash, makeJWT, makeRefreshToken, getBearerToken } from "./auth.js";
import { createRefreshToken, getRefreshToken, revokeRefreshToken } from "./db/queries/refresh_tokens.js";
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

    const token = makeJWT(user.id, 3600, config.jwtSecret);
    const refreshToken = makeRefreshToken();
    const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

    await createRefreshToken({
      token: refreshToken,
      userId: user.id,
      expiresAt: expiresAt,
      revokedAt: null,
    });

    return res.status(200).json({
      id: user.id,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      email: user.email,
      token: token,
      refreshToken: refreshToken,
    });
  } catch (error) {
    console.error("DETAILED LOGIN ERROR:", error);
    return res.status(500).json({ error: "Failed to login" });
  }
}

export async function handlerRefresh(req: Request, res: Response): Promise<void> {
  try {
    const token = getBearerToken(req);
    const dbToken = await getRefreshToken(token);

    if (!dbToken || dbToken.revokedAt !== null || new Date(dbToken.expiresAt) < new Date()) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const newAccessToken = makeJWT(dbToken.userId, 3600, config.jwtSecret);

    res.status(200).json({
      token: newAccessToken,
    });
  } catch (error) {
    res.status(401).json({ error: "Invalid request" });
  }
}

export async function handlerRevoke(req: Request, res: Response): Promise<void> {
  try {
    const token = getBearerToken(req);
    await revokeRefreshToken(token);
    res.sendStatus(204);
  } catch (error) {
    res.status(400).json({ error: "Failed to revoke token" });
  }
}
