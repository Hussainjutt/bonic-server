import Jwt from "jsonwebtoken";
import { Request, Response } from "express";
import adminModal from "../../models/adminModal.ts";
import { createPasswword } from "../../utils/email.ts";
import { isEmpty } from "../../utils/fields.ts";
import {
  appErrorResponse,
  missingFeilds,
  sendErrorResponse,
  sendSuccessResponse,
} from "../../utils/response.ts";
import { hashPassword } from "../../utils/bcrypt.ts";
import { addNotificationController } from "./notifications.ts";
import { removeImage, uploadImage } from "../../helpers/firbaseHelper.ts";
import { OutputFileType } from "typescript";

export const staffListController = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "all",
      role = "all",
    }: any = req.query;
    const userId = (req as any).user.id;

    const query: any = {
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

    sendSuccessResponse(
      res,
      200,
      {
        data: users,
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

export const addStaffController = async (req: Request, res: Response) => {
  try {
    const { first_name, last_name, email, role } = req.body;
    const { id } = (req as any).user;
    const admin = await adminModal.findOne({ _id: id });
    if (isEmpty([first_name, last_name, email, role])) {
      return missingFeilds(res);
    }
    const check = await adminModal.findOne({ email });
    if (check) {
      return sendErrorResponse(res, 400, "User already exits");
    }
    const token = Jwt.sign({ email }, (process as any).env.JWT_SECRET, {
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
    await addNotificationController({
      message: `${admin?.first_name} has added ${first_name} as ${role}`,
      doc: "staff",
      url: `/staff/${user._id}`,
      receiver: "staff",
    });
    await addNotificationController({
      message: "Please upload your verification docs to be verified",
      doc: "profile",
      url: "/profile",
      receiver: "specific",
      id: user?._id,
    });
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

export const removeStaffController = async (req: Request, res: Response) => {
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

export const resendPasswordEmailController = async (
  req: Request,
  res: Response
) => {
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
    const email = user.email || "";
    const token = Jwt.sign({ email }, (process as any).env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const url = `http://localhost:3000/create-password/${token}`;
    await createPasswword(email, user?.first_name || "", url);
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

export const passwordCreateController = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    if (isEmpty([token, password])) {
      return missingFeilds(res);
    }
    const decoded: any = Jwt.decode(token);
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

export const verificationDocsUploadController = async (
  req: Request,
  res: Response
) => {
  try {
    const { cnic_front, cnic_back }: any = (req as any).files;
    const { id } = (req as any).user;
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
    await addNotificationController({
      message: `${user.first_name}  has uploaded his verification documents`,
      doc: "staff",
      receiver: "staff",
      url: `/staff/${user._id}`,
    });
    sendSuccessResponse(res, 200, {}, "Documents uploaded successfully");
  } catch (error) {
    appErrorResponse(res, error);
  }
};

export const docsVerificationController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id, status } = req.body;
    if (isEmpty([id, status])) {
      return missingFeilds(res);
    }
    const adminID = (req as any).user.id;
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
    if (status === "approve") {
      if (user.verified) {
        return sendSuccessResponse(res, 200, {}, "User already approved");
      }
      user.verified = true;
      await user.save();
      await addNotificationController({
        message: `Admin has approved your documents`,
        doc: "profile",
        receiver: "specific",
        url: "/profile",
        id: user._id,
      });
      await addNotificationController({
        message: `${admin?.first_name} has approved ${user.first_name} documents`,
        doc: "staff",
        receiver: "staff",
        url: `/staff/${user?._id}`,
        id: user._id,
      });
      return sendSuccessResponse(
        res,
        200,
        {},
        `${user?.first_name} decuments has approved successfully`
      );
    } else if (status === "reject") {
      await removeImage(user.cnic_front);
      await removeImage(user.cnic_back);
      user.verified = false;
      user.cnic_back = "";
      user.cnic_front = "";
      user.save();
      await addNotificationController({
        message: `Admin has rejected your document plz reupload them`,
        doc: "profile",
        receiver: "specific",
        url: "/profile",
        id: user._id,
      });
      await addNotificationController({
        message: `${admin?.first_name} has rejected ${user.first_name} documents`,
        doc: "staff",
        receiver: "staff",
        url: `/staff/${user?._id}`,
        id: user._id,
      });
      return sendSuccessResponse(
        res,
        200,
        {},
        `${user.first_name} decuments has rejected successfully`
      );
    } else {
      sendErrorResponse(res, 400, "Invalid status");
    }
  } catch (error) {
    appErrorResponse(res, error);
  }
};

export const staffDetailsController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (isEmpty([id])) {
      return missingFeilds(res);
    }
    const user = await adminModal.findOne({ _id: id });
    const data = {
      id: user?._id,
      first_name: user?.first_name,
      last_name: user?.last_name,
      email: user?.email,
      profile_pic: user?.profile_pic,
      verified: user?.verified,
      is_active: user?.is_active,
      cnic_front: user?.cnic_front,
      cnic_back: user?.cnic_back,
      role: user?.role,
      address: user?.address,
      phone: user?.phone,
    };
    sendSuccessResponse(res, 200, data, "Staff detailed fetched successfully");
  } catch (error) {
    appErrorResponse(res, error);
  }
};

export const staffRoleChangeController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id, role } = req.body;
    const adminId = (req as any).user.id;
    if (isEmpty([id, role])) {
      return missingFeilds(res);
    }
    const admin = await adminModal.findOne({ _id: adminId });
    const user = await adminModal.findOne({ _id: id });
    if (!user) {
      return sendErrorResponse(res, 400, "User not found");
    }
    if (!["manager", "admin"].includes(role)) {
      return sendErrorResponse(res, 400, "Invalid role");
    }
    user.role = role;
    await user.save();
    await addNotificationController({
      doc: "staff",
      message: `${admin?.first_name} has updated the role of ${user.first_name} to ${role}`,
      receiver: "staff",
      url: `/staff/${user._id}`,
    });
    await addNotificationController({
      doc: "profile",
      message: `Admin has updated your role to ${role}`,
      receiver: "specific",
      url: `/profile`,
      id: user?._id,
    });
    sendSuccessResponse(
      res,
      200,
      {},
      `${user?.first_name} role changed to ${role}`
    );
  } catch (error) {
    appErrorResponse(res, error);
  }
};
