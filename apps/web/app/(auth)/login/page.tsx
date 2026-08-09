'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../stores/auth.store';
import { useThemeStore } from '../../../stores/theme.store';
import Link from 'next/link';
import Image from 'next/image';
import GoogleAuthButton from '../../../components/GoogleAuthButton';

export default function Login() {
  const router = useRouter();
  const loginAction = useAuthStore((s) => s.loginAction);
  const storeError = useAuthStore((s) => s.error);
  const { theme, toggleTheme } = useThemeStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('rememberedEmail');
      const savedRememberMe = localStorage.getItem('rememberMe');
      if (savedEmail) {
        setEmail(savedEmail);
      }
      if (savedRememberMe !== null) {
        setRememberMe(savedRememberMe === 'true');
      }
    }
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await loginAction(email, password, rememberMe);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Email ou senha incorretos');
    } finally {
      setLoading(false);
    }
  };

  const displayError = error || storeError;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-on-background px-4 py-8 relative transition-colors duration-200">
      {/* Dark/Light Theme Toggle Button */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={toggleTheme}
          type="button"
          className="w-10 h-10 rounded-2xl bg-white dark:bg-[#111827] border border-surface-variant dark:border-[#1f2937] flex items-center justify-center text-amber-500 hover:scale-105 transition-all shadow-xs"
          title="Alternar Tema (Claro / Escuro)"
        >
          <span className="material-symbols-outlined text-xl">
            {theme === 'dark' ? 'dark_mode' : 'light_mode'}
          </span>
        </button>
      </div>

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-28 h-28 rounded-2xl bg-white dark:bg-[#111827] border border-surface-variant dark:border-[#1f2937] p-2 flex items-center justify-center mb-4 shadow-xs">
            <Image
              src="/logo.png"
              alt="Economize Já Logo"
              width={100}
              height={100}
              className="object-contain w-full h-full"
              priority
            />
          </div>
          <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">Economize Já</h1>
          <p className="text-xs text-outline mt-1 font-medium">Entre na sua conta para continuar</p>
        </div>

        {displayError && (
          <div
            data-cy="login-error-message"
            className="bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs px-4 py-3 rounded-xl mb-4 font-bold border border-rose-500/20"
          >
            {displayError}
          </div>
        )}

        {/* Google OAuth Login Button */}
        <div className="mb-4">
          <GoogleAuthButton mode="login" />
        </div>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-surface-variant dark:bg-[#1f2937]" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-outline">ou com e-mail</span>
          <div className="flex-1 h-px bg-surface-variant dark:bg-[#1f2937]" />
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <input
            data-cy="login-email-input"
            type="email"
            placeholder="Seu e-mail"
            className="p-3.5 rounded-xl border border-surface-variant dark:border-[#1f2937] bg-white dark:bg-[#111827] text-on-surface placeholder-outline focus:outline-none focus:border-primary transition-colors text-xs font-medium"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <input
            data-cy="login-password-input"
            type="password"
            placeholder="Sua senha"
            className="p-3.5 rounded-xl border border-surface-variant dark:border-[#1f2937] bg-white dark:bg-[#111827] text-on-surface placeholder-outline focus:outline-none focus:border-primary transition-colors text-xs font-medium"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          {/* Checkbox Manter-me Conectado */}
          <div className="flex items-center justify-between px-1 py-1">
            <label className="flex items-center gap-2.5 text-xs font-bold text-on-surface cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-surface-variant dark:border-[#1f2937] accent-primary cursor-pointer"
              />
              <span>Manter-me conectado</span>
            </label>
          </div>

          <button
            data-cy="login-submit-button"
            type="submit"
            disabled={loading}
            className="bg-primary text-on-primary p-3.5 rounded-xl font-bold mt-1 transition-all hover:opacity-95 active:scale-98 shadow-xs text-xs"
          >
            {loading ? 'Entrando...' : 'Entrar na Conta'}
          </button>
        </form>

        <div className="mt-6 flex justify-between text-xs font-semibold">
          <Link
            href="/register"
            data-cy="login-register-link"
            className="text-primary dark:text-[#34d399] hover:underline"
          >
            Criar nova conta
          </Link>
          <Link
            href="#"
            data-cy="login-forgot-link"
            className="text-outline hover:underline"
          >
            Esqueci a senha
          </Link>
        </div>
      </div>
    </div>
  );
}
