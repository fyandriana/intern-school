// src/lib/api.js

// 1) Base URL from Vite env
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";

export async function signup(data) {
    const res = await fetch(`${API_BASE}/api/auth/signup`, {  // <-- add /api
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    const body = await res.json().catch(() => ({}));          // <-- parse once

    if (!res.ok) {
        const msg = body?.error || body?.message || `HTTP ${res.status}`;
        throw new Error(msg);                                    // <-- use parsed error
    }

    return body;                                               // <-- return parsed JSON
}

export async function login(data) {
    const res = await fetch(`${API_BASE}/api/auth/login`, { // <-- add /api
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    const body = await res.json().catch(() => ({}));        // <-- parse once

    if (!res.ok) {
        throw new Error(body?.error || body?.message || `HTTP ${res.status}`);
    }

    return body;                                            // { user: {...} }
}

