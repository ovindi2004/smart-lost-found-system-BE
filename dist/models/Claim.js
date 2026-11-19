import mongoose, { Schema } from "mongoose";
const claimSchema = new Schema({
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
}, {
    timestamps: true,
});
const Claim = mongoose.model("Claim", claimSchema);
export default Claim;
//# sourceMappingURL=Claim.js.map