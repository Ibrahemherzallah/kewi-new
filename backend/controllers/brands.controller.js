import Brand from "../models/brand.model.js";
import mongoose from "mongoose";
import {uploadBrandImage, uploadCategoryImage, uploadProductImages} from "../utils/firebaseService.js";
import User from "../models/users.model.js"; // Assuming same function works for brand images
import { bucket } from "../utils/firebaseConfig.js";
import Category from "../models/category.model.js";

export const getBrands = async (req, res) => {
    try {
        const brands = await Brand.find();
        res.status(200).json(brands);
    } catch (error) {
        console.error("Error fetching brands:", error);
        res.status(500).json({ error: error.message });
    }
};
export const incrementBrandClick = async (req, res) => {
    try {
        const brand = await Brand.findByIdAndUpdate(
            req.params.id,
            { $inc: { numOfClicks: 1 } },
            { new: true }
        );
        res.json(brand);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const addBrand = async (req, res) => {
    try {
        const { name } = req.body;
        const isFake = req.body.isFake === "true";
        const brand = await Brand.findOne({ name });
        if (brand) {
            console.log("brand exists");
            return res.status(400).json({ error: "brand exists" });
        }

        const newBrand = new Brand({
            name,
            isFake,
            image: ""
        });

        await newBrand.save();

        if (req.files && req.files.length > 0) {
            const imageUrl = await uploadBrandImage(req.files[0]); // Upload the first image
            newBrand.image = imageUrl;
            await newBrand.save();
        }

        res.status(201).json(newBrand);
        console.log("Brand stored successfully");
    } catch (e) {
        console.error("Error:", e.message);
        res.status(500).json({ error: e.message });
    }
};

export const updateBrand = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid brand ID format" });
        }


        const { name, isFake } = req.body;

        // Check if another brand already uses the same name
        const existingBrand = await Brand.findOne({ name });
        if (existingBrand && existingBrand._id.toString() !== id) {
            return res.status(400).json({ error: "Brand name already exists" });
        }


        const updatedData = {
            name: req.body.name,
            isFake: req.body.isFake
        };
        if (req.files && req.files[0]) {
            const imageUrl = await uploadBrandImage(req.files[0]); // Ensure we send only the first file
            updatedData.image = imageUrl;
        }

        const updatedBrand = await Brand.findByIdAndUpdate(id, updatedData, { new: true });

        if (!updatedBrand) {
            return res.status(404).json({ message: "Brand not found" });
        }

        res.status(200).json(updatedBrand);
    } catch (error) {
        console.error("Error updating brand:", error);
        res.status(500).json({ error: error.message });
    }
};

const extractPathFromUrl = (url) => {
    const baseUrl = "https://storage.googleapis.com/fitrack-efd01.appspot.com/";
    if (url.startsWith(baseUrl)) {
        return url.replace(baseUrl, "").split("?")[0];
    }
    return null;
};

export const deleteBrand = async (req, res) => {
    try {
        const { id } = req.params;

        const brand = await Brand.findById(id);
        if (!brand) {
            return res.status(404).json({ message: "Category not found" });
        }

        // Delete image from Firebase Storage
        const filePath = extractPathFromUrl(brand.image);
        if (filePath) {
            try {
                await bucket.file(filePath).delete();
                console.log(`Category image deleted from Firebase: ${filePath}`);
            } catch (err) {
                console.error(`Failed to delete category image from Firebase:`, err.message);
            }
        }

        // Now delete the category document from MongoDB
        await Brand.findByIdAndDelete(id);

        res.status(200).json({ message: "Category and image deleted successfully" });
    } catch (error) {
        console.error("Error deleting Category:", error.message);
        res.status(500).json({ error: error.message });
    }
};