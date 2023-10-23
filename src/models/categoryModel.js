import mongoose from "mongoose";

const productCategory = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    image: {
      type: String,
      require: true,
    },
    slug: {
      type: String,
      require: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("categories", productCategory);
