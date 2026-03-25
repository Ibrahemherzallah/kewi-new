import express from 'express';
import {getAdminDashboardStats} from "../../controllers/adminDash.controller.js";
import {requireAdmin, requireAuth} from "../../middleware/authMiddleware.js";

const router = express.Router();

router.get("/dashboard-stats", requireAuth, requireAdmin, getAdminDashboardStats);
export default router;