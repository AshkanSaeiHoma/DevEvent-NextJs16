import mongoose, { Mongoose } from "mongoose";

/**
 * Global connection cache object to avoid multiple connections during development
 * when Next.js hot-reloads the code
 */
interface MongooseCache {
  connection: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

declare global {
  // Prevents TypeScript errors in development mode with hot-reload
  var mongooseCache: MongooseCache | undefined;
}

// Initialize cache on global object
const cached: MongooseCache = global.mongooseCache || {
  connection: null,
  promise: null,
};

/**
 * Connects to MongoDB using Mongoose
 * Implements connection caching to prevent multiple connections during development
 *
 * @returns Promise<Mongoose> - Returns a connected Mongoose instance
 * @throws Error if MONGODB_URI environment variable is not set
 */
async function connectDB(): Promise<Mongoose> {
  // Return existing connection if already connected
  if (cached.connection) {
    return cached.connection;
  }

  // Return pending promise if connection is in progress
  if (cached.promise) {
    return cached.promise;
  }

  // Get MongoDB URI from environment variables
  const mongodbUri = process.env.MONGODB_URI;

  if (!mongodbUri) {
    console.error("❌ MONGODB_URI is not defined in .env.local");
    throw new Error(
      "MONGODB_URI environment variable is not set. Please add it to .env.local file.",
    );
  }

  console.log("✅ Connecting to MongoDB...");
  console.log(`📍 MongoDB URI: ${mongodbUri.substring(0, 50)}...`); // Log first 50 chars for debugging

  // Create new connection promise
  cached.promise = mongoose
    .connect(mongodbUri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000, // 10 second timeout
      socketTimeoutMS: 45000, // 45 second socket timeout
      maxPoolSize: 10,
    })
    .then((mongooseInstance) => {
      console.log("✅ MongoDB connected successfully!");
      cached.connection = mongooseInstance;
      return mongooseInstance;
    })
    .catch((error) => {
      console.error("❌ MongoDB connection failed:", error.message);
      throw error;
    });

  try {
    await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  // Update global cache
  global.mongooseCache = cached;

  return cached.connection!;
}

export default connectDB;
