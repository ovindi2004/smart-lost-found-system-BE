import { Router } from "express";
import {
  getMyNotifications,
  deleteNotification,
} from "../controllers/notificationController.js";
import { authenticateMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", authenticateMiddleware, getMyNotifications);

router.delete("/:id", authenticateMiddleware, deleteNotification);

export default router;