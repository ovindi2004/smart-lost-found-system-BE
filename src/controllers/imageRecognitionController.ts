
import type { Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";

export const recognizeItemImage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { image } = req.body;

    if (!image || typeof image !== "string") {
      res.status(400).json({
        success: false,
        message: "Please upload an item image.",
      });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      res.status(500).json({
        success: false,
        message: "Gemini API key is missing.",
      });
      return;
    }

    const imageMatch = image.match(
      /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/
    );

    if (!imageMatch) {
      res.status(400).json({
        success: false,
        message: "Please upload a valid JPG, PNG or WEBP image.",
      });
      return;
    }
    const mimeType = imageMatch[1];
const imageData = imageMatch[2];

if (!mimeType || !imageData) {
  res.status(400).json({
    success: false,
    message: "Invalid image data.",
  });
  return;
}

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: [
        {
         inlineData: {
  mimeType: mimeType,
  data: imageData,
},
        },
        {
        text: `Analyze this item image for a university lost and found system.

Return ONLY valid JSON in this exact format:
{
  "title": "Short item name",
  "category": "One of: Electronics, Bags, Documents, Keys, Clothing, Jewelry, Pets, Other",
  "description": "Short description of visible color and features"
}

Do not include markdown or extra text.
Do not guess details that are not visible.`,
        },
      ],
    });

    res.status(200).json({
      success: true,
      result: response.text || "Could not identify the item.",
    });
  } catch (error) {
    console.error("Image Recognition Error:", error);

    res.status(500).json({
      success: false,
      message: "Image recognition is currently unavailable.",
    });
  }
};