import {
  checkRequiredField,
  hashPassword,
  camparePassword,
  sendResetEmail,
  generateToken,
  verifyToken,
  checkRequiredFields,
} from "../helpers/authHelper.js";
import { removeImage, uploadImage } from "../helpers/firbaseHelper.js";
import userModel from "../models/userModel.js";
import JWT from "jsonwebtoken";

//Register Controller
export const registerController = async (req, res) => {
  try {
    const { first_name, last_name, email, password, phone, address } = req.body;
    checkRequiredField("first_name", first_name);
    checkRequiredField("last_name", last_name);
    checkRequiredField("email", email);
    checkRequiredField("password", password);
    checkRequiredField("phone", phone);
    checkRequiredField("address", address);
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      throw new Error("Email already exist login or use another email");
    }
    const hashedPassword = await hashPassword(password);
    const user = new userModel({
      first_name,
      last_name,
      email,
      phone,
      address,
      password: hashedPassword,
      role: "user",
      profile_pic: "",
      verified: true,
    });
    await user.save();
    res.status(201).send({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      success: false,
      error,
    });
  }
};
//Login Controller
export const loginController = async (req, res) => {
  try {
    const { email, password, remember_me } = req.body;
    checkRequiredField("email", email);
    checkRequiredField("password", password);
    const user = await userModel.findOne({ email });
    const match = await camparePassword(password, user?.password);
    if (!user) {
      throw new Error("Email does not exist");
    }
    if (!match) {
      throw new Error("Invalid password");
    }
    if (user?.verified === false) {
      throw new Error("You blocked by the admin try again later");
    }
    const token = JWT.sign({ _id: user?._id }, process.env.JWT_SECRET, {
      expiresIn: remember_me ? "2d" : "1d",
    });
    res.status(201).send({
      message: "Login successfully",
      success: true,
      user: {
        id: user?._id,
        first_name: user?.first_name,
        last_name: user?.last_name,
        email: user?.email,
        phone: user?.phone,
        address: user?.address,
        role: user?.role,
        profile_pic: user?.profile_pic,
      },
      token: token,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      success: false,
      error,
    });
  }
};
//Forgot Password Controller
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    checkRequiredField("email", email);
    const user = await userModel.findOne({ email });
    if (!user) {
      throw new Error("Email does not exist");
    }
    const resetToken = generateToken(email);
    const link = `http://localhost:3000/resetPassword/${resetToken}`;
    await sendResetEmail(email, link);
    res.status(201).send({
      success: true,
      message: "Password reset link hase been sent to your givin email address",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
};

//Reset Password Controller
export const resetPassword = async (req, res) => {
  try {
    const token = req.params.token;
    const { password } = req.body;
    const user = await userModel.findOne({ email: verifyToken(token) });
    if (!user) {
      throw new Error("Invalid token");
    }
    const hashedPassword = await hashPassword(password);
    user.password = hashedPassword;
    user.save();
    res.status(201).send({
      message: "Password reset successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message == "jwt expired" ? "Token expire" : error.message,
      success: false,
    });
  }
};

//Get user profile
export const getProfileByID = async (req, res) => {
  try {
    const id = req.params.id;
    checkRequiredField("id", id);
    const user = await userModel.findOne({ _id: id });
    if (!user) {
      throw new Error("User does not exists");
    }
    res.status(201).send({
      message: "Fecthed successfully",
      success: true,
      user: {
        _id: user?._id,
        first_name: user?.first_name,
        last_name: user?.last_name,
        email: user?.email,
        phone: user?.phone,
        role: user?.role,
        profile_pic: user?.profile_pic,
        address: user?.address,
      },
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }
};

//Update profile
export const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, phone, address } = req.fields;
    let image;
    if (req.files.profile_pic) {
      image = req.files.profile_pic;
    } else {
      image = req.fields.profile_pic;
    }
    checkRequiredFields([
      id,
      first_name,
      last_name,
      email,
      phone,
      address,
      image,
    ]);
    const profile = await userModel.findOne({ _id: id });
    if (!profile) {
      throw new Error("profile not found");
    }
    if (typeof image !== "string") {
      if (profile?.profile_pic) {
        await removeImage(profile?.profile_pic);
      }
      image = await uploadImage(image?.path, "profile_pics");
    }
    profile.first_name = first_name;
    profile.last_name = last_name;
    profile.email = email;
    profile.phone = phone;
    profile.address = address;
    profile.profile_pic = image;
    await profile.save();
    res.status(201).send({
      message: "Profile updated succeessfully",
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,

      success: false,
    });
  }
};

//Update Password
export const updatePassword = async (req, res) => {
  try {
    const id = req.params.id;
    const { currentPassword, password } = req.body;
    checkRequiredFields([id, currentPassword, password]);
    if (currentPassword === password) {
      throw new Error("password and current password cannot be same");
    }
    const user = await userModel.findOne({ _id: id });
    if (!user) {
      throw new Error("Invalid Id");
    }
    const match = await camparePassword(currentPassword, user?.password);
    if (!match) {
      throw new Error("Invalid current password");
    }
    user.password = await hashPassword(password);
    await user?.save();
    res.status(201).send({
      message: "Password changed successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }
};
