
import type { Request, Response } from "express";
import Claim from "../models/Claim.js";
import Item from "../models/Item.js";
import Notification from "../models/Notification.js";

// CREATE CLAIM REQUEST
export const createClaim = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { itemId, proofDescription } = req.body;

    const claimantId = (
      req as Request & { userId?: string }
    ).userId;

    if (!claimantId) {
      res.status(401).json({
        success: false,
        message: "Please login first.",
      });
      return;
    }

    if (!itemId || !proofDescription?.trim()) {
      res.status(400).json({
        success: false,
        message: "Please provide all required fields.",
      });
      return;
    }

    const item = await Item.findById(itemId);

    if (!item) {
      res.status(404).json({
        success: false,
        message: "Item not found.",
      });
      return;
    }

    if (item.itemType !== "FOUND") {
      res.status(400).json({
        success: false,
        message: "Only found items can be claimed.",
      });
      return;
    }

    if (item.status !== "OPEN") {
      res.status(400).json({
        success: false,
        message: "This item is not available for claims.",
      });
      return;
    }

    if (item.userId.toString() === claimantId) {
      res.status(400).json({
        success: false,
        message: "You cannot claim your own item.",
      });
      return;
    }

    const existingClaim = await Claim.findOne({
      itemId,
      claimantId,
      status: { $in: ["PENDING", "APPROVED"] },
    });

    if (existingClaim) {
      res.status(400).json({
        success: false,
        message: "You already have an active claim for this item.",
      });
      return;
    }

    const newClaim = await Claim.create({
      itemId,
      claimantId,
      ownerId: item.userId,
      proofDescription: proofDescription.trim(),
    });

    // CREATE NOTIFICATION FOR ITEM OWNER
    await Notification.create({
      userId: item.userId,
      message: `Someone submitted a claim for your item: ${item.title}`,
      type: "CLAIM_REQUEST",
      relatedItemId: item._id,
    });

    res.status(201).json({
      success: true,
      message: "Claim request submitted successfully!",
      data: newClaim,
    });
  } catch (error) {
    console.error("Create claim error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to submit claim request.",
    });
  }
};

// GET ALL CLAIMS - ADMIN
export const getAllClaims = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const claims = await Claim.find()
      .populate("itemId")
      .populate("claimantId", "name email")
      .populate("ownerId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: claims.length,
      data: claims,
    });
  } catch (error) {
    console.error("Get claims error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve claims.",
    });
  }
};

// GET CLAIMS FOR LOGGED-IN ITEM OWNER
export const getMyClaims = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const ownerId = (
      req as Request & { userId?: string }
    ).userId;

    if (!ownerId) {
      res.status(401).json({
        success: false,
        message: "Please login first.",
      });
      return;
    }

    const claims = await Claim.find({ ownerId })
      .populate("itemId")
      .populate("claimantId", "name email")
      .populate("ownerId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: claims.length,
      data: claims,
    });
  } catch (error) {
    console.error("Get my claims error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve your claims.",
    });
  }
};

// GET CLAIMS SUBMITTED BY LOGGED-IN USER
export const getMySubmittedClaims = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const claimantId = (
      req as Request & { userId?: string }
    ).userId;

    if (!claimantId) {
      res.status(401).json({
        success: false,
        message: "Please login first.",
      });
      return;
    }

    const claims = await Claim.find({ claimantId })
      .populate("itemId")
      .populate("claimantId", "name email")
      .populate("ownerId", "name email")
      .sort({ createdAt: -1 });

    console.log("SUBMITTED CLAIMS:", claims.length);

    res.status(200).json({
      success: true,
      count: claims.length,
      data: claims,
    });
  } catch (error) {
    console.error("Get submitted claims error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve your submitted claims.",
    });
  }
};

// UPDATE CLAIM STATUS - ITEM OWNER ONLY
export const updateClaimStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { status } = req.body;

    const loggedInUserId = (
      req as Request & { userId?: string }
    ).userId;

    if (!loggedInUserId) {
      res.status(401).json({
        success: false,
        message: "Please login first.",
      });
      return;
    }

    if (!["APPROVED", "REJECTED"].includes(status)) {
      res.status(400).json({
        success: false,
        message: "Status must be APPROVED or REJECTED.",
      });
      return;
    }

    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      res.status(404).json({
        success: false,
        message: "Claim request not found.",
      });
      return;
    }

    if (claim.ownerId.toString() !== loggedInUserId) {
      res.status(403).json({
        success: false,
        message: "Only the item owner can approve or reject this claim.",
      });
      return;
    }

    if (claim.status !== "PENDING") {
      res.status(400).json({
        success: false,
        message: "This claim has already been processed.",
      });
      return;
    }

    if (status === "APPROVED") {
      const item = await Item.findOneAndUpdate(
        {
          _id: claim.itemId,
          status: "OPEN",
        },
        {
          status: "MATCHED",
        },
        { new: true }
      );

      if (!item) {
        res.status(400).json({
          success: false,
          message: "This item is no longer available.",
        });
        return;
      }

      claim.status = "APPROVED";
      await claim.save();

      // NOTIFY CLAIMANT - APPROVED
      await Notification.create({
        userId: claim.claimantId,
        message: "Good news! Your claim request has been approved.",
        type: "CLAIM_APPROVED",
        relatedItemId: claim.itemId,
    });

      // REJECT OTHER PENDING CLAIMS AND SEND NOTIFICATIONS
const otherClaims = await Claim.find({
  itemId: claim.itemId,
  _id: { $ne: claim._id },
  status: "PENDING",
});

for (const otherClaim of otherClaims) {
  otherClaim.status = "REJECTED";
  await otherClaim.save();

  await Notification.create({
    userId: otherClaim.claimantId,
    message: "Your claim request has been rejected because another claim was approved.",
    type: "CLAIM_REJECTED",
    relatedItemId: claim.itemId,
  });
}
    } else {
      claim.status = "REJECTED";
      await claim.save();

      // NOTIFY CLAIMANT - REJECTED
     await Notification.create({
        userId: claim.claimantId,
        message: "Your claim request has been rejected.",
        type: "CLAIM_REJECTED",
        relatedItemId: claim.itemId,
});
    }

    res.status(200).json({
      success: true,
      message: `Claim ${status.toLowerCase()} successfully!`,
      data: claim,
    });
  } catch (error) {
    console.error("Update claim error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update claim.",
    });
  }
};
