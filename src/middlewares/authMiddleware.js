import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";

//Check Token
export const tokenValidate = async (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;
    const [userId, token] = authorizationHeader.split("+");
    if (userId) {
      const user = await userModel.findOne({ _id: userId });
      if (!user) {
        throw new Error("Using Invalid Id");
      } else if (user?.verified === false) {
        throw new Error("You blocked by the admin try again later");
      }
    }
    const decode = JWT.verify(token, process.env.JWT_SECRET);
    req.user = decode;
    next();
  } catch (error) {
    res.status(401).send({
      message:
        error.message == "jwt expired" ? "Token expired" : error?.message,
      success: false,
    });
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
