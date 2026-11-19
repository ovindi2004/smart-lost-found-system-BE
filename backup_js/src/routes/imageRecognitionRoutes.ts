
import { Router } from "express";
import { recognizeItemImage } from "../controllers/imageRecognitionController.js";

const router = Router();

router.post("/", recognizeItemImage);

export default router;
