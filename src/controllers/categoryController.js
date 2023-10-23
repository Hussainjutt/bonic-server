import slugify from "slugify";
import { checkRequiredField } from "../helpers/authHelper.js";
import categoryModel from "../models/categoryModel.js";
import fs from "fs";
import { removeImage, uploadImage } from "../helpers/firbaseHelper.js";

export const addCategory = async (req, res) => {
  try {
    const { name } = req.fields;
    const { image } = req.files;
    checkRequiredField("Category name", name);
    checkRequiredField("Category image", image);
    const check = await categoryModel.findOne({ name });
    if (check) {
      throw new Error("Category already exist");
    }
    const imageUrl = await uploadImage(image.path, "categories");
    const category = new categoryModel({
      name: name,
      slug: slugify(name),
      image: imageUrl,
    });
    await category.save();
    res.status(201).send({
      message: "Category Added successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
};

export const getCategories = async (req, res) => {
  try {
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;
    const skip = (page - 1) * limit;
    const searchQuery = req.query.search || "";
    const query = searchQuery
      ? { name: { $regex: searchQuery, $options: "i" } }
      : {};
    const [categories, totalItems] = await Promise.all([
      categoryModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      categoryModel.countDocuments(query),
    ]);
    res.status(200).send({
      categories: categories,
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

export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    checkRequiredField("id", id);
    const category = await categoryModel.findOne({ _id: id });
    res.status(201).send({
      message: "Category fetched successfully",
      success: true,
      category: category,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
      success: false,
    });
  }
};
export const updateCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.fields;
    let image;
    if (req.files.image) {
      image = req.files.image;
    } else {
      image = req.fields.image;
    }
    checkRequiredField("id", id);
    checkRequiredField("name", name);
    checkRequiredField("image", image);
    const updatedCategory = await categoryModel.findOne({ _id: id });
    if (!updatedCategory) {
      throw new Error("Category not found");
    }
    if (updatedCategory.name !== name) {
      const checkDuplicate = await categoryModel.findOne({ name });
      if (checkDuplicate) {
        throw new Error("Category name already exists");
      }
    }
    if (typeof image !== "string") {
      await removeImage(updatedCategory?.image);
      image = await uploadImage(image?.path, "categories");
    }
    updatedCategory.name = name;
    updatedCategory.slug = slugify(name);
    updatedCategory.image = image;
    await updatedCategory.save();
    res.status(200).send({
      success: true,
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
};

export const deleteCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    checkRequiredField("id", id);
    const deletedCategory = await categoryModel.findOneAndDelete({ _id: id });
    removeImage(deletedCategory.image);
    if (!deletedCategory) {
      throw new Error("Category not found");
    }
    res.status(200).send({
      success: true,
      message: "Category deleted successfully",
      category: deletedCategory,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
};
