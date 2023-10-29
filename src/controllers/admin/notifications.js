import notificationModal from "../../models/adminNotificationModal.js";

export const addNotification = async (message, receiver, url) => {
  try {
    const notification = new notificationModal({
      message,
      receiver,
      url,
    });
    await notification.save();
  } catch (error) {
    throw new Error(error.message);
  }
};
