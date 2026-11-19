import { GoogleGenAI } from "@google/genai";
/**
 * Classifies Gemini API errors into distinct categories (429 Quota, 503 Capacity, Model, Auth, Generic)
 */
const classifyGeminiError = (error) => {
    const status = error?.status ||
        error?.statusCode ||
        error?.response?.status ||
        error?.statusText;
    const rawMsg = (error?.message || "").toLowerCase();
    if (status === 429 ||
        rawMsg.includes("429") ||
        rawMsg.includes("resource_exhausted") ||
        rawMsg.includes("quota") ||
        rawMsg.includes("rate limit")) {
        return {
            status: 429,
            message: "AI service quota exceeded. Please wait a moment before trying again.",
            code: "QUOTA_EXHAUSTED",
        };
    }
    if (status === 503 ||
        rawMsg.includes("503") ||
        rawMsg.includes("unavailable") ||
        rawMsg.includes("high demand") ||
        rawMsg.includes("overloaded") ||
        rawMsg.includes("capacity")) {
        return {
            status: 503,
            message: "AI service is temporarily overloaded. Please try again in a few moments.",
            code: "SERVICE_UNAVAILABLE",
        };
    }
    if (status === 404 ||
        rawMsg.includes("not found") ||
        rawMsg.includes("is not supported") ||
        rawMsg.includes("unsupported model") ||
        rawMsg.includes("invalid model") ||
        (status === 400 && rawMsg.includes("model"))) {
        return {
            status: 400,
            message: "The configured Gemini model is not supported. Please verify the GEMINI_MODEL setting.",
            code: "INVALID_MODEL",
        };
    }
    if (status === 401 ||
        status === 403 ||
        rawMsg.includes("api_key_invalid") ||
        rawMsg.includes("api key not valid") ||
        rawMsg.includes("unauthenticated") ||
        rawMsg.includes("permission_denied")) {
        return {
            status: 401,
            message: "Gemini API key is invalid or unauthorized.",
            code: "AUTH_FAILED",
        };
    }
    return {
        status: 500,
        message: "Image recognition encountered an error. Please try again.",
        code: "IMAGE_RECOGNITION_ERROR",
    };
};
export const recognizeItemImage = async (req, res) => {
    try {
        const { image } = req.body;
        if (!image || typeof image !== "string") {
            res.status(400).json({
                success: false,
                message: "Please upload an item image.",
            });
            return;
        }
        const apiKey = (process.env.GEMINI_API_KEY ||
            process.env.GOOGLE_API_KEY ||
            process.env.GOOGLE_GENAI_API_KEY)?.trim();
        if (!apiKey) {
            console.error("Image Recognition: Gemini API key is missing from environment variables.");
            res.status(500).json({
                success: false,
                message: "Gemini API key is missing on the server.",
                code: "MISSING_API_KEY",
            });
            return;
        }
        const imageMatch = image.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
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
        const model = process.env.GEMINI_MODEL?.trim() || "gemini-3.8-flash";
        const ai = new GoogleGenAI({ apiKey });
        const promptText = `Analyze this item image for a university lost and found system.

Return ONLY valid JSON in this exact format:
{
  "title": "Short item name",
  "category": "One of: Electronics, Bags, Documents, Keys, Clothing, Jewelry, Pets, Other",
  "description": "Short description of visible color and features"
}

Do not include markdown or extra text.
Do not guess details that are not visible.`;
        const response = await ai.models.generateContent({
            model,
            contents: [
                {
                    inlineData: {
                        mimeType: mimeType,
                        data: imageData,
                    },
                },
                {
                    text: promptText,
                },
            ],
        });
        const resultText = response?.text ||
            response?.candidates?.[0]?.content?.parts
                ?.map((p) => p?.text || "")
                .join("")
                .trim() ||
            "Could not identify the item.";
        res.status(200).json({
            success: true,
            result: resultText,
        });
    }
    catch (error) {
        const classified = classifyGeminiError(error);
        console.error(`Image Recognition Error [${classified.code}]:`, error?.message || error);
        res.status(classified.status).json({
            success: false,
            message: classified.message,
            code: classified.code,
        });
    }
};
export default recognizeItemImage;
//# sourceMappingURL=imageRecognitionController.js.map