export const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

export const apiFetch = (path, options = {}) =>
    fetch(`${API_URL}${path}`, {
        ...options,
        credentials: "include",
        headers: {
            ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
            ...(options.headers || {})
        }
    });
