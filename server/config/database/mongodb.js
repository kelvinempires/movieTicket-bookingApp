import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const connectMongoDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined in environment variables");
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database connected successfully");
    return mongoose.connection;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

export default connectMongoDB;
