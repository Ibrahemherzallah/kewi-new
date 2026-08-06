import User from "../models/users.model.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

export const addWholesaler = async (req, res) => {
    try {
        const { userName, password, phone, address, wholesalerCategories } = req.body;

        if (!password || password.length < 8) {
            return res.status(400).json({ error: "Password must be at least 8 characters long" });
        }

        const user = await User.findOne({ userName, role: "wholesaler" });
        if (user) {
            return res.status(400).json({ error: "Wholesaler username already exists" });
        }

        const phoneExists = await User.findOne({ phone });
        if (phoneExists) {
            return res.status(400).json({ error: "Phone already in use" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);

        const newUser = new User({
            userName,
            password: hashedPass,
            phone,
            address,
            isWholesaler: true,
            role: "wholesaler",
            // if not provided or empty array → defaults to [] which means "all categories"
            wholesalerCategories: Array.isArray(wholesalerCategories) ? wholesalerCategories : [],
        });

        await newUser.save();

        res.status(201).json({
            _id: newUser._id,
            userName: newUser.userName,
            phone: newUser.phone,
            address: newUser.address,
            isWholesaler: newUser.isWholesaler,
            wholesalerCategories: newUser.wholesalerCategories,
        });

        console.log("Wholesaler stored successfully");
    } catch (e) {
        console.error("Error:", e.message);
        if (e.name === "ValidationError") {
            const firstError = Object.values(e.errors)[0].message;
            return res.status(400).json({ error: firstError });
        }
        res.status(500).json({ error: "Internal Server Error" });
    }
};


export const deleteWholesaler = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid wholesaler id" });
        }

        const deletedWholesaler = await User.findOneAndDelete({
            _id: id,
            role: "wholesaler",
        });

        if (!deletedWholesaler) {
            return res.status(404).json({ error: "Wholesaler not found" });
        }

        res.status(200).json({ message: "Wholesaler deleted successfully" });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


export const updateWholesaler = async (req, res) => {
    try {
        const { id } = req.params;
        const { userName, password, phone, address, isWholesaler, wholesalerCategories } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: "Wholesaler not found" });
        }

        if (phone && phone.length < 10) {
            return res.status(400).json({ error: "Phone number must be at least 10 characters" });
        }

        if (password && password.length < 8) {
            return res.status(400).json({ error: "Password must be at least 8 characters long" });
        }

        // Check phone uniqueness (excluding current user)
        if (phone && phone !== user.phone) {
            const phoneExists = await User.findOne({ phone, _id: { $ne: id } });
            if (phoneExists) {
                return res.status(400).json({ error: "Phone already in use" });
            }
        }

        if (userName) user.userName = userName;
        if (phone) user.phone = phone;
        if (address !== undefined) user.address = address;
        if (isWholesaler !== undefined) user.isWholesaler = isWholesaler;

        // Update categories if provided
        if (Array.isArray(wholesalerCategories)) {
            user.wholesalerCategories = wholesalerCategories;
        }

        // Only update password if a new one was provided
        if (password && password.trim()) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        await user.save();

        res.status(200).json({
            _id: user._id,
            userName: user.userName,
            phone: user.phone,
            address: user.address,
            isWholesaler: user.isWholesaler,
            wholesalerCategories: user.wholesalerCategories,
        });
    } catch (e) {
        console.error("Error:", e.message);
        if (e.name === "ValidationError") {
            const firstError = Object.values(e.errors)[0].message;
            return res.status(400).json({ error: firstError });
        }
        res.status(500).json({ error: "Internal Server Error" });
    }
};



export const getWholesalers = async (req, res) => {
    try {
        const wholesalers = await User.find({ isWholesaler: true });

        if (wholesalers.length === 0) {
            return res.status(404).json({ message: "No wholesalers found" });
        }

        res.status(200).json(wholesalers);
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};