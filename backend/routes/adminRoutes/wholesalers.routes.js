import express from "express";
import {addWholesaler, deleteWholesaler, getWholesalers, updateWholesaler} from "../../controllers/wholesaler.controller.js";
import {requireAdmin, requireAuth} from "../../middleware/authMiddleware.js";

const router = express.Router();


router.get('/wholesalers',requireAuth, requireAdmin, getWholesalers);
router.post("/wholesalers",requireAuth, requireAdmin, addWholesaler);
router.put("/wholesalers/:id",requireAuth, requireAdmin, updateWholesaler);
router.delete("/wholesalers/:id",requireAuth, requireAdmin, deleteWholesaler);

export default router;