import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "../services/api.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        try {
            const response = await apiFetch("/api/auth/me");
            if (!response.ok) {
                setUser(null);
                return false;
            }
            const data = await response.json();
            setUser(data.user);
            return true;
        } catch {
            setUser(null);
            return false;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const logout = async () => {
        try {
            await apiFetch("/api/auth/logout", { method: "POST" });
        } finally {
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, checkAuth, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
