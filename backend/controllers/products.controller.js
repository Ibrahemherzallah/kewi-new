import Product from "../models/product.model.js";
import mongoose from "mongoose";
import {uploadBrandImage, uploadProductImages} from '../utils/firebaseService.js';
import { bucket } from "../utils/firebaseConfig.js";

export const getProducts = async (req, res) => {
    try {
        const products = await Product.find()
            .populate('categoryId')
            .populate('brandId');

        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getFeaturedProducts = async (req, res) => {
    try {
        const products = await Product.find({ featured: true })
            .populate("categoryId")
            .populate("brandId");

        res.json(products);
    } catch (error) {
        console.error("Error fetching featured products:", error);
        res.status(500).json({ error: error.message });
    }
};

export const getProductsById = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id)
            .populate('categoryId')
            .populate('brandId');

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getProductsByCategory = async (req, res) => {
    const { categoryId } = req.params;
    if(categoryId === '6804dfd569ff9ce587677f0c') {
        try {
            const products = await Product.find({ isSoon: true })
                .populate('categoryId')
                .populate('brandId');

            res.json(products);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    else {
        try {
            const products = await Product.find({ categoryId })
                .populate('categoryId')
                .populate('brandId');

            // Randomize (Fisher–Yates shuffle is better than sort(() => Math.random() - 0.5))
            for (let i = products.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [products[i], products[j]] = [products[j], products[i]];
            }

            res.json(products);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

export const getRelatedProductsByCategory = async (req, res) => {
    const { categoryId } = req.params;
    const { excludeId } = req.query;

    try {
        const products = await Product.aggregate([
            {
                $match: {
                    categoryId: new mongoose.Types.ObjectId(categoryId),
                    _id: { $ne: new mongoose.Types.ObjectId(excludeId) }
                }
            },
            { $sample: { size: 4 } } // Pick 4 random docs
        ]);

        // If you still want populated fields (brandId, categoryId), do a second populate step
        await Product.populate(products, [{ path: "categoryId" }, { path: "brandId" }]);

        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getNewestProducts = async (req, res) => {
    try {
        const products = await Product.find()
            .sort({ createdAt: -1 }) // Newest first
            .limit(8)
            .populate('categoryId')
            .populate('brandId');

        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const addProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            id,                 // product ID from admin
            categoryId,
            brandId,
            gender,
            size,
            color,
            customerPrice,
            wholesalerPrice,
            stockNumber,
            isSoldOut = false,
            isOnSale = false,
            isSoon = false,
            salePrice,
            numOfClicks = 0,
            images,             // array or JSON string of image URLs
            image,              // sometimes single or array, older payloads
            isMultiColor,       // 👈 NEW
            variants,           // 👈 NEW: can be array or JSON string
        } = req.body;

        // helper for booleans (string or real boolean)
        const toBool = (val) => val === true || val === "true";

        // ----------------------------
        // Normalise multi-color flag
        // ----------------------------
        const multiColorFlag = toBool(isMultiColor);
        let normalizedVariants = [];

        if (multiColorFlag && variants) {
            let raw = variants;

            // variants might be a JSON string or an array
            if (typeof raw === "string") {
                try {
                    raw = JSON.parse(raw);
                } catch (err) {
                    console.warn("Failed to parse variants JSON:", err.message);
                    raw = [];
                }
            }

            if (Array.isArray(raw)) {
                normalizedVariants = raw
                    .map((v) => ({
                        color: v.color || "",
                        stockNumber: Number(v.stockNumber || 0),
                        image: v.image || "",
                    }))
                    // only keep valid ones
                    .filter((v) => v.color && v.stockNumber > 0 && v.image);
            }
        }

        // If multi-color and we have valid variants, stock = sum of variants
        const finalStockNumber =
            multiColorFlag && normalizedVariants.length > 0
                ? normalizedVariants.reduce((sum, v) => sum + v.stockNumber, 0)
                : stockNumber
                    ? Number(stockNumber)
                    : 0;

        // -----------------------------------
        // Base product data (no images yet)
        // -----------------------------------
        const productData = {
            name: name || "",
            description: description || "",
            id: id || "",
            stockNumber: finalStockNumber,

            categoryId: mongoose.Types.ObjectId.isValid(categoryId)
                ? new mongoose.Types.ObjectId(categoryId)
                : null,

            brandId: mongoose.Types.ObjectId.isValid(brandId)
                ? new mongoose.Types.ObjectId(brandId)
                : null,

            gender: gender || null,
            size: size || null,

            // single-color uses this, multi-color uses variants instead
            color: multiColorFlag ? null : color || "",

            customerPrice: customerPrice ? Number(customerPrice) : 0,
            wholesalerPrice: wholesalerPrice ? Number(wholesalerPrice) : 0,
            salePrice: salePrice ? Number(salePrice) : null,

            isSoldOut: toBool(isSoldOut),
            isOnSale: toBool(isOnSale),
            isSoon: toBool(isSoon),

            numOfClicks: Number(numOfClicks) || 0,
            featured: false,          // still default false

            // 👇 NEW FIELDS
            isMultiColor: multiColorFlag,
            variants: normalizedVariants,

            image: [],                // we'll fill below
        };

        console.log("productData before images:", productData);

        const newProduct = new Product(productData);

        // -----------------------------------
        // Resolve image URLs
        // -----------------------------------
        let imageUrls = [];

        if (images || image) {
            // from payload: images / image (array / JSON / string)
            let raw = images ?? image;

            if (Array.isArray(raw)) {
                imageUrls = raw;
            } else if (typeof raw === "string") {
                try {
                    const parsed = JSON.parse(raw);
                    imageUrls = Array.isArray(parsed) ? parsed : [parsed];
                } catch {
                    imageUrls = [raw];
                }
            }
        } else if (multiColorFlag && normalizedVariants.length > 0) {
            // if multi-color & no explicit images field, use variant images
            imageUrls = normalizedVariants
                .map((v) => v.image)
                .filter((url) => !!url);
        } else if (req.files && req.files.length > 0) {
            // legacy flow: uploaded files via this endpoint
            imageUrls = await uploadProductImages(
                req.files,
                newProduct._id.toString()
            );
        }

        newProduct.image = imageUrls;
        await newProduct.save();

        res.status(201).json(newProduct);
        console.log("Product and images stored successfully");
    } catch (e) {
        console.error("Error:", e.message);
        res.status(500).json({ error: e.message });
    }
};


export const incrementProductClicks = async (req, res) => {
    try {
        const { id } = req.params; // productId from URL
        const product = await Product.findByIdAndUpdate(
            id,
            { $inc: { numOfClicks: 1 } }, // increment
            { new: true } // return updated document
        );

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json({ message: "Clicks incremented", product });
    } catch (error) {
        console.error("Error incrementing clicks:", error);
        res.status(500).json({ message: "Server error" });
    }
};


export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid product ID format" });
        }

        const existingProduct = await Product.findById(id);
        if (!existingProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        // -----------------------------
        // Helpers
        // -----------------------------
        const toBool = (val, fallback) => {
            if (val === undefined || val === null) return fallback;
            if (typeof val === "boolean") return val;
            if (typeof val === "string") return val === "true";
            return fallback;
        };

        // normalize brandId / categoryId whether they arrive as string or object
        const rawBrandId = req.body.brandId?.id || req.body.brandId || existingProduct.brandId;
        const rawCategoryId =
            req.body.categoryId?.id || req.body.categoryId || existingProduct.categoryId;

        const brandId = mongoose.Types.ObjectId.isValid(rawBrandId)
            ? new mongoose.Types.ObjectId(rawBrandId)
            : existingProduct.brandId;

        const categoryId = mongoose.Types.ObjectId.isValid(rawCategoryId)
            ? new mongoose.Types.ObjectId(rawCategoryId)
            : existingProduct.categoryId;

        // -----------------------------
        // Images (JSON, string, or files)
        // -----------------------------
        let imageUrls; // undefined means "keep existingProduct.image"

        if (req.body.images || req.body.image) {
            let raw = req.body.images ?? req.body.image;

            if (Array.isArray(raw)) {
                imageUrls = raw;
            } else if (typeof raw === "string") {
                try {
                    const parsed = JSON.parse(raw);
                    imageUrls = Array.isArray(parsed) ? parsed : [parsed];
                } catch {
                    imageUrls = [raw];
                }
            }
        } else if (req.files && req.files.length > 0) {
            // legacy flow: files uploaded directly to API
            imageUrls = await uploadProductImages(req.files, id);
        }

        // -----------------------------
        // Multi-color / variants
        // -----------------------------
        const isMultiColor = toBool(req.body.isMultiColor, existingProduct.isMultiColor || false);

        let variants = existingProduct.variants || [];
        let stockNumber =
            req.body.stockNumber !== undefined
                ? Number(req.body.stockNumber)
                : existingProduct.stockNumber;

        if (isMultiColor && Array.isArray(req.body.variants)) {
            // FE sends variants as array of { color, stockNumber, image }
            variants = req.body.variants.map((v) => ({
                color: v.color || "",
                stockNumber: Number(v.stockNumber) || 0,
                image: v.image || "",
            }));

            // recompute total stock from variants for safety
            stockNumber = variants.reduce((sum, v) => sum + (v.stockNumber || 0), 0);

            // if images not explicitly sent, derive them from variants
            if (!imageUrls) {
                imageUrls = variants.map((v) => v.image).filter(Boolean);
            }
        }

        // -----------------------------
        // Status flags (single choice from FE)
        // -----------------------------
        const isSoldOut = toBool(req.body.isSoldOut, existingProduct.isSoldOut);
        const isOnSale = toBool(req.body.isOnSale, existingProduct.isOnSale);
        const isSoon = toBool(req.body.isSoon, existingProduct.isSoon);

        // -----------------------------
        // Build updated data
        // -----------------------------
        const updatedData = {
            name: req.body.name ?? existingProduct.name,
            description: req.body.description ?? existingProduct.description,
            id: req.body.id ?? existingProduct.id,

            stockNumber,
            categoryId,
            brandId,

            gender: req.body.gender ?? existingProduct.gender,
            size: req.body.size ?? existingProduct.size,
            // if multi-color we store color per variant, so main color can be null
            color: isMultiColor ? null : req.body.color ?? existingProduct.color,

            customerPrice:
                req.body.customerPrice !== undefined
                    ? Number(req.body.customerPrice)
                    : existingProduct.customerPrice,
            wholesalerPrice:
                req.body.wholesalerPrice !== undefined
                    ? Number(req.body.wholesalerPrice)
                    : existingProduct.wholesalerPrice,
            salePrice:
                req.body.salePrice !== undefined
                    ? Number(req.body.salePrice)
                    : existingProduct.salePrice,

            isSoldOut,
            isOnSale,
            isSoon,
            featured: req.body.featured ?? existingProduct.featured,

            isMultiColor,
            variants,

            // if we computed new images, use them, otherwise keep existing
            image: imageUrls || existingProduct.image,
        };

        const updatedProduct = await Product.findByIdAndUpdate(id, updatedData, {
            new: true,
        });

        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json(updatedProduct);
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ error: error.message });
    }
};

export const extractPathFromUrl = (url) => {
    try {
        const decodedUrl = decodeURIComponent(url);
        const matches = decodedUrl.match(/\/o\/(.*?)\?alt=media/);
        if (matches && matches[1]) {
            return matches[1]; // This is the path inside the bucket
        }
    } catch (err) {
        console.error("Failed to extract path:", err.message);
    }
    return null;
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ message: "Product not found" });


        // Delete product from DB
        await Product.findByIdAndDelete(id);

        res.status(200).json({ message: "Product and images deleted successfully" });
    } catch (error) {
        console.error("Error deleting product:", error.message);
        res.status(500).json({ error: error.message });
    }
};