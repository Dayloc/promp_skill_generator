const BASE = import.meta.env.VITE_BACKEND_URL || "";

const authHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("token") || ""}`,
});

const jsonHeaders = () => ({ "Content-Type": "application/json" });

export const api = {
    post: (path, body, auth = false) =>
        fetch(`${BASE}${path}`, {
            method: "POST",
            headers: auth ? authHeaders() : jsonHeaders(),
            body: JSON.stringify(body),
        }),

    get: (path) =>
        fetch(`${BASE}${path}`, { headers: authHeaders() }),

    del: (path) =>
        fetch(`${BASE}${path}`, { method: "DELETE", headers: authHeaders() }),
};
