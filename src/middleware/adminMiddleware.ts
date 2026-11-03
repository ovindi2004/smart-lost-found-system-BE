
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const adminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Please login first.",
      });
      return;
    }

   const token = authHeader.split(" ")[1];

if (!token) {
  res.status(401).json({
    success: false,
    message: "Invalid token.",
  });
  return;
}
    const decoded = jwt.verify(
  token,
  process.env.JWT_SECRET || "change-this-secret"
) as unknown as { userId: string };
    if (!decoded.userId) {
      res.status(401).json({
        success: false,
        message: "Invalid token.",
      });
      return;
    }

    const user = await User.findById(decoded.userId);

    if (!user || user.role !== "ADMIN") {
      res.status(403).json({
        success: false,
        message: "Admin access only.",
      });
      return;
    }

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};
