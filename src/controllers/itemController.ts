
import type { Request, Response } from "express";
import Item from "../models/Item.js";

// CREATE ITEM
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

// GET ALL ITEMS
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

// UPDATE ITEM
export const updateItem = async (
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
      status,
    } = req.body;

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        category,
        itemType,
        location,
        date,
        image,
        status,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedItem) {
      res.status(404).json({
        success: false,
        message: "Item not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Item updated successfully!",
      data: updatedItem,
    });
  } catch (error) {
    console.error("Update item error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update item.",
    });
  }
};

// DELETE ITEM
export const deleteItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id);

    if (!deletedItem) {
      res.status(404).json({
        success: false,
        message: "Item not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Item deleted successfully!",
    });
  } catch (error) {
    console.error("Delete item error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete item.",
    });
  }
};
