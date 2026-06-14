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

const router = express.Router();

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
  resolveReport,
);

router.put("/:id", updateReport);

router.patch("/:id", resolveReport);

router.delete(
  "/:id",
  deleteReport,
);

export default router;
