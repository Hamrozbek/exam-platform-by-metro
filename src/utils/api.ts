const BASE_URL = import.meta.env.VITE_API_URL || "https://semiofficial-desirae-shamefacedly.ngrok-free.dev/api/v1";

// ─── Helpers ────────────────────────────────────────────────────────────────

export const getTokens = () => ({
    access: localStorage.getItem("access_token"),
    refresh: localStorage.getItem("refresh_token"),
});

const getFullUrl = (endpoint: string): string => {
    const cleanBase = BASE_URL.replace(/\/+$/, "");
    const cleanEndpoint = endpoint.replace(/^\/+|\/+$/g, "");
    return `${cleanBase}/${cleanEndpoint}/`;
};

const getCsrfToken = (): string => {
    const match = document.cookie.match(/csrftoken=([^;]+)/);
    return match ? match[1] : "";
};

const isAuthEndpoint = (endpoint: string): boolean =>
    endpoint.includes("login") || endpoint.includes("register");

const getAuthHeader = (endpoint: string): Record<string, string> => {
    const { access } = getTokens();
    return access && !isAuthEndpoint(endpoint)
        ? { Authorization: `Bearer ${access}` }
        : {};
};

// ─── API Functions ───────────────────────────────────────────────────────────

// 1. Oddiy JSON so'rovlar uchun
export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const fullUrl = getFullUrl(endpoint);

    const headers: HeadersInit = {
        "Content-Type": "application/json",
        "X-CSRFToken": getCsrfToken(),
        "ngrok-skip-browser-warning": "69420",
        ...getAuthHeader(endpoint),
        ...options.headers,
    };

    const response = await fetch(fullUrl, { ...options, headers });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Server xatosi:", errorData);
        throw new Error(errorData.detail || "Xatolik yuz berdi");
    }

    return response.json();
};

// 2. Fayl yuklash uchun
export const apiUpload = async (endpoint: string, formData: FormData) => {
    const fullUrl = getFullUrl(endpoint);

    const response = await fetch(fullUrl, {
        method: "POST",
        headers: {
            "X-CSRFToken": getCsrfToken(),
            "ngrok-skip-browser-warning": "69420",
            ...getAuthHeader(endpoint),
        },
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Server xatosi:", errorData);
        throw new Error(errorData.detail || "Fayl yuklashda xatolik");
    }

    return response.json();
};