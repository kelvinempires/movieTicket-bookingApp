import jwt from "jsonwebtoken";

const managerAuth = async (req, res, next) => {
  try {
    // 1. Extract token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized: Missing token",
      });
    }

    const token = authHeader.split(" ")[1];

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Check role (either 'manager' or 'admin')
    if (!["manager", "admin"].includes(decoded.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Manager access required",
      });
    }

    // 4. Additional theater validation for managers (not admins)
    if (decoded.role === "manager" && !decoded.theater) {
      return res.status(403).json({
        success: false,
        message: "Manager account not assigned to a theater",
      });
    }

    // 5. Attach user data to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      theater: decoded.theater, // Only relevant for managers
    };

    next();
  } catch (error) {
    console.error("managerAuth error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Token verification failed",
    });
  }
};

export default managerAuth;
