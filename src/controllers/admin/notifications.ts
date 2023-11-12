import { io } from "../../app.ts";
import adminModal from "../../models/adminModal.ts";
import notificationModal from "../../models/notificationModal.ts";
import { isEmpty } from "../../utils/fields.ts";
import {
  appErrorResponse,
  missingFeilds,
  sendErrorResponse,
  sendSuccessResponse,
} from "../../utils/response.ts";
import { Request, Response } from "express";

export const addNotificationController = async ({
  message,
  receiver,
  url,
  doc,
  id,
}: {
  message: string;
  receiver: "staff" | "specific";
  url: string;
  doc: "staff" | "profile" | "orders";
  id?: any;
}) => {
  try {
    if (receiver === "staff") {
      const allStaffMembers = await adminModal.find({ verified: true });
      const notifications = allStaffMembers.map((staffMember) => ({
        insertOne: {
          document: {
            message: message,
            receiver: staffMember?._id,
            url: url,
            doc: doc,
          },
        },
      }));
      await notificationModal.bulkWrite(notifications);
    } else if (receiver === "specific") {
      const notification = new notificationModal({
        message: message,
        receiver: id,
        url: url,
        doc: doc,
      });
      await notification.save();
    }
    io.emit("newNotification", () => {});
  } catch (error) {
    throw error;
  }
};

export const getNotificationsController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = (req as any).user;
    if (isEmpty([id])) {
      return missingFeilds(res);
    }
    const notification = await notificationModal
      .find({ receiver: id })
      .sort({ createdAt: -1 });
    sendSuccessResponse(
      res,
      200,
      { notifications: notification },
      "Notification fetched"
    );
  } catch (error) {
    appErrorResponse(res, error);
  }
};

export const readNotificationController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id }: any = req.body;
    if (isEmpty([id])) {
      return missingFeilds(res);
    }
    const notification = await notificationModal.findOne({ _id: id });
    if (!notification) {
      return sendErrorResponse(res, 400, "Invalid notification id");
    }
    notification.unreaded = false;
    await notification.save();
    io.emit("newNotification", () => {});
    sendSuccessResponse(res, 200, {}, "Readed successfull");
  } catch (error) {
    appErrorResponse(res, error);
  }
};

export const readAllNotificationsController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = (req as any).user;
    if (isEmpty([id])) {
      return missingFeilds(res);
    }
    await notificationModal.updateMany(
      { receiver: id, unreaded: true },
      { $set: { unreaded: false } }
    );
    io.emit("newNotification", () => {});
    sendSuccessResponse(res, 200, {}, "All notification readed");
  } catch (error) {
    appErrorResponse(res, error);
  }
};
