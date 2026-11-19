import { Router } from "express";
import { createItem, getAllItems, getItemById, updateItem, deleteItem, getSmartMatches } from "../controllers/itemController.js";
import { authenticateMiddleware } from "../middleware/authMiddleware.js";
const router = Router();
router.post("/", authenticateMiddleware, createItem);
router.get("/", getAllItems);
router.get("/:id/matches", getSmartMatches);
router.get("/:id", getItemById);
router.put("/:id", authenticateMiddleware, updateItem);
router.delete("/:id", authenticateMiddleware, deleteItem);
export default router;
//# sourceMappingURL=itemRoutes.js.map