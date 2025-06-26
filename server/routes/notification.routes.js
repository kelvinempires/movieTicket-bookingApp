import express from "express";
import {
  createNotification,
  getUserNotifications,
  markAsRead,
  deleteNotification,
} from "../controllers/notification.controller.js";
import adminAuth from "../middleware/adminAuth.js";
import authUser from "../middleware/auth.js";

const notificationRouter = express.Router();

notificationRouter.post("/create", adminAuth, createNotification);
notificationRouter.get("/:userId", authUser, getUserNotifications);
notificationRouter.patch("/:notificationId/read", authUser, markAsRead);
notificationRouter.delete("/:notificationId", authUser, deleteNotification);

export default notificationRouter;
