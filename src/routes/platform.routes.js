import { Router } from "express";
import {
  getPlatforms,
  getAllPlatforms,
  createPlatform,
  updatePlatform,
  deletePlatform,
} from "../controllers/platform.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { roleMiddleware } from "../middleware/role.middleware.js";

const router = Router();

router.get("/", getPlatforms);
router.get("/all", authMiddleware, roleMiddleware("admin", "boss"), getAllPlatforms);
router.post("/", authMiddleware, roleMiddleware("admin", "boss"), createPlatform);
router.put("/:id", authMiddleware, roleMiddleware("admin", "boss"), updatePlatform);
router.delete("/:id", authMiddleware, roleMiddleware("admin", "boss"), deletePlatform);

export default router;
