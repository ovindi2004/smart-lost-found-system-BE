
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


// SMART MATCHING HELPER
const calculateSimilarity = (text1: string, text2: string): number => {
  const words1 = new Set(
    text1.toLowerCase().match(/[a-z0-9]+/g) || []
  );

  const words2 = new Set(
    text2.toLowerCase().match(/[a-z0-9]+/g) || []
  );

  if (words1.size === 0 || words2.size === 0) {
    return 0;
  }

  const commonWords = [...words1].filter((word) =>
    words2.has(word)
  );

  return commonWords.length / new Set([...words1, ...words2]).size;
};

// CALCULATE ITEM MATCH SCORE
const calculateMatchScore = (lostItem: any, foundItem: any) => {
  let score = 0;
  const reasons: string[] = [];

  // Category matching (30%)
  if (
    lostItem.category?.toLowerCase() ===
    foundItem.category?.toLowerCase()
  ) {
    score += 30;
    reasons.push("Same category");
  }

  // Title matching (30%)
  const titleSimilarity = calculateSimilarity(
    lostItem.title || "",
    foundItem.title || ""
  );

  score += titleSimilarity * 30;

  if (titleSimilarity > 0) {
    reasons.push("Similar item name");
  }

  // Description matching (20%)
  const descriptionSimilarity = calculateSimilarity(
    lostItem.description || "",
    foundItem.description || ""
  );

  score += descriptionSimilarity * 20;

  if (descriptionSimilarity > 0) {
    reasons.push("Similar description");
  }

  // Location matching (15%)
  const location1 = lostItem.location?.toLowerCase() || "";
  const location2 = foundItem.location?.toLowerCase() || "";

  if (location1 && location2 && location1 === location2) {
    score += 15;
    reasons.push("Same location");
  } else if (
    location1 &&
    location2 &&
    (location1.includes(location2) || location2.includes(location1))
  ) {
    score += 8;
    reasons.push("Similar location");
  }

  // Date matching (5%)
  const date1 = new Date(lostItem.date).getTime();
  const date2 = new Date(foundItem.date).getTime();

  if (!isNaN(date1) && !isNaN(date2)) {
    const daysDifference = Math.abs(date1 - date2) / 86400000;

    if (daysDifference <= 1) {
      score += 5;
      reasons.push("Similar date");
    } else if (daysDifference <= 7) {
      score += 3;
      reasons.push("Dates are close");
    }
  }

  return {
    matchScore: Math.round(score),
    matchedReasons: reasons,
  };
};

// GET SMART MATCHES
export const getSmartMatches = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const lostItem = await Item.findById(req.params.id);

    if (!lostItem) {
      res.status(404).json({
        success: false,
        message: "Item not found.",
      });
      return;
    }

    const oppositeType =
      lostItem.itemType === "LOST" ? "FOUND" : "LOST";

    const possibleMatches = await Item.find({
      itemType: oppositeType,
      _id: { $ne: lostItem._id },
      status: { $ne: "RETURNED" },
    });

    const matches = possibleMatches
      .map((item) => {
        const result = calculateMatchScore(lostItem, item);

        return {
          item,
          matchScore: result.matchScore,
          matchedReasons: result.matchedReasons,
        };
      })
      .filter((match) => match.matchScore >= 20)
      .sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json({
      success: true,
      count: matches.length,
      data: matches,
    });
  } catch (error) {
    console.error("Smart matching error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to find matching items.",
    });
  }
};

