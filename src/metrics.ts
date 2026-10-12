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
  console.log("--> INCOMING REQUEST: /admin/reset hit!");

  if (config.platform !== "dev") {
    console.log("--> Platform is not dev, returning 403. Current platform:", config.platform);
    return res.status(403).send("Forbidden");
  }

  console.log("--> Platform is dev. Starting database deletion...");
  await deleteAllUsers();
  console.log("--> Users deleted. Resetting hits counter...");

  config.fileserverHits = 0;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  console.log("--> Response sent successfully.");
  return res.send("Reset successful");
}
