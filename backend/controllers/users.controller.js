import User from "../models/users.model.js";
import Purchase from "../models/purchase.model.js";

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

export const getUserPurchases = async (req, res) => {
    try {
        console.log("getUserPurchases req.userId:", req.userId);

        if (!req.userId) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        // 1) Get user and their orderHistory IDs
        const user = await User.findById(req.userId).lean();

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        console.log("user.orderHistory:", user.orderHistory);

        const orderIds = Array.isArray(user.orderHistory)
            ? user.orderHistory
            : [];

        if (orderIds.length === 0) {
            // User has no orders yet
            return res.json([]);
        }

        // 2) Fetch the purchase documents by IDs
        const orders = await Purchase.find({ _id: { $in: orderIds } })
            .sort({ createdAt: -1 })
            .lean();

        // 3) Return them
        return res.json(orders);
    } catch (error) {
        console.error("Error fetching user purchases:", error);
        res.status(500).json({
            message: "Failed to fetch user purchases",
            error: error.message,
        });
    }
};
// PATCH /user/purchase/:id/received
export const markOrderDeliveredByUser = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Purchase.findById(id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Optional: verify that this order belongs to this user (by phone or by stored userId)
        // if (String(order.userId) !== String(req.userId)) { ... }

        // set status to delivered
        order.orderStatus = "delivered";
        order.deliveredAt = new Date();
        await order.save();

        res.json(order);
    } catch (error) {
        console.error("Error marking order delivered:", error);
        res.status(500).json({
            message: "Failed to mark order as delivered",
            error: error.message,
        });
    }
};