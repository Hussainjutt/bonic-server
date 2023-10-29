// adminRoutes.js
import express from "express";

// Import necessary functions/controllers
import {
  fogotPasswordController,
  loginController,
  verifyLoginController,
  resetPasswordController,
  profileContoller,
  updateProfileController,
  updatePasswordController,
} from "../controllers/admin/auth.js";
import { isAdmin, tokenValidate } from "../middlewares/authMiddleware.js";
import {
  addStaffController,
  passwordCreateController,
  removeStaffController,
  resendPasswordEmailController,
} from "../controllers/admin/staff.js";

const router = express.Router();

// LOGIN || POST
router.post("/login", loginController);

// LOGIN VERIFY || POST
router.post("/login-verify", verifyLoginController);

// FORGOT PASSWORD || POST
router.post("/forgot-password", fogotPasswordController);

// FORGOT PASSWORD VERIFY || POST
router.post("/reset-password", resetPasswordController);

// PROFILE || GET
router.get("/profile", tokenValidate, profileContoller);

// UPDATE PROFILE || PUT
router.put("/update-profile", tokenValidate, updateProfileController);

// UPDATE PASSWORD || PUT
router.put("/update-password", tokenValidate, updatePasswordController);

// Add-Staff || POST
router.post("/add-staff", tokenValidate, isAdmin, addStaffController);

//REMOVE STAFF || DELETE
router.delete("/remove-staff", tokenValidate, isAdmin, removeStaffController);

//RESEND PASSWORD EMAIL
router.post(
  "/resend-password-email",
  tokenValidate,
  isAdmin,
  resendPasswordEmailController
);

//PASSWORD CREATION || POST
router.post("/create-password", passwordCreateController);

export default router;
