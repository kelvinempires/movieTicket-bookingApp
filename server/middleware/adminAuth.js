import jwt from "jsonwebtoken";

const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized: Missing token",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Explicit role check instead of email comparison
    if (decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Admin access required",
      });
    }

    req.user = decoded; // Standardized to match managerAuth
    next();
  } catch (error) {
    console.error("adminAuth error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Token verification failed",
    });
  }
};

export default adminAuth;
