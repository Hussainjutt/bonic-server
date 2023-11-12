import * as express from "express";

import {
  getNotificationsController,
  readAllNotificationsController,
  readNotificationController,
} from "../controllers/admin/notifications.ts";
import { tokenValidate } from "../middlewares/authMiddleware.ts";

const router = express.Router();

router.get("/notifications", tokenValidate, getNotificationsController);

router.put("/read-notification", tokenValidate, readNotificationController);

router.put(
  "/read-all-notifications",
  tokenValidate,
  readAllNotificationsController
);

export default router;
