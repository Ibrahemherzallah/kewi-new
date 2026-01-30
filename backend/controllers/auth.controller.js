import bcrypt from "bcryptjs";
import User from "../models/users.model.js";
import session from "express-session";


export const signUp = async (req, res) => {
    try {
        const { userName, password,phone, isWholesaler } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ userName });
        if (existingUser) {
            return res.status(400).json({ error: "Username already taken" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            userName,
            phone,
            password: hashedPassword,
            isWholesaler: isWholesaler || false,
        });

        await newUser.save();

        // Store user in session
        req.session.user = {
            _id: newUser._id,
            userName: newUser.userName,
            isWholesaler: newUser.isWholesaler
        };

        const redirectUrl = newUser.isWholesaler ? "/" : "/admin/dashboard";

        res.status(201).json({
            message: "Signup successful",
            user: req.session.user,
            redirectUrl
        });

    } catch (err) {
        console.error("Signup error:", err.message);
        res.status(500).json({ error: "Internal server error" });
    }
};






export const logIn = async (req, res) => {
    try {
        const { userName, password } = req.body;

        const user = await User.findOne({ userName });

        if (!user) {
            return res.status(404).json({ error: "Invalid username or password" });
        }

        const correctPass = await bcrypt.compare(password, user.password);

        if (!correctPass) {
            return res.status(400).json({ error: "Invalid username or password" });
        }

        // Store user information in session
        req.session.user = {
            _id: user._id,
            userName: user.userName,
            isWholesaler: user.isWholesaler
        };
        const redirectUrl = user.isWholesaler ? "/" : "/admin/dashboard";

        return res.status(200).json({
            message: "Login successful",
            user: req.session.user,
            redirectUrl
        });

    } catch (e) {
        console.error("Error:", e.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const logOut = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: "Error logging out" });
        }
        res.json({ message: "Logged out successfully" });
    });
};
