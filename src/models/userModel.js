import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      require: true,
      trim: true,
    },
    last_name: {
      type: String,
      require: true,
      trim: true,
    },
    profile_pic: {
      type: String,
    },
    email: {
      type: String,
      require: true,
      unique: true,
    },
    password: {
      type: String,
      require: true,
    },
    phone: {
      type: String,
      require: true,
    },
    address: {
      type: String,
      require: true,
    },
    role: {
      type: String,
      require: true,
    },
    profile_pic: {
      type: String,
    },
    verified: {
      type: Boolean,
      require: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("users", userSchema);
