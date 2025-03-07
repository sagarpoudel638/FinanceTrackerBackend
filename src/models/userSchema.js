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
    isVerified:{
      type: Boolean,
      default: false,
    },
    verificationToken:{
      type:String,
      default:"",
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

  export const findUser = async (query, showPassword = false) => {
    const data = showPassword
      ? await User.findOne(query).select("+password")
      : await User.findOne(query);
  
    return data;
  };