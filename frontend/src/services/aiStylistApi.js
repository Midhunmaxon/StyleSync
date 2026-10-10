import { apiFetch } from "./api.js";

export const askAIStylist = async (message, history = []) => {
    const response = await apiFetch("/api/ai/stylist", {
        method: "POST",
        body: JSON.stringify({ message, history })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || `AI Stylist request failed (${response.status})`);
    }

    return data;
};
