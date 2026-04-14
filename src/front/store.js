export const initialStore = () => ({
    token: localStorage.getItem("token") || null,
    user: JSON.parse(localStorage.getItem("user") || "null"),
    currentResult: null,
    history: [],
});

export default function storeReducer(store, action = {}) {
    switch (action.type) {

        case "login":
            localStorage.setItem("token", action.payload.token);
            localStorage.setItem("user", JSON.stringify(action.payload.user));
            return { ...store, token: action.payload.token, user: action.payload.user };

        case "logout":
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            return { ...store, token: null, user: null, currentResult: null, history: [] };

        case "set_result":
            return { ...store, currentResult: action.payload };

        case "set_history":
            return { ...store, history: action.payload };

        case "add_generation":
            return { ...store, history: [action.payload, ...store.history] };

        case "delete_generation":
            return { ...store, history: store.history.filter(g => g.id !== action.payload) };

        default:
            throw new Error("Unknown action: " + action.type);
    }
}
