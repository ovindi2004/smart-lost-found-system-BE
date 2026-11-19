import mongoose, { Schema } from "mongoose";
const itemSchema = new Schema({
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
}, {
    timestamps: true,
});
const Item = mongoose.model("Item", itemSchema);
export default Item;
//# sourceMappingURL=Item.js.map