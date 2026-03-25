import { create } from 'zustand';
import { apiFetch } from '../utils/api';
import { toast } from 'sonner';

interface AuthState {
    token: string | null;
    role: string | null;
    isLoading: boolean;
    login: (credentials: Record<string, any>) => Promise<void>;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
    // Dastlabki qiymatlarni localStorage'dan olamiz
    token: localStorage.getItem('access_token'),
    role: localStorage.getItem('user_role'),
    isLoading: false,

    login: async (credentials) => {
        set({ isLoading: true });
        try {
            // API Dokumentatsiyasiga ko'ra: users/login/
            const result = await apiFetch('users/login', {
                method: 'POST',
                body: JSON.stringify(credentials),
            });

            // Backenddan keladigan ma'lumotlar (access va role)
            const token = result.access || result.token;
            const role = result.role; // ADMIN, MANAGER, USER

            if (token && role) {
                localStorage.setItem('access_token', token);
                localStorage.setItem('user_role', role);

                set({ token, role, isLoading: false });

                toast.success("Tizimga muvaffaqiyatli kirdingiz!");

                // ROLGA QARAB YO'NALTIRISH (Hard refresh bilan)
                const redirectMap: Record<string, string> = {
                    'ADMIN': '/admin/dashboard',
                    'MANAGER': '/manager/results',
                    'USER': '/user/welcome'
                };

                window.location.href = redirectMap[role] || '/';
            } else {
                throw new Error("Token yoki Role topilmadi");
            }
        } catch (error: any) {
            set({ isLoading: false });
            // API'dan kelgan aniq xatolik xabari
            toast.error(error.message || "Kirishda xatolik yuz berdi");
            throw error;
        }
    },

    logout: () => {
        localStorage.clear();
        set({ token: null, role: null, isLoading: false });
        window.location.href = "/login";
    }
}));