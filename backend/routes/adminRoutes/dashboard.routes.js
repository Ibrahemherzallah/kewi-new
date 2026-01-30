import express from 'express';
import {adminDashboard} from "../../controllers/adminDash.controller.js";
import {checkAuth} from "../../middleware/checkAuth.js";

const router = express.Router();

router.get("/dashboard", checkAuth, adminDashboard);
export default router;