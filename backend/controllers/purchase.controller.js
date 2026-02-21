import Purchase from '../models/purchase.model.js';
import Product from "../models/product.model.js";
import User from "../models/users.model.js";
import mongoose from "mongoose";
import twilio from 'twilio';
import dotenv from 'dotenv';
dotenv.config();




export const getPurchase = async (req, res) => {
    try {
        const purchases = await Purchase.find().sort({ createdAt: -1 }); // optional: newest first
        res.status(200).json(purchases);
    } catch (error) {
        console.error('Error fetching purchases:', error);
        res.status(500).json({ message: 'فشل في جلب المشتريات', error: error.message });
    }
};

export const addPurchase = async (req, res) => {
    const {cName, cNumber, cAddress, cCity, delivery, notes, id, products, totalPrice,discount,numOfItems,} = req.body;

    console.log("products IS : ", products);

    try {
        const newPurchase = new Purchase({
            fullName: cName,
            phoneNumber: cNumber,
            streetAddress: cAddress,
            city: cCity,
            deliveryType: delivery,
            notes,
            id,
            price: totalPrice,
            totalPrice,
            numOfItems,
            discount,
            products,
        });

        await newPurchase.save();

        // 🆕 If this purchase belongs to a logged-in user, add to their order history
        try {
            let user = null;

            // Prefer req.userId from JWT (route protected by requireAuth)
            if (req.userId) {
                user = await User.findByIdAndUpdate(
                    req.userId,
                    { $push: { orderHistory: newPurchase._id } },
                    { new: true }
                );
            } else {
                // Optional fallback: try to match by phone number
                user = await User.findOneAndUpdate(
                    { phone: cNumber },
                    { $push: { orderHistory: newPurchase._id } },
                    { new: true }
                );
            }

            if (user) {
                console.log(
                    `Added purchase ${newPurchase._id} to user ${user._id} orderHistory`
                );
            } else {
                console.log(
                    "No matching user found for this purchase (guest checkout or phone not registered)."
                );
            }
        } catch (userErr) {
            console.error("Error updating user order history:", userErr);
            // don't fail the whole request if just history update fails
        }

        res.status(201).json({
            message: "تم إضافة الشراء بنجاح",
            purchase: newPurchase,
        });
    } catch (error) {
        console.error("Error creating purchase:", error);
        res.status(500).json({
            message: "فشل في إضافة الشراء",
            error: error.message,
        });
    }
};

const calculatePointsFromPurchase = (amount) => {
    return Math.floor(amount / 50) * 2;
};



const deductStockForOrder = async (order, session) => {
    for (const item of order.products) {
        const qty = Number(item.quantity || 1);

        const product = await Product.findById(item.productId).session(session);
        if (!product) {
            throw new Error(`Product not found: ${item.productId}`);
        }

        // ✅ Variant product
        if (product.isMultiColor && Array.isArray(product.variants) && product.variants.length > 0) {
            const color = (item.color || "").trim();
            const variant = product.variants.find(v => (v.color || "").trim() === color);

            if (!variant) {
                throw new Error(`Variant not found for product ${product._id} (color: ${item.color})`);
            }

            if ((variant.stockNumber ?? 0) < qty) {
                throw new Error(`Not enough stock for ${product.name} (${color})`);
            }

            variant.stockNumber -= qty;

            // optional: mark sold out if that variant reached 0
            // (if you want per-variant soldout you can add a field later)

            await product.save({ session });
        }

        // ✅ Simple product
        else {
            if ((product.stockNumber ?? 0) < qty) {
                throw new Error(`Not enough stock for ${product.name}`);
            }

            product.stockNumber -= qty;

            // optional: auto mark sold out
            product.isSoldOut = product.stockNumber <= 0;

            await product.save({ session });
        }
    }
};


