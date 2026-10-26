
import express from "express";
import cors from "cors";
import itemRoutes from "./routes/itemRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/", (_req, res) => {
  res.json({ message: "Smart Lost & Found API is running!" });
});

app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);

export default app;
