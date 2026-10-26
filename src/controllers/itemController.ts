
import type { Request, Response } from "express";import Item from "../models/Item.js";

export const createItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      title,
      description,
      category,
      itemType,
      location,
      date,
      image,
      userId,
    } = req.body;

    if (
      !title ||
      !description ||
      !category ||
      !itemType ||
      !location ||
      !date ||
      !userId
    ) {
      res.status(400).json({
        success: false,
        message: "Please provide all required fields.",
      });
      return;
    }

    if (!["LOST", "FOUND"].includes(itemType)) {
      res.status(400).json({
        success: false,
        message: "Item type must be LOST or FOUND.",
      });
      return;
    }

    const newItem = await Item.create({
      title,
      description,
      category,
      itemType,
      location,
      date,
      image,
      userId,
    });

    res.status(201).json({
      success: true,
      message: "Item created successfully!",
      data: newItem,
    });
  } catch (error) {
    console.error("Create item error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create item.",
    });
  }
};

export const getAllItems = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const items = await Item.find()
      .sort({ createdAt: -1 })
      .populate("userId", "name email");

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    console.error("Get items error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve items.",
    });
  }
};
