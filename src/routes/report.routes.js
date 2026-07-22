import express from "express";
import {
  createReport,
  getReports,
  getReportById,
  updateReport,
  deleteReport,
  resolveReport,
} from "../controllers/report.controller.js";

import { upload } from "../middleware/upload.middleware.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { roleMiddleware } from "../middleware/role.middleware.js";

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

router.get("/:id", getReportById);

router.put(
  "/:id/resolve",
  roleMiddleware("admin", "boss"),
  resolveReport,
);

router.put("/:id", updateReport);

router.patch(
  "/:id",
  roleMiddleware("admin", "boss"),
  resolveReport,
);

router.delete(
  "/:id",
  roleMiddleware("admin", "boss"),
  deleteReport,
);

export default router;
