import Purchase from '../models/purchase.model.js';
import Product from "../models/product.model.js";
import User from "../models/users.model.js";

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
    const {
        cName,
        cNumber,
        cAddress,
        cCity,
        delivery,
        notes,
        id,
        products, // includes { productId, quantity, color, price, variantId }
        totalPrice,
        numOfItems,
    } = req.body;

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
            price: totalPrice, // frontend calculated
            totalPrice,
            numOfItems,
            products,
        });

        await newPurchase.save();

        // 🆕 If this purchase belongs to a logged-in user, add to their order history
        try {
            let user = null;

            // Prefer req.userId from JWT (route protected by requireAuth)
            console.log("req.userId is: " ,req.userId)
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

export const updateOrderStatus = async (req, res) => {
    console.log("testt")
    try {
        const { id } = req.params;
        const { action } = req.body; // 'confirm' | 'ship' | 'deliver'

        const order = await Purchase.findById(id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (action === "confirm") {
            // admin confirmed with customer by phone
            if (order.orderStatus === "ordered") {
                order.orderStatus = "confirmed";
                order.confirmedAt = new Date();
            }
        } else if (action === "ship") {
            // admin handed to delivery company
            if (order.orderStatus === "ordered" || order.orderStatus === "confirmed") {
                order.orderStatus = "shipped";
                if (!order.confirmedAt) order.confirmedAt = new Date();
                order.shippedAt = new Date();
            }
        } else if (action === "deliver") {
            // later: user marks as received
            if (order.orderStatus === "shipped" || order.orderStatus === "confirmed") {
                order.orderStatus = "delivered";
                order.deliveredAt = new Date();
            }
        } else {
            return res.status(400).json({ message: "Invalid action" });
        }

        await order.save();

        res.json(order);
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({
            message: "Failed to update order status",
            error: error.message,
        });
    }
};


export const updateStock = async (req, res) => {
    const { id, quantity, color, variantId } = req.body;

    try {
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ message: "المنتج غير موجود" });
        }

        const qty = Number(quantity) || 0;
        if (qty <= 0) {
            return res.status(400).json({ message: "الكمية غير صحيحة" });
        }

        // If product has variants and we know which color/variant was sold
        if (product.isMultiColor && product.variants && product.variants.length > 0) {
            // Find variant either by variantId or by color
            let variant = null;

            if (variantId) {
                variant = product.variants.id(variantId);
            }

            if (!variant && color) {
                variant = product.variants.find((v) => v.color === color);
            }

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
