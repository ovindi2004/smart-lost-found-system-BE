
import { Router } from "express";

import {
  createItem,
  getAllItems,
  updateItem,
  deleteItem,
  getSmartMatches
} from "../controllers/itemController.js";

import { authenticateMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/", authenticateMiddleware, createItem);
router.get("/", getAllItems);

router.put("/:id", authenticateMiddleware, updateItem);
router.delete("/:id", authenticateMiddleware, deleteItem);
router.get("/:id/matches", getSmartMatches);

export default router;
