import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import App from "./App.jsx";
import Products from "./pages/products.jsx";
import ProductDetails from "./pages/productDetails.jsx";
import Cart from "./pages/Cart.jsx";
import BuyNow from "./pages/Buy.jsx";
import AIStylist from "./pages/AIStylist.jsx";
import Profile from "./pages/Profile.jsx";
import Orders from "./pages/Orders.jsx";
import OrderSuccess from "./pages/OrderSuccess.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";

import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/protectedRoutes.jsx";
import AdminRoute from "./components/AdminRoute.jsx";

import "./index.css";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    {/* Shared authentication pages */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Customer storefront */}
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <App />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/products"
                        element={
                            <ProtectedRoute>
                                <Products />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/product/:id"
                        element={
                            <ProtectedRoute>
                                <ProductDetails />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/cart"
                        element={
                            <ProtectedRoute>
                                <Cart />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/checkout"
                        element={
                            <ProtectedRoute>
                                <BuyNow />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/payment"
                        element={
                            <ProtectedRoute>
                                <BuyNow />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/order-success"
                        element={
                            <ProtectedRoute>
                                <OrderSuccess />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/orders"
                        element={
                            <ProtectedRoute>
                                <Orders />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/ai-stylist"
                        element={
                            <ProtectedRoute>
                                <AIStylist />
                            </ProtectedRoute>
                        }
                    />

                    {/* Admin dashboard — separate, role-protected area */}
                    <Route
                        path="/admin"
                        element={
                            <AdminRoute>
                                <AdminDashboard />
                            </AdminRoute>
                        }
                    />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>
);