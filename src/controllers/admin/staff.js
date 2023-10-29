// import { io } from "../../app.js";
import Jwt from "jsonwebtoken";
import { io } from "../../app.js";
import adminModal from "../../models/adminModal.js";
import { createPasswword } from "../../utils/email.js";
import { isEmpty } from "../../utils/fields.js";
import {
  appErrorResponse,
  missingFeilds,
  sendErrorResponse,
  sendSuccessResponse,
} from "../../utils/response.js";
import { hashPassword } from "../../utils/bcrypt.js";
import { addNotification } from "./notifications.js";

export const addStaffController = async (req, res) => {
  try {
    const { first_name, last_name, email, role } = req.body;
    const { id } = req.user;
    const admin = await adminModal.findOne({ _id: id });
    if (isEmpty([first_name, last_name, email, role])) {
      return missingFeilds(res);
    }
    const check = await adminModal.findOne({ email });
    if (check) {
      return sendErrorResponse(res, 400, "User already exits");
    }
    const token = Jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const url = `http://localhost:3000/create-password/${token}`;
    await createPasswword(email, first_name, url);
    const user = new adminModal({
      first_name,
      last_name,
      email,
      role,
      verified: false,
    });
    await user.save();
    await addNotification(
      `${admin.first_name} has added ${first_name} as ${role}`,
      "admins",
      `/staff/${user._id}`
    );
    sendSuccessResponse(
      res,
      200,
      {},
      `${first_name} added as a ${role?.toUpperCase()} succussfully`
    );
  } catch (error) {
    appErrorResponse(res, error);
  }
};

export const removeStaffController = async (req, res) => {
  try {
    const { id } = req.body;
    if (isEmpty(id)) {
      return missingFeilds(id);
    }
    const user = await adminModal.findOne({ _id: id });
    if (!user) {
      return sendErrorResponse(res, 400, "User not found");
    }
    const removed = await adminModal.findByIdAndRemove(id);
    if (removed) {
      return sendSuccessResponse(
        res,
        200,
        {},
        `${user.first_name} deleted successfully`
      );
    }
  } catch (error) {
    appErrorResponse(res, error);
  }
};
export const resendPasswordEmailController = async (req, res) => {
  try {
    const { id } = req.body;
    if (isEmpty([id])) {
      return missingFeilds(res);
    }
    const user = await adminModal.findOne({ _id: id });
    if (!user) {
      return sendErrorResponse(res, 400, "User not found");
    }
    if (user.password) {
      return sendErrorResponse(res, 400, "User already created his password");
    }
    const email = user.email;
    const token = Jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const url = `http://localhost:3000/create-password/${token}`;
    await createPasswword(email, user.first_name, url);
    sendSuccessResponse(
      res,
      200,
      {},
      `Password creation email successfully resended to ${user.first_name}`
    );
  } catch (error) {
    appErrorResponse(res, error);
  }
};

export const passwordCreateController = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (isEmpty([token, password])) {
      return missingFeilds();
    }
    const decoded = Jwt.decode(token);
    if (!decoded?.email) {
      return sendErrorResponse(res, 401, "Invalid token");
    }
    const user = await adminModal.findOne({ email: decoded?.email });
    const expired = decoded.exp && decoded.exp <= Math.floor(Date.now() / 1000);
    if (!user) {
      return sendErrorResponse(res, 401, "Invalid token");
    }
    if (expired) {
      return sendErrorResponse(res, 401, "Token expired");
    }
    user.password = await hashPassword(password);
    user.save();
    sendSuccessResponse(res, 200, {}, "Password created successfully");
  } catch (error) {
    appErrorResponse(res, error);
  }
};

export const docsVerificationController = async (req, res) => {
  try {
    const { id, status } = req.body;
    const user = await adminModal.findOne({ _id: id });
    if (!user) {
      return sendErrorResponse(res, 400, "User not found");
    }
    if (!user.cnic_front || !user.cnic_back) {
      return sendErrorResponse(
        res,
        400,
        `${user.first_name} didn't upload all the verification documents so you can't do an action`
      );
    }
    if (status === "approved") {
      user.verified = true;
      await user.save();
      return sendSuccessResponse(
        res,
        200,
        {},
        `${user.first_name} has approved successfully`
      );
    } else if (status === "rejected") {
      return sendSuccessResponse(
        res,
        200,
        `${user.first_name} has rejected successfully`
      );
    }
  } catch (error) {
    appErrorResponse(res, error);
  }
};
