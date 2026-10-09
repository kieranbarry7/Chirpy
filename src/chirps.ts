import { Request, Response } from "express";
import { BadRequestError } from "./errors.js";

const PROFANE_WORDS = new Set(["kerfuffle", "sharbert", "fornax"]);

export async function handlerValidateChirp(req: Request, res: Response): Promise<void> {
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

  res.status(200).json({ cleanedBody });
}
