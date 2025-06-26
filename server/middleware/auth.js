import jwt from "jsonwebtoken";
import UserModel from "../models/userModel.js";

const authUser = async (req, res, next) => {
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized: No token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
      ignoreExpiration: false,
    });

    // Optional: If using a token blacklist system
    // const isBlacklisted = await checkIfTokenRevoked(token);
    // if (isBlacklisted) {
    //   return res.status(401).json({ success: false, message: "Token revoked" });
    // }

    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("JWT Auth Error:", error.message);
    res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

export default authUser;
