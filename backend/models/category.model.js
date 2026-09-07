import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
      },
      image: {
        type: String,
        default: "",
      },
      description: {
        type: String,
        default: "",
      },
      order: {
        type: Number,
        default: 0,
      },
      other: {
        type: Boolean,
        default: false,
      },
    },
    { timestamps: true }
);

const Category = mongoose.model("Category", categorySchema);

export default Category;
