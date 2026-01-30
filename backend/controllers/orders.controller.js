import mongoose from 'mongoose';
import Purchase from "../models/purchase.model.js";
import City from "../models/city.model.js";
import Order from "../models/order.model.js";


export const getOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate({
                path: 'productId',
                populate: [
                    { path: 'categoryId', select: 'name' }, // Get only category name
                    { path: 'brandId', select: 'name' } // Get only brand name
                ]
            })
            .populate('buyerId')
            .populate({
                path: 'purchaseId',
                populate: {
                    path: 'city',
                    model: 'City', // Explicitly reference City model
                    select: 'name'
                }
            });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};