import express from "express";
import cors from "cors";
import path from "path";

const app = express();

const corsConfig = { credentials: true };

if (process.env.CORS_ORIGINS) {
  const origins = process.env.CORS_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean);
  corsConfig.origin = function (origin, callback) {
    if (!origin || origins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Origen no permitido"));
    }
  };
}

app.use(cors(corsConfig));

app.use(express.json({ limit: "10mb" }));

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import reportRoutes from "./routes/report.routes.js";

app.use("/uploads", express.static(path.resolve("uploads")));
app.use("/api/uploads", express.static(path.resolve("uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reports", reportRoutes);

app.use((err, _req, res, _next) => {
  console.error("[ERROR]", err.message);
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "Archivo demasiado grande (max 5MB)" });
  }
  if (err.name === "MulterError") {
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({ message: "Error interno del servidor" });
});

export default app;
