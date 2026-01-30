import Category from "../models/category.model.js";
import {uploadBrandImage, uploadCategoryImage, uploadProductImages} from "../utils/firebaseService.js";
import Product from "../models/product.model.js";
import mongoose from "mongoose";
import Brand from "../models/brand.model.js";
import { bucket } from "../utils/firebaseConfig.js";

export const addCategory = async (req, res) => {
    try {
        const { name, description, other } = req.body;

        const category = await Category.findOne({ name });
        if (category) {
            return res.status(400).json({ error: "category exists" });
        }

        const newCategory = new Category({
            name,
            description,
            image: "",
            other: other ?? false, // handle if not provided
        });

        await newCategory.save();

        if (req.files && req.files.length > 0) {
            const imageUrl = await uploadCategoryImage(req.files[0]);
            newCategory.image = imageUrl;
            await newCategory.save();
        }

        res.status(201).json(newCategory);
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: err.message });
    }
};

export const getCategories = async (req, res) => {
    try {
        const category = await Category.find();
        res.status(200).json(category);
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ error: error.message });
    }
}

export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid category ID format" });
        }

        const { name, description, other } = req.body;

        const existingCategory = await Category.findOne({ name });
        if (existingCategory && existingCategory._id.toString() !== id) {
            return res.status(400).json({ error: "Category name already exists" });
        }

        const updatedData = {
            name,
            description,
            other, // include the new boolean field
        };

        if (req.files && req.files[0]) {
            const imageUrl = await uploadCategoryImage(req.files[0]);
            updatedData.image = imageUrl;
        }

        const updatedCategory = await Category.findByIdAndUpdate(id, updatedData, {
            new: true,
        });

        if (!updatedCategory) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json(updatedCategory);
    } catch (error) {
        console.error("Error updating Category:", error);
        res.status(500).json({ error: error.message });
    }
}

const extractPathFromUrl = (url) => {
    const baseUrl = "https://storage.googleapis.com/fitrack-efd01.appspot.com/";
    if (url.startsWith(baseUrl)) {
        return url.replace(baseUrl, "").split("?")[0];
    }
    return null;
};

export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        // Delete image from Firebase Storage
        const filePath = extractPathFromUrl(category.image);
        if (filePath) {
            try {
                await bucket.file(filePath).delete();
                console.log(`Category image deleted from Firebase: ${filePath}`);
            } catch (err) {
                console.error(`Failed to delete category image from Firebase:`, err.message);
            }
        }

        // Now delete the category document from MongoDB
        await Category.findByIdAndDelete(id);

        res.status(200).json({ message: "Category and image deleted successfully" });
    } catch (error) {
        console.error("Error deleting Category:", error.message);
        res.status(500).json({ error: error.message });
    }
};