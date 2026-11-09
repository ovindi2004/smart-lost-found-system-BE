
import type { Request, Response } from "express";
import Notification from "../models/Notification.js";
import mongoose from "mongoose";

// GET LOGGED-IN USER NOTIFICATIONS
export const getMyNotifications = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (
      req as Request & { userId?: string }
    ).userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Please login first.",
      });
      return;
    }

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    console.error("Get notifications error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve notifications.",
    });
  }
};
// DELETE NOTIFICATION AFTER SEEN
export const deleteNotification = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (
      req as Request & { userId?: string }
    ).userId;

const id = req.params.id;

if (!id || Array.isArray(id)) {
  res.status(400).json({
    success: false,
    message: "Invalid notification ID.",
  });
  return;
}
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Please login first.",
      });
      return;
    }

    const notification = await Notification.findOneAndDelete({
  _id: id,
  userId: new mongoose.Types.ObjectId(userId),
});

    if (!notification) {
      res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully.",
    });
  } catch (error) {
    console.error("Delete notification error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete notification.",
    });
  }
};
