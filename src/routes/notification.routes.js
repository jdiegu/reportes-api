import { Router } from "express";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "../controllers/notification.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { validateObjectId } from "../middleware/validateObjectId.middleware.js";

const router = Router();

router.use(authMiddleware);
router.get("/", getNotifications);
router.get("/unread", getUnreadCount);
router.patch("/:id/read", validateObjectId, markAsRead);
router.patch("/read-all", markAllAsRead);

export default router;
