import { Router } from "express";
import { chatbotResponse } from "../controllers/chatbotController.js";

const router = Router();

router.post("/", chatbotResponse);

export default router;