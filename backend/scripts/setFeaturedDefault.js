// scripts/setUserRolesFromIsWholesaler.js
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../db/connectDB.js";
import User from "../models/users.model.js"; // adjust the path if needed

dotenv.config();

const run = async () => {
    try {
        await connectDB();
        console.log("Connected to DB");

        // 1) Set role = "wholesaler" where isWholesaler === true and role not set
        const wholesalersResult = await User.updateMany(
            {
                isWholesaler: true,
                $or: [{ role: { $exists: false } }, { role: null }],
            },
            { $set: { role: "wholesaler" } }
        );

        console.log("Wholesalers update:");
        console.log("  Matched:", wholesalersResult.matchedCount ?? wholesalersResult.n);
        console.log("  Modified:", wholesalersResult.modifiedCount ?? wholesalersResult.nModified);

        // 2) Set role = "admin" where isWholesaler === false and role not set
        const adminsResult = await User.updateMany(
            {
                isWholesaler: false,
                $or: [{ role: { $exists: false } }, { role: null }],
            },
            { $set: { role: "admin" } }
        );

        console.log("Admins update:");
        console.log("  Matched:", adminsResult.matchedCount ?? adminsResult.n);
        console.log("  Modified:", adminsResult.modifiedCount ?? adminsResult.nModified);

        console.log("Role migration done ✅");
    } catch (err) {
        console.error("Migration error:", err);
    } finally {
        await mongoose.connection.close();
        console.log("DB connection closed");
    }
};

run();
