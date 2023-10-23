import express from "express";
import { isAdmin, tokenValidate } from "../middlewares/authMiddleware.js";
import {
  addCategory,
  deleteCategoryById,
  getCategories,
  getCategoryById,
  updateCategoryById,
} from "../controllers/categoryController.js";
import formidableMiddleware from "express-formidable";
const router = express.Router();

//Get All Categories || Get
router.get("/categories", tokenValidate, isAdmin, getCategories);
//Add Category || Post
router.post(
  "/add-category",
  tokenValidate,
  isAdmin,
  formidableMiddleware(),
  addCategory
);
//Update Category || Put
router.put(
  "/update-category/:id",
  tokenValidate,
  isAdmin,
  formidableMiddleware(),
  updateCategoryById
);
//Get Category ||Get
router.get("/get-category/:id", tokenValidate, isAdmin, getCategoryById);
//Delete Category || Delete
router.delete(
  "/delete-category/:id",
  tokenValidate,
  isAdmin,
  deleteCategoryById
);
export default router;
