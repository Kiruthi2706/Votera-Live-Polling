
const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:8080";

export async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem("token");

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (token) {
        headers.Authorization = "Bearer " + token;
    }

    try {
        const response = await fetch(
            API_URL + endpoint,
            {
                ...options,
                headers
            }
        );

        let data = {};

        try {
            data = await response.json();
        } catch {
            data = {};
        }

        console.log(
            "API RESPONSE:",
            response.status,
            data
        );

        return {
            response,
            data
        };

    } catch (error) {

        console.error("API Error:", error);

        return {
            response: {
                ok: false,
                status: 0
            },
            data: {
                error: "Cannot connect to backend"
            }
        };
    }
}


export function getStoredUser() {

    const user =
        localStorage.getItem("user");

    if (!user) {
        return null;
    }

    try {
        return JSON.parse(user);
    } catch {
        return null;
    }
}


export function saveLogin(token, user) {

    localStorage.setItem(
        "token",
        token
    );

    localStorage.setItem(
        "user",
        JSON.stringify(user)
    );
}


export function logoutUser() {

    localStorage.removeItem("token");

    localStorage.removeItem("user");
}
