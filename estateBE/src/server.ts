import dotenv from "dotenv";
import mongoose from "mongoose";

import app from "./app";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL as string);

    console.log("MongoDB Connected ✅");

    app.listen(PORT, () => {
      console.log(
        `Server running on port ${PORT}`
      );
    });
  } catch (error) {
    console.log(error);
  }
};

startServer();