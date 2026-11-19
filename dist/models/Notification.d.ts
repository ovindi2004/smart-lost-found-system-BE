import mongoose, { Document } from "mongoose";
export interface INotification extends Document {
    userId: mongoose.Types.ObjectId;
    message: string;
    type: "CLAIM_REQUEST" | "CLAIM_APPROVED" | "CLAIM_REJECTED";
    relatedItemId?: mongoose.Types.ObjectId;
    isRead: boolean;
}
declare const _default: mongoose.Model<INotification, {}, {}, {}, Document<unknown, {}, INotification, {}, mongoose.DefaultSchemaOptions> & INotification & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, INotification & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}>;
export default _default;
//# sourceMappingURL=Notification.d.ts.map