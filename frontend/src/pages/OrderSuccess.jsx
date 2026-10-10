import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, Package } from "lucide-react";
import "./Account.css";

const OrderSuccess = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const order = state?.order;

    return (
        <div className="account-page">
            <main className="success-card">
                <CheckCircle2 size={72} />
                <p className="account-eyebrow">STYLESYNC</p>
                <h1>Order placed successfully</h1>
                <p>Your order has been saved. No payment was charged.</p>
                {order && (
                    <div className="success-order">
                        <span>Order number</span><strong>{order.orderNumber}</strong>
                        <span>Total</span><strong>₹{order.totalAmount?.toLocaleString("en-IN")}</strong>
                        <span>Status</span><strong>{order.status}</strong>
                    </div>
                )}
                <div className="success-actions">
                    <button onClick={() => navigate("/orders")}><Package size={17}/> VIEW MY ORDERS</button>
                    <button onClick={() => navigate("/products")}>CONTINUE SHOPPING</button>
                </div>
            </main>
        </div>
    );
};

export default OrderSuccess;
