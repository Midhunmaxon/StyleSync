import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, ArrowLeft } from "lucide-react";
import { apiFetch } from "../services/api.js";
import { getProductImage } from "../utils/productImage.js";
import "./Account.css";

const Orders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiFetch("/api/orders/my")
            .then(r => r.json())
            .then(data => setOrders(data.orders || []))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="account-page">
            <header className="account-header">
                <button onClick={() => navigate("/")}><ArrowLeft size={18}/> StyleSync</button>
                <strong>MY ORDERS</strong>
                <button onClick={() => navigate("/profile")}>Profile</button>
            </header>
            <main className="orders-container">
                <div className="account-title"><p className="account-eyebrow">YOUR ACCOUNT</p><h1>My Orders</h1><span>Track every StyleSync purchase in one place.</span></div>
                {loading ? <p>Loading orders...</p> : !orders.length ? (
                    <div className="account-empty"><Package size={48}/><h2>No orders yet</h2><p>Once you place an order, it will appear here.</p><button onClick={() => navigate("/products")}>START SHOPPING</button></div>
                ) : orders.map(order => (
                    <article className="order-card" key={order._id}>
                        <div className="order-card-top">
                            <div><span>Order</span><strong>{order.orderNumber}</strong></div>
                            <div><span>Placed</span><strong>{new Date(order.createdAt).toLocaleDateString("en-IN")}</strong></div>
                            <div><span>Status</span><strong className="status-pill">{order.status}</strong></div>
                        </div>
                        <div className="order-items">
                            {order.items.map(item => (
                                <div className="order-item" key={`${item.product}-${item.size}-${item.color}`}>
                                    <img src={getProductImage({ images: [item.image], category: "" })} alt={item.name}/>
                                    <div><strong>{item.name}</strong><span>Qty {item.quantity}{item.size ? ` • Size ${item.size}` : ""}{item.color ? ` • ${item.color}` : ""}</span></div>
                                    <strong>₹{(item.price * item.quantity).toLocaleString("en-IN")}</strong>
                                </div>
                            ))}
                        </div>
                        <div className="order-total"><span>Total</span><strong>₹{order.totalAmount.toLocaleString("en-IN")}</strong></div>
                    </article>
                ))}
            </main>
        </div>
    );
};

export default Orders;
