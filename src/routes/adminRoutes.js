import express from "express";
import {
  fogotPasswordController,
  loginController,
  verifyLoginController,
  resetPasswordController,
} from "../controllers/admin/auth.js";

const router = express.Router();

//LOGIN || POST
router.post("/login", loginController);

//LOGIN VERIFY || POST
router.post("/login-verify", verifyLoginController);

//FORGOT PASSWORD || POST
router.post("/forgot-password", fogotPasswordController);

//FORGOT PASSWORD VERIFY || POST
router.post("/reset-password", resetPasswordController);

export default router;
