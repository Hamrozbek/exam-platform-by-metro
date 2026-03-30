const BASE_URL = import.meta.env.VITE_API_URL || "http://13.60.163.115:8000/api/v1";

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

        // Backenddan kelgan xatolik xabarini qidirish
        let errorMessage = "Xatolik yuz berdi";

        if (typeof errorData === 'string') {
            errorMessage = errorData;
        } else if (errorData.detail) {
            errorMessage = errorData.detail;
        } else if (errorData.message) {
            errorMessage = errorData.message;
        } else if (errorData.non_field_errors) {
            errorMessage = Array.isArray(errorData.non_field_errors) ? errorData.non_field_errors[0] : errorData.non_field_errors;
        } else if (errorData.error) {
            errorMessage = errorData.error;
        } else if (typeof errorData === 'object') {
            const firstKey = Object.keys(errorData)[0];
            if (firstKey) {
                const val = errorData[firstKey];
                errorMessage = Array.isArray(val) ? val[0] : val;
            }
        }

        throw new Error(errorMessage);
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
        throw new Error(errorData.error || errorData.detail || "Fayl yuklashda xatolik");
    }

    return response.json();
};