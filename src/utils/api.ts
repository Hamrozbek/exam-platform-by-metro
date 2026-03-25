const BASE_URL = import.meta.env.VITE_API_URL || "/api";

export const getTokens = () => ({
    access: localStorage.getItem("access_token"),
    refresh: localStorage.getItem("refresh_token"),
});

const getFullUrl = (endpoint: string) => {
    const cleanBase = BASE_URL.replace(/\/+$/, "");
    // endpoint boshidagi va oxiridagi slash-larni olib tashla, keyin bitta '/' qo'sh
    const cleanEndpoint = endpoint.replace(/^\/+|\/+$/g, "");
    return `${cleanBase}/${cleanEndpoint}/`;
};

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const { access } = getTokens();
    const fullUrl = getFullUrl(endpoint);

    const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(access && { Authorization: `Bearer ${access}` }),
        ...options.headers,
    };

    const response = await fetch(fullUrl, { ...options, headers });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Xatolik yuz berdi");
    }

    return response.json();
};

export const apiUpload = async (endpoint: string, formData: FormData) => {
    const { access } = getTokens();
    const fullUrl = getFullUrl(endpoint);

    const response = await fetch(fullUrl, {
        method: "POST",
        headers: {
            ...(access && { Authorization: `Bearer ${access}` }),
        },
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Fayl yuklashda xatolik");
    }

    return response.json();
};