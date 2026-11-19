import mongoose, { Schema, Document } from "mongoose";
const notificationSchema = new Schema({
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
}, { timestamps: true });
export default mongoose.model("Notification", notificationSchema);
//# sourceMappingURL=Notification.js.map