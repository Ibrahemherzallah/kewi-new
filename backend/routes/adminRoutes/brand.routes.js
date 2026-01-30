import express from "express";
import {
    addBrand,
    deleteBrand,
    getBrands,
    incrementBrandClick,
    updateBrand
} from "../../controllers/brands.controller.js";
import multer from "multer";

const storage = multer.memoryStorage(); // Stores files in memory
const upload = multer({ storage });

// Apply middleware to routes
const router = express.Router();

router.get('/brands', getBrands);
router.post("/brands", upload.array("image"), addBrand);
router.put("/brands/:id", upload.array("image"), updateBrand);
router.delete("/brands/:id", deleteBrand);
router.patch('/brands/:id/click', incrementBrandClick);


export default router;