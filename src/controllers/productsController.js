import { checkRequiredField } from "../helpers/authHelper.js";
import { removeImage, uploadImage } from "../helpers/firbaseHelper.js";
import { isImageUrl } from "../helpers/formatter.js";
import categoryModel from "../models/categoryModel.js";
import productModal from "../models/productModal.js";
import { getCategoryById } from "./categoryController.js";

export const addProduct = async (req, res) => {
  try {
    const { data } = req.fields;
    let newData = JSON.parse(data);
    for (const key in req.files) {
      newData.variants[Number(key.match(/\d+/)[0])].img = await uploadImage(
        req.files[key].path,
        "products"
      );
    }
    const newProduct = new productModal({
      name: newData?.name,
      price: newData?.price,
      category: newData?.category,
      description: newData?.description,
      discount: newData?.discount,
      variants: newData?.variants,
    });
    await newProduct.save();
    res.status(200).send({
      message: "Product added successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }
};
export const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    checkRequiredField("id", id);
    const product = await productModal.findOne({ _id: id });
    res.status(200).send({
      message: "Fetched successfully",
      success: true,
      product: product,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }
};
export const getProducts = async (req, res) => {
  try {
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;
    const skip = (page - 1) * limit;
    const searchQuery = req.query.search || "";
    const query = searchQuery
      ? { name: { $regex: searchQuery, $options: "i" } }
      : {};
    const [categories, totalItems] = await Promise.all([
      productModal.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      productModal.countDocuments(query),
    ]);
    res.status(200).send({
      products: categories,
      currentPage: page,
      total: totalItems,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }
};
export const updateProduct = async (req, res) => {
  try {
    const { data } = req.fields;
    const { id } = req.params;
    let newData = JSON.parse(data);
    // Inside the loop that handles file uploads
    for (const key in req.files) {
      if (isImageUrl(req.files[key].path)) {
        newData.variants[Number(key.match(/\d+/)[0])].img = req.files[key].path;
      } else {
        try {
          const uploadedImagePath = await uploadImage(
            req.files[key].path,
            "products"
          );
          newData.variants[Number(key.match(/\d+/)[0])].img = uploadedImagePath;
        } catch (uploadError) {
          // Handle the error that occurred during image upload
          console.error("Image upload error:", uploadError);
          // Optionally, you can send an error response here.
        }
      }
    }

    const updatedProduct = await productModal.findOne({ _id: id });

    updatedProduct.name = newData?.name;
    updatedProduct.price = newData?.price;
    updatedProduct.category = newData?.category;
    updatedProduct.description = newData?.description;
    updatedProduct.discount = newData?.discount;
    updatedProduct.variants = newData?.variants;

    await updatedProduct.save();
    res.status(200).send({
      message: "Product updated successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }
};
