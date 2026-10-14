import { Request, Response } from "express";
import { createUser, getUserByEmail, updateUser, upgradeUserToChirpyRed } from "./db/queries/users.js";
import { hashPassword, checkPasswordHash, makeJWT, makeRefreshToken, getBearerToken, validateJWT } from "./auth.js";
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
      isChirpyRed: newUser.isChirpyRed,
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
      isChirpyRed: user.isChirpyRed,
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

export async function handlerUpdateUser(req: Request, res: Response): Promise<void> {
  try {
    const token = getBearerToken(req);
    const userId = validateJWT(token, config.jwtSecret);

    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const hashedPassword = await hashPassword(password);
    const updatedUser = await updateUser(userId, email, hashedPassword);

    if (!updatedUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json({
      id: updatedUser.id,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      email: updatedUser.email,
      isChirpyRed: updatedUser.isChirpyRed,
    });
  } catch (error) {
    res.status(401).json({ error: "Unauthorized" });
  }
}

export async function handlerPolkaWebhook(req: Request, res: Response): Promise<void> {
  const { event, data } = req.body;

  if (event !== "user.upgraded") {
    res.status(204).send();
    return;
  }

  try {
    const updatedUser = await upgradeUserToChirpyRed(data.userId);
    if (!updatedUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ error: "User not found" });
  }
}
