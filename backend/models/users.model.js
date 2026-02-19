import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        userName: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
            minlength: 10,
            unique: true,
        },
        address: {
            type: String,
            required: false,
        },
        isWholesaler: {
            type: Boolean,
            required: true,
        },
        dob: {
            type: Date,
            required: false,
        },
        role: {
            type: String,
            enum: ["admin", "user", "wholesaler"],
            default: "user",
        },

        // 🆕 order history: list of purchases
        orderHistory: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Purchase",
            },
        ],
        loyaltyPoints: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
