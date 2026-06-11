export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export const FOOD_ITEMS_URL = `${API_BASE}/v1/food-items`;
export const VISION_DETECT_URL = `${API_BASE}/v1/vision/detect-items`;
export const RECIPES_URL = `${API_BASE}/v1/recipes/get-recipe-suggestions`;
export const REPORTS_FREQUENTLY_USED_URL = `${API_BASE}/v1/reports/frequently-used`;
export const REPORTS_FREQUENTLY_WASTED_URL = `${API_BASE}/v1/reports/frequently-wasted`;
export const REPORTS_UNUSED_URL = `${API_BASE}/v1/reports/unused`;

export async function apiFetch(url, token, options = {}) {
    const res = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail ?? `Request failed (${res.status})`);
    }
    if (options["method"] == "DELETE" || res.status == 204)
        return {}

    return res.json();
}
