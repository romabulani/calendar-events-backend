import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const mongoUrl = process.env.MONGO_URL;
const dbName = process.env.DB_NAME;

export const connectToDatabase = async () => {
  try {
    await mongoose.connect(mongoUrl!, { dbName: dbName });
    console.log("Connected to Database");
  } catch (error) {
    console.error("Failed to connect to database", error);
    process.exit(1);
  }
};
