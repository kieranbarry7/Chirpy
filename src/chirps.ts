import { Request, Response } from "express";
import { BadRequestError } from "./errors.js";
import { createChirp, getChirps } from "./db/queries/chirps.js";

const PROFANE_WORDS = new Set(["kerfuffle", "sharbert", "fornax"]);

export async function handlerCreateChirp(req: Request, res: Response): Promise<void> {
  const { body, userId } = req.body;

  if (typeof body !== "string" || body.length > 140) {
    throw new BadRequestError("Chirp is too long. Max length is 140");
  }

  if (!userId) {
    throw new BadRequestError("User ID is required");
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
}

export async function handlerGetChirps(req: Request, res: Response): Promise<void> {
  const allChirps = await getChirps();
  res.status(200).json(allChirps);
}
