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
        unique: true
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
        default: "user", // or whatever default you want for NEW users
      },
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
