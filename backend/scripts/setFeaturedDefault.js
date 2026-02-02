// scripts/setFeaturedDefault.js
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../db/connectDB.js";
import Product from "../models/product.model.js"; // adjust path to your Product model

dotenv.config();

const run = async () => {
    try {
        await connectDB();

        // Update only products that DON'T have "featured" field yet
        const result = await Product.updateMany(
            { featured: { $exists: false } },
            { $set: { featured: false } }
        );

        console.log("Migration done. Matched:", result.matchedCount || result.n);
        console.log("Modified:", result.modifiedCount || result.nModified);
    } catch (err) {
        console.error("Migration error:", err);
    } finally {
        await mongoose.connection.close();
        console.log("DB connection closed");
    }
};

run();
