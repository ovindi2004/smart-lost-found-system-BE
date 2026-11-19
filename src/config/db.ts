import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

interface CachedConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: CachedConnection | undefined;
}

// Global cached connection for serverless environments (Vercel)
const cached: CachedConnection = globalThis.mongooseCache || {
  conn: null,
  promise: null,
};

if (!globalThis.mongooseCache) {
  globalThis.mongooseCache = cached;
}

export const connectDB = async (): Promise<typeof mongoose> => {
  // If already connected, return the existing active connection
  if (mongoose.connection.readyState === 1 && cached.conn) {
    return cached.conn;
  }

  // If a connection is currently being established, wait for it
  if (cached.promise && mongoose.connection.readyState === 2) {
    return cached.promise;
  }

  // Support multiple common environment variable names
  const rawURI =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    process.env.MONGODB_URL ||
    process.env.DATABASE_URL;

  const mongoURI = rawURI ? rawURI.trim() : "";

  if (!mongoURI) {
    if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
      console.warn("MONGODB_URI not found in env, falling back to localhost.");
    } else {
      throw new Error(
        "CRITICAL: MONGODB_URI (or MONGO_URI) environment variable is missing in Vercel project settings."
      );
    }
  }

  const uriToUse = mongoURI || "mongodb://127.0.0.1:27017/smart_lost_found";

  const options: mongoose.ConnectOptions = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    bufferCommands: false, // Fail fast if connection fails rather than hanging 10s
  };

  try {
    cached.promise = mongoose.connect(uriToUse, options);
    const conn = await cached.promise;
    cached.conn = conn;
    console.log(`MongoDB connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    console.error("MongoDB connection failed:", error);
    throw error;
  }
};

export default connectDB;
