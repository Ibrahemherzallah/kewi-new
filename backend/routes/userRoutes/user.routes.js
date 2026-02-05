import express from 'express';
import {
    getUsers,
    getUserById,
    getMe,
    updateMe,
    getUserPurchases,
    markOrderDeliveredByUser
} from '../../controllers/users.controller.js';
import {requireAuth} from "../../middleware/authMiddleware.js";

const router = express.Router();

router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.get("/purchase/my", requireAuth, getUserPurchases);
router.patch("/purchase/:id/received", requireAuth, markOrderDeliveredByUser);
router.get("/me", requireAuth, getMe);
router.put("/me", requireAuth, updateMe);

export default router;
