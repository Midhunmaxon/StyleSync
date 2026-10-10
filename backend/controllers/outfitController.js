import Product from "../models/Product.js";

export const getCompleteLook = async (req, res) => {
    try {
        const {
            style,
            occasion,
            maxPrice
        } = req.query;

        // Validate required inputs
        if (!style || !occasion) {
            return res.status(400).json({
                message: "Style and occasion are required"
            });
        }

        // Convert budget into a number if provided
        const budget = maxPrice ? Number(maxPrice) : Infinity;

        // Find suitable products
        const products = await Product.find({
            style: {
                $regex: style,
                $options: "i"
            },
            occasion: {
                $regex: occasion,
                $options: "i"
            },
            stock: {
                $gt: 0
            }
        });

        // Separate products by category
        const tops = products.filter(product =>
            ["T-Shirts", "Shirts"].includes(product.category)
        );

        const bottoms = products.filter(product =>
            ["Jeans", "Trousers"].includes(product.category)
        );

        const shoes = products.filter(product =>
            product.category === "Shoes"
        );

        // Check whether we have enough products
        if (
            tops.length === 0 ||
            bottoms.length === 0 ||
            shoes.length === 0
        ) {
            return res.status(404).json({
                message: "Could not find enough products to create a complete look",
                available: {
                    tops: tops.length,
                    bottoms: bottoms.length,
                    shoes: shoes.length
                }
            });
        }

        // Create outfit combinations
        const outfits = [];

        for (const top of tops) {
            for (const bottom of bottoms) {
                for (const shoe of shoes) {

                    const totalPrice =
                        top.price +
                        bottom.price +
                        shoe.price;

                    // Only include outfits within budget
                    if (totalPrice <= budget) {
                        outfits.push({
                            top,
                            bottom,
                            shoes: shoe,
                            totalPrice
                        });
                    }
                }
            }
        }

        // No outfit within budget
        if (outfits.length === 0) {
            return res.status(404).json({
                message: "No complete look found within your budget"
            });
        }

        // Sort by rating
        outfits.sort((a, b) => {
            const ratingA =
                (a.top.rating + a.bottom.rating + a.shoes.rating) / 3;

            const ratingB =
                (b.top.rating + b.bottom.rating + b.shoes.rating) / 3;

            return ratingB - ratingA;
        });

        return res.status(200).json({
            message: "Complete looks generated successfully",
            count: outfits.length,
            request: {
                style,
                occasion,
                maxPrice: maxPrice || "No limit"
            },
            outfits
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to generate complete look",
            error: error.message
        });
    }
};