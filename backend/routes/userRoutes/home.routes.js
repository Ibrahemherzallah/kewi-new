import express from 'express';
import {getCategories} from "../../controllers/categories.controller.js";
import {getNewestProducts} from "../../controllers/products.controller.js";
import {addPurchase,sendWhatsAppMessage, updateStock} from "../../controllers/purchase.controller.js";


const router = express.Router();

router.get("/categories", getCategories);
router.get("/features", getNewestProducts);
router.post('/purchase', addPurchase);
router.post('/product/update-stock', updateStock);
router.post('/purchase/send-whatsapp', sendWhatsAppMessage );

export default router;