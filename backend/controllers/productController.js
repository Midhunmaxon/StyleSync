import Product from "../models/Product.js";

const categoryImageFallback = {
    "T-Shirts": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85",
    "Shirts": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=85",
    "Jeans": "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=85",
    "Trousers": "https://images.unsplash.com/photo-1506629905607-d9b1e5d2a7c8?auto=format&fit=crop&w=900&q=85",
    "Dresses": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=85",
    "Jackets": "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=85",
    "Shoes": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85",
    "Accessories": "https://images.unsplash.com/photo-1523779917675-b6ed3a42a561?auto=format&fit=crop&w=900&q=85"
};



// ==========================================
// CREATE PRODUCT
// ==========================================

export const createProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            category,
            subCategory,
            brand,
            sizes,
            colors,
            style,
            occasion,
            material,
            stock,
            images,
            rating,
            reviewCount,
            isFeatured,
            isTrending,
            isNewArrival,
            discountPercentage,
            tags
        } = req.body;

        if (
            !name ||
            !description ||
            price === undefined ||
            !category ||
            stock === undefined
        ) {
            return res.status(400).json({
                message: "Please fill all required fields"
            });
        }

        const newProduct = new Product({
            name,
            description,
            price,
            category,
            subCategory,
            brand,
            sizes,
            colors,
            style,
            occasion,
            material,
            stock,
            images: Array.isArray(images) && images.length ? images : [categoryImageFallback[category] || categoryImageFallback["T-Shirts"]],
            rating,
            reviewCount,
            isFeatured,
            isTrending,
            isNewArrival,
            discountPercentage,
            tags
        });

        const savedProduct = await newProduct.save();

        return res.status(201).json({
            message: "Product created successfully",
            product: savedProduct
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to create product",
            error: error.message
        });
    }
};


// ==========================================
// GET ALL PRODUCTS
// ==========================================

export const getProducts = async (req, res) => {
    try {
        const products = await Product.find()
            .sort({ createdAt: -1 });

        return res.status(200).json({
            count: products.length,
            products
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch products",
            error: error.message
        });
    }
};


// ==========================================
// GET SINGLE PRODUCT
// ==========================================

export const getProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        return res.status(200).json(product);

    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch product",
            error: error.message
        });
    }
};


// ==========================================
// FILTER PRODUCTS
// ==========================================

export const filterProducts = async (req, res) => {
    try {

        const {
            category,
            minPrice,
            maxPrice,
            color,
            size,
            style,
            occasion
        } = req.query;


        // ------------------------------------------
        // BUILD FILTER OBJECT
        // ------------------------------------------

        const filter = {};


        // CATEGORY
        if (category) {
            filter.category = {
                $regex: `^${category}$`,
                $options: "i"
            };
        }


        // PRICE
        if (minPrice || maxPrice) {

            filter.price = {};

            if (minPrice) {
                filter.price.$gte = Number(minPrice);
            }

            if (maxPrice) {
                filter.price.$lte = Number(maxPrice);
            }
        }


        // COLOR
        if (color) {
            filter.colors = {
                $regex: color,
                $options: "i"
            };
        }


        // SIZE
        if (size) {
            filter.sizes = {
                $regex: `^${size}$`,
                $options: "i"
            };
        }


        // STYLE
        if (style) {
            filter.style = {
                $regex: style,
                $options: "i"
            };
        }


        // OCCASION
        if (occasion) {
            filter.occasion = {
                $regex: occasion,
                $options: "i"
            };
        }


        // ------------------------------------------
        // FIND PRODUCTS
        // ------------------------------------------

        const products = await Product.find(filter)
            .sort({
                rating: -1,
                createdAt: -1
            });


        return res.status(200).json({
            count: products.length,
            filters: req.query,
            products
        });

    } catch (error) {

        return res.status(500).json({
            message: "Product filtering failed",
            error: error.message
        });
    }
};


// ==========================================
// UPDATE PRODUCT
// ==========================================

export const updateProduct = async (req, res) => {
    try {

        const { id } = req.params;

        const updateData = { ...req.body };
        if (Array.isArray(updateData.images) && updateData.images.length === 0 && updateData.category) {
            updateData.images = [categoryImageFallback[updateData.category] || categoryImageFallback["T-Shirts"]];
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        );


        if (!updatedProduct) {
            return res.status(404).json({
                message: "Product not found"
            });
        }


        return res.status(200).json({
            message: "Product updated successfully",
            product: updatedProduct
        });

    } catch (error) {

        return res.status(500).json({
            message: "Failed to update product",
            error: error.message
        });
    }
};


// ==========================================
// DELETE PRODUCT
// ==========================================

export const deleteProduct = async (req, res) => {
    try {

        const { id } = req.params;

        const deletedProduct =
            await Product.findByIdAndDelete(id);


        if (!deletedProduct) {
            return res.status(404).json({
                message: "Product not found"
            });
        }


        return res.status(200).json({
            message: "Product deleted successfully"
        });

    } catch (error) {

        return res.status(500).json({
            message: "Failed to delete product",
            error: error.message
        });
    }
};


// ==========================================
// SEARCH PRODUCTS
// ==========================================

export const searchProducts = async (req, res) => {
    try {

        const { keyword } = req.query;


        if (!keyword) {
            return res.status(400).json({
                message: "Search keyword is required"
            });
        }


        const products = await Product.find({
            $or: [
                {
                    name: {
                        $regex: keyword,
                        $options: "i"
                    }
                },
                {
                    description: {
                        $regex: keyword,
                        $options: "i"
                    }
                },
                {
                    category: {
                        $regex: keyword,
                        $options: "i"
                    }
                },
                {
                    brand: {
                        $regex: keyword,
                        $options: "i"
                    }
                },
                {
                    tags: {
                        $regex: keyword,
                        $options: "i"
                    }
                }
            ]
        });


        return res.status(200).json({
            count: products.length,
            products
        });

    } catch (error) {

        return res.status(500).json({
            message: "Search failed",
            error: error.message
        });
    }
};


// ==========================================
// TRENDING PRODUCTS
// ==========================================

export const getTrendingProducts = async (req, res) => {
    try {

        const products = await Product.find({
            isTrending: true
        }).sort({
            rating: -1
        });


        return res.status(200).json({
            count: products.length,
            products
        });

    } catch (error) {

        return res.status(500).json({
            message: "Failed to fetch trending products",
            error: error.message
        });
    }
};


// ==========================================
// FEATURED PRODUCTS
// ==========================================

export const getFeaturedProducts = async (req, res) => {
    try {

        const products = await Product.find({
            isFeatured: true
        }).sort({
            createdAt: -1
        });


        return res.status(200).json({
            count: products.length,
            products
        });

    } catch (error) {

        return res.status(500).json({
            message: "Failed to fetch featured products",
            error: error.message
        });
    }
};