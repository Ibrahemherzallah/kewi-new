import express from 'express';
import {getUsers, getUserById, getMe, updateMe} from '../../controllers/users.controller.js';
import {requireAuth} from "../../middleware/authMiddleware.js";

const router = express.Router();

router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.get("/me", requireAuth, getMe);
router.put("/me", requireAuth, updateMe);

export default router;
