import express, { Request, Response, NextFunction } from "express";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import { config } from "./config.js";
import { middlewareLogResponses, middlewareErrorHandler } from "./middleware.js";
import { middlewareMetricsInc, handlerMetrics, handlerReset } from "./metrics.js";
import { handlerCreateChirp, handlerGetChirps } from "./chirps.js";
import { handlerCreateUser } from "./users.js";

const app = express();
const PORT = config.port;

app.use(express.json());
app.use(middlewareLogResponses);

app.use("/app", middlewareMetricsInc);
app.use("/app", express.static("./src/app"));

function handlerReadiness(req: Request, res: Response) {
  res.set("Content-Type", "text/plain; charset=utf-8");
  res.send("OK");
}

app.get("/api/healthz", handlerReadiness);

app.get("/api/chirps", (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(handlerGetChirps(req, res)).catch(next);
});

app.post("/api/chirps", (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(handlerCreateChirp(req, res)).catch(next);
});

app.post("/api/users", (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(handlerCreateUser(req, res)).catch(next);
});

app.get("/admin/metrics", handlerMetrics);
app.post("/admin/reset", (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(handlerReset(req, res)).catch(next);
});

app.use(middlewareErrorHandler);

async function start() {
  try {
    console.log("1. Starting migrations...");
    const migrationClient = postgres(config.db.url, { max: 1 });
    await migrate(drizzle(migrationClient), config.db.migrationConfig);
    console.log("2. Migrations complete. Binding Express listener...");
    app.listen(PORT, () => {
      console.log(`3. Server is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

start();
