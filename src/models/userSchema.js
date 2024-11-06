import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  });
  export const User = mongoose.model("user", userSchema);
  export const createUser = async (user) => {
    const newUser = new User(user);
    return await newUser.save();
  };