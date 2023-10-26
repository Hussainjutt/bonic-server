import express from "express";
import {
  fogotPasswordController,
  loginController,
  verifyLoginController,
  resetPasswordController,
  profileContoller,
} from "../controllers/admin/auth.js";
import { tokenValidate } from "../middlewares/authMiddleware.js";

const router = express.Router();

//LOGIN || POST
router.post("/login", loginController);

//LOGIN VERIFY || POST
router.post("/login-verify", verifyLoginController);

//FORGOT PASSWORD || POST
router.post("/forgot-password", fogotPasswordController);

//FORGOT PASSWORD VERIFY || POST
router.post("/reset-password", resetPasswordController);

//Profile || GET
router.get("/profile", tokenValidate, profileContoller);

export default router;
