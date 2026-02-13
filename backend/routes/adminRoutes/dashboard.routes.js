import express from 'express';
import {getAdminDashboardStats} from "../../controllers/adminDash.controller.js";
import {requireAuth} from "../../middleware/authMiddleware.js";

const router = express.Router();

router.get("/dashboard-stats", requireAuth, getAdminDashboardStats);
export default router;