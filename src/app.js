import express from "express";
import cors from "cors";
import path from "path";
const app = express();
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors());

app.use(express.json());

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import reportRoutes from "./routes/report.routes.js";
import platformRoutes from "./routes/platform.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import siteSettingsRoutes from "./routes/siteSettings.routes.js";
import balanceMovementRoutes from "./routes/balanceMovement.routes.js";

app.use("/uploads", express.static("uploads"));
app.use("/api/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/platforms", platformRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/site-settings", siteSettingsRoutes);
app.use("/api/balance-movements", balanceMovementRoutes);

const publicDir = path.resolve(__dirname, "../public");
app.use(express.static(publicDir));
app.get("/{*splat}", (req, res, next) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
    return next();
  }
  res.sendFile(path.join(publicDir, "index.html"));
});

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
