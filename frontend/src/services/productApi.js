import { API_URL } from "./api.js";

const request = async (path, options = {}) => {
    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        credentials: "include"
    });
    if (!response.ok) throw new Error("Request failed");
    return response.json();
};

export const getProducts = async (signal) => request("/api/products", { signal });
export const getTrendingProducts = async () => request("/api/products/trending");
export const getFeaturedProducts = async () => request("/api/products/featured");
export const getCompleteLooks = async () => request("/api/outfits?style=casual&occasion=college&maxPrice=5000");
