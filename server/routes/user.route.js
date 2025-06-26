import express from "express";
import authUser from "../middleware/auth.js";
import { adminLogin, getUsersData, isAuthenticated, login_verifyOtp, loginUser, logout, registerUser, resetPassword, sendResetOtp, verifyOtp } from "../controllers/user.controller.js";


const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/logout", logout);
userRouter.post("/admin", adminLogin);

userRouter.post("/send-verify-otp", authUser, verifyOtp);
userRouter.post("/verify-account", authUser, login_verifyOtp);
userRouter.get("/is-auth", authUser, isAuthenticated);
userRouter.post("/send-reset-otp", sendResetOtp);
userRouter.post("/reset-password", resetPassword);
userRouter.get("/profile", authUser, getUsersData); // Secure route

export default userRouter;
