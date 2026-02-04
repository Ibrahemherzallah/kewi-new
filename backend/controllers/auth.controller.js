import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/users.model.js";

const JWT_SECRET = "dev-secret-change-me";
const JWT_EXPIRES_IN = "7d";

const createToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            role: user.role,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
};

// SIGN UP
export const signUp = async (req, res) => {
    try {
        const { username, phone, password, address, dob } = req.body;

        if (!username || !phone || !password) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const phoneExists = await User.findOne({ phone });
        if (phoneExists) {
            return res.status(400).json({ message: "Phone already in use" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            userName: username,
            phone,
            password: hashedPassword,
            address: address || "",
            isWholesaler: false,
            dob: dob ? new Date(dob) : undefined, // ✅ here
            role: "user"
        });

        const token = createToken(user);

        res.status(201).json({
            token,
            user: {
                id: user._id,
                username: user.userName,
                phone: user.phone,
                role: user.role,
                address: user.address,
                dob: user.dob,
            },
        });
    } catch (err) {
        console.error("Signup error:", err);

        if (err.code === 11000 && err.keyPattern?.phone) {
            return res.status(400).json({
                message: "Phone already in use",
                field: "phone",
            });
        }

        if (err.name === "ValidationError") {
            const firstErrorKey = Object.keys(err.errors)[0];
            const friendlyMessage = err.errors[firstErrorKey].message;

            return res.status(400).json({
                message: friendlyMessage,
                field: firstErrorKey,
            });
        }

        res.status(500).json({ message: err.message || "Unknown server error" });
    }
};

// POST /api/auth/login
// LOGIN (phone + password)
export const logIn = async (req, res) => {
    try {
        const { phone, password } = req.body;

        if (!phone || !password) {
            return res.status(400).json({ message: "Missing phone or password" });
        }

        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(400).json({ message: "Invalid phone or password" });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({ message: "Invalid phone or password" });
        }

        const token = createToken(user);
        const dateOfBirth = user?.role === 'user' ? user?.dob : ''

        res.json({
            token,
            user: {
                id: user._id,
                username: user.userName,
                phone: user.phone,
                role: user.role,
                address: user.address,
                dob: dateOfBirth
            },
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};
