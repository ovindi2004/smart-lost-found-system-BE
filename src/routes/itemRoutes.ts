
import { Router } from "express";

import {
  createItem,
  getAllItems,
  updateItem,
  deleteItem,
} from "../controllers/itemController.js";

const router = Router();

router.post("/", createItem);
router.get("/", getAllItems);

router.put("/:id", updateItem);
router.delete("/:id", deleteItem);

export default router;
