import express from 'express';
import {
    addProduct,
    deleteProduct, getDiscountProducts,
    getProducts,
    getProductsByCategory, getProductsById, getRelatedProductsByCategory, incrementProductClicks,
    updateProduct
} from "../../controllers/products.controller.js";
import upload from "../../middleware/multerConfig.js";
import {requireAdmin, requireAuth} from "../../middleware/authMiddleware.js";

const router = express.Router();

router.get('/products', getProducts);
router.get("/products/discount", getDiscountProducts );
router.get('/products/:id', getProductsById);
router.patch("/products/:id/click", incrementProductClicks);
router.get('/products/category/:categoryId', getProductsByCategory);
router.get('/related-products/category/:categoryId', getRelatedProductsByCategory);
router.post("/products",requireAuth, requireAdmin, upload.array("images", 10), addProduct);
router.put("/products/:id",requireAuth, requireAdmin, upload.array("images", 10), updateProduct);
router.get("/products/discount",requireAuth, requireAdmin, upload.array("images", 10), updateProduct);
router.delete("/products/:id",requireAuth, requireAdmin, deleteProduct);

export default router;