import express from 'express';
import {getFeaturedProducts, getNewProducts, getProducts} from "../../controllers/products.controller.js";

const router = express.Router();

router.get("/products", getFeaturedProducts);
router.get("/products/new", getNewProducts);
// router.get("/products/featured", getFeaturedProducts);

export default router;