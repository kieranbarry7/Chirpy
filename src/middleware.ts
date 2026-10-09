import { Request, Response, NextFunction } from "express";
import { HttpError } from "./errors.js";

export function middlewareLogResponses(req: Request, res: Response, next: NextFunction): void {
  res.on("finish", () => {
    console.log(`${req.method} ${req.path} -> ${res.statusCode}`);
  });
  next();
}

export function middlewareErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  console.log(err);
  res.status(500).json({ error: "Something went wrong on our end" });
}
