import express, { Request, Response, NextFunction } from "express";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import { config } from "./config.js";
import { middlewareLogResponses, middlewareErrorHandler } from "./middleware.js";
import { middlewareMetricsInc, handlerMetrics, handlerReset } from "./metrics.js";
import { handlerValidateChirp } from "./chirps.js";
import { handlerCreateUser } from "./users.js";

const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);

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


app.post("/api/validate_chirp", (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(handlerValidateChirp(req, res)).catch(next);
});
app.post("/api/users", (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(handlerCreateUser(req, res)).catch(next);
});

app.get("/admin/metrics", handlerMetrics);
app.post("/admin/reset", handlerReset);

app.use(middlewareErrorHandler);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
