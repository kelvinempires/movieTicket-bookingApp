import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function testConnection() {
  try {
    console.log("Connecting to:", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);

    // Check current database name
    console.log("Connected to DB:", mongoose.connection.name);

    // Test a simple query
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log(
      "Collections in DB:",
      collections.map((c) => c.name)
    );
  } catch (error) {
    console.error("Connection failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

testConnection();
