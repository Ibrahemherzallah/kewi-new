import express from 'express';
import {
    addProduct,
    deleteProduct,
    getProducts,
    getProductsByCategory, getProductsById, getRelatedProductsByCategory, incrementProductClicks,
    updateProduct
} from "../../controllers/products.controller.js";
import upload from "../../middleware/multerConfig.js";

const router = express.Router();

router.get('/products', getProducts);
router.get('/products/:id', getProductsById);
router.patch("/products/:id/click", incrementProductClicks);
router.get('/products/category/:categoryId', getProductsByCategory);
router.get('/related-products/category/:categoryId', getRelatedProductsByCategory);
router.post("/products", upload.array("images", 10), addProduct);
router.put("/products/:id", upload.array("images", 10), updateProduct);
router.delete("/products/:id", deleteProduct);

export default router;