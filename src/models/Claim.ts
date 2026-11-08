
import mongoose, { Schema, Document } from "mongoose";

export interface IClaim extends Document {
  itemId: mongoose.Types.ObjectId;
  claimantId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  proofDescription: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

const claimSchema = new Schema<IClaim>(
  {
    itemId: {
      type: Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    claimantId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    proofDescription: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  }
);

const Claim = mongoose.model<IClaim>("Claim", claimSchema);

export default Claim;
