import express from 'express';
import {getFeaturedProducts, getProducts} from "../../controllers/products.controller.js";

const router = express.Router();

router.get("/products", getFeaturedProducts);
// router.get("/products/featured", getFeaturedProducts);

export default router;