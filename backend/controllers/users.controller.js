import User from "../models/users.model.js";

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({
            id: user._id,
            username: user.userName,
            phone: user.phone,
            address: user.address,
            dob: user.dob,
            role: user.role,
        });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

export const updateMe = async (req, res) => {
    try {
        const { username, phone, address, dob } = req.body;

        const update = {};

        if (username !== undefined) update.userName = username;
        if (address !== undefined) update.address = address;
        if (dob !== undefined) update.dob = dob;

        if (phone !== undefined) {
            // keep phone unique
            const existing = await User.findOne({
                phone,
                _id: { $ne: req.userId },
            });
            if (existing) {
                return res.status(400).json({ message: "Phone already in use" });
            }
            update.phone = phone;
        }

        const user = await User.findByIdAndUpdate(req.userId, update, {
            new: true,
        });

        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({
            message: "Profile updated",
            user: {
                id: user._id,
                username: user.userName,
                phone: user.phone,
                address: user.address,
                dob: user.dob,
                role: user.role,
            },
        });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// Get all users
export const getUsers = async (req, res) => {
    try {
        const users = await User.find({role: 'user'});
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error });
    }
};

// Get user by ID
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user', error });
    }
};
