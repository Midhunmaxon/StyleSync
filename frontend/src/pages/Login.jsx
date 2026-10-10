import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { apiFetch } from "../services/api.js";
import "./Login.css";

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { checkAuth } = useAuth();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        if (!formData.email.trim() || !formData.password) {
            setError("Please fill in all fields.");
            return;
        }

        try {
            setLoading(true);

            const response = await apiFetch("/api/auth/login", {
                method: "POST",
                body: JSON.stringify({
                    email: formData.email.trim(),
                    password: formData.password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Invalid email or password."
                );
            }

            const authenticated = await checkAuth();

            if (!authenticated) {
                throw new Error(
                    "Login succeeded, but the session could not be verified."
                );
            }

            // Use the verified authenticated user's role.
            const role = data.user?.role;

            if (role === "admin") {
                navigate("/admin", { replace: true });
                return;
            }

            // Prevent a normal customer from being redirected
            // to an admin URL saved in the previous location.
            const requestedPath = location.state?.from;
            const redirectPath =
                typeof requestedPath === "string" &&
                requestedPath.startsWith("/") &&
                !requestedPath.startsWith("//") &&
                !requestedPath.startsWith("/admin")
                    ? requestedPath
                    : "/";

            navigate(redirectPath, { replace: true });
        } catch (error) {
            setError(error.message || "Unable to sign in. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-brand">
                <button
                    type="button"
                    onClick={() => navigate("/login")}
                >
                    STYLESYNC
                </button>
            </div>

            <div className="auth-wrapper">
                <div className="auth-card">
                    <div className="auth-heading">
                        <p>WELCOME BACK</p>
                        <h1>Sign in to StyleSync</h1>
                        <span>
                            Discover your style. Continue where you left off.
                        </span>
                    </div>

                    {error && (
                        <div className="auth-error" role="alert">
                            {error}
                        </div>
                    )}

                    <form
                        className="auth-form"
                        onSubmit={handleSubmit}
                    >
                        <div className="auth-field">
                            <label htmlFor="login-email">
                                Email Address
                            </label>

                            <input
                                id="login-email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={(event) =>
                                    setFormData({
                                        ...formData,
                                        email: event.target.value
                                    })
                                }
                                placeholder="Enter your email"
                                autoComplete="username"
                                required
                            />
                        </div>

                        <div className="auth-field">
                            <label htmlFor="login-password">
                                Password
                            </label>

                            <input
                                id="login-password"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={(event) =>
                                    setFormData({
                                        ...formData,
                                        password: event.target.value
                                    })
                                }
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                required
                            />
                        </div>

                        <button
                            className="auth-submit"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "SIGNING IN..." : "SIGN IN"}
                        </button>
                    </form>

                    <div className="auth-divider">
                        <span>OR</span>
                    </div>

                    <p className="auth-switch">
                        Don't have an account?{" "}
                        <Link to="/register">Create account</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;