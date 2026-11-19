import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  message: string;
  type: "CLAIM_REQUEST" | "CLAIM_APPROVED" | "CLAIM_REJECTED";
  relatedItemId?: mongoose.Types.ObjectId;
  isRead: boolean;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["CLAIM_REQUEST", "CLAIM_APPROVED", "CLAIM_REJECTED"],
      required: true,
    },
    relatedItemId: {
      type: Schema.Types.ObjectId,
      ref: "Item",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model<INotification>(
  "Notification",
  notificationSchema
);