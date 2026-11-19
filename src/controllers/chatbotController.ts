import type { Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";

/**
 * Classifies Gemini API errors into distinct categories (429 Quota, 503 Capacity, Model, Auth, Generic)
 */
const classifyGeminiError = (
  error: any
): { status: number; message: string; code: string } => {
  const status =
    error?.status ||
    error?.statusCode ||
    error?.response?.status ||
    error?.statusText;

  const rawMsg: string = (error?.message || "").toLowerCase();

  // 1. Quota / Rate Limit (HTTP 429 / RESOURCE_EXHAUSTED)
  if (
    status === 429 ||
    rawMsg.includes("429") ||
    rawMsg.includes("resource_exhausted") ||
    rawMsg.includes("quota") ||
    rawMsg.includes("rate limit")
  ) {
    return {
      status: 429,
      message: "AI service quota exceeded. Please wait a moment before sending another message.",
      code: "QUOTA_EXHAUSTED",
    };
  }

  // 2. Capacity / Service Unavailable (HTTP 503 / UNAVAILABLE / Overloaded)
  if (
    status === 503 ||
    rawMsg.includes("503") ||
    rawMsg.includes("unavailable") ||
    rawMsg.includes("high demand") ||
    rawMsg.includes("overloaded") ||
    rawMsg.includes("capacity")
  ) {
    return {
      status: 503,
      message: "AI service is temporarily overloaded. Please try again shortly.",
      code: "SERVICE_UNAVAILABLE",
    };
  }

  // 3. Invalid or Unsupported Model (HTTP 404 / 400 / NOT_FOUND)
  if (
    status === 404 ||
    rawMsg.includes("not found") ||
    rawMsg.includes("is not supported") ||
    rawMsg.includes("unsupported model") ||
    rawMsg.includes("invalid model") ||
    (status === 400 && rawMsg.includes("model"))
  ) {
    return {
      status: 400,
      message: "The configured Gemini model is not supported. Please verify the GEMINI_MODEL setting.",
      code: "INVALID_MODEL",
    };
  }

  // 4. Invalid API Key / Authentication (HTTP 401 / 403 / API_KEY_INVALID)
  if (
    status === 401 ||
    status === 403 ||
    rawMsg.includes("api_key_invalid") ||
    rawMsg.includes("api key not valid") ||
    rawMsg.includes("unauthenticated") ||
    rawMsg.includes("permission_denied")
  ) {
    return {
      status: 401,
      message: "Gemini API key is invalid or unauthorized.",
      code: "AUTH_FAILED",
    };
  }

  // Default fallback
  return {
    status: 500,
    message: "Chatbot encountered an unexpected error. Please try again.",
    code: "CHATBOT_ERROR",
  };
};

export const chatbotResponse = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { message } = req.body;

    // Validate request body
    if (!message || typeof message !== "string" || !message.trim()) {
      res.status(400).json({
        success: false,
        message: "Please enter a message.",
      });
      return;
    }

    // Resolve API key securely without exposing it in logs or errors
    const apiKey = (
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.GOOGLE_GENAI_API_KEY
    )?.trim();

    if (!apiKey) {
      console.error("Chatbot: Gemini API key is missing from environment variables.");
      res.status(500).json({
        success: false,
        message: "Gemini API key is not configured on the server.",
        code: "MISSING_API_KEY",
      });
      return;
    }

    // Use supported model compatible with @google/genai SDK (defaults to gemini-3.8-flash)
    const model = process.env.GEMINI_MODEL?.trim() || "gemini-3.8-flash";

    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `You are UniFind AI Assistant, a helpful chatbot for a university Lost and Found Management System.

Help users with:
- Finding lost and found items.
- Explaining how to report lost or found items.
- Explaining the claim request process.
- Giving guidance on using the UniFind website.

Answer in simple English. Be friendly and concise.
Do not claim that you searched the database or submitted a claim.

User message: ${message.trim()}`;

    const response = await ai.models.generateContent({
      model,
      contents: systemPrompt,
    });

    const replyText =
      response?.text ||
      response?.candidates?.[0]?.content?.parts
        ?.map((p: any) => p?.text || "")
        .join("")
        .trim() ||
      "Sorry, I could not generate a response.";

    res.status(200).json({
      success: true,
      reply: replyText,
    });
  } catch (error: any) {
    const classified = classifyGeminiError(error);

    // Log error summary securely without leaking any credentials
    console.error(
      `Chatbot Error [${classified.code}]:`,
      error?.message || error
    );

    res.status(classified.status).json({
      success: false,
      message: classified.message,
      code: classified.code,
    });
  }
};

export default chatbotResponse;
