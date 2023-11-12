// adminRoutes.ts
import * as express from "express";

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
} from "../controllers/admin/auth.ts";
import {
  isAdmin,
  isManager,
  tokenValidate,
} from "../middlewares/authMiddleware.ts";
import {
  addStaffController,
  docsVerificationController,
  passwordCreateController,
  removeStaffController,
  resendPasswordEmailController,
  staffListController,
  verificationDocsUploadController,
  staffDetailsController,
} from "../controllers/admin/staff.ts";
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

// STAFF DETAILS || GET
router.get("/staff/:id", tokenValidate, isAdmin, staffDetailsController);

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
router.put(
  "/upload-verification-docs",
  tokenValidate,
  formidableMiddleware(),
  verificationDocsUploadController
);

//DOCS VERIFICATION || POST
router.post(
  "/docs-verification",
  tokenValidate,
  isAdmin,
  docsVerificationController
);
export default router;
