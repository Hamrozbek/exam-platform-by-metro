import { create } from 'zustand';
import { apiFetch } from '../utils/api';
import { toast } from 'sonner';

interface AuthState {
    token: string | null;
    isLoading: boolean;
    login: (credentials: Record<string, any>) => Promise<void>;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
    token: localStorage.getItem('access_token'),
    isLoading: false,

    // authStore.ts ichidagi login funksiyasi
    login: async (credentials) => {
        set({ isLoading: true });
        try {
            const result = await apiFetch('users/login', {
                method: 'POST',
                body: JSON.stringify(credentials)
            });

            const token = result.access || result.token;
            const role = result.role; // Backenddan role kelishi kerak (ADMIN, MANAGER, USER)

            if (token) {
                localStorage.setItem('access_token', token);
                localStorage.setItem('user_role', role); // Rolni saqlab qo'yamiz

                set({ token, isLoading: false });

                // ROLGA QARAB YO'NALTIRISH
                if (role === 'ADMIN') {
                    window.location.href = "/admin/dashboard";
                } else if (role === 'MANAGER') {
                    window.location.href = "/manager/results";
                } else {
                    window.location.href = "/user/welcome";
                }
            }
        } catch (error: any) {
            set({ isLoading: false });
            toast.error("Xatolik yuz berdi");
        }
    },

    logout: () => {
        localStorage.clear();
        set({ token: null });
        window.location.href = "/login";
    }
}));