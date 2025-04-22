import jwt from "jsonwebtoken";
import "dotenv/config";
export const userAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1]; // Extract token after 'Bearer'

    const decoded = jwt.verify(token, process.env.JWT_KEY); // Todo implements dotenv file after this  process.env.JWT_SECRET
    req.userData = decoded;
    next();
  } catch (error) {
    console.error("JWT auth error:", error.message);
    return res
      .status(401)
      .json({ message: "Authentication failed", error: error.message });
  }
};
