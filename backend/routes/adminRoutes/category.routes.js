import express from "express";
import {
    addCategory,
    deleteCategory,
    getCategories,
    reorderCategories,
    updateCategory
} from "../../controllers/categories.controller.js";
import multer from "multer";
import {requireAdmin, requireAuth} from "../../middleware/authMiddleware.js";
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();


router.get('/categories', getCategories);
router.put("/categories/reorder",requireAuth, requireAdmin, reorderCategories);
router.post("/categories",requireAuth, requireAdmin, upload.array("image"), addCategory);
router.put('/categories/:id',requireAuth, requireAdmin, upload.array("image"), updateCategory);
router.delete("/categories/:id",requireAuth, requireAdmin, deleteCategory);

export default router;