export const updateOrderStatus = async (req, res) => {
    const session = await mongoose.startSession();
    let earnedPoints = 0;

    try {
        const { id } = req.params;
        const { action } = req.body;


        await session.withTransaction(async () => {
            const order = await Purchase.findById(id).session(session);
            if (!order) {
                throw new Error("ORDER_NOT_FOUND");
            }

            let updated = false;

            if (action === "confirm") {
                if (order.orderStatus !== "ordered") {
                    throw new Error("INVALID_STATE_CONFIRM");
                }

                // ✅ deduct stock once
                if (!order.stockDeducted) {
                    await deductStockForOrder(order, session);
                    order.stockDeducted = true;
                }

                order.orderStatus = "confirmed";
                order.confirmedAt = new Date();
                updated = true;
            } else if (action === "ship") {
                if (
                    order.orderStatus === "ordered" ||
                    order.orderStatus === "confirmed"
                ) {
                    order.orderStatus = "shipped";
                    if (!order.confirmedAt) order.confirmedAt = new Date();
                    order.shippedAt = new Date();
                    updated = true;
                } else {
                    throw new Error("INVALID_STATE_SHIP");
                }
            } else if (action === "delivered") {
                if (
                    order.orderStatus === "shipped" ||
                    order.orderStatus === "confirmed"
                ) {
                    const previousStatus = order.orderStatus;

                    order.orderStatus = "delivered";
                    order.deliveredAt = new Date();
                    updated = true;

                    // Only give points the FIRST time
                    if (previousStatus !== "delivered") {
                        earnedPoints = calculatePointsFromPurchase(order.totalPrice);
                        console.log("earnedPoints is:", earnedPoints);
                    }
                } else {
                    throw new Error("INVALID_STATE_DELIVER");
                }
            } else {
                throw new Error("INVALID_ACTION");
            }

            if (!updated) {
                throw new Error("ORDER_NOT_CHANGED");
            }

            await order.save({ session });
        });

        // 🟢 Transaction succeeded – now handle loyalty points (outside session)
        let totalPoints;

        if (earnedPoints > 0 && req.userId) {
            // Load user from DB to check role safely
            const user = await User.findById(req.userId);

            if (user) {
                if (user.role === "user") {
                    // ✅ only "user" role gets points
                    user.loyaltyPoints = (user.loyaltyPoints || 0) + earnedPoints;
                    await user.save();
                    totalPoints = user.loyaltyPoints;

                    console.log(
                        `Added ${earnedPoints} points to user ${user._id}. Role=${user.role}. Total=${totalPoints}`
                    );
                } else {
                    console.log(
                        `Order delivered but no points added because role is "${user.role}".`
                    );
                }
            } else {
                console.warn(
                    "Could not find user to add loyalty points. req.userId =",
                    req.userId
                );
            }
        }

        const updatedOrder = await Purchase.findById(id);

        return res.status(200).json({
            order: updatedOrder,
            earnedPoints,
            totalPoints, // may be undefined if no points added
        });
    } catch (error) {
        console.error("Error updating order status:", error);

        if (error.message === "ORDER_NOT_FOUND") {
            return res.status(404).json({ message: "Order not found" });
        }

        if (
            error.message === "INVALID_STATE_CONFIRM" ||
            error.message === "INVALID_STATE_SHIP" ||
            error.message === "INVALID_STATE_DELIVER" ||
            error.message === "ORDER_NOT_CHANGED"
        ) {
            return res
                .status(400)
                .json({ message: "Order status not changed (invalid state)" });
        }

        if (error.message === "INVALID_ACTION") {
            return res.status(400).json({ message: "Invalid action" });
        }

        return res.status(500).json({
            message: "Failed to update order status",
            error: error.message,
        });
    } finally {
        session.endSession();
    }
};

// already have this for percentage discount:
export const redeemDiscountWithPoints = async (req, res) => {
    try {
        const { pointsCost } = req.body;

        if (
            pointsCost == null ||
            typeof pointsCost !== "number" ||
            !Number.isInteger(pointsCost) ||
            pointsCost <= 0
        ) {
            return res
                .status(400)
                .json({ message: "Invalid points cost for discount redemption" });
        }

        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const currentPoints = user.loyaltyPoints || 0;

        if (currentPoints < pointsCost) {
            return res.status(400).json({
                message: "Not enough loyalty points",
                loyaltyPoints: currentPoints,
            });
        }

        user.loyaltyPoints = currentPoints - pointsCost;
        await user.save();

        return res.json({
            message: "Discount redeemed successfully",
            loyaltyPoints: user.loyaltyPoints,
            pointsSpent: pointsCost,
        });
    } catch (err) {
        console.error("Error redeeming discount with points:", err);
        return res.status(500).json({
            message: "Failed to redeem discount",
            error: err.message,
        });
    }
};

// 👇 NEW: free product redemption
export const redeemFreeProductWithPoints = async (req, res) => {
    try {
        const FREE_PRODUCT_COST = 100;

        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const currentPoints = user.loyaltyPoints || 0;

        if (currentPoints < FREE_PRODUCT_COST) {
            return res.status(400).json({
                message: "Not enough loyalty points for free product",
                loyaltyPoints: currentPoints,
            });
        }

        user.loyaltyPoints = currentPoints - FREE_PRODUCT_COST;
        await user.save();

        return res.json({
            message: "Free product redeemed successfully",
            loyaltyPoints: user.loyaltyPoints,
            pointsSpent: FREE_PRODUCT_COST,
        });
    } catch (err) {
        console.error("Error redeeming free product:", err);
        return res.status(500).json({
            message: "Failed to redeem free product",
            error: err.message,
        });
    }
};


