import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
   
    Minus,
    Plus,
    ShoppingBag,
    Truck,
    RotateCcw,
    ShieldCheck,
    ChevronDown,
    Star,
} from "lucide-react";
import "./productDetails.css";
import { apiFetch } from "../services/api.js";
import { getProductImage } from "../utils/productImage.js";

const API_URL = "/api/products";

function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [openSection, setOpenSection] = useState(null);

    useEffect(() => {
    const fetchProduct = async () => {
        try {
            setLoading(true);
            setError("");
            setProduct(null);

            console.log("Fetching product ID:", id);

            const response = await apiFetch(`/api/products/${id}`);

            console.log("Response status:", response.status);

            const data = await response.json();

            console.log("Complete API response:", data);

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to fetch product"
                );
            }

            // Backend is returning the product directly
            if (!data) {
                throw new Error("Product data is missing");
            }

            setProduct(data);

            if (data.colors?.length > 0) {
                setSelectedColor(data.colors[0]);
            }

            if (data.sizes?.length > 0) {
                setSelectedSize(data.sizes[0]);
            }

        } catch (error) {
            console.error("Product fetching error:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (id) {
        fetchProduct();
    } else {
        setError("Product ID is missing");
        setLoading(false);
    }
}, [id]);

    // -----------------------------
    // Loading
    // -----------------------------

    if (loading) {
        return (
            <div className="product-details-page">
                <div className="product-details-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading product...</p>
                </div>
            </div>
        );
    }

    // -----------------------------
    // Error
    // -----------------------------

    if (error) {
        return (
            <div className="product-details-page">
                <div className="product-details-error">
                    <h2>Unable to load product</h2>
                    <p>{error}</p>

                    <button
                        className="back-to-shop-btn"
                        onClick={() => navigate("/products")}
                    >
                        <ArrowLeft size={18} />
                        Back to Shop
                    </button>
                </div>
            </div>
        );
    }

    // -----------------------------
    // Safety check
    // -----------------------------

    if (!product) {
        return (
            <div className="product-details-page">
                <div className="product-details-error">
                    <h2>Product Not Found</h2>

                    <button
                        className="back-to-shop-btn"
                        onClick={() => navigate("/products")}
                    >
                        <ArrowLeft size={18} />
                        Back to Shop
                    </button>
                </div>
            </div>
        );
    }

    // -----------------------------
    // Product data
    // -----------------------------

    const images =
        product.images && product.images.length > 0
            ? product.images
            : [getProductImage(product)];

    const colors =
        product.colors && product.colors.length > 0
            ? product.colors
            : [];

    const sizes =
        product.sizes && product.sizes.length > 0
            ? product.sizes
            : [];

    const discount = Number(product.discountPercentage || 0);

    const originalPrice =
        discount > 0
            ? Math.round(product.price / (1 - discount / 100))
            : product.price;

    const hasMultipleImages = images.length > 1;

    // -----------------------------
    // Quantity
    // -----------------------------

    const increaseQuantity = () => {
        if (quantity < product.stock) {
            setQuantity(quantity + 1);
        }
    };

    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    // -----------------------------
    // Add to cart
    // -----------------------------

    const addToCart = async () => {
        try {
            if (!selectedSize && selectedSize !== "") {
                alert("Please select a size");
                return false;
            }

            const response = await apiFetch("/api/cart/add", {
                method: "POST",
                body: JSON.stringify({
                    productId: product._id,
                    quantity,
                    size: selectedSize,
                    color: selectedColor
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to add product to cart");
            return true;
        } catch (error) {
            alert(error.message || "Failed to add product to cart");
            return false;
        }
    };

    // -----------------------------
    // Buy now
    // -----------------------------

    const buyNow = () => {
        navigate("/checkout", {
            state: {
                source: "direct",
                product,
                quantity,
                size: selectedSize,
                color: selectedColor
            }
        });
    };

    // -----------------------------
    // Wishlist
    // -----------------------------

    const toggleWishlist = () => {
        setIsWishlisted((previous) => !previous);
    };

    // -----------------------------
    // Accordion
    // -----------------------------

    const toggleSection = (section) => {
        setOpenSection((previous) =>
            previous === section ? null : section
        );
    };

    return (
        <div className="product-details-page">

            {/* HEADER */}

            <header className="product-details-header">

                <button
                    className="back-button"
                    onClick={() => navigate("/products")}
                >
                    <ArrowLeft size={18} />
                    <span>Back to Shop</span>
                </button>

                <div className="product-details-brand">
                    STYLESYNC
                </div>

                <button
                    className="header-bag-button"
                    onClick={() => navigate("/cart")}
                >
                    <ShoppingBag size={20} />
                </button>

            </header>

            {/* BREADCRUMB */}

            <div className="product-breadcrumb">

                <span onClick={() => navigate("/")}>
                    Home
                </span>

                <span>/</span>

                <span onClick={() => navigate("/products")}>
                    Shop
                </span>

                <span>/</span>

                <span>
                    {product.category}
                </span>

                <span>/</span>

                <strong>
                    {product.name}
                </strong>

            </div>

            {/* MAIN PRODUCT */}

            <main className="product-details-container">

                {/* LEFT - IMAGE GALLERY */}

                <section className="product-gallery">

                    <div className="product-main-image-wrapper">

                        {discount > 0 && (
                            <span className="product-discount-badge">
                                -{discount}%
                            </span>
                        )}

                        {product.isNewArrival && (
                            <span className="product-new-badge">
                                NEW
                            </span>
                        )}

                       

                        <img
                            src={images[selectedImage]}
                            alt={product.name}
                            className="product-main-image"
                            onError={(event) => {
                                event.currentTarget.src =
                                    "/placeholder.jpg";
                            }}
                        />

                    </div>

                    {hasMultipleImages && (
                        <div className="product-thumbnails">

                            {images.map((image, index) => (
                                <button
                                    key={`${image}-${index}`}
                                    className={`product-thumbnail ${
                                        selectedImage === index
                                            ? "active"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        setSelectedImage(index)
                                    }
                                >
                                    <img
                                        src={image}
                                        alt={`${product.name} ${
                                            index + 1
                                        }`}
                                        onError={(event) => {
                                            event.currentTarget.src =
                                                "/placeholder.jpg";
                                        }}
                                    />
                                </button>
                            ))}

                        </div>
                    )}

                </section>

                {/* RIGHT - PRODUCT INFORMATION */}

                <section className="product-information">

                    {/* CATEGORY */}

                    <div className="product-category-label">
                        {product.category}

                        {product.subCategory && (
                            <>
                                <span> · </span>
                                {product.subCategory}
                            </>
                        )}
                    </div>

                    {/* NAME */}

                    <h1 className="product-title">
                        {product.name}
                    </h1>

                    {/* BRAND */}

                    {product.brand && (
                        <p className="product-brand">
                            {product.brand}
                        </p>
                    )}

                    {/* RATING */}

                    <div className="product-rating">

                        <div className="rating-stars">

                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    size={16}
                                    fill={
                                        star <=
                                        Math.round(
                                            product.rating || 0
                                        )
                                            ? "currentColor"
                                            : "none"
                                    }
                                />
                            ))}

                        </div>

                        <span>
                            {product.rating || 0}
                        </span>

                        <span className="rating-separator">
                            ·
                        </span>

                        <span>
                            {product.reviewCount || 0} Reviews
                        </span>

                    </div>

                    {/* PRICE */}

                    <div className="product-price-section">

                        <span className="product-current-price">
                            ₹{Number(product.price).toLocaleString("en-IN")}
                        </span>

                        {discount > 0 && (
                            <>
                                <span className="product-original-price">
                                    ₹
                                    {originalPrice.toLocaleString(
                                        "en-IN"
                                    )}
                                </span>

                                <span className="product-saving">
                                    Save {discount}%
                                </span>
                            </>
                        )}

                    </div>

                    <p className="tax-note">
                        Inclusive of all taxes
                    </p>

                    {/* DESCRIPTION */}

                    {product.description && (
                        <div className="product-description">
                            {product.description}
                        </div>
                    )}

                    {/* COLORS */}

                    {colors.length > 0 && (
                        <div className="product-option">

                            <div className="option-heading">

                                <span>
                                    Color
                                </span>

                                <strong>
                                    {selectedColor}
                                </strong>

                            </div>

                            <div className="color-options">

                                {colors.map((color) => (
                                    <button
                                        key={color}
                                        className={`color-option ${
                                            selectedColor === color
                                                ? "active"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            setSelectedColor(color)
                                        }
                                    >
                                        {color}
                                    </button>
                                ))}

                            </div>

                        </div>
                    )}

                    {/* SIZES */}

                    {sizes.length > 0 && (
                        <div className="product-option">

                            <div className="option-heading">

                                <span>
                                    Size
                                </span>

                                <button className="size-guide">
                                    Size Guide
                                </button>

                            </div>

                            <div className="size-options">

                                {sizes.map((size) => (
                                    <button
                                        key={size}
                                        className={`size-option ${
                                            selectedSize === size
                                                ? "active"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            setSelectedSize(size)
                                        }
                                    >
                                        {size}
                                    </button>
                                ))}

                            </div>

                        </div>
                    )}

                    {/* STOCK */}

                    <div className="product-stock">

                        {product.stock > 0 ? (
                            <>
                                <span className="stock-dot"></span>

                                {product.stock <= 5
                                    ? `Only ${product.stock} left`
                                    : "In stock"}
                            </>
                        ) : (
                            "Out of stock"
                        )}

                    </div>

                    {/* QUANTITY */}

                    {product.stock > 0 && (
                        <div className="quantity-section">

                            <span>
                                Quantity
                            </span>

                            <div className="quantity-selector">

                                <button
                                    onClick={decreaseQuantity}
                                    disabled={quantity <= 1}
                                >
                                    <Minus size={15} />
                                </button>

                                <span>
                                    {quantity}
                                </span>

                                <button
                                    onClick={increaseQuantity}
                                    disabled={
                                        quantity >= product.stock
                                    }
                                >
                                    <Plus size={15} />
                                </button>

                            </div>

                        </div>
                    )}

                    {/* ACTION BUTTONS */}

                    <div className="product-actions">

                        <button
                            className="add-to-cart-button"
                            onClick={addToCart}
                            disabled={product.stock <= 0}
                        >
                            <ShoppingBag size={19} />

                            {product.stock > 0
                                ? "ADD TO CART"
                                : "OUT OF STOCK"}
                        </button>

                       <button
    className="buy-now-button"
    onClick={() =>
        navigate("/payment", {
            state: {
                product: {
                    productId: product._id,
                    name: product.name,
                    price: product.price,
                    image: images[0],
                    size: selectedSize,
                    color: selectedColor
                },
                quantity: quantity
            }
        })
    }
    disabled={product.stock <= 0}
>
    BUY NOW
</button>

                    </div>

                    {/* SERVICES */}

                    <div className="product-services">

                        <div className="service-item">

                            <Truck size={21} />

                            <div>
                                <strong>
                                    Free Shipping
                                </strong>

                                <span>
                                    On orders above ₹999
                                </span>
                            </div>

                        </div>

                        <div className="service-item">

                            <RotateCcw size={21} />

                            <div>
                                <strong>
                                    Easy Returns
                                </strong>

                                <span>
                                    7-day return policy
                                </span>
                            </div>

                        </div>

                        <div className="service-item">

                            <ShieldCheck size={21} />

                            <div>
                                <strong>
                                    Secure Payment
                                </strong>

                                <span>
                                    100% secure checkout
                                </span>
                            </div>

                        </div>

                    </div>

                    {/* ACCORDIONS */}

                    <div className="product-accordions">

                        <div className="accordion-item">

                            <button
                                className="accordion-header"
                                onClick={() =>
                                    toggleSection("details")
                                }
                            >
                                <span>
                                    Product Details
                                </span>

                                <ChevronDown
                                    size={18}
                                    className={
                                        openSection ===
                                        "details"
                                            ? "rotate"
                                            : ""
                                    }
                                />
                            </button>

                            {openSection === "details" && (
                                <div className="accordion-content">

                                    <p>
                                        {product.description ||
                                            "Premium quality fashion product designed for everyday style and comfort."}
                                    </p>

                                    {product.material && (
                                        <p>
                                            <strong>
                                                Material:
                                            </strong>{" "}
                                            {product.material}
                                        </p>
                                    )}

                                    {product.style?.length > 0 && (
                                        <p>
                                            <strong>
                                                Style:
                                            </strong>{" "}
                                            {product.style.join(
                                                ", "
                                            )}
                                        </p>
                                    )}

                                    {product.occasion?.length > 0 && (
                                        <p>
                                            <strong>
                                                Occasion:
                                            </strong>{" "}
                                            {product.occasion.join(
                                                ", "
                                            )}
                                        </p>
                                    )}

                                </div>
                            )}

                        </div>

                        <div className="accordion-item">

                            <button
                                className="accordion-header"
                                onClick={() =>
                                    toggleSection("shipping")
                                }
                            >
                                <span>
                                    Shipping & Returns
                                </span>

                                <ChevronDown
                                    size={18}
                                    className={
                                        openSection ===
                                        "shipping"
                                            ? "rotate"
                                            : ""
                                    }
                                />
                            </button>

                            {openSection === "shipping" && (
                                <div className="accordion-content">

                                    <p>
                                        Free standard shipping
                                        on orders above ₹999.
                                    </p>

                                    <p>
                                        Products can be returned
                                        within 7 days subject to
                                        our return policy.
                                    </p>

                                </div>
                            )}

                        </div>

                        <div className="accordion-item">

                            <button
                                className="accordion-header"
                                onClick={() =>
                                    toggleSection("care")
                                }
                            >
                                <span>
                                    Care Instructions
                                </span>

                                <ChevronDown
                                    size={18}
                                    className={
                                        openSection === "care"
                                            ? "rotate"
                                            : ""
                                    }
                                />
                            </button>

                            {openSection === "care" && (
                                <div className="accordion-content">

                                    <p>
                                        Follow the care
                                        instructions provided
                                        with the product.
                                    </p>

                                </div>
                            )}

                        </div>

                    </div>

                </section>

            </main>

            {/* MOBILE BUY BAR */}

            {product.stock > 0 && (
                <div className="mobile-buy-bar">

                    <div>
                        <span>
                            ₹
                            {Number(
                                product.price
                            ).toLocaleString("en-IN")}
                        </span>
                    </div>

                    <button onClick={addToCart}>
                        <ShoppingBag size={18} />
                        Add to Cart
                    </button>

                </div>
            )}

        </div>
    );
}

export default ProductDetails;