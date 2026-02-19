// middleware/auth.middleware.js
import jwt from "jsonwebtoken";
import User from "../models/users.model.js";

export const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || "";
        if (!authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No token provided" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);


        // token has: { id, role, iat, exp }
        const user = await User.findById(decoded.id);

        if (!user) {
            return res
                .status(401)
                .json({ message: "User no longer exists, please log in again" });
        }

        // Attach to request
        req.userId = user._id;
        req.user = user;

        next();
    } catch (err) {
        console.error("JWT error:", err);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};