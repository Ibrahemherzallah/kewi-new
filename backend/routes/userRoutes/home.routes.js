import express from 'express';
import {getCategories} from "../../controllers/categories.controller.js";
import {getNewestProducts} from "../../controllers/products.controller.js";
import {addPurchase, sendWhatsAppMessage, updateOrderStatus, updateStock} from "../../controllers/purchase.controller.js";
import {requireAuth} from "../../middleware/authMiddleware.js";


const router = express.Router();

router.get("/categories", getCategories);
router.get("/features", getNewestProducts);
router.post('/purchase', addPurchase);
router.patch("/purchase/:id/status", updateOrderStatus);
router.post('/product/update-stock', updateStock);
router.post('/purchase/send-whatsapp', sendWhatsAppMessage );

export default router;