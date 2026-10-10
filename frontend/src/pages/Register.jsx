import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";
import { apiFetch } from "../services/api.js";

const Register = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (
            !formData.name ||
            !formData.email ||
            !formData.password
        ) {
            setError("Please fill in all fields.");
            return;
        }

        if (formData.password.length < 6) {
            setError(
                "Password must contain at least 6 characters."
            );
            return;
        }

        try {
            setLoading(true);

            const response = await apiFetch("/api/auth/register", { method: "POST", body: JSON.stringify(formData) });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Registration failed."
                );
            }

            setSuccess(
                "Account created successfully. Redirecting to login..."
            );

            setTimeout(() => {
                navigate("/login");
            }, 1200);

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">

            <div className="register-brand">
                <button onClick={() => navigate("/")}>
                    STYLESYNC
                </button>
            </div>

            <div className="register-wrapper">

                <div className="register-card">

                    <div className="register-heading">

                        <p>JOIN STYLESYNC</p>

                        <h1>
                            Create your account
                        </h1>

                        <span>
                            Build your wardrobe. Discover your style.
                        </span>

                    </div>

                    {error && (
                        <div className="register-error">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="register-success">
                            {success}
                        </div>
                    )}

                    <form
                        className="register-form"
                        onSubmit={handleSubmit}
                    >

                        <div className="register-field">

                            <label>
                                Full Name
                            </label>

                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your name"
                                autoComplete="name"
                            />

                        </div>

                        <div className="register-field">

                            <label>
                                Email Address
                            </label>

                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                autoComplete="email"
                            />

                        </div>

                        <div className="register-field">

                            <label>
                                Password
                            </label>

                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Create a password"
                                autoComplete="new-password"
                            />

                        </div>

                        <button
                            className="register-submit"
                            type="submit"
                            disabled={loading}
                        >
                            {loading
                                ? "CREATING ACCOUNT..."
                                : "CREATE ACCOUNT"}
                        </button>

                    </form>

                    <div className="register-divider">
                        <span>OR</span>
                    </div>

                    <p className="register-switch">
                        Already have an account?
                        <Link to="/login">
                            Sign in
                        </Link>
                    </p>

                </div>

            </div>

        </div>
    );
};

export default Register;
