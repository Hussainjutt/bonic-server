import mongoose from "mongoose";

const AdminModal = new mongoose.Schema(
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
      default: null,
    },
    email: {
      type: String,
      require: true,
      unique: true,
    },
    password: {
      type: String,
      require: true,
      default: "",
    },
    phone: {
      type: String,
      require: true,
      trim: true,
      default: "",
    },
    address: {
      type: String,
      require: true,
      default: "",
    },
    role: {
      type: String,
      require: true,
      default: "",
    },
    verified: {
      type: Boolean,
      require: true,
      default: false,
    },
    is_active: {
      type: Boolean,
      require: true,
      default: true,
    },
    token: {
      type: String,
      require: true,
      default: "",
    },
    confirmation_pin: {
      type: String,
      default: "",
    },
    remember_me: {
      type: Boolean,
      default: false,
    },
    cnic_front: {
      type: String,
      require: true,
      default: "",
    },
    cnic_back: {
      type: String,
      require: true,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("admin-auths", AdminModal);
