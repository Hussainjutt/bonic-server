import mongoose from "mongoose";

const variantDetailSchema = new mongoose.Schema({
  title: String,
  size: String,
  qty: Number,
  checked: Boolean,
});
const variantSchema = new mongoose.Schema({
  img: { type: String, required: true },
  variantName: { type: String, required: true },
  details: [variantDetailSchema],
});
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: String, require: true },
    discount: { type: String, require: true },
    category: {
      type: mongoose.ObjectId,
      ref: "Category",
      required: true,
    },
    description: String,
    discounts: {
      type: String,
      require: true,
    },
    variants: [variantSchema],
  },
  { timestamps: true }
);
export default mongoose.model("Products", productSchema);
