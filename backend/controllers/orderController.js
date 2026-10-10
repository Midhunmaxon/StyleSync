import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";

const makeOrderNumber = () =>
    `STY-${Date.now().toString().slice(-7)}-${Math.floor(
        100 + Math.random() * 900
    )}`;

/* =========================
   CREATE ORDER
========================= */
const createOrder = async (req, res) => {
    try {
        const {
            source = "cart",
            productId,
            quantity = 1,
            size = "",
            color = "",
            shippingAddress
        } = req.body;

        // Validate delivery details
        if (
            !shippingAddress?.name ||
            !shippingAddress?.phone ||
            !shippingAddress?.address ||
            !shippingAddress?.city ||
            !shippingAddress?.state ||
            !shippingAddress?.pincode
        ) {
            return res.status(400).json({
                message: "Complete delivery details are required"
            });
        }

        let requestedItems = [];

        /* =========================
           DIRECT PURCHASE
        ========================= */
        if (source === "direct") {
            if (!productId || !mongoose.isValidObjectId(productId)) {
                return res.status(400).json({
                    message: "Invalid product"
                });
            }

            requestedItems = [
                {
                    productId,
                    quantity: Number(quantity),
                    size,
                    color
                }
            ];
        }

        /* =========================
           CART PURCHASE
        ========================= */
        else {
            const cart = await Cart.findOne({
                user: req.user.userid
            }).lean();

            if (!cart || !cart.items || !cart.items.length) {
                return res.status(400).json({
                    message: "Your cart is empty"
                });
            }

            requestedItems = cart.items.map((item) => ({
                productId: item.product,
                quantity: item.quantity,
                size: item.size || "",
                color: item.color || ""
            }));
        }

        /* =========================
           GET PRODUCTS
        ========================= */
        const productIds = requestedItems.map(
            (item) => item.productId
        );

        const products = await Product.find({
            _id: { $in: productIds }
        });

        const productMap = new Map(
            products.map((product) => [
                product._id.toString(),
                product
            ])
        );

        const orderItems = [];

        /* =========================
           VALIDATE PRODUCTS
        ========================= */
        for (const requested of requestedItems) {
            const product = productMap.get(
                requested.productId.toString()
            );

            const qty = Number(requested.quantity);

            if (!product) {
                return res.status(404).json({
                    message: "One of the products no longer exists"
                });
            }

            if (!Number.isInteger(qty) || qty < 1) {
                return res.status(400).json({
                    message: "Invalid quantity"
                });
            }

            if (product.stock < qty) {
                return res.status(400).json({
                    message: `${product.name} has only ${product.stock} item(s) left`
                });
            }

            // Product image is mandatory
            const productImage = product.images?.[0];

            if (!productImage) {
                return res.status(400).json({
                    message: `${product.name} does not have a product image`
                });
            }

            orderItems.push({
                product: product._id,
                name: product.name,
                image: productImage,
                price: product.price,
                quantity: qty,
                size: requested.size || "",
                color: requested.color || ""
            });
        }

        /* =========================
           CALCULATE TOTAL
        ========================= */
        const subtotal = orderItems.reduce(
            (sum, item) =>
                sum + item.price * item.quantity,
            0
        );

        const shipping = subtotal >= 3000 ? 0 : 99;

        const totalAmount = subtotal + shipping;

        /* =========================
           REDUCE STOCK
        ========================= */
        for (const item of orderItems) {
            await Product.findByIdAndUpdate(
                item.product,
                {
                    $inc: {
                        stock: -item.quantity
                    }
                }
            );
        }

        /* =========================
           CREATE ORDER
        ========================= */
        const order = await Order.create({
            orderNumber: makeOrderNumber(),

            user: req.user.userid,

            items: orderItems,

            subtotal,

            shipping,

            totalAmount,

            shippingAddress: {
                name: shippingAddress.name,
                phone: shippingAddress.phone,
                address: shippingAddress.address,
                city: shippingAddress.city,
                state: shippingAddress.state,
                pincode: shippingAddress.pincode
            },

            paymentMethod: "Cash on Delivery",

            paymentStatus: "Pending",

            status: "Order Placed",

            cancellationReason: "",

            cancelledAt: null
        });

        /*
         * IMPORTANT:
         * We intentionally DO NOT clear the cart.
         *
         * The customer requested that the cart
         * should remain unchanged after ordering.
         */

        return res.status(201).json({
            success: true,
            message: "Order placed successfully",
            order
        });

    } catch (error) {
        console.error("Create order error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to place order",
            error: error.message
        });
    }
};


/* =========================
   GET MY ORDERS
========================= */
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            user: req.user.userid
        }).sort({
            createdAt: -1
        });

        return res.status(200).json({
            success: true,
            orders
        });

    } catch (error) {
        console.error("Get my orders error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to load your orders"
        });
    }
};


/* =========================
   GET SINGLE ORDER
========================= */
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user.userid
        });

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        return res.status(200).json({
            success: true,
            order
        });

    } catch (error) {
        console.error("Get order error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to load order"
        });
    }
};


/* =========================
   ADMIN - GET ALL ORDERS
========================= */
const getAllOrders = async (_req, res) => {
    try {
        const orders = await Order.find()
            .populate(
                "user",
                "name email"
            )
            .sort({
                createdAt: -1
            });

        return res.status(200).json({
            success: true,
            orders
        });

    } catch (error) {
        console.error("Get all orders error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to load orders"
        });
    }
};


/* =========================
   ADMIN - UPDATE ORDER STATUS
========================= */
const updateOrderStatus = async (req, res) => {
    try {
        const allowedStatuses = [
            "Order Placed",
            "Processing",
            "Shipped",
            "Delivered",
            "Cancelled"
        ];

        const { status, cancellationReason } = req.body;

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid order status"
            });
        }

        const order = await Order.findById(
            req.params.id
        );

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        /* =========================
           CANCEL ORDER
        ========================= */
        if (status === "Cancelled") {

            if (!cancellationReason?.trim()) {
                return res.status(400).json({
                    message: "Cancellation reason is required"
                });
            }

            order.status = "Cancelled";

            order.cancellationReason =
                cancellationReason.trim();

            order.cancelledAt = new Date();
        }

        /* =========================
           NORMAL STATUS UPDATE
        ========================= */
        else {
            order.status = status;

            // Clear cancellation information
            // if order is moved back to an active status.
            order.cancellationReason = "";
            order.cancelledAt = null;
        }

        await order.save();

        return res.status(200).json({
            success: true,
            message:
                status === "Cancelled"
                    ? "Order cancelled successfully"
                    : "Order status updated successfully",
            order
        });

    } catch (error) {
        console.error(
            "Update order status error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to update order status",
            error: error.message
        });
    }
};


export {
    createOrder,
    getMyOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus
};