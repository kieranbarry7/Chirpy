import express, { Request, Response } from "express";
import { middlewareLogResponses } from "./middleware.js";
import { middlewareMetricsInc, handlerMetrics, handlerReset } from "./metrics.js";
import { handlerValidateChirp } from "./chirps.js";

const app = express();
const PORT = 8080;

app.use(express.json());

app.use(middlewareLogResponses);

app.use("/app", middlewareMetricsInc);
app.use("/app", express.static("./src/app"));

function handlerReadiness(req: Request, res: Response) {
  res.set("Content-Type", "text/plain; charset=utf-8");
  res.send("OK");
}

app.get("/api/healthz", handlerReadiness);
app.post("/api/validate_chirp", handlerValidateChirp);

app.get("/admin/metrics", handlerMetrics);
app.post("/admin/reset", handlerReset);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
