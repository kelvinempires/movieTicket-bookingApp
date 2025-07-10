import { clerkClient } from "@clerk/express";

export const protectAdmin = async (req, res, next) => {
  try {
    // 1. Check if auth exists
    if (!req.auth) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    // 2. Get userId safely
    const { userId } = req.auth;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "User ID not found" });
    }

    // 3. Get user from Clerk
    const user = await clerkClient.users.getUser(userId);

    // 4. Check role safely
    if (user?.privateMetadata?.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    next();
  } catch (error) {
    console.error("Error in auth middleware:", error);
    return res.status(500).json({
      success: false,
      message: "Error in auth middleware",
      error: error.message,
    });
  }
};
