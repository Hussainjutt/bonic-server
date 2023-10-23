import express from "express";
import { testController } from "../controllers/usersController.js";
const router = express.Router();

//Get Products || Get
router.get("/test", testController);

export default router;
