
import type { Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";

export const chatbotResponse = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      res.status(400).json({
        success: false,
        message: "Please enter a message.",
      });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      res.status(500).json({
        success: false,
        message: "Gemini API key is missing in .env file.",
      });
      return;
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
     model: "gemini-3.8-flash",
      contents: `You are UniFind AI Assistant, a helpful chatbot for a university Lost and Found Management System.

Help users with:
- Finding lost and found items.
- Explaining how to report lost or found items.
- Explaining the claim request process.
- Giving guidance on using the UniFind website.

Answer in simple English. Be friendly and concise.
Do not claim that you searched the database or submitted a claim.

User message: ${message}`,
    });

    res.status(200).json({
      success: true,
      reply: response.text || "Sorry, I could not generate a response.",
    });
  } catch (error) {
    console.error("Chatbot Error:", error);

    res.status(500).json({
      success: false,
      message: "Chatbot is currently unavailable. Please try again.",
    });
  }
};
