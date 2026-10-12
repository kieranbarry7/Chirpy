import { Request, Response } from "express";
import { config } from "./config.js";
import { deleteAllUsers } from "./db/queries/users.js";

export function middlewareMetricsInc(req: Request, res: Response, next: () => void) {
  config.fileserverHits++;
  next();
}

export function handlerMetrics(req: Request, res: Response) {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(`<html><body><h1>Welcome, Chirpy Admin</h1><p>Chirpy has been visited ${config.fileserverHits} times!</p></body></html>`);
}

export async function handlerReset(req: Request, res: Response) {
  if (config.platform !== "dev") {
    return res.status(403).send("Forbidden");
  }

  await deleteAllUsers();
  config.fileserverHits = 0;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  return res.send("Reset successful");
}
