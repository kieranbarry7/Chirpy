import express, { Request, Response } from "express";
import { middlewareLogResponses } from "./middleware.js";
import { middlewareMetricsInc, handlerMetrics, handlerReset } from "./metrics.js";

const app = express();
const PORT = 8080;

app.use(middlewareLogResponses);

// Step 4: Run metrics middleware on /app before serving files
app.use("/app", middlewareMetricsInc);
app.use("/app", express.static("./src/app"));

function handlerReadiness(req: Request, res: Response) {
  res.set("Content-Type", "text/plain; charset=utf-8");
  res.send("OK");
}

app.get("/healthz", handlerReadiness);

// Step 6 & 7: Register metrics and reset endpoints
app.get("/metrics", handlerMetrics);
app.get("/reset", handlerReset);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
