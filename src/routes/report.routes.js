import express from "express";
import {
  createReport,
  getReports,
  getReportById,
  updateReport,
  deleteReport,
  resolveReport,
  getStats,
} from "../controllers/report.controller.js";

import { upload } from "../middleware/upload.middleware.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { roleMiddleware } from "../middleware/role.middleware.js";
import { validateObjectId } from "../middleware/validateObjectId.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post(
  "/",
  upload.fields([
    { name: "fail_evidence", maxCount: 1 },
    { name: "delivery_evidence", maxCount: 1 },
  ]),
  createReport,
);

router.post("/list", getReports);

router.get(
  "/stats",
  roleMiddleware("admin", "boss"),
  getStats,
);

router.get("/:id", validateObjectId, getReportById);

router.put(
  "/:id/resolve",
  validateObjectId,
  roleMiddleware("admin", "boss"),
  resolveReport,
);

router.put("/:id", validateObjectId, updateReport);

router.patch(
  "/:id",
  validateObjectId,
  roleMiddleware("admin", "boss"),
  resolveReport,
);

router.delete(
  "/:id",
  validateObjectId,
  roleMiddleware("admin", "boss"),
  deleteReport,
);

export default router;
