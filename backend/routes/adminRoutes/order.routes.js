import express from 'express';
import {deleteOrder, getPurchase} from "../../controllers/purchase.controller.js";
const router = express.Router();

router.get('/purchase', getPurchase);
router.delete('/orders/:id', deleteOrder);


export default router;