export const updateStock = async (req, res) => {
    const { id, quantity, color, variantId } = req.body;

    try {
        const fixedId = variantId ? id.split("-")[0] : id;
        console.log("fixedId id is ::, " , fixedId)

        const product = await Product.findById(fixedId);

        if (!product) {
            return res.status(404).json({ message: "المنتج غير موجود" });
        }

        const qty = Number(quantity) || 0;
        if (qty <= 0) {
            return res.status(400).json({ message: "الكمية غير صحيحة" });
        }
        console.log("variantId id is variantIdvariantIdvariantIdvariantId: ")

        // If product has variants and we know which color/variant was sold
        if (product.isMultiColor && product.variants && product.variants.length > 0) {
            // Find variant either by variantId or by color
            let variant = null;
            console.log("variantId id is : " , variantId)
            if (variantId) {
                variant = product.variants.id(variantId);
            }

            if (!variant && color) {
                variant = product.variants.find((v) => v.color === color);
            }
            console.log("variant id is : " , variant)

            if (!variant) {
                return res.status(400).json({
                    message: "اللون المحدد غير موجود لهذا المنتج",
                });
            }

            const remainingVariantStock = variant.stockNumber - qty;

            if (remainingVariantStock < 0) {
                return res.status(400).json({
                    message: `كمية غير كافية من منتج ${product.name} بلون ${variant.color}`,
                });
            }

            variant.stockNumber = remainingVariantStock;

            // Also update global stockNumber (optional but recommended)
            const totalVariantStock = product.variants.reduce(
                (sum, v) => sum + (v.stockNumber || 0),
                0
            );
            product.stockNumber = totalVariantStock;

            if (totalVariantStock <= 0) {
                product.isSoldOut = true;
            }
        } else {
            // Old behavior: simple product without variants
            const remainingStock = product.stockNumber - qty;

            if (remainingStock < 0) {
                return res.status(400).json({
                    message: `كمية غير كافية من منتج ${product.name}`,
                });
            }

            product.stockNumber = remainingStock;

            if (remainingStock === 0) {
                product.isSoldOut = true;
            }
        }

        await product.save();

        res
            .status(200)
            .json({ message: "تم تحديث المخزون بنجاح", product });
    } catch (error) {
        console.error("Error updating stock:", error);
        res.status(500).json({
            message: "فشل في تحديث المخزون",
            error: error.message,
        });
    }
};



const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

export const sendWhatsAppMessage = async (req, res) => {
    const { cName, cNumber, cAddress, notes, cCity, price, numOfItems, delivery, products, type, totalPrice } = req.body;
    console.log("products : " ,products)
    // Format products into a readable string
    const productsMessage = products
        .map(
            (p, index) => `
      🛒 المنتج ${index + 1}:
      - معرف المنتج: ${p.productId}
      - الكمية: ${p.quantity}
      - اللون: ${p.color || "غير محدد"}
      - السعر: ${p.unitPrice || "غير محدد"}
    `
        )
        .join("\n");

    const message = `طلب جديد
الاسم: ${cName}
رقم الهاتف: ${cNumber}
المدينة: ${cAddress}
ملاحظات: ${notes || "لا يوجد"}
المنطقة: ${cCity}
السعر الإجمالي بدون توصيل: ${totalPrice}
التوصيل: ${delivery}
${productsMessage}
مصدر الطلب: ${type}
`;

    try {
        const response = await client.messages.create({
            from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
            to: 'whatsapp:+972597250539',
            body: message,
        });

        const messageStatus = await client.messages(response.sid).fetch();
        console.log("The message is : ", messageStatus);
        console.log("Message Status:", messageStatus.status);

        res.status(200).json({ message: "تم إرسال رسالة واتساب بنجاح" });
    } catch (error) {
        console.error("فشل إرسال رسالة واتساب:", error);
        res.status(500).json({ message: "فشل إرسال الرسالة", error: error.message });
    }
};


export const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("Deleting order with id:", id);

        // if using MongoDB _id
        const order = await Purchase.findByIdAndDelete(id);

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        res.status(200).json({ success: true, message: "Order deleted successfully" });
    } catch (error) {
        console.error("Error deleting order:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


// e.g. userPaymentController.js
export const createPaymentSession = async (req, res) => {
    try {
        const { orderId, amount } = req.body;
        const userId = req.userId; // from your auth middleware

        // TODO: validate order, amount, ownership, etc.

        // TODO: call Bank of Palestine API here:
        // const response = await axios.post("https://bank-palestine-api/.../createPayment", {
        //   amount,
        //   currency: "ILS",
        //   orderId,
        //   returnUrl: "https://your-domain.com/payment/success",
        //   notifyUrl: "https://your-backend.com/payment/webhook"
        //   ...
        // });

        // Example:
        // const paymentUrl = response.data.paymentUrl;

        const paymentUrl = "https://bank-of-palestine-demo-url.com/payment"; // placeholder

        res.json({ paymentUrl });
    } catch (err) {
        console.error("Error creating payment session:", err);
        res.status(500).json({
            message: "Failed to create payment session",
        });
    }
};
