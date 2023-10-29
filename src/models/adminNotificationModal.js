import mongoose from "mongoose";

const notificationModal = new mongoose.Schema(
  {
    receiver: {
      type: String,
      require: true,
    },
    message: {
      type: String,
      require: true,
    },
    url: {
      type: String,
      require: true,
    },
    unreaded: {
      type: Boolean,
      require: true,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("admin-notifications", notificationModal);
