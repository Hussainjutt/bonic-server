import JWT from "jsonwebtoken";
import adminModal from "../models/adminModal.js";
import { appErrorResponse, sendErrorResponse } from "../utils/response.js";

//Check Token
export const tokenValidate = async (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;
    const [userId, token] = authorizationHeader.split("+");
    if (!userId || !token) {
      return sendErrorResponse(res, 498, "Invalid token");
    }
    const user = await adminModal.findOne({ _id: userId });
    if (!user) {
      return sendErrorResponse(res, 401, "Invalid token");
    }
    const decode = JWT.decode(token, process.env.JWT_SECRET);
    if (
      !decode?.email ||
      !decode.exp ||
      !decode.exp ||
      user.email !== decode?.email
    ) {
      return sendErrorResponse(res, 498, "Invalid token");
    }
    const expired = decode.exp && decode.exp <= Math.floor(Date.now() / 1000);
    if (expired) {
      return sendErrorResponse(res, 401, "Token expired");
    }
    next();
  } catch (error) {
    appErrorResponse(res, error);
  }
};

//Admin validate
export const isAdmin = async (req, res, next) => {
  try {
    const user = await userModel.findOne({ _id: req.user._id });
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized access");
    }
    next();
  } catch (error) {
    res.status(401).send({
      message: error.message,
      success: false,
    });
  }
};
