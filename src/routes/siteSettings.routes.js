import { Router } from "express";
import {
  getSiteSettings,
  getSiteStatus,
  updateSiteSettings,
} from "../controllers/siteSettings.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { roleMiddleware } from "../middleware/role.middleware.js";

const router = Router();

router.get("/status", getSiteStatus);
router.get("/", authMiddleware, roleMiddleware("boss"), getSiteSettings);
router.put("/", authMiddleware, roleMiddleware("boss"), updateSiteSettings);

export default router;
