import express from "express";
import cors from "cors";
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

app.get("/", (_req, res) => {
  res.json({ message: "Smart Lost & Found API is running!" });
});

app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/users", userRoutes);
app.use("/api/claims", claimRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/image-recognition", imageRecognitionRoutes);
app.use("/api/notifications", notificationRoutes);


export default app;