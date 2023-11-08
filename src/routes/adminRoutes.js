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
  profilePicUpload,
} from "../controllers/admin/auth.js";
import {
  isAdmin,
  isManager,
  tokenValidate,
} from "../middlewares/authMiddleware.js";
import {
  addStaffController,
  docsVerificationController,
  passwordCreateController,
  removeStaffController,
  resendPasswordEmailController,
  staffListController,
  verificationDocsUploadController,
} from "../controllers/admin/staff.js";
import formidableMiddleware from "express-formidable";
const router = express.Router();
// LOGIN || POST
router.post("/login", loginController);

// LOGIN VERIFY || POST
router.post("/login-verify", verifyLoginController);

// FORGOT PASSWORD || POST
router.post("/forgot-password", fogotPasswordController);

// FORGOT PASSWORD VERIFY || POST
router.put("/reset-password", resetPasswordController);

// PROFILE || GET
router.get("/profile", tokenValidate, profileContoller);

// UPDATE PROFILE || PUT
router.put("/update-profile", tokenValidate, updateProfileController);
// PROFILE PIC UPLOAD || PUT
router.put(
  "/profile-pic-upload",
  tokenValidate,
  formidableMiddleware(),
  profilePicUpload
);
// UPDATE PASSWORD || PUT
router.put("/update-password", tokenValidate, updatePasswordController);

// STAFF LIST || GET
router.get("/staff-list", tokenValidate, isAdmin, staffListController);
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
router.put("/create-password", passwordCreateController);

//VERIFICATION DOCUMENTS UPLOAD || PUT
router.post(
  "/upload-verification-docs",
  tokenValidate,
  formidableMiddleware(),
  verificationDocsUploadController
);

//DOCS VERIFICATION || POST
router.put(
  "/docs-verification",
  tokenValidate,
  isAdmin,
  docsVerificationController
);
export default router;
