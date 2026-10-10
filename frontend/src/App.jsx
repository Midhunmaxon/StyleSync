import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import { apiFetch } from "./services/api.js";
import {
    Search,
    User,
   
    ShoppingBag,
    ChevronRight,
    Truck,
    ShieldCheck,
    RotateCcw,
    Headphones,
    Star,
    Menu,
    X,
    Sparkles
} from "lucide-react";

import {
    getProducts,
    getTrendingProducts,
    getFeaturedProducts,
    getCompleteLooks
} from "./services/productApi";

import "./index.css";

function App() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [cartCount, setCartCount] = useState(0);
    const [products, setProducts] = useState([]);
    const [trending, setTrending] = useState([]);
    const [featured, setFeatured] = useState([]);
    const [completeLooks, setCompleteLooks] = useState([]);

    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const [
                    allProducts,
                    trendingProducts,
                    featuredProducts,
                    looks
                ] = await Promise.all([
                    getProducts(),
                    getTrendingProducts(),
                    getFeaturedProducts(),
                    getCompleteLooks()
                ]);

                setProducts(allProducts.products || []);
                setTrending(trendingProducts.products || []);
                setFeatured(featuredProducts.products || []);
                setCompleteLooks(looks.outfits || []);
            } catch (error) {
                console.error("Failed to load homepage data:", error);
            }
        };

        loadProducts();
        apiFetch("/api/cart").then(r => r.ok ? r.json() : null).then(data => {
            if (data) setCartCount((data.items || []).reduce((sum, item) => sum + item.quantity, 0));
        }).catch(() => {});
    }, []);

    return (
        <div className="app">

            {/* TOP ANNOUNCEMENT */}

            <div className="announcement">
                <span>!</span>

                <p>
                    FREE SHIPPING on orders above ₹1499
                </p>

                <span>!</span>
            </div>


            {/* NAVBAR */}

            <header className="navbar">

                <div className="logo">
                    STYLESYNC
                </div>

                


                <div className="nav-actions">

            <nav
                    className={
                        menuOpen
                            ? "nav-links mobile-open"
                            : "nav-links"
                    }
                >
                    <a href="#shop" onClick={()=>navigate("/products")}>Shop</a>
                    <a href="#collections">Collections</a>
                    
                </nav>

                    <button
                        className="ai-nav-button"
                        onClick={() => navigate("/ai-stylist")}
                        aria-label="Open AI Stylist"
                    >
                        <Sparkles size={17} />
                        <span>AI Stylist</span>
                    </button>

                    


                    <button onClick={() => navigate("/profile")} aria-label="Profile">
                        <User size={21} />
                    </button>


                    


                    <button
                        className="cart-button"
                        onClick={() => navigate("/cart")}
                    >
                        <ShoppingBag size={22} />
                        {cartCount > 0 && <span>{cartCount}</span>}
                    </button>


                    <button className="profile-name-button" onClick={() => navigate("/profile")}>
                        {user?.name?.split(" ")[0] || "Profile"}
                    </button>

                    <button className="menu-button"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        {menuOpen ? (
                            <X size={23} />
                        ) : (
                            <Menu size={23} />
                        )}
                    </button>

                </div>

            </header>


            {/* HERO */}

            <section className="hero">

                <div className="hero-content">

                    <span className="hero-label">
                        NEW SEASON 2026
                    </span>

                    <h1>
                        Define Your
                        <br />
                        Everyday Style.
                    </h1>

                    <p>
                        Discover premium quality fashion that
                        <br />
                        fits your vibe and your lifestyle.
                    </p>


                    <div className="hero-buttons">

                        <button className="primary-button"
                        onClick={()=>navigate("/products")}>
                            SHOP NOW
                        </button>

                        <button className="secondary-button">
                            <a href="#collections">
                                EXPLORE COLLECTION
                            </a>
                            
                           
                            
                        
                        </button>

                    </div>

                </div>


                <div className="hero-image">

                    <img
                        src="https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1400&q=85"
                        alt="Fashion collection"
                    />

                </div>


                <div className="hero-dots">

                    <span className="active"></span>
                    <span></span>
                    <span></span>

                </div>

            </section>


            {/* BENEFITS */}

            <section className="benefits">

                <Benefit
                    icon={<Truck />}
                    title="Free Shipping"
                    text="On orders above ₹1499"
                />

                <Benefit
                    icon={<ShieldCheck />}
                    title="Secure Payments"
                    text="100% secure & trusted"
                />

                <Benefit
                    icon={<RotateCcw />}
                    title="Easy Returns"
                    text="7 days return policy"
                />

                <Benefit
                    icon={<Headphones />}
                    title="24/7 Support"
                    text="We're here to help"
                />

            </section>


            {/* CATEGORIES */}

            <section
                className="section"
                id="collections"
            >

                <div className="section-header">

                    <h2>
                        Shop By Category
                    </h2>

                </div>


                <div className="categories">

                    <Category
                        title="MEN"
                        image="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=600&q=80"
                    />

                    <Category
                        title="WOMEN"
                        image="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80"
                    />

                    <Category
                        title="HOODIES"
                        image="https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=600&q=80"
                    />

                    <Category
                        title="JEANS"
                        image="https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=600&q=80"
                    />

                    <Category
                        title="SNEAKERS"
                        image="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80"
                    />

                    <Category
                        title="ACCESSORIES"
                        image="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80"
                    />

                </div>

            </section>


            {/* TRENDING */}

            <ProductSection
                title="TRENDING NOW"
                products={
                    trending.length
                        ? trending
                        : products
                }
            />


            {/* NEW ARRIVALS */}

            <ProductSection
                title="NEW ARRIVALS"
                products={
                    featured.length
                        ? featured
                        : products
                }
            />


            


            {/* NEWSLETTER */}

            <section className="newsletter">

                <div className="newsletter-icon">
                    ✉
                </div>


                <div>

                    <h2>
                        Get Style Updates
                    </h2>

                    <p>
                        Join our newsletter and get 10% off your first order.
                    </p>

                </div>


                <div className="newsletter-form">

                    <input
                        type="email"
                        placeholder="Enter your email address"
                    />

                    <button>
                        SUBSCRIBE
                    </button>

                </div>

            </section>


            {/* FOOTER */}

            <footer>

                <div className="footer-brand">

                    <h2>
                        STYLESYNC
                    </h2>

                    <p>
                        Your style. Your vibe.
                        <br />
                        Your way.
                    </p>

                    <div className="socials">
                        ○ ○ ○ ○ ○
                    </div>

                </div>


                <FooterColumn
                    title="SHOP"
                    links={[
                        "All Products",
                        "Men",
                        "Women",
                        "Hoodies",
                        "Jeans",
                        "Sneakers",
                        "Accessories"
                    ]}
                />


                <FooterColumn
                    title="CUSTOMER CARE"
                    links={[
                        "Contact Us",
                        "Track Order",
                        "Returns & Refunds",
                        "Shipping Policy",
                        "Size Guide",
                        "FAQ"
                    ]}
                />


                <FooterColumn
                    title="COMPANY"
                    links={[
                        "About Us",
                        "Careers",
                        "Press",
                        "Sustainability",
                        "Terms & Conditions",
                        "Privacy Policy"
                    ]}
                />

            </footer>


            <div className="copyright">
                © 2026 StyleSync. All rights reserved.
            </div>

        </div>
    );
}


