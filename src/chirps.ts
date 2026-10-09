import { Request, Response } from "express";

export function handlerValidateChirp(req: Request, res: Response): void {
  const { body } = req.body;

  if (typeof body !== "string" || body.length > 140) {
    res.status(400).json({ error: "Chirp is too long" });
    return;
  }

  res.status(200).json({ valid: true });
}
