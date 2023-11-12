import { removeImage, uploadImage } from "../../helpers/firbaseHelper.ts";
import { generatePin } from "../../helpers/formatter.ts";
import adminModal from "../../models/adminModal.ts";
import { Request, Response } from "express";
import { comparePassword, hashPassword } from "../../utils/bcrypt.ts";
import { sendPinConfirmation } from "../../utils/email.ts";
import { isEmpty } from "../../utils/fields.ts";
import {
  appErrorResponse,
  missingFeilds,
  sendErrorResponse,
  sendSuccessResponse,
} from "../../utils/response.ts";
import Jwt from "jsonwebtoken";

export const loginController = async (req: Request, res: Response) => {
  try {
    const { email, password, remember_me } = req.body;
    if (isEmpty([email, password])) {
      return missingFeilds(res);
    }
    const user = await adminModal.findOne({ email });
    const check = await comparePassword(password, user?.password || "");
    if (!user || !check) {
      return sendErrorResponse(res, 400, "Incorrect email or password");
    }
    const token = Jwt.sign({ id: user._id }, (process as any).env.JWT_SECRET, {
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

export const verifyLoginController = async (req: Request, res: Response) => {
  try {
    const { token, pin } = req?.body;
    if (isEmpty([token, pin])) {
      return missingFeilds(res);
    }
    const decoded: any = Jwt.decode(token);
    if (!decoded?.id) {
      return sendErrorResponse(res, 401, "Invalid token");
    }
    const user = await adminModal.findOne({ _id: decoded?.id });
    const expired = decoded.exp && decoded.exp <= Math.floor(Date.now() / 1000);
    if (!user) {
      return sendErrorResponse(res, 401, "Invalid token");
    }
    if (expired) {
      return sendErrorResponse(res, 401, "Token expired");
    }
    if (pin !== user?.confirmation_pin) {
      return sendErrorResponse(res, 400, "Invalid Pin");
    }
    const newtoken = await Jwt.sign(
      { id: user?._id },
      (process as any).env.JWT_SECRET,
      {
        expiresIn: user?.remember_me ? "2d" : "1d",
      }
    );
    user.confirmation_pin = "";
    user.token = `${newtoken}.${user?.role}.${user.verified}`;
    await user.save();
    const data = {
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      profile_pic: user.profile_pic,
      verified: user.verified,
      token: user.token,
      phone: user.phone,
      address: user.address,
      cnic_front: user?.cnic_front ?? "",
      cnic_back: user?.cnic_back ?? "",
    };
    sendSuccessResponse(res, 200, data, "Login successfully");
  } catch (error) {
    appErrorResponse(res, error);
  }
};

export const fogotPasswordController = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (isEmpty([email])) {
      return missingFeilds(res);
    }
    const user = await adminModal.findOne({ email });
    if (!user) {
      return sendErrorResponse(res, 400, "Invalid email address");
    }
    if (!user.password) {
      return sendErrorResponse(res, 400, "Please first create your password");
    }
    const token = Jwt.sign(
      { _id: user?._id },
      (process as any).env.JWT_SECRET,
      {
        expiresIn: "10m",
      }
    );
    const pin = generatePin(user?.confirmation_pin).toString();
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

export const resetPasswordController = async (req: Request, res: Response) => {
  try {
    const { token, pin, password } = req.body;
    if (isEmpty([pin, password])) {
      return missingFeilds(res);
    }
    const decoded: any = Jwt.decode(token);
    if (!decoded?._id) {
      return sendErrorResponse(res, 401, "Invalid token");
    }
    const user = await adminModal.findOne({ _id: decoded?._id });
    const expired = decoded.exp && decoded.exp <= Math.floor(Date.now() / 1000);
    if (!user) {
      return sendErrorResponse(res, 401, "Invalid token");
    }
    if (expired) {
      return sendErrorResponse(res, 401, "Token expired");
    }
    if (pin !== user?.confirmation_pin) {
      return sendErrorResponse(res, 400, "Invalid Pin");
    }
    const check = await comparePassword(password, user?.password);
    if (check) {
      return sendErrorResponse(
        res,
        400,
        "You have used that password before plz enter different one"
      );
    }
    user.password = await hashPassword(password);
    user.confirmation_pin = "";
    await user.save();
    sendSuccessResponse(res, 200, {}, "Password reset successfully");
  } catch (error) {
    appErrorResponse(res, error);
  }
};

export const profileContoller = async (req: Request, res: Response) => {
  try {
    const { id } = (req as any).user;
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
      verified: user.verified,
      token: user.token,
      phone: user.phone,
      address: user.address,
      cnic_front: user?.cnic_front ?? "",
      cnic_back: user?.cnic_back ?? "",
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

export const updateProfileController = async (req: Request, res: Response) => {
  try {
    const { first_name, last_name, phone, address } = req.body;
    const { id } = (req as any).user;
    if (isEmpty([id, first_name, last_name])) {
      return missingFeilds(res);
    }
    const user = await adminModal.findOne({ _id: id });
    if (!user) {
      return sendErrorResponse(res, 400, "User not found");
    }
    user.first_name = first_name;
    user.last_name = last_name;
    user.phone = phone;
    user.address = address;
    await user.save();
    sendSuccessResponse(
      res,
      200,
      {},
      `${first_name} your Profile is updated successfully`
    );
  } catch (error) {
    appErrorResponse(res, error);
  }
};

export const updatePasswordController = async (req: Request, res: Response) => {
  try {
    const { current_password, new_password } = req.body;
    const { id } = (req as any).user;
    if (isEmpty([current_password, new_password, id])) {
      return missingFeilds(res);
    }
    const user = await adminModal.findOne({ _id: id });
    if (!user) {
      return sendErrorResponse(res, 400, "User not found");
    }
    const check = await comparePassword(current_password, user.password);
    if (!check) {
      return sendErrorResponse(
        res,
        400,
        "Please enter the valid current password"
      );
    }
    user.password = await hashPassword(new_password);
    await user.save();
    sendSuccessResponse(
      res,
      200,
      {},
      `${user.first_name} your password changed succussfully`
    );
  } catch (error) {
    return appErrorResponse(res, error);
  }
};

export const profilePicUpload = async (req: Request, res: Response) => {
  try {
    const { id } = (req as any).user;
    const { img }: any = (req as any).files;
    if (isEmpty([img])) {
      return missingFeilds(res);
    }
    const user = await adminModal.findOne({ _id: id });
    if (!img?.path) {
      return sendErrorResponse(res, 400, "Invalid img");
    }
    if (user?.profile_pic) {
      await removeImage(user.profile_pic);
    }
    const imgUrl = await uploadImage(img?.path, "profiles");
    (user as any).profile_pic = imgUrl;
    await (user as any).save();
    sendSuccessResponse(
      res,
      200,
      {},
      `${user?.first_name} your profile pic uploaded successfully`
    );
  } catch (error) {
    appErrorResponse(res, error);
  }
};
