import Purchase from '../models/purchase.model.js';
import Product from "../models/product.model.js";
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
        products, // includes { productId, quantity, color, price }
        totalPrice,
        numOfItems,
    } = req.body;
    console.log("TOTAL PRICE IS : " , totalPrice);
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
            products, // now includes price + color
        });

        await newPurchase.save();

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



export const updateStock = async (req, res) => {
    const { id, quantity } = req.body;

    try {
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ message: 'المنتج غير موجود' });
        }
        let remainingStock = product.stockNumber - quantity
        if (remainingStock < 0){
            return res.status(404).json({ message: `كمية غير كافية من منتج ${product.name}` });
        }
        else if (remainingStock === 0){
            product.isSoldOut = true;
        }
        product.stockNumber -= quantity;


        await product.save();

        res.status(200).json({ message: 'تم تحديث المخزون بنجاح', product });
    } catch (error) {
        console.error('Error updating stock:', error);
        res.status(500).json({ message: 'فشل في تحديث المخزون', error: error.message });
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
            to: 'whatsapp:+972567758087',
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
