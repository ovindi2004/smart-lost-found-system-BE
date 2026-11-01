
import { Router } from "express";

import {
  createItem,
  getAllItems,
  updateItem,
  deleteItem,
  getSmartMatches
  
} from "../controllers/itemController.js";

const router = Router();

router.post("/", createItem);
router.get("/", getAllItems);

router.put("/:id", updateItem);
router.delete("/:id", deleteItem);
router.get("/:id/matches", getSmartMatches);

export default router;
