import express from 'express';
import {deleteOrder, getPurchase} from "../../controllers/purchase.controller.js";
import {requireAdmin, requireAuth} from "../../middleware/authMiddleware.js";
const router = express.Router();

router.get('/purchase',requireAuth, requireAdmin, getPurchase);
router.delete('/orders/:id',requireAuth, requireAdmin, deleteOrder);


export default router;