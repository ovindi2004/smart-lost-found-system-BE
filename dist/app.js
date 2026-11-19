import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import itemRoutes from "./routes/itemRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import claimRoutes from "./routes/claimRoutes.js";
import chatbotRoutes from "./routes/chatbotRoutes.js";
import imageRecognitionRoutes from "./routes/imageRecognitionRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
// Root health check endpoint (returns API and database status)
app.get("/", async (_req, res) => {
    let dbStatus = "disconnected";
    try {
        await connectDB();
        dbStatus = "connected";
    }
    catch (err) {
        dbStatus = `connection_failed: ${err?.message || "error"}`;
    }
    res.json({
        message: "Smart Lost & Found API is running!",
        database: dbStatus,
    });
});
// Diagnostic health endpoint for verifying Vercel environment setup
app.get("/api/health", async (_req, res) => {
    let dbStatus = "disconnected";
    let dbError = null;
    try {
        await connectDB();
        dbStatus = "connected";
    }
    catch (err) {
        dbStatus = "error";
        dbError = err?.message || "Connection failed";
    }
    res.json({
        status: "ok",
        database: dbStatus,
        readyState: mongoose.connection.readyState,
        envCheck: {
            hasMongoUri: Boolean(process.env.MONGODB_URI ||
                process.env.MONGO_URI ||
                process.env.MONGODB_URL ||
                process.env.DATABASE_URL),
            hasJwtSecret: Boolean(process.env.JWT_SECRET),
            hasGeminiKey: Boolean(process.env.GEMINI_API_KEY ||
                process.env.GOOGLE_API_KEY ||
                process.env.GOOGLE_GENAI_API_KEY),
            hasGeminiModel: Boolean(process.env.GEMINI_MODEL),
            configuredGeminiModel: process.env.GEMINI_MODEL?.trim() || "gemini-3.8-flash",
        },
        error: dbError,
    });
});
// Database connection middleware: ensures DB is connected before handling ANY api route
app.use(async (req, res, next) => {
    if (req.path.startsWith("/api")) {
        try {
            await connectDB();
            next();
        }
        catch (error) {
            console.error("Database connection middleware error:", error);
            res.status(500).json({
                success: false,
                message: "Database connection failed. Please verify MongoDB Atlas configuration in Vercel.",
                error: process.env.NODE_ENV === "development" ? error?.message : undefined,
            });
            return;
        }
    }
    else {
        next();
    }
});
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/users", userRoutes);
app.use("/api/claims", claimRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/image-recognition", imageRecognitionRoutes);
app.use("/api/notifications", notificationRoutes);
export default app;
//# sourceMappingURL=app.js.map