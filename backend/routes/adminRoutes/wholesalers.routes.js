import express from "express";
import {
    addWholesaler,
    deleteWholesaler,
    getWholesalers,
    updateWholesaler
} from "../../controllers/wholesaler.controller.js";

const router = express.Router();


router.get('/wholesalers', getWholesalers);
router.post("/wholesalers", addWholesaler);
router.put("/wholesalers/:id", updateWholesaler);
router.delete("/wholesalers/:id", deleteWholesaler);

export default router;