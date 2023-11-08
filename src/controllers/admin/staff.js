// import { io } from "../../app.js";
import Jwt from "jsonwebtoken";
// import { io } from "../../app.js";
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
import { uploadImage } from "../../helpers/firbaseHelper.js";

export const staffListController = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "all",
      role = "all",
    } = req.query;
    const userId = req.user.id;

    const query = {
      $or: [
        { name: { $regex: new RegExp(search, "i") } },
        { email: { $regex: new RegExp(search, "i") } },
      ],
      _id: { $ne: userId },
    };

    if (status === "approved") {
      query.verified = true;
    } else if (status === "pending") {
      query.verified = false;
    } else if (status === "blocked") {
      query.is_active = false;
    }

    if (role !== "all") {
      query.role = role;
    }

    const selectFields = [
      "first_name",
      "last_name",
      "verified",
      "email",
      "profile_pic",
      "is_active",
      "cnic_front",
      "cnic_back",
      "role",
      "createdAt",
    ];

    const users = await adminModal
      .find(query)
      .select(selectFields)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .exec();

    const totalUsers = await adminModal.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limit);
    const nextPage = page < totalPages ? +page + 1 : null;
    const prevPage = page > 1 ? +page - 1 : null;

    const usersWithGotMail = users.map((user) => {
      const obj = user.toObject();
      delete obj["password"];
      return {
        ...obj,
        got_mail: !!user.password,
      };
    });

    sendSuccessResponse(
      res,
      200,
      {
        data: usersWithGotMail,
        totalPages,
        nextPage,
        prevPage,
        currentPage: Number(page),
      },
      "Staff fetched successfully"
    );
  } catch (err) {
    appErrorResponse(res, err);
  }
};

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
    if (user.password) {
      return sendErrorResponse(
        res,
        400,
        "You've already craeted your password"
      );
    }
    user.password = await hashPassword(password);
    user.save();
    sendSuccessResponse(res, 200, {}, "Password created successfully");
  } catch (error) {
    appErrorResponse(res, error);
  }
};

export const verificationDocsUploadController = async (req, res) => {
  try {
    const { cnic_front, cnic_back } = req.files;
    const { id } = req.user;
    if (isEmpty([cnic_front, cnic_back])) {
      return missingFeilds(res);
    }
    const user = await adminModal.findOne({ _id: id });
    if (!user) {
      return sendErrorResponse(res, 400, "User not found");
    }
    user.cnic_front = await uploadImage(cnic_front.path, "documents");
    user.cnic_back = await uploadImage(cnic_back.path, "documents");
    await user.save();
    await addNotification(
      `${user.first_name} has uploaded his varification documents`,
      "admins",
      `/staff/${user._id}`
    );
    sendSuccessResponse(res, 200, {}, "Documents uploaded successfully");
  } catch (error) {
    appErrorResponse(res, error);
  }
};

export const docsVerificationController = async (req, res) => {
  try {
    const { id, status } = req.body;
    const adminID = req.user.id;
    const admin = await adminModal.findOne({ _id: adminID });
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
      await addNotification(
        `${admin.role} has approved your documents`,
        user._id,
        "/profile"
      );
      await addNotification(
        `${admin.first_name} has approved ${user.first_name} documents`,
        "admins",
        `/staff/${user?._id}`
      );
      return sendSuccessResponse(
        res,
        200,
        {},
        `${user.first_name} has approved successfully`
      );
    } else if (status === "rejected") {
      user.verified = false;
      await addNotification(
        `${admin.role} has rejected your document plz reupload them`,
        user._id,
        "/profile"
      );
      await addNotification(
        `${admin.first_name} has rejected ${user.first_name} documents`,
        user._id,
        `/staff/${user?._id}`
      );
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

export const staffDetailsController = async (req, res) => {
  try {
    const { id } = req.params;
    if (isEmpty([id])) {
      return missingFeilds(res);
    }
    const user = await adminModal.findOne({ _id: id });
    const data = {
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      profile_pic: user.profile_pic,
      verified: user.verified,
      is_active: user.is_active,
      cnic_front: user.cnic_front,
      cnic_back: user.cnic_back,
    };
    sendSuccessResponse(res, 200, data, "Staff detailed fetched successfully");
  } catch (error) {
    appErrorResponse(res, error);
  }
};
