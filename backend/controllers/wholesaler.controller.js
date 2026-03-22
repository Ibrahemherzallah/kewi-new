import User from "../models/users.model.js";
import bcrypt from "bcryptjs";

export const addWholesaler = async (req, res) => {
    try {
        const { userName, password, phone, address } = req.body;

        // Check if the password is at least 8 characters long
        if (!password || password.length < 8) {
            return res.status(400).json({ error: "Password must be at least 8 characters long" });
        }

        const user = await User.findOne({userName, role: "wholesaler"});

        if (user) {
            return res.status(400).json({ error: "Wholesaler username already exists" });
        }

        const phoneExists = await User.findOne({phone, role: "wholesaler"});

        if (phoneExists) {
            return res.status(400).json({ error: "Wholesaler phone already in use" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);

        const newUser = new User({
            userName,
            password: hashedPass,
            phone,
            address,
            isWholesaler:true,
            role: 'wholesaler'
        });

        await newUser.save();

        res.status(201).json({
            _id: newUser._id,
            userName: newUser.userName,
            phone: newUser.phone,
            address: newUser.address,
            isWholesaler: newUser.isWholesaler
        });

        console.log("Data stored successfully");
    } catch (e) {
        console.error("Error:", e.message);
        if (e.name === 'ValidationError') {
            // extract first validation error
            const firstError = Object.values(e.errors)[0].message;
            return res.status(400).json({ error: firstError });
        }
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const deleteWholesaler = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedWholesaler = await User.findByIdAndDelete(id);

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
        const { userName, password, phone, address, isWholesaler } = req.body;

        if (phone && phone.length < 10) {
            return res.status(400).json({ error: "Phone number must be at least 10 digits long" });
        }

        if (userName) {
            const existingUser = await User.findOne({ userName, role: "wholesaler" });
            if (existingUser && existingUser._id.toString() !== id) {
                return res.status(400).json({ error: "Wholesaler username already exists" });
            }
        }

        if (phone) {
            const existingPhone = await User.findOne({ phone, role: "wholesaler" });
            if (existingPhone && existingPhone._id.toString() !== id) {
                return res.status(400).json({ error: "Wholesaler phone already in use" });
            }
        }

        const updateData = {
            userName,
            phone,
            address,
            isWholesaler,
        };

        if (password) {
            if (password.length < 8) {
                return res.status(400).json({ error: "Password must be at least 8 characters long" });
            }
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        const updatedWholesaler = await User.findOneAndUpdate(
            { _id: id, role: "wholesaler" },
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedWholesaler) {
            return res.status(404).json({ error: "Wholesaler not found" });
        }

        res.status(200).json(updatedWholesaler);
    } catch (error) {
        console.error("Error:", error.message);
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