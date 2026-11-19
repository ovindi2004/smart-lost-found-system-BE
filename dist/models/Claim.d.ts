import mongoose, { Document } from "mongoose";
export interface IClaim extends Document {
    itemId: mongoose.Types.ObjectId;
    claimantId: mongoose.Types.ObjectId;
    ownerId: mongoose.Types.ObjectId;
    proofDescription: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
}
declare const Claim: mongoose.Model<IClaim, {}, {}, {}, Document<unknown, {}, IClaim, {}, mongoose.DefaultSchemaOptions> & IClaim & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IClaim & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}>;
export default Claim;
//# sourceMappingURL=Claim.d.ts.map