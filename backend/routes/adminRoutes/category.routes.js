import express from "express";
import {addCategory, deleteCategory, getCategories, updateCategory} from "../../controllers/categories.controller.js";
import multer from "multer";
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();


router.get('/categories', getCategories);
router.post("/categories", upload.array("image"), addCategory);
router.put('/categories/:id', upload.array("image"), updateCategory);
router.delete("/categories/:id", deleteCategory);

export default router;