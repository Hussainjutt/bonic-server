import express from "express";
import { isAdmin, tokenValidate } from "../middlewares/authMiddleware.js";
import { getUsers, updateUser } from "../controllers/usersController.js";

const router = express.Router();

//Get Users || Get
router.get("/users", tokenValidate, isAdmin, getUsers);

//Update User || Put
router.put("/updateUser/:id", tokenValidate, isAdmin, updateUser);

export default router;
