import NotificationModel from "../models/NotificationModel.js";

// Send notification (admin or system)
export const createNotification = async (req, res) => {
  try {
    const { user, title, message, type } = req.body;

    const notification = await NotificationModel.create({
      user,
      title,
      message,
      type,
    });

    res.status(201).json({ message: "Notification sent", data: notification });
  } catch (error) {
    res.status(500).json({ message: "Error sending notification", error });
  }
};

// Get all notifications for a user
export const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    const notifications = await NotificationModel.find({ user: userId }).sort({
      createdAt: -1,
    });

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch notifications", error });
  }
};

// Mark a notification as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await NotificationModel.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    res.status(200).json({ message: "Marked as read", data: updated });
  } catch (error) {
    res.status(500).json({ message: "Failed to update notification", error });
  }
};

// Delete a notification
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    await NotificationModel.findByIdAndDelete(id);

    res.status(200).json({ message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete", error });
  }
};
