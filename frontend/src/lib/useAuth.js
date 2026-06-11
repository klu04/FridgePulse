// Name: Paula Tica
// Date: 05/23/2026

import { useState, useEffect } from "react";
import { API_BASE } from "./api"; // adjust path as needed

let listeners = [];
let state = {
    user: JSON.parse(localStorage.getItem("user")),
    token: localStorage.getItem("token"),
};

function setState(newState) {
    state = { ...state, ...newState };
    listeners.forEach((l) => l(state));
}

export function useAuth() {
    const [, rerender] = useState(0);

    useEffect(() => {
        const listener = () => rerender((n) => n + 1);
        listeners.push(listener);
        return () => { listeners = listeners.filter((l) => l !== listener); };
    }, []);

    const login = async ({ email, password }) => {
        const body = new URLSearchParams({
            username: email, // OAuth2PasswordRequestForm uses "username" but accepts email per API note
            password,
        });

        const res = await fetch(`${API_BASE}/v1/tokens`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body,
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail ?? `Login failed (${res.status})`);
        }

        const { access_token } = await res.json();

        // /v1/tokens only returns a token — fetch the user separately if needed,
        // or decode the JWT. For now we store email as a lightweight user object.
        const user = { email };

        localStorage.setItem("token", access_token);
        localStorage.setItem("user", JSON.stringify(user));
        setState({ token: access_token, user });
    };

    const register = async ({ name, email, password }) => {
        const res = await fetch(`${API_BASE}/v1/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email_address: email, password }),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            const detail = err.detail;
            const message = Array.isArray(detail)
                ? detail.map((e) => e.msg).join(", ")
                : detail ?? `Registration failed (${res.status})`;
            throw new Error(message);
        }

        return res.json(); // { id, name, email_address }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setState({ token: null, user: null });
    };

    const isAuthenticated = () => !!state.token;

    return { login, register, logout, isAuthenticated, user: state.user, token: state.token };
}