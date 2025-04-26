import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI || "";

export const connectMongo = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGO_URI, {
      dbName: "lab-2",
    });
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
};
