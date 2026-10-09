import { Request, Response, NextFunction } from "express";
import { config } from "./config.js";

// Step 3: Middleware that increments fileserverHits
export function middlewareMetricsInc(req: Request, res: Response, next: NextFunction): void {
  config.fileserverHits++;
  next();
}

// Step 5: Handler that returns plain text response "Hits: x"
export function handlerMetrics(req: Request, res: Response): void {
  res.set("Content-Type", "text/plain; charset=utf-8");
  res.send(`Hits: ${config.fileserverHits}`);
}

// Step 7: Handler that resets fileserverHits to 0
export function handlerReset(req: Request, res: Response): void {
  config.fileserverHits = 0;
  res.set("Content-Type", "text/plain; charset=utf-8");
  res.send("Hits reset to 0");
}
