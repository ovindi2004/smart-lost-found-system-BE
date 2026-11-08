
import { Router } from "express";
import {
  getAllUsers,
  deleteUser,
} from "../controllers/userController.js";
import { adminMiddleware } from "../middleware/authMiddleware.js";
const router = Router();

// GET ALL USERS
router.get("/", adminMiddleware, getAllUsers);

// DELETE USER
router.delete("/:id", adminMiddleware, deleteUser);

export default router;
