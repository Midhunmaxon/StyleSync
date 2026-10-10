import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Minus,
    Plus,
    Trash2,
    ShoppingBag,
    ChevronDown
} from "lucide-react";
import { apiFetch } from "../services/api.js";
import { getProductImage } from "../utils/productImage.js";
import "./Cart.css";

const Cart = () => {
    const navigate = useNavigate();

    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingItem, setUpdatingItem] = useState(null);

    const fetchCart = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await apiFetch("/api/cart");
            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to fetch cart"
                );
            }

            setCart(data.items || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);


    const updateQuantity = async (item, quantity) => {
        const key = `${item.product._id}-${item.size}-${item.color}`;

        try {
            setUpdatingItem(key);

            const response = await apiFetch(
                "/api/cart/update",
                {
                    method: "PUT",
                    body: JSON.stringify({
                        productId: item.product._id,
                        quantity,
                        size: item.size || "",
                        color: item.color || ""
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to update cart"
                );
            }

            setCart(data.items || []);
        } catch (err) {
            alert(err.message);
        } finally {
            setUpdatingItem(null);
        }
    };


    const updateVariant = async (
        item,
        newSize,
        newColor
    ) => {
        const key = `${item.product._id}-${item.size}-${item.color}`;

        try {
            setUpdatingItem(key);

            const response = await apiFetch(
                "/api/cart/update",
                {
                    method: "PUT",
                    body: JSON.stringify({
                        productId: item.product._id,
                        quantity: item.quantity,
                        size: item.size || "",
                        color: item.color || "",
                        newSize,
                        newColor
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to update product options"
                );
            }

            setCart(data.items || []);
        } catch (err) {
            alert(err.message);
        } finally {
            setUpdatingItem(null);
        }
    };


    const removeItem = async (item) => {
    const key = `${item.product._id}-${item.size}-${item.color}`;

    try {
        setUpdatingItem(key);

        const params = new URLSearchParams();

        params.set("size", item.size || "");
        params.set("color", item.color || "");

        const response = await apiFetch(
            `/api/cart/remove/${item.product._id}?${params.toString()}`,
            {
                method: "DELETE"
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to remove item"
            );
        }

        setCart(data.items || []);
    } catch (err) {
        alert(err.message);
    } finally {
        setUpdatingItem(null);
    }
};


    const clearCart = async () => {
        if (!window.confirm("Clear all items from your cart?")) {
            return;
        }

        try {
            const response = await apiFetch(
                "/api/cart/clear",
                {
                    method: "DELETE"
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to clear cart"
                );
            }

            setCart([]);
        } catch (err) {
            alert(err.message);
        }
    };


    const subtotal = useMemo(
        () =>
            cart.reduce(
                (sum, item) =>
                    sum +
                    item.product.price *
                    item.quantity,
                0
            ),
        [cart]
    );

    const shipping =
        subtotal === 0
            ? 0
            : subtotal >= 3000
                ? 0
                : 99;

    const total = subtotal + shipping;

    const itemCount = cart.reduce(
        (sum, item) => sum + item.quantity,
        0
    );


    if (loading) {
        return (
            <div className="cart-page">
                <main className="cart-state">
                    <div className="cart-loader" />
                    <p>Loading your cart...</p>
                </main>
            </div>
        );
    }


    if (error) {
        return (
            <div className="cart-page">
                <main className="cart-state">
                    <h1>Unable to load cart</h1>
                    <p>{error}</p>

                    <button
                        className="continue-shopping-button"
                        onClick={fetchCart}
                    >
                        TRY AGAIN
                    </button>
                </main>
            </div>
        );
    }


    if (!cart.length) {
        return (
            <div className="cart-page">

                <header className="cart-header">
                    <button
                        className="cart-back-button"
                        onClick={() =>
                            navigate("/products")
                        }
                    >
                        ← Shop
                    </button>

                    <strong
                        className="cart-brand"
                        onClick={() => navigate("/")}
                    >
                        STYLESYNC
                    </strong>

                    <span />
                </header>

                <main className="empty-cart">

                    <div className="empty-cart-icon">
                        <ShoppingBag size={46} strokeWidth={1.3} />
                    </div>

                    <p className="empty-cart-eyebrow">
                        YOUR COLLECTION
                    </p>

                    <h1>Your cart is empty</h1>

                    <p>
                        Discover something you'll love
                        and add it to your StyleSync
                        collection.
                    </p>

                    <button
                        className="continue-shopping-button"
                        onClick={() =>
                            navigate("/products")
                        }
                    >
                        CONTINUE SHOPPING
                    </button>

                </main>
            </div>
        );
    }


    return (
        <div className="cart-page">

            <header className="cart-header">

                <button
                    className="cart-back-button"
                    onClick={() =>
                        navigate("/products")
                    }
                >
                    ← Shop
                </button>

                <strong
                    className="cart-brand"
                    onClick={() => navigate("/")}
                >
                    STYLESYNC
                </strong>

                <span className="cart-header-count">
                    {itemCount}{" "}
                    {itemCount === 1
                        ? "item"
                        : "items"}
                </span>

            </header>


            <main className="cart-container">

                <div className="cart-top">

                    <div>
                        <p className="cart-eyebrow">
                            YOUR SELECTION
                        </p>

                        <h1>Your Cart</h1>
                    </div>

                    <button
                        className="clear-cart-button"
                        onClick={clearCart}
                    >
                        Clear cart
                    </button>

                </div>


                <div className="cart-layout">

                    <section className="cart-items">

                        {cart.map((item) => {

                            const key =
                                `${item.product._id}-${item.size}-${item.color}`;

                            const sizes =
                                Array.isArray(
                                    item.product.sizes
                                )
                                    ? item.product.sizes
                                    : [];

                            const colors =
                                Array.isArray(
                                    item.product.colors
                                )
                                    ? item.product.colors
                                    : [];

                            const isUpdating =
                                updatingItem === key;

                            return (
                                <article
                                    className={`cart-item ${isUpdating
                                        ? "is-updating"
                                        : ""
                                        }`}
                                    key={key}
                                >

                                    <div
                                        className="cart-item-image"
                                        onClick={() =>
                                            navigate(
                                                `/product/${item.product._id}`
                                            )
                                        }
                                    >
                                        <img
                                            src={getProductImage(
                                                item.product
                                            )}
                                            alt={
                                                item.product.name
                                            }
                                        />
                                    </div>


                                    <div className="cart-item-info">

                                        <div className="cart-item-details">

                                            <p className="cart-item-brand">
                                                {item.product.brand ||
                                                    "StyleSync"}
                                            </p>

                                            <h2
                                                onClick={() =>
                                                    navigate(
                                                        `/product/${item.product._id}`
                                                    )
                                                }
                                            >
                                                {item.product.name}
                                            </h2>


                                            {colors.length > 0 ? (
                                                <label className="cart-option">
                                                    <span>
                                                        Color
                                                    </span>

                                                    <div className="cart-select-wrap">
                                                        <select
                                                            value={
                                                                item.color ||
                                                                ""
                                                            }
                                                            disabled={
                                                                isUpdating
                                                            }
                                                            onChange={(e) =>
                                                                updateVariant(
                                                                    item,
                                                                    item.size ||
                                                                    "",
                                                                    e.target.value
                                                                )
                                                            }
                                                        >
                                                            <option value="">
                                                                Select color
                                                            </option>

                                                            {colors.map(
                                                                (
                                                                    color
                                                                ) => (
                                                                    <option
                                                                        key={
                                                                            color
                                                                        }
                                                                        value={
                                                                            color
                                                                        }
                                                                    >
                                                                        {
                                                                            color
                                                                        }
                                                                    </option>
                                                                )
                                                            )}
                                                        </select>

                                                        <ChevronDown
                                                            size={
                                                                14
                                                            }
                                                        />
                                                    </div>
                                                </label>
                                            ) : item.color ? (
                                                <p className="cart-option-text">
                                                    Color:{" "}
                                                    <span>
                                                        {
                                                            item.color
                                                        }
                                                    </span>
                                                </p>
                                            ) : null}


                                            {sizes.length > 0 ? (
                                                <label className="cart-option">
                                                    <span>
                                                        Size
                                                    </span>

                                                    <div className="cart-select-wrap">
                                                        <select
                                                            value={
                                                                item.size ||
                                                                ""
                                                            }
                                                            disabled={
                                                                isUpdating
                                                            }
                                                            onChange={(e) =>
                                                                updateVariant(
                                                                    item,
                                                                    e.target.value,
                                                                    item.color ||
                                                                    ""
                                                                )
                                                            }
                                                        >
                                                            <option value="">
                                                                Select size
                                                            </option>

                                                            {sizes.map(
                                                                (
                                                                    size
                                                                ) => (
                                                                    <option
                                                                        key={
                                                                            size
                                                                        }
                                                                        value={
                                                                            size
                                                                        }
                                                                    >
                                                                        {
                                                                            size
                                                                        }
                                                                    </option>
                                                                )
                                                            )}
                                                        </select>

                                                        <ChevronDown
                                                            size={
                                                                14
                                                            }
                                                        />
                                                    </div>
                                                </label>
                                            ) : item.size ? (
                                                <p className="cart-option-text">
                                                    Size:{" "}
                                                    <span>
                                                        {
                                                            item.size
                                                        }
                                                    </span>
                                                </p>
                                            ) : null}


                                            <button
                                                className="remove-item-button"
                                                disabled={
                                                    isUpdating
                                                }
                                                onClick={() =>
                                                    removeItem(
                                                        item
                                                    )
                                                }
                                            >
                                                <Trash2
                                                    size={14}
                                                />
                                                Remove
                                            </button>

                                        </div>


                                        <div className="cart-item-right">

                                            <div className="cart-quantity">

                                                <button
                                                    disabled={
                                                        isUpdating ||
                                                        item.quantity <=
                                                        1
                                                    }
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item,
                                                            item.quantity -
                                                            1
                                                        )
                                                    }
                                                    aria-label="Decrease quantity"
                                                >
                                                    <Minus
                                                        size={14}
                                                    />
                                                </button>

                                                <span>
                                                    {
                                                        item.quantity
                                                    }
                                                </span>

                                                <button
                                                    disabled={
                                                        isUpdating ||
                                                        item.quantity >=
                                                        item.product.stock
                                                    }
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item,
                                                            item.quantity +
                                                            1
                                                        )
                                                    }
                                                    aria-label="Increase quantity"
                                                >
                                                    <Plus
                                                        size={14}
                                                    />
                                                </button>

                                            </div>

                                            <strong className="cart-item-price">
                                                ₹
                                                {(
                                                    item.product.price *
                                                    item.quantity
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}
                                            </strong>

                                        </div>

                                    </div>

                                </article>
                            );
                        })}

                    </section>


                    <aside className="cart-summary">

                        <div className="summary-heading">
                            <p>SUMMARY</p>
                            <h2>Order Summary</h2>
                        </div>


                        <div className="summary-row">
                            <span>
                                Subtotal
                            </span>

                            <strong>
                                ₹
                                {subtotal.toLocaleString(
                                    "en-IN"
                                )}
                            </strong>
                        </div>


                        <div className="summary-row">
                            <span>
                                Shipping
                            </span>

                            <strong>
                                {shipping
                                    ? `₹${shipping}`
                                    : "FREE"}
                            </strong>
                        </div>


                        {subtotal > 0 &&
                            subtotal < 3000 && (
                                <p className="shipping-note">
                                    Add ₹
                                    {(
                                        3000 -
                                        subtotal
                                    ).toLocaleString(
                                        "en-IN"
                                    )}{" "}
                                    more for free
                                    shipping.
                                </p>
                            )}


                        <div className="summary-divider" />


                        <div className="summary-total">
                            <span>Total</span>

                            <strong>
                                ₹
                                {total.toLocaleString(
                                    "en-IN"
                                )}
                            </strong>
                        </div>


                        <button
                            className="checkout-button"
                            onClick={() =>
                                navigate(
                                    "/checkout",
                                    {
                                        state: {
                                            source: "cart"
                                        }
                                    }
                                )
                            }
                        >
                            PROCEED TO CHECKOUT
                        </button>


                        <button
                            className="summary-shopping-button"
                            onClick={() =>
                                navigate("/products")
                            }
                        >
                            CONTINUE SHOPPING
                        </button>


                        <div className="cart-benefits">

                            <div>
                                <strong>
                                    Secure checkout
                                </strong>

                                <span>
                                    Your order details
                                    are protected.
                                </span>
                            </div>

                            <div>
                                <strong>
                                    Free shipping
                                </strong>

                                <span>
                                    On orders above
                                    ₹3,000.
                                </span>
                            </div>

                            <div>
                                <strong>
                                    Cash on delivery
                                </strong>

                                <span>
                                    Available for
                                    your order.
                                </span>
                            </div>

                        </div>

                    </aside>

                </div>

            </main>

        </div>
    );
};

export default Cart;