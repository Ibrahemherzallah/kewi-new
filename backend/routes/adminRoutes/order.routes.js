import express from 'express';
import {deleteOrder, getAccountingStats, getPurchase} from "../../controllers/purchase.controller.js";
import {requireAdmin, requireAuth} from "../../middleware/authMiddleware.js";
const router = express.Router();

router.get('/purchase',requireAuth, requireAdmin, getPurchase);
router.get("/purchases/accounting", requireAuth, requireAdmin, getAccountingStats);
router.delete('/orders/:id',requireAuth, requireAdmin, deleteOrder);


export default router;