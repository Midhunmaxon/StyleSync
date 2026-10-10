import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>Loading admin portal...</div>;
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== "admin") return <Navigate to="/" replace />;

    return children;
};

export default AdminRoute;
