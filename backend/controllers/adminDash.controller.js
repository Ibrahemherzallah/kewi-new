import Product from "../models/product.model.js";
import Purchase from "../models/purchase.model.js";
import User from "../models/users.model.js";

export const getAdminDashboardStats = async (req, res) => {
        try {
                // 1️⃣ Total Products
                const totalProducts = await Product.countDocuments();

                // 2️⃣ Pending Orders
                const pendingOrders = await Purchase.countDocuments({
                        orderStatus: { $in: ["ordered", "confirmed"] },
                });

                // 3️⃣ Monthly Revenue (only shipped orders this month)
                const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

                const monthlyRevenueAgg = await Purchase.aggregate([
                        {
                                $match: {
                                        orderStatus: "shipped",
                                        shippedAt: { $gte: startOfMonth },
                                },
                        },
                        {
                                $group: {
                                        _id: null,
                                        total: { $sum: "$totalPrice" },
                                },
                        },
                ]);
                const monthlyRevenue =
                    monthlyRevenueAgg.length > 0 ? monthlyRevenueAgg[0].total : 0;

                // 4️⃣ Wholesalers count
                const wholesalers = await User.countDocuments({
                        role: "wholesaler",
                });

                res.json({
                        totalProducts,
                        pendingOrders,
                        monthlyRevenue,
                        wholesalers,
                });
        } catch (error) {
                console.error("Admin dashboard error:", error);
                res.status(500).json({ message: "Server error" });
        }
};
