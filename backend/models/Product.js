import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true
        },

        price: {
            type: Number,
            required: true,
            min: 0
        },

        category: {
            type: String,
            required: true,
            enum: [
                "T-Shirts",
                "Shirts",
                "Jeans",
                "Trousers",
                "Dresses",
                "Jackets",
                "Shoes",
                "Accessories"
            ]
        },

        subCategory: {
            type: String,
            default: ""
        },

        brand: {
            type: String,
            default: "VÉRA"
        },

        sizes: {
            type: [String],
            default: []
        },

        colors: {
            type: [String],
            default: []
        },

        style: {
            type: [String],
            default: []
        },

        occasion: {
            type: [String],
            default: []
        },

        material: {
            type: String,
            default: ""
        },

        stock: {
            type: Number,
            required: true,
            min: 0
        },

        images: {
            type: [String],
            default: []
        },

        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },

        reviewCount: {
            type: Number,
            default: 0
        },

        isFeatured: {
            type: Boolean,
            default: false
        },

        isTrending: {
            type: Boolean,
            default: false
        },

        isNewArrival: {
            type: Boolean,
            default: true
        },

        discountPercentage: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },

        tags: {
            type: [String],
            default: []
        }
    },
    {
        timestamps: true
    }
);

const Product = mongoose.model("Product", productSchema);

export default Product;