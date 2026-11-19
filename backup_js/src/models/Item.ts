
import mongoose, { Schema, Document } from "mongoose";

export interface IItem extends Document {
  title: string;
  description: string;
  category: string;
  itemType: "LOST" | "FOUND";
  location: string;
  date: Date;
  image?: string;
  status: "OPEN" | "MATCHED" | "RETURNED";
  userId: mongoose.Types.ObjectId;
}

const itemSchema = new Schema<IItem>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    itemType: {
      type: String,
      enum: ["LOST", "FOUND"],
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["OPEN", "MATCHED", "RETURNED"],
      default: "OPEN",
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Item = mongoose.model<IItem>("Item", itemSchema);

export default Item;
