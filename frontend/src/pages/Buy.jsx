
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiFetch } from "../services/api.js";
import { getProductImage } from "../utils/productImage.js";
import { useAuth } from "../context/AuthContext.jsx";
import "./Buy.css";

const emptyAddress = {
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: ""
};

// Supports MongoDB IDs and the productId field in your cart.
const getProductId = (product) => {
    if (!product) return "";

    const id =
        product._id ||
        product.id ||
        product.productId;

    return id ? String(id) : "";
};

// Extract the product from the cart item structure.
const getCartProduct = (item) => {
    if (!item) return null;

    const product =
        item.product ||
        item.productId ||
        item.item;

    if (product && typeof product === "object") {
        return product;
    }

    return null;
};

const BuyNow = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const source = location.state?.source || "direct";
    const directProduct = location.state?.product;

    const [cartItems, setCartItems] = useState([]);
    const [address, setAddress] = useState(emptyAddress);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const quantity = Math.max(
        1,
        Number(location.state?.quantity) || 1
    );

    // Prefill delivery details from the saved profile.
    useEffect(() => {
        if (!user) return;

        setAddress({
            name: user.name || "",
            phone: user.phone || "",
            address: user.address?.address || "",
            city: user.address?.city || "",
            state: user.address?.state || "",
            pincode: user.address?.pincode || ""
        });
    }, [user]);

    // Load the cart from the backend.
    useEffect(() => {
        let cancelled = false;

        const loadCart = async () => {
            if (source !== "cart") {
                if (!directProduct) {
                    navigate("/products", { replace: true });
                }
                return;
            }

            try {
                const response = await apiFetch("/api/cart");
                const data = await response.json().catch(() => ({}));

                if (!response.ok) {
                    throw new Error(
                        data.message || "Unable to load your cart."
                    );
                }

                if (!cancelled) {
                    setCartItems(
                        Array.isArray(data.items) ? data.items : []
                    );
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err.message || "Unable to load your cart."
                    );
                }
            }
        };

        loadCart();

        return () => {
            cancelled = true;
        };
    }, [source, directProduct, navigate]);

    // Normalize cart and direct-buy items.
    const items =
        source === "cart"
            ? cartItems.map((item) => {
                  const product = getCartProduct(item);

                  return {
                      ...item,
                      product,
                      quantity: Number(item.quantity) || 0,
                      size: item.size || product?.size || "",
                      color: item.color || product?.color || ""
                  };
              })
            : directProduct
              ? [
                    {
                        product: directProduct,
                        quantity,
                        size: location.state?.size || "",
                        color: location.state?.color || ""
                    }
                ]
              : [];

    const subtotal = items.reduce((sum, item) => {
        const price = Number(item.product?.price) || 0;

        return sum + price * item.quantity;
    }, 0);

    const shipping =
        subtotal === 0 ? 0 : subtotal >= 3000 ? 0 : 99;

    const total = subtotal + shipping;

    const handleChange = (e) => {
        const { name, value } = e.target;

        setAddress((previous) => ({
            ...previous,
            [name]: value
        }));

        if (error) setError("");
    };

    const placeOrder = async (e) => {
        e.preventDefault();

        if (loading) return;

        setError("");

        const shippingAddress = {
            name: address.name.trim(),
            phone: address.phone.trim(),
            address: address.address.trim(),
            city: address.city.trim(),
            state: address.state.trim(),
            pincode: address.pincode.trim()
        };

        if (
            Object.values(shippingAddress).some((value) => !value)
        ) {
            setError("Please complete all delivery details.");
            return;
        }

        if (!/^[0-9]{10}$/.test(shippingAddress.phone)) {
            setError("Please enter a valid 10-digit phone number.");
            return;
        }

        if (!/^[0-9]{6}$/.test(shippingAddress.pincode)) {
            setError("Please enter a valid 6-digit PIN code.");
            return;
        }

        if (!items.length) {
            setError("There are no items to order.");
            return;
        }

        // Validate each item using the actual product ID field.
        const invalidItem = items.find((item) => {
            const productId = getProductId(item.product);
            const itemQuantity = Number(item.quantity);
            const price = Number(item.product?.price);

            return (
                !item.product ||
                !productId ||
                !Number.isFinite(itemQuantity) ||
                itemQuantity < 1 ||
                !Number.isFinite(price) ||
                price < 0
            );
        });

        if (invalidItem) {
            console.error(
                "Invalid StyleSync checkout item:",
                invalidItem
            );

            setError(
                "A cart item is missing valid product details. Please reload the cart and try again."
            );
            return;
        }

        try {
            setLoading(true);

            let body;

            if (source === "cart") {
                body = {
                    source: "cart",
                    shippingAddress
                };
            } else {
                body = {
                    source: "direct",
                    productId: getProductId(directProduct),
                    quantity,
                    size: location.state?.size || "",
                    color: location.state?.color || "",
                    shippingAddress
                };
            }

            const response = await apiFetch("/api/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                console.error("StyleSync order error:", {
                    status: response.status,
                    response: data
                });

                throw new Error(
                    data.message ||
                    data.error ||
                    `Could not place order (HTTP ${response.status}).`
                );
            }

            if (!data.order) {
                throw new Error(
                    "The server did not return order details. Check My Orders before attempting to order again."
                );
            }

            navigate("/order-success", {
                replace: true,
                state: {
                    order: data.order
                }
            });
        } catch (err) {
            setError(
                err.message ||
                "Something went wrong while placing your order."
            );
        } finally {
            setLoading(false);
        }
    };

    // Support image, images array, and the existing image utility.
    const renderProductImage = (item) => {
        const product = item.product;

        let imageUrl =
            product?.image ||
            (Array.isArray(product?.images)
                ? product.images.find(
                      (image) =>
                          typeof image === "string" &&
                          image.trim()
                  )
                : "");

        if (!imageUrl) {
            try {
                imageUrl = getProductImage(product);
            } catch (err) {
                console.error("Product image error:", err);
            }
        }

        if (
            typeof imageUrl !== "string" ||
            !imageUrl.trim()
        ) {
            return (
                <div
                    className="checkout-product-image-placeholder"
                    role="img"
                    aria-label="Product image unavailable"
                >
                    Image unavailable
                </div>
            );
        }

        return (
            <img
                src={imageUrl}
                alt={product?.name || "StyleSync product"}
                onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.removeAttribute("src");
                }}
            />
        );
    };

    return (
        <div className="buy-now-page">
            <header className="buy-now-header">
                <button
                    type="button"
                    className="buy-now-back"
                    onClick={() => navigate(-1)}
                >
                    ← Back
                </button>

                <div className="buy-now-brand">STYLESYNC</div>
            </header>

            <main className="buy-now-container">
                <div className="buy-now-heading">
                    <p>STYLESYNC CHECKOUT</p>
                    <h1>Complete your order</h1>
                </div>

                {error && (
                    <div className="checkout-error" role="alert">
                        {error}
                    </div>
                )}

                <div className="buy-now-layout">
                    <section className="checkout-left">
                        {/* DELIVERY DETAILS */}
                        <div className="checkout-section">
                            <div className="section-title">
                                <span>01</span>
                                <h2>Delivery Details</h2>
                            </div>

                            <form
                                className="address-form"
                                onSubmit={placeOrder}
                            >
                                {[
                                    ["name", "Full Name"],
                                    ["phone", "Phone Number"],
                                    ["address", "Address"],
                                    ["city", "City"],
                                    ["state", "State"],
                                    ["pincode", "PIN Code"]
                                ].map(([name, label]) => (
                                    <div
                                        className={`form-group ${
                                            name === "address"
                                                ? "full-field"
                                                : ""
                                        }`}
                                        key={name}
                                    >
                                        <label htmlFor={name}>
                                            {label}
                                        </label>

                                        {name === "address" ? (
                                            <textarea
                                                id={name}
                                                name={name}
                                                value={address[name]}
                                                onChange={handleChange}
                                                rows={3}
                                                placeholder="House / Flat / Street"
                                                required
                                            />
                                        ) : (
                                            <input
                                                id={name}
                                                name={name}
                                                value={address[name]}
                                                onChange={handleChange}
                                                placeholder={`Enter ${label.toLowerCase()}`}
                                                maxLength={
                                                    name === "phone"
                                                        ? 10
                                                        : name === "pincode"
                                                          ? 6
                                                          : undefined
                                                }
                                                required
                                            />
                                        )}
                                    </div>
                                ))}

                                <button
                                    type="submit"
                                    className="place-order-button mobile-place"
                                    disabled={loading || !items.length}
                                >
                                    {loading
                                        ? "PLACING ORDER..."
                                        : "PLACE ORDER"}
                                </button>
                            </form>
                        </div>

                        {/* PAYMENT */}
                        <div className="checkout-section">
                            <div className="section-title">
                                <span>02</span>
                                <h2>Payment</h2>
                            </div>

                            <div className="payment-placeholder">
                                <div className="payment-icon">₹</div>

                                <div>
                                    <h3>
                                        Cash on Delivery / Demo Payment
                                    </h3>

                                    <p>
                                        No real payment gateway is
                                        connected. This portfolio demo
                                        does not charge money.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ORDER SUMMARY */}
                    <aside className="buy-now-summary">
                        <h2>Order Summary</h2>

                        {items.map((item, index) => (
                            <div
                                className="checkout-product"
                                key={`${getProductId(item.product) || index}-${index}`}
                            >
                                {item.product
                                    ? renderProductImage(item)
                                    : (
                                        <div className="checkout-product-image-placeholder">
                                            Product unavailable
                                        </div>
                                    )}

                                <div>
                                    <p>
                                        {item.product?.brand || "StyleSync"}
                                    </p>

                                    <h3>
                                        {item.product?.name || "Product"}
                                    </h3>

                                    <span>
                                        Qty: {item.quantity}
                                        {item.size
                                            ? ` • ${item.size}`
                                            : ""}
                                        {item.color
                                            ? ` • ${item.color}`
                                            : ""}
                                    </span>
                                </div>

                                <strong>
                                    ₹
                                    {(
                                        (Number(item.product?.price) || 0) *
                                        item.quantity
                                    ).toLocaleString("en-IN")}
                                </strong>
                            </div>
                        ))}

                        <div className="summary-line" />

                        <div className="total-line">
                            <span>Subtotal</span>
                            <strong>
                                ₹{subtotal.toLocaleString("en-IN")}
                            </strong>
                        </div>

                        <div className="total-line">
                            <span>Shipping</span>
                            <strong>
                                {shipping
                                    ? `₹${shipping}`
                                    : "FREE"}
                            </strong>
                        </div>

                        <div className="total-line grand">
                            <span>Total</span>
                            <strong>
                                ₹{total.toLocaleString("en-IN")}
                            </strong>
                        </div>

                        <button
                            type="button"
                            className="place-order-button"
                            onClick={placeOrder}
                            disabled={loading || !items.length}
                        >
                            {loading
                                ? "PLACING ORDER..."
                                : "PLACE ORDER"}
                        </button>

                        <p className="checkout-note">
                            This is a portfolio demo. No money is charged.
                        </p>
                    </aside>
                </div>
            </main>
        </div>
    );
};

export default BuyNow;
