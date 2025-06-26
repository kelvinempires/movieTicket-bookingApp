// models/NotificationModel.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, default: "info" }, // info, alert, promo, etc.
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const NotificationModel =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);

export default NotificationModel;
