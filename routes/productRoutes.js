import express from "express";
import { isAdmin, tokenValidate } from "../middlewares/authMiddleware.js";
import {
  addProduct,
  getProduct,
  getProducts,
  updateProduct,
} from "../controllers/productsController.js";
import formidable from "express-formidable";
const router = express.Router();

//Get Products || Get
router.get("/products", tokenValidate, isAdmin, getProducts);
//Add Product || Post
router.post("/add-product", tokenValidate, isAdmin, formidable(), addProduct);
//Update Product || Put
router.put(
  "/update-product/:id",
  tokenValidate,
  isAdmin,
  formidable(),
  updateProduct
);
//Add Product || Get
router.get("/get-product/:id", tokenValidate, getProduct);

export default router;
