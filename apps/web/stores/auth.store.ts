import { create } from 'zustand';
import { apiClient } from '../lib/api-client';

type User = { id: string; email: string; name: string; plan?: string };
type AuthState = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  loginAction: (e: string, p: string) => Promise<void>;
  registerAction: (n: string, e: string, p: string) => Promise<void>;
  googleLoginAction: (googleData: { email: string; name?: string; googleId?: string; credential?: string }) => Promise<void>;
  logoutAction: () => void;
  loadUser: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  loginAction: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      const token = res?.accessToken || res?.data?.accessToken;
      if (token) {
        localStorage.setItem('accessToken', token);
      }
      const user = await apiClient.get('/users/me');
      set({ user, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Credenciais inválidas', isLoading: false });
      throw err;
    }
  },

  registerAction: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.post('/auth/register', { name, email, password });
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Erro no cadastro', isLoading: false });
      throw err;
    }
  },

  googleLoginAction: async (googleData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.post('/auth/google', googleData);
      const token = res?.accessToken || res?.data?.accessToken;
      if (token) {
        localStorage.setItem('accessToken', token);
      }
      const user = await apiClient.get('/users/me');
      set({ user, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Erro ao autenticar com Google', isLoading: false });
      throw err;
    }
  },

  logoutAction: () => {
    localStorage.removeItem('accessToken');
    set({ user: null });
    if (typeof window !== 'undefined') window.location.href = '/login';
  },

  loadUser: async () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('accessToken');
    if (!token || token === 'undefined' || token === 'null') return;
    set({ isLoading: true });
    try {
      const user = await apiClient.get('/users/me');
      set({ user, isLoading: false });
    } catch {
      set({ user: null, isLoading: false });
      localStorage.removeItem('accessToken');
    }
  },
}));
