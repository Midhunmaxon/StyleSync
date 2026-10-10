import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) return <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>Loading StyleSync...</div>;

    if (!user) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    if (user.role === "admin" && !location.pathname.startsWith("/admin")) {
        return <Navigate to="/admin" replace />;
    }

    return children;
};

export default ProtectedRoute;
