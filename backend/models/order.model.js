import mongoose from "mongoose";
const ordersSchema = new mongoose.Schema({
    productId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
    },
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    purchaseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Purchase",
    }
},{timestamps: true})

const Order = mongoose.model("Order", ordersSchema);

export default Order;