import { Request, Response } from "express";

const PROFANE_WORDS = new Set(["kerfuffle", "sharbert", "fornax"]);

export function handlerValidateChirp(req: Request, res: Response): void {
  const { body } = req.body;

  if (typeof body !== "string" || body.length > 140) {
    res.status(400).json({ error: "Chirp is too long" });
    return;
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
