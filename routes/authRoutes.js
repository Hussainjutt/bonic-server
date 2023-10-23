import express from "express";
import {
  registerController,
  loginController,
  // test,
  forgotPassword,
  resetPassword,
  getProfileByID,
  updateProfile,
  updatePassword,
} from "../controllers/authController.js";
import { tokenValidate } from "../middlewares/authMiddleware.js";
import formidableMiddleware from "express-formidable";

const router = express.Router();

//Register || POST
router.post("/register", registerController);

//Register || POST
router.post("/login", loginController);

//Forgot Password || Post
router.post("/forgotpassword", forgotPassword);

//Reset Password || Post
router.post("/resetPassword/:token", resetPassword);

//Get Profile || Get
router.get("/profile/:id", tokenValidate, getProfileByID);

//Update Profile || Put
router.put(
  "/updateProfile/:id",
  tokenValidate,
  formidableMiddleware(),
  updateProfile
);

//Update Password || Put
router.put("/updatePassword/:id", tokenValidate, updatePassword);

export default router;
