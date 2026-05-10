import express from "express";
import cookieParser from "cookie-parser";
import healthRouter from "./routes/health.router.js";
import sessionsRouter from "./routes/sessions.router.js";
import petsRouter from "./routes/pets.router.js";
import adoptionsRouter from "./routes/adoptions.router.js";
import { swaggerSpecs } from "./config/swagger.js";
import swaggerUi from "swagger-ui-express";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/health", healthRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/api/pets", petsRouter);
app.use("/api/adoptions", adoptionsRouter);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
});

export default app;
