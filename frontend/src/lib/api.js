import { clearAuth } from '@/lib/auth'
export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ""
export const USER_INFO_URL = `${API_BASE}/api/v1/users/me`
export const FOOD_ITEMS_URL = `${API_BASE}/api/v1/food-items`
export const VISION_DETECT_URL = `${API_BASE}/api/v1/vision/detect-items`
export const RECIPES_URL = `${API_BASE}/api/v1/recipes/get-recipe-suggestions`
export const SAVED_RECIPES_URL = `${API_BASE}/api/v1/recipes`
export const REPORTS_FREQUENTLY_USED_URL = `${API_BASE}/api/v1/reports/frequently-used`
export const REPORTS_FREQUENTLY_WASTED_URL = `${API_BASE}/api/v1/reports/frequently-wasted`
export const REPORTS_UNUSED_URL = `${API_BASE}/api/v1/reports/unused`

let isRedirecting = false

export async function apiFetch(url, options = {}) {
    const token = localStorage.getItem("access_token")
    const res = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
    })

    if (res.status === 401) {
        if (!isRedirecting) {
            isRedirecting = true
            clearAuth()
            window.location.href = "/login"
        }
        throw new Error("Session expired")
    }

    if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail ?? `Request failed (${res.status})`)
    }

    if (options["method"] === "DELETE" || res.status === 204) return {}

    return res.json()
}