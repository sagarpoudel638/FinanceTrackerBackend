import mongoose from "mongoose";
import { config } from "./config.js";

export const connectMongoDB = async () => {
  const conn = await mongoose.connect(config.mongodb.url);

  if (conn) {
    console.log(config.mongodb.url);
    console.log("Database Connected");
  } else {
    console.log("error connecting to database");
  }
};