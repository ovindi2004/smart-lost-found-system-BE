import mongoose, { Document } from "mongoose";
export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: "USER" | "ADMIN";
}
declare const User: mongoose.Model<IUser, {}, {}, {}, Document<unknown, {}, IUser, {}, mongoose.DefaultSchemaOptions> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}>;
export default User;
//# sourceMappingURL=User.d.ts.map