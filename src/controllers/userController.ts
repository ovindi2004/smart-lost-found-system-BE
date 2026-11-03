
import type { Request, Response } from "express";
import User from "../models/User.js";

// GET ALL USERS (ADMIN ONLY)
export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get users.",
    });
  }
};

// DELETE USER (ADMIN ONLY)
export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found.",
      });
      return;
    }

    if (user.role === "ADMIN") {
      res.status(403).json({
        success: false,
        message: "Admin accounts cannot be deleted.",
      });
      return;
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete user.",
    });
  }
};
