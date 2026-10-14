import { Request, Response } from "express";
import { BadRequestError } from "./errors.js";
import { createChirp, getChirps, getChirpById } from "./db/queries/chirps.js";
import { getBearerToken, validateJWT } from "./auth.js";
import { config } from "./config.js";

const PROFANE_WORDS = new Set(["kerfuffle", "sharbert", "fornax"]);

export async function handlerCreateChirp(req: Request, res: Response): Promise<void> {
  try {
    const token = getBearerToken(req);
    const userId = validateJWT(token, config.jwtSecret);

    const { body } = req.body;

    if (typeof body !== "string" || body.length > 140) {
      throw new BadRequestError("Chirp is too long. Max length is 140");
    }

    const words = body.split(" ");
    const cleanedWords = words.map((word) => {
      if (PROFANE_WORDS.has(word.toLowerCase())) {
        return "****";
      }
      return word;
    });
    const cleanedBody = cleanedWords.join(" ");

    const newChirp = await createChirp({
      body: cleanedBody,
      userId,
    });

    res.status(201).json({
      id: newChirp.id,
      createdAt: newChirp.createdAt,
      updatedAt: newChirp.updatedAt,
      body: newChirp.body,
      userId: newChirp.userId,
    });
  } catch (error) {
    if (error instanceof BadRequestError) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(401).json({ error: "Unauthorized" });
  }
}

export async function handlerGetChirps(req: Request, res: Response): Promise<void> {
  const allChirps = await getChirps();
  res.status(200).json(allChirps);
}

export async function handlerGetChirpById(req: Request, res: Response): Promise<void> {
  const chirpId = req.params.chirpId;

  if (typeof chirpId !== "string") {
    res.status(400).send("Invalid chirp ID");
    return;
  }

  const chirp = await getChirpById(chirpId);

  if (!chirp) {
    res.status(404).send("Not found");
    return;
  }

  res.status(200).json(chirp);
}
