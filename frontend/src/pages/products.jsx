import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    ChevronDown,
    
    Search,
    SlidersHorizontal,
    ShoppingBag,
    X,
    Star,
} from "lucide-react";
import "./products.css";
import { apiFetch } from "../services/api.js";


const categories = [
    "All",
    "T-Shirts",
    "Shirts",
    "Jeans",
    "Trousers",
    "Dresses",
    "Jackets",
    "Shoes",
    "Accessories",
];

function Products() {
    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("recommended");

    const [showFilters, setShowFilters] = useState(false);

    const [maxPrice, setMaxPrice] = useState(10000);
    const [selectedStyle, setSelectedStyle] = useState("All");
    const [selectedOccasion, setSelectedOccasion] = useState("All");
    const [minimumRating, setMinimumRating] = useState(0);

    const [wishlist, setWishlist] = useState([]);
    const [cartCount, setCartCount] = useState(0);

    const navigate = useNavigate();

    // ==========================================
    // FETCH PRODUCTS
    // ==========================================

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await apiFetch("/api/products");

                if (!response.ok) {
                    throw new Error("Failed to fetch products");
                }

                const data = await response.json();

                setProducts(data.products || []);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };

        fetchProducts();
    }, []);

    // ==========================================
    // FILTER + SEARCH + SORT
    // ==========================================

    const filteredProducts = useMemo(() => {
        let result = [...products];

        // Category
        if (selectedCategory !== "All") {
            result = result.filter(
                (product) =>
                    product.category === selectedCategory
            );
        }

        // Search
        if (search.trim()) {
            const query = search.toLowerCase();

            result = result.filter((product) => {
                const searchableText = [
                    product.name,
                    product.category,
                    product.brand,
                    product.description,
                    ...(product.tags || []),
                    ...(product.style || []),
                    ...(product.occasion || []),
                ]
                    .join(" ")
                    .toLowerCase();

                return searchableText.includes(query);
            });
        }

        // Price
        result = result.filter(
            (product) => product.price <= maxPrice
        );

        // Style
        if (selectedStyle !== "All") {
            result = result.filter((product) =>
                product.style?.some(
                    (style) =>
                        style.toLowerCase() ===
                        selectedStyle.toLowerCase()
                )
            );
        }

        // Occasion
        if (selectedOccasion !== "All") {
            result = result.filter((product) =>
                product.occasion?.some(
                    (occasion) =>
                        occasion.toLowerCase() ===
                        selectedOccasion.toLowerCase()
                )
            );
        }

        // Rating
        if (minimumRating > 0) {
            result = result.filter(
                (product) =>
                    product.rating >= minimumRating
            );
        }

        // Sorting
        if (sort === "price-low") {
            result.sort(
                (a, b) => a.price - b.price
            );
        }

        if (sort === "price-high") {
            result.sort(
                (a, b) => b.price - a.price
            );
        }

        if (sort === "rating") {
            result.sort(
                (a, b) => b.rating - a.rating
            );
        }

        if (sort === "newest") {
            result.sort(
                (a, b) =>
                    new Date(b.createdAt) -
                    new Date(a.createdAt)
            );
        }

        return result;
    }, [
        products,
        selectedCategory,
        search,
        sort,
        maxPrice,
        selectedStyle,
        selectedOccasion,
        minimumRating,
    ]);


    // ==========================================
    // ADD TO CART
    // ==========================================

    const addToCart = async (event, product) => {
        event.stopPropagation();
        if (product.stock <= 0) return;
        try {
            const response = await apiFetch("/api/cart/add", {
                method: "POST",
                body: JSON.stringify({
                    productId: product._id,
                    quantity: 1,
                    size: product.sizes?.[0] || "",
                    color: product.colors?.[0] || ""
                })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to add to cart");
            setCartCount((data.items || []).reduce((sum, item) => sum + item.quantity, 0));
        } catch (error) {
            alert(error.message);
        }
    };

    // ==========================================
    // CLEAR FILTERS
    // ==========================================

    const clearFilters = () => {
        setSelectedCategory("All");
        setSearch("");
        setMaxPrice(10000);
        setSelectedStyle("All");
        setSelectedOccasion("All");
        setMinimumRating(0);
        setSort("recommended");
    };

    return (
        <div className="shop-page">

            {/* =================================
                HEADER
            ================================= */}

            <header className="shop-header">

                <button
                    className="shop-back"
                    onClick={() => navigate("/")}
                >
                    <ArrowLeft size={20} />
                    <span>Back</span>
                </button>

                <button
                    className="shop-logo"
                  //  onClick={() => navigate("/")}
                >
                    STYLESYNC
                </button>

                <div className="shop-header-actions">

                    <button
                        className="header-icon"
                        onClick={() =>
                            setShowFilters(true)
                        }
                    >
                        <SlidersHorizontal
                            size={20}
                        />
                    </button>

                   

                    <button
                        className="header-icon"
                        onClick={() =>
                           navigate("/cart")
                        }
                    >
                        <ShoppingBag
                            size={20}
                        />

                        {cartCount > 0 && (
                            <span className="icon-badge">
                                {cartCount}
                            </span>
                        )}
                    </button>

                </div>

            </header>


            {/* =================================
                LIVE FASHION HERO
            ================================= */}

            <section className="shop-hero">

                <div className="hero-background"></div>

                <div className="hero-overlay"></div>

                <div className="shop-hero-content">

                    <p className="shop-eyebrow">
                        THE COLLECTION
                    </p>

                    <h1>
                        SHOP ALL
                    </h1>

                    <p className="hero-description">
                        Discover pieces designed
                        for your everyday style.
                    </p>

                    <div className="hero-line"></div>

                </div>

            </section>


            {/* =================================
                SEARCH
            ================================= */}

            <div className="shop-search-wrapper">

                <div className="shop-search">

                    <Search size={19} />

                    <input
                        type="text"
                        placeholder="Search products, styles..."
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />

                    {search && (
                        <button
                            onClick={() =>
                                setSearch("")
                            }
                        >
                            <X size={18} />
                        </button>
                    )}

                </div>

            </div>


            {/* =================================
                CATEGORIES
            ================================= */}

            <div className="category-bar">

                {categories.map(
                    (category) => (
                        <button
                            key={category}
                            className={
                                selectedCategory ===
                                category
                                    ? "category-button active"
                                    : "category-button"
                            }
                            onClick={() =>
                                setSelectedCategory(
                                    category
                                )
                            }
                        >
                            {category}
                        </button>
                    )
                )}

            </div>


            {/* =================================
                SHOP CONTROLS
            ================================= */}

            <div className="shop-controls">

                <div className="result-count">
                    {filteredProducts.length}{" "}
                    PRODUCTS
                </div>

                <div className="shop-control-right">

                    <button
                        className="filter-button"
                        onClick={() =>
                            setShowFilters(true)
                        }
                    >
                        <SlidersHorizontal
                            size={17}
                        />
                        FILTER
                    </button>

                    <div className="sort-wrapper">

                        <select
                            value={sort}
                            onChange={(event) =>
                                setSort(
                                    event.target.value
                                )
                            }
                        >
                            <option value="recommended">
                                Recommended
                            </option>

                            <option value="newest">
                                Newest
                            </option>

                            <option value="price-low">
                                Price: Low to High
                            </option>

                            <option value="price-high">
                                Price: High to Low
                            </option>

                            <option value="rating">
                                Highest Rated
                            </option>
                        </select>

                        <ChevronDown
                            size={16}
                        />

                    </div>

                </div>

            </div>


            {/* =================================
                PRODUCT GRID
            ================================= */}

            <main className="shop-products">

                {filteredProducts.length > 0 ? (

                    filteredProducts.map(
                        (product) => {

                            const originalPrice =
                                product.discountPercentage >
                                0
                                    ? Math.round(
                                          product.price /
                                              (1 -
                                                  product.discountPercentage /
                                                      100)
                                      )
                                    : null;

                            const isWishlisted =
                                wishlist.includes(
                                    product._id
                                );

                            return (
                                <article
                                    className="shop-product-card"
                                    key={product._id}
                                    onClick={() =>
                                        navigate(
                                            `/product/${product._id}`
                                        )
                                    }
                                >

                                    {/* IMAGE */}

                                    <div className="shop-product-image">

                                        <img
                                            src={
                                                product.images?.[0] ||
                                                "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80"
                                            }
                                            alt={
                                                product.name
                                            }
                                        />

                                        {/* BADGES */}

                                        <div className="product-badges">

                                            {product.discountPercentage >
                                                0 && (
                                                <span className="discount-badge">
                                                    -
                                                    {
                                                        product.discountPercentage
                                                    }
                                                    %
                                                </span>
                                            )}

                                            {product.isNewArrival && (
                                                <span className="new-badge">
                                                    NEW
                                                </span>
                                            )}

                                        </div>


                                       


                                        {/* QUICK ADD */}

                                        {product.stock >
                                            0 && (
                                            <button
                                                className="quick-add"
                                                onClick={(
                                                    event
                                                ) =>
                                                    addToCart(
                                                        event,
                                                        product
                                                    )
                                                }
                                            >
                                                <ShoppingBag
                                                    size={
                                                        17
                                                    }
                                                />

                                                ADD TO CART
                                            </button>
                                        )}

                                    </div>


                                    {/* PRODUCT INFO */}

                                    <div className="shop-product-info">

                                        <div className="product-top-row">

                                            <span className="product-category">
                                                {
                                                    product.category
                                                }
                                            </span>

                                            {product.rating >
                                                0 && (
                                                <span className="product-rating">

                                                    <Star
                                                        size={
                                                            13
                                                        }
                                                        fill="currentColor"
                                                    />

                                                    {
                                                        product.rating
                                                    }

                                                    {product.reviewCount >
                                                        0 && (
                                                        <span>
                                                            (
                                                            {
                                                                product.reviewCount
                                                            }
                                                            )
                                                        </span>
                                                    )}

                                                </span>
                                            )}

                                        </div>

                                        <h2>
                                            {
                                                product.name
                                            }
                                        </h2>

                                        <div className="product-price-row">

                                            <span className="current-price">
                                                ₹
                                                {product.price?.toLocaleString(
                                                    "en-IN"
                                                )}
                                            </span>

                                            {originalPrice && (
                                                <span className="original-price">
                                                    ₹
                                                    {originalPrice.toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </span>
                                            )}

                                        </div>


                                        {product.stock <=
                                            5 &&
                                            product.stock >
                                                0 && (
                                                <p className="low-stock">
                                                    Only{" "}
                                                    {
                                                        product.stock
                                                    }{" "}
                                                    left
                                                </p>
                                            )}

                                        {product.stock ===
                                            0 && (
                                            <p className="out-stock">
                                                Out of
                                                stock
                                            </p>
                                        )}

                                    </div>

                                </article>
                            );
                        }
                    )

                ) : (

                    <div className="no-products">

                        <h2>
                            No products found
                        </h2>

                        <p>
                            Try changing your
                            search or filters.
                        </p>

                        <button
                            onClick={
                                clearFilters
                            }
                        >
                            CLEAR FILTERS
                        </button>

                    </div>

                )}

            </main>


            {/* =================================
                FILTER DRAWER
            ================================= */}

            {showFilters && (

                <div
                    className="filter-overlay"
                    onClick={() =>
                        setShowFilters(false)
                    }
                >

                    <aside
                        className="filter-drawer"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <div className="filter-header">

                            <h2>
                                FILTERS
                            </h2>

                            <button
                                onClick={() =>
                                    setShowFilters(
                                        false
                                    )
                                }
                            >
                                <X size={21} />
                            </button>

                        </div>


                        {/* PRICE */}

                        <div className="filter-section">

                            <h3>
                                PRICE
                            </h3>

                            <div className="price-values">

                                <span>
                                    ₹0
                                </span>

                                <span>
                                    ₹
                                    {maxPrice.toLocaleString(
                                        "en-IN"
                                    )}
                                </span>

                            </div>

                            <input
                                className="price-slider"
                                type="range"
                                min="0"
                                max="10000"
                                step="100"
                                value={maxPrice}
                                onChange={(
                                    event
                                ) =>
                                    setMaxPrice(
                                        Number(
                                            event.target
                                                .value
                                        )
                                    )
                                }
                            />

                        </div>


                        {/* STYLE */}

                        <div className="filter-section">

                            <h3>
                                STYLE
                            </h3>

                            {[
                                "All",
                                "Casual",
                                "Minimal",
                                "Formal",
                                "Party",
                            ].map(
                                (style) => (
                                    <button
                                        key={style}
                                        className={
                                            selectedStyle ===
                                            style
                                                ? "filter-option active"
                                                : "filter-option"
                                        }
                                        onClick={() =>
                                            setSelectedStyle(
                                                style
                                            )
                                        }
                                    >
                                        {style}
                                    </button>
                                )
                            )}

                        </div>


                        {/* OCCASION */}

                        <div className="filter-section">

                            <h3>
                                OCCASION
                            </h3>

                            {[
                                "All",
                                "College",
                                "Everyday",
                                "Office",
                                "Party",
                            ].map(
                                (occasion) => (
                                    <button
                                        key={occasion}
                                        className={
                                            selectedOccasion ===
                                            occasion
                                                ? "filter-option active"
                                                : "filter-option"
                                        }
                                        onClick={() =>
                                            setSelectedOccasion(
                                                occasion
                                            )
                                        }
                                    >
                                        {occasion}
                                    </button>
                                )
                            )}

                        </div>


                        {/* RATING */}

                        <div className="filter-section">

                            <h3>
                                RATING
                            </h3>

                            {[4, 3, 2].map(
                                (rating) => (
                                    <button
                                        key={rating}
                                        className={
                                            minimumRating ===
                                            rating
                                                ? "filter-option active"
                                                : "filter-option"
                                        }
                                        onClick={() =>
                                            setMinimumRating(
                                                minimumRating ===
                                                    rating
                                                    ? 0
                                                    : rating
                                            )
                                        }
                                    >

                                        <Star
                                            size={
                                                14
                                            }
                                            fill="currentColor"
                                        />

                                        {rating}+
                                        stars

                                    </button>
                                )
                            )}

                        </div>


                        {/* ACTIONS */}

                        <div className="filter-actions">

                            <button
                                className="clear-button"
                                onClick={
                                    clearFilters
                                }
                            >
                                CLEAR ALL
                            </button>

                            <button
                                className="apply-button"
                                onClick={() =>
                                    setShowFilters(
                                        false
                                    )
                                }
                            >
                                APPLY FILTERS
                            </button>

                        </div>

                    </aside>

                </div>
            )}

        </div>
    );
}

export default Products;