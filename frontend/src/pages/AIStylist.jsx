import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bot, Send, Sparkles, ShoppingBag, Plus } from "lucide-react";
import { askAIStylist } from "../services/aiStylistApi";
import { apiFetch } from "../services/api.js";
import { getProductImage } from "../utils/productImage.js";
import "./AIStylist.css";

const QUICK_PROMPTS = [
    "Elegant college farewell outfit under ₹3000",
    "A casual outfit for college",
    "A stylish party outfit",
    "A simple date-night look"
];

async function addProductToCart(product) {
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
    if (!response.ok) throw new Error(data.message || "Could not add to cart");
    return data;
}

function ProductRecommendation({ product, reason }) {
    const navigate = useNavigate();
    const [added, setAdded] = useState(false);

    const handleAdd = async (event) => {
        event.stopPropagation();
        try {
            await addProductToCart(product);
            setAdded(true);
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <article
            className="ai-product-card"
            onClick={() => navigate(`/product/${product._id}`)}
        >
            <div className="ai-product-image">
                <img
                    src={
                        getProductImage(product)
                    }
                    alt={product.name}
                />
            </div>

            <div className="ai-product-info">
                <span>{product.category}</span>
                <h3>{product.name}</h3>
                <strong>₹{product.price?.toLocaleString("en-IN")}</strong>
                {reason && <p>{reason}</p>}

                <button onClick={handleAdd}>
                    <Plus size={15} />
                    {added ? "Added to cart" : "Add to cart"}
                </button>
            </div>
        </article>
    );
}

function AIStylist() {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content:
                "Hi! I’m your StyleSync AI Stylist. Tell me the occasion, vibe, color, size, or budget you have in mind, and I’ll build a look from our actual catalogue. ✨"
        }
    ]);
    const [input, setInput] = useState("");
    const [recommendations, setRecommendations] = useState([]);
    const [outfit, setOutfit] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [outfitAdded, setOutfitAdded] = useState(false);

    const sendMessage = async (messageOverride = null) => {
        const message = (messageOverride ?? input).trim();
        if (!message || loading) return;

        const nextMessages = [
            ...messages,
            { role: "user", content: message }
        ];

        setMessages(nextMessages);
        setInput("");
        setLoading(true);
        setError("");
        setOutfitAdded(false);

        try {
            const result = await askAIStylist(message, nextMessages);

            setMessages((current) => [
                ...current,
                { role: "assistant", content: result.reply }
            ]);
            setRecommendations(result.recommendations || []);
            setOutfit(result.outfit || null);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setLoading(false);
        }
    };

    const addEntireOutfit = () => {
        if (!outfit?.products?.length) return;

        outfit.products.forEach((product) => addProductToCart(product));
        setOutfitAdded(true);
    };

    return (
        <div className="ai-stylist-page">
            <header className="ai-stylist-header">
                <button onClick={() => navigate(-1)} className="ai-back-button">
                    <ArrowLeft size={18} />
                    Back
                </button>

                <div className="ai-brand">
                    <Sparkles size={19} />
                    <span>StyleSync AI Stylist</span>
                </div>

                <button
                    className="ai-cart-button"
                    onClick={() => navigate("/cart")}
                >
                    <ShoppingBag size={19} />
                    Cart
                </button>
            </header>

            <main className="ai-stylist-layout">
                <section className="ai-chat-panel">
                    <div className="ai-intro">
                        <div className="ai-avatar">
                            <Bot size={25} />
                        </div>
                        <div>
                            <p className="ai-eyebrow">PERSONAL STYLE ASSISTANT</p>
                            <h1>Find your next look.</h1>
                            <p>
                                Describe what you want naturally. I’ll match your request
                                against StyleSync’s live product catalogue.
                            </p>
                        </div>
                    </div>

                    <div className="ai-quick-prompts">
                        {QUICK_PROMPTS.map((prompt) => (
                            <button
                                key={prompt}
                                onClick={() => sendMessage(prompt)}
                                disabled={loading}
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>

                    <div className="ai-messages">
                        {messages.map((message, index) => (
                            <div
                                key={`${message.role}-${index}`}
                                className={`ai-message ${message.role}`}
                            >
                                {message.content}
                            </div>
                        ))}

                        {loading && (
                            <div className="ai-message assistant ai-loading">
                                <span></span><span></span><span></span>
                                Finding your best matches…
                            </div>
                        )}
                    </div>

                    {error && <div className="ai-error">{error}</div>}

                    <form
                        className="ai-input-row"
                        onSubmit={(event) => {
                            event.preventDefault();
                            sendMessage();
                        }}
                    >
                        <input
                            value={input}
                            onChange={(event) => setInput(event.target.value)}
                            placeholder="Try: black party outfit under ₹2500"
                            disabled={loading}
                        />
                        <button type="submit" disabled={loading || !input.trim()}>
                            <Send size={18} />
                        </button>
                    </form>
                </section>

                <aside className="ai-results-panel">
                    <div className="ai-results-heading">
                        <p className="ai-eyebrow">CURATED FOR YOU</p>
                        <h2>Style recommendations</h2>
                    </div>

                    {outfit?.products?.length > 0 && (
                        <section className="ai-outfit-box">
                            <div>
                                <span className="ai-outfit-label">COMPLETE LOOK</span>
                                <h3>Your AI-picked outfit</h3>
                                <p>
                                    {outfit.products.length} pieces · ₹{outfit.total?.toLocaleString("en-IN")}
                                </p>
                            </div>

                            <button onClick={addEntireOutfit}>
                                <ShoppingBag size={16} />
                                {outfitAdded ? "Outfit added" : "Add entire outfit"}
                            </button>
                        </section>
                    )}

                    {recommendations.length === 0 && !loading ? (
                        <div className="ai-empty-results">
                            <Sparkles size={28} />
                            <h3>Your recommendations will appear here.</h3>
                            <p>Start with a quick prompt or describe your ideal outfit.</p>
                        </div>
                    ) : (
                        <div className="ai-product-list">
                            {recommendations.map(({ product, reason }) => (
                                <ProductRecommendation
                                    key={product._id}
                                    product={product}
                                    reason={reason}
                                />
                            ))}
                        </div>
                    )}
                </aside>
            </main>
        </div>
    );
}

export default AIStylist;
