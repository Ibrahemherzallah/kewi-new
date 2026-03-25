import express from 'express';
import {getCategories} from "../../controllers/categories.controller.js";
import {getNewestProducts} from "../../controllers/products.controller.js";
import {addPurchase, initLahzaPayment, redeemDiscountWithPoints, redeemFreeProductWithPoints, sendWhatsAppMessage, updateOrderStatus, updateStock, verifyLahzaPayment} from "../../controllers/purchase.controller.js";
import {requireAuth} from "../../middleware/authMiddleware.js";


const router = express.Router();

router.get("/categories", getCategories);
router.get("/features", getNewestProducts);
router.post('/purchase', addPurchase);
router.patch("/purchase/:id/status",requireAuth, updateOrderStatus);
router.post('/product/update-stock', updateStock);
router.post('/purchase/send-whatsapp', sendWhatsAppMessage );
router.patch("/loyalty/redeem-discount", requireAuth, redeemDiscountWithPoints);
router.patch("/loyalty/redeem-free-product", requireAuth, redeemFreeProductWithPoints);
router.post("/payments/lahza/init", initLahzaPayment);
router.post("/payments/lahza/verify", verifyLahzaPayment);
export default router;