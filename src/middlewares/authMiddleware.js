import JWT from "jsonwebtoken";
import adminModal from "../models/adminModal.js";
import { appErrorResponse, sendErrorResponse } from "../utils/response.js";

//Check Token
export const tokenValidate = async (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      return sendErrorResponse(res, 401, "Invalid token");
    }
    const [userId, token] = authorizationHeader?.split("+");
    if (!userId || !token) {
      return sendErrorResponse(res, 401, "Invalid token");
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
      return sendErrorResponse(res, 401, "Invalid token");
    }
    const expired = decode.exp && decode.exp <= Math.floor(Date.now() / 1000);
    if (expired) {
      return sendErrorResponse(res, 401, "Token expired");
    }
    if (!user.is_active) {
      return sendErrorResponse(
        res,
        403,
        "Your account is blocked by the admin for some reason try again later"
      );
    }
    req.user = {
      id: userId,
      token: token,
    };
    next();
  } catch (error) {
    appErrorResponse(res, error);
  }
};

//Admin validate
export const isAdmin = async (req, res, next) => {
  try {
    const user = await adminModal.findOne({ _id: req.user.id });
    if (user && (user.role === "super_admin" || user.role === "admin")) {
      next();
    } else {
      return sendErrorResponse(res, 401, "Unauthorized access");
    }
  } catch (error) {
    appErrorResponse(res, error);
  }
};

//Manager validate
export const isManager = async (req, res, next) => {
  try {
    const user = await adminModal.findOne({ _id: req.user.id });
    if (!user || user.role !== "manager") {
      return sendErrorResponse(res, 401, "Unauthorized access");
    }
    next();
  } catch (error) {
    appErrorResponse(res, error);
  }
};
