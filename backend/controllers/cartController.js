import Product from "../models/Product.js";
import Cart from "../models/Cart.js";

// Get user's cart
export const getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({
            user: req.user.userid
        }).populate("items.product");

        if (!cart) {
            cart = await Cart.create({
                user: req.user.userid,
                items: []
            });
        }

        return res.status(200).json(cart);
    } catch (error) {
        console.error("Get cart error:", error);
        return res.status(500).json({
            message: "Failed to fetch cart"
        });
    }
};


// Add item to cart
export const addToCart = async (req, res) => {
    try {
        const {
            productId,
            size = "",
            color = ""
        } = req.body;

        const quantity = Number(req.body.quantity || 1);

        if (
            !productId ||
            !Number.isInteger(quantity) ||
            quantity < 1
        ) {
            return res.status(400).json({
                message: "Invalid product or quantity"
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        let cart = await Cart.findOne({
            user: req.user.userid
        });

        if (!cart) {
            cart = new Cart({
                user: req.user.userid,
                items: []
            });
        }

        const existingItem = cart.items.find(
            (item) =>
                item.product.toString() === productId &&
                item.size === size &&
                item.color === color
        );

        const requestedQuantity =
            (existingItem?.quantity || 0) + quantity;

        if (requestedQuantity > product.stock) {
            return res.status(400).json({
                message: `Only ${product.stock} item(s) of ${product.name} are available`
            });
        }

        if (existingItem) {
            existingItem.quantity = requestedQuantity;
        } else {
            cart.items.push({
                product: productId,
                quantity,
                size,
                color
            });
        }

        await cart.save();

        const updatedCart = await Cart.findById(cart._id)
            .populate("items.product");

        return res.status(200).json(updatedCart);
    } catch (error) {
        console.error("Add to cart error:", error);

        return res.status(500).json({
            message: "Failed to add item to cart"
        });
    }
};


// Update quantity / size / color
export const updateCartItem = async (req, res) => {
    try {
        const {
            productId,
            size = "",
            color = "",
            newSize,
            newColor
        } = req.body;

        const quantity = Number(req.body.quantity);

        if (!productId) {
            return res.status(400).json({
                message: "Product ID is required"
            });
        }

        const cart = await Cart.findOne({
            user: req.user.userid
        });

        if (!cart) {
            return res.status(404).json({
                message: "Cart not found"
            });
        }

        const itemIndex = cart.items.findIndex(
            (item) =>
                item.product.toString() === productId &&
                item.size === size &&
                item.color === color
        );

        if (itemIndex === -1) {
            return res.status(404).json({
                message: "Item not found in cart"
            });
        }

        const item = cart.items[itemIndex];

        // Remove item if quantity becomes zero
        if (quantity <= 0) {
            cart.items.splice(itemIndex, 1);

            await cart.save();

            const updatedCart = await Cart.findById(cart._id)
                .populate("items.product");

            return res.status(200).json(updatedCart);
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        if (quantity > product.stock) {
            return res.status(400).json({
                message: `Only ${product.stock} item(s) are available`
            });
        }

        const finalSize =
            typeof newSize === "string"
                ? newSize
                : item.size;

        const finalColor =
            typeof newColor === "string"
                ? newColor
                : item.color;

        /*
         * If changing size/color creates the same variant
         * as another cart item, merge the quantities.
         */
        const duplicateIndex = cart.items.findIndex(
            (otherItem, index) =>
                index !== itemIndex &&
                otherItem.product.toString() === productId &&
                otherItem.size === finalSize &&
                otherItem.color === finalColor
        );

        if (duplicateIndex !== -1) {
            const duplicateItem = cart.items[duplicateIndex];

            const combinedQuantity =
                duplicateItem.quantity + quantity;

            if (combinedQuantity > product.stock) {
                return res.status(400).json({
                    message: `Only ${product.stock} item(s) are available`
                });
            }

            duplicateItem.quantity = combinedQuantity;

            cart.items.splice(itemIndex, 1);
        } else {
            item.quantity = quantity;
            item.size = finalSize;
            item.color = finalColor;
        }

        await cart.save();

        const updatedCart = await Cart.findById(cart._id)
            .populate("items.product");

        return res.status(200).json(updatedCart);
    } catch (error) {
        console.error("Update cart error:", error);

        return res.status(500).json({
            message: "Failed to update cart"
        });
    }
};


// Remove item from cart
export const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;

        const size =
            typeof req.query.size === "string"
                ? req.query.size
                : "";

        const color =
            typeof req.query.color === "string"
                ? req.query.color
                : "";

        const cart = await Cart.findOne({
            user: req.user.userid
        });

        if (!cart) {
            return res.status(404).json({
                message: "Cart not found"
            });
        }

        const originalLength = cart.items.length;

        cart.items = cart.items.filter(
            (item) =>
                !(
                    item.product.toString() === productId &&
                    item.size === size &&
                    item.color === color
                )
        );

        if (cart.items.length === originalLength) {
            return res.status(404).json({
                message: "Item not found in cart"
            });
        }

        await cart.save();

        const updatedCart = await Cart.findById(cart._id)
            .populate("items.product");

        return res.status(200).json(updatedCart);
    } catch (error) {
        console.error("Remove cart item error:", error);

        return res.status(500).json({
            message: "Failed to remove item"
        });
    }
};


// Clear cart
export const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({
            user: req.user.userid
        });

        if (!cart) {
            return res.status(404).json({
                message: "Cart not found"
            });
        }

        cart.items = [];

        await cart.save();

        return res.status(200).json(cart);
    } catch (error) {
        console.error("Clear cart error:", error);

        return res.status(500).json({
            message: "Failed to clear cart"
        });
    }
};