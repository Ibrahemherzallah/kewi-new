import express from 'express';
import {getUsers, getUserById, getMe, updateMe, getUserPurchases, markOrderDeliveredByUser, deleteUser} from '../../controllers/users.controller.js';
import {requireAdmin, requireAuth} from "../../middleware/authMiddleware.js";

const router = express.Router();

router.get('/users',requireAuth, requireAdmin, getUsers);
router.get('/users/:id',requireAuth, requireAdmin, getUserById);
router.get("/purchase/my", requireAuth, getUserPurchases);
router.patch("/purchase/:id/received", requireAuth, markOrderDeliveredByUser);
router.get("/me", requireAuth, getMe);
router.put("/me", requireAuth, updateMe);
router.delete("/users/:id",requireAuth, requireAdmin, deleteUser);
export default router;
