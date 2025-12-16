import mongoose from "mongoose";
import dotenv from "dotenv"
dotenv.config()

const { MONGO_URI } = process.env

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI)
    console.log("MongoDB server connected successfully")
  } catch (err) {
    console.error(`Error in connecting to MongoDB: ${err.message}`)
    process.exit(1)
  }
}

export default connectDB