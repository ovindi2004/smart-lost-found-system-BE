import mongoose from "mongoose";
interface CachedConnection {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}
declare global {
    var mongooseCache: CachedConnection | undefined;
}
export declare const connectDB: () => Promise<typeof mongoose>;
export default connectDB;
//# sourceMappingURL=db.d.ts.map