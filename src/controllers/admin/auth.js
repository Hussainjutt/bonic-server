import { generatePin } from "../../helpers/formatter.js";
import adminModal from "../../models/adminModal.js";
import { camparePassword, hashPassword } from "../../utils/bcrypt.js";
import { sendPinConfirmation } from "../../utils/email.js";
import { isEmpty } from "../../utils/fields.js";
import { JwtSign } from "../../utils/jwtToken.js";
import {
  appErrorResponse,
  missingFeilds,
  sendErrorResponse,
  sendSuccessResponse,
} from "../../utils/response.js";
import Jwt from "jsonwebtoken";
export const loginController = async (req, res) => {
  try {
    const { email, password, remember_me } = req.body;
    if (isEmpty([email, password])) {
      return missingFeilds(res);
    }
    const user = await adminModal.findOne({ email });
    const check = await camparePassword(password, user?.password);
    if (!user || !check) {
      return sendErrorResponse(res, 400, "Incorrect email or password");
    }
    const token = Jwt.sign({ email: email }, process.env.JWT_SECRET, {
      expiresIn: "10m",
    });
    const pin = generatePin(user?.confirmation_pin);
    await sendPinConfirmation(email, pin);
    user.confirmation_pin = pin;
    user.remember_me = remember_me ? true : false;
    await user.save();
    sendSuccessResponse(
      res,
      200,
      { token: token },
      "Please Check your email address for your PIN"
    );
  } catch (error) {
    appErrorResponse(res, error);
  }
};

export const verifyLoginController = async (req, res) => {
  try {
    const { token, pin } = req?.body;
    if (isEmpty([token, pin])) {
      return missingFeilds(res);
    }
    const decoded = Jwt.decode(token);
    if (!decoded?.email) {
      return sendErrorResponse(res, 498, "Invalid token");
    }
    const user = await adminModal.findOne({ email: decoded?.email });
    const expired = decoded.exp && decoded.exp <= Math.floor(Date.now() / 1000);
    if (!user) {
      return sendErrorResponse(res, 498, "Invalid token");
    }
    if (expired) {
      return sendErrorResponse(res, 401, "Token expired");
    }
    if (pin !== user?.confirmation_pin) {
      return sendErrorResponse(res, 400, "Invalid Pin");
    }
    const newtoken = await JwtSign(user.email, user.remember_me);
    user.confirmation_pin = null;
    user.token = newtoken;
    user.save();
    const data = {
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      profile_pic: user.profile_pic,
      token: `${user._id}+${newtoken}`,
    };
    sendSuccessResponse(res, 200, data, "Login successfully");
  } catch (error) {
    appErrorResponse(res, error);
  }
};

export const fogotPasswordController = async (req, res) => {
  try {
    const { email } = req.body;
    if (isEmpty([email])) {
      return missingFeilds(res);
    }
    const user = await adminModal.findOne({ email });
    if (!user) {
      sendErrorResponse(res, 400, "Invalid email address");
    }
    const token = Jwt.sign({ _id: user?._id }, process.env.JWT_SECRET, {
      expiresIn: "10m",
    });
    const pin = generatePin(user?.confirmation_pin);
    await sendPinConfirmation(email, pin);
    user.confirmation_pin = pin;
    await user.save();
    sendSuccessResponse(
      res,
      200,
      { token },
      "Please check your email address for the pin"
    );
  } catch (error) {
    appErrorResponse(res, error);
  }
};

export const resetPasswordController = async (req, res) => {
  try {
    const { token, pin, password } = req.body;
    if (isEmpty([pin, password])) {
      return missingFeilds(res);
    }
    const decoded = Jwt.decode(token);
    if (!decoded?._id) {
      return sendErrorResponse(res, 498, "Invalid token");
    }
    const user = await adminModal.findOne({ _id: decoded?._id });
    const expired = decoded.exp && decoded.exp <= Math.floor(Date.now() / 1000);
    if (!user) {
      return sendErrorResponse(res, 498, "Invalid token");
    }
    if (expired) {
      return sendErrorResponse(res, 401, "Token expired");
    }
    if (pin !== user?.confirmation_pin) {
      return sendErrorResponse(res, 400, "Invalid Pin");
    }
    const check = await camparePassword(password, user?.password);
    if (check) {
      return sendErrorResponse(
        res,
        400,
        "You have used that password before plz enter different one"
      );
    }
    user.password = await hashPassword(password);
    user.confirmation_pin = null;
    await user.save();
    sendSuccessResponse(res, 200, {}, "Password reset successfully");
  } catch (error) {
    appErrorResponse(res, error);
  }
};

export const profileContoller = async (req, res) => {
  try {
    const { id } = req.body;
    if (isEmpty([id])) {
      return missingFeilds(res);
    }
    const user = await adminModal.findOne({ _id: id });
    if (!user) {
      return sendErrorResponse(res, 400, "User not found");
    }
    const data = {
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      profile_pic: user.profile_pic,
      token: `${user._id}.${user.token}`,
    };
    sendSuccessResponse(
      res,
      200,
      {
        ...data,
      },
      "Profile Fetched succussfully"
    );
  } catch (error) {
    appErrorResponse(res, error);
  }
};
