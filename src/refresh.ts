import { Request, Response } from "express";
import { getBearerToken, makeJWT } from "./auth.js";
import { getRefreshToken, revokeRefreshToken } from "./db/queries/refresh_tokens.js";
import { config } from "./config.js";

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