/* ============================= */
/* BENEFIT COMPONENT */
/* ============================= */

function Benefit({ icon, title, text }) {

    return (

        <div className="benefit">

            {icon}

            <div>

                <strong>
                    {title}
                </strong>

                <span>
                    {text}
                </span>

            </div>

        </div>

    );
}


/* ============================= */
/* CATEGORY COMPONENT */
/* ============================= */

function Category({ title, image }) {

    return (

        <div className="category-card">

            <img
                src={image}
                alt={title}
            />

            <div className="category-overlay">
                {title}
            </div>

        </div>

    );
}


/* ============================= */
/* PRODUCT SECTION */
/* ============================= */

function ProductSection({ title, products }) {

    return (

        <section className="section">

            <div className="section-header">

                <h2>
                    {title}
                </h2>

                <button>
                    View All
                    <ChevronRight size={17} />
                </button>

            </div>


            <div className="product-grid">

                {products
                    .slice(0, 6)
                    .map((product) => (

                        <ProductCard
                            key={product._id}
                            product={product}
                        />

                    ))}

            </div>

        </section>

    );

}



/* ============================= */
/* PRODUCT CARD */
/* ============================= */


function ProductCard({ product }) {
    const navigate = useNavigate();

    const image =
        product.images?.[0] ||
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=80";

    return (
        <article
            className="product-card"
            onClick={() => navigate(`/product/${product._id}`)}
        >
            <div className="product-image">
                <img src={image} alt={product.name} />

                {product.discountPercentage > 0 && (
                    <span className="discount">
                        -{product.discountPercentage}%
                    </span>
                )}
            </div>

            <div className="product-info">
                <h3>{product.name}</h3>

                <div className="price-row">
                    <strong>
                        ₹{product.price?.toLocaleString("en-IN")}
                    </strong>

                    {product.discountPercentage > 0 && (
                        <span className="old-price">
                            ₹
                            {Math.round(
                                product.price /
                                    (1 - product.discountPercentage / 100)
                            ).toLocaleString("en-IN")}
                        </span>
                    )}
                </div>

                <div className="rating">
                    <Star size={14} fill="currentColor" />
                    <span>{product.rating || "0"}</span>
                    <small>({product.reviewCount || 0})</small>
                </div>
            </div>
        </article>
    );
}



/* ============================= */
/* COMPLETE LOOK CARD */
/* ============================= */

function LookCard({ look }) {

    const topImage =
        look.top?.images?.[0] ||
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=300&q=80";


    const bottomImage =
        look.bottom?.images?.[0] ||
        "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=300&q=80";


    const shoeImage =
        look.shoes?.images?.[0] ||
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80";


    return (

        <div className="look-card">

            <div className="look-images">

                <img
                    src={topImage}
                    alt={look.top?.name || "Top"}
                />

                <img
                    src={bottomImage}
                    alt={look.bottom?.name || "Bottom"}
                />

                <img
                    src={shoeImage}
                    alt={look.shoes?.name || "Shoes"}
                />

            </div>


            <div className="look-info">

                <h3>
                    Complete the Look
                </h3>


                <p>
                    {look.top?.name}
                    {" + "}
                    {look.bottom?.name}
                    {" + "}
                    {look.shoes?.name}
                </p>


                <strong>
                    ₹
                    {look.totalPrice?.toLocaleString("en-IN")}
                </strong>

            </div>

        </div>

    );

}


/* ============================= */
/* FOOTER COLUMN */
/* ============================= */

function FooterColumn({ title, links }) {

    return (

        <div className="footer-column">

            <h3>
                {title}
            </h3>


            {links.map((link) => (

                <a
                    key={link}
                    href="#"
                >
                    {link}
                </a>

            ))}

        </div>

    );

}


export default App;