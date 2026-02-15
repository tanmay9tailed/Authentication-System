import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const MONGO_URI = process.env.MONGOURI;
    const conn = await mongoose.connect(MONGO_URI);

    console.log("Connected to DB", conn.connection.host);
  } catch (error) {
    console.error("Error in Connecting DB -> ", error.message);
    process.exit(1);
  }
};

export default connectDB;
