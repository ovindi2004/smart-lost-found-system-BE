import mongoose, { Document } from "mongoose";
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
declare const Item: mongoose.Model<IItem, {}, {}, {}, Document<unknown, {}, IItem, {}, mongoose.DefaultSchemaOptions> & IItem & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IItem & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}>;
export default Item;
//# sourceMappingURL=Item.d.ts.map