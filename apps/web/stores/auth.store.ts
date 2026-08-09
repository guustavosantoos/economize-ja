import { create } from 'zustand';
import { apiClient } from '../lib/api-client';

type User = { id: string; email: string; name: string; plan?: string };
type AuthState = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  loginAction: (e: string, p: string, rememberMe?: boolean) => Promise<void>;
  registerAction: (n: string, e: string, p: string) => Promise<void>;
  googleLoginAction: (googleData: { email: string; name?: string; googleId?: string; credential?: string }) => Promise<void>;
  logoutAction: () => void;
  loadUser: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  loginAction: async (email, password, rememberMe = true) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      const token = res?.accessToken || res?.data?.accessToken;
      const refreshToken = res?.refreshToken || res?.data?.refreshToken;
      if (token) {
        localStorage.setItem('accessToken', token);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        localStorage.setItem('loginTimestamp', String(Date.now()));
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
          localStorage.setItem('rememberedEmail', email.trim());
        } else {
          localStorage.removeItem('rememberMe');
          localStorage.removeItem('rememberedEmail');
        }
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
      const refreshToken = res?.refreshToken || res?.data?.refreshToken;
      if (token) {
        localStorage.setItem('accessToken', token);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        localStorage.setItem('loginTimestamp', String(Date.now()));
        localStorage.setItem('rememberMe', 'true');
        if (googleData.email) {
          localStorage.setItem('rememberedEmail', googleData.email);
        }
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
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('loginTimestamp');
    set({ user: null });
    if (typeof window !== 'undefined') window.location.href = '/login';
  },

  loadUser: async () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    if ((!token || token === 'undefined' || token === 'null') && (!refreshToken || refreshToken === 'undefined')) return;

    const loginTimestamp = localStorage.getItem('loginTimestamp');
    const isRemembered = localStorage.getItem('rememberMe') === 'true';

    // 48 horas (2 dias) se "Manter conectado", ou 24 horas (1 dia) se desmarcado
    const maxAgeMs = isRemembered ? 2 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;

    if (loginTimestamp && Date.now() - Number(loginTimestamp) > maxAgeMs) {
      console.log('Sessão expirada após o limite de tempo.');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('loginTimestamp');
      set({ user: null, isLoading: false, error: 'Sua sessão expirou por segurança. Faça login novamente.' });
      return;
    }

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
