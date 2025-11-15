import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  // 1. Check if the header exists and starts with "Bearer"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // 2. Get the token from the header (split "Bearer <token>")
      token = req.headers.authorization.split(" ")[1];

      if (!token) {
        return res.json({ success: false, message: "Not authorized, no token" });
      }

      // 3. Use jwt.verify() to check the secret and get the payload
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Get the user ID from the payload (based on your generateToken function)
      // Your generateToken function uses { id: userId }, so we use 'decoded.id'
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
         return res.json({ success: false, message: "Not authorized, user not found" });
      }

      // 5. All good, proceed to the next function (getUserData)
      next();
    } catch (error) {
      console.error("Token verification failed:", error.message);
      return res.json({ success: false, message: "Not authorized, token failed" });
    }
  } else {
    // This happens if the header is missing or doesn't start with "Bearer"
    return res.json({ success: false, message: "Not authorized, no Bearer token" });
  }
};