'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../stores/auth.store';
import { useThemeStore } from '../../../stores/theme.store';
import Link from 'next/link';
import Image from 'next/image';
import GoogleAuthButton from '../../../components/GoogleAuthButton';

export default function Register() {
  const router = useRouter();
  const registerAction = useAuthStore((s) => s.registerAction);
  const { theme, toggleTheme } = useThemeStore();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordMismatch = form.password && form.confirm && form.password !== form.confirm;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordMismatch) {
      setError('As senhas não coincidem');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await registerAction(form.name, form.email, form.password);
      router.push(`/verify-email?email=${encodeURIComponent(form.email)}`);
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">Crie sua conta</h1>
          <p className="text-xs text-outline mt-1 font-medium">Comece a controlar suas finanças pessoais</p>
        </div>

        {error && (
          <div className="bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs px-4 py-3 rounded-xl mb-4 font-bold border border-rose-500/20">
            {error}
          </div>
        )}

        {/* Google Auth Button */}
        <div className="mb-4">
          <GoogleAuthButton mode="register" />
        </div>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-surface-variant dark:bg-[#1f2937]" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-outline">ou com e-mail</span>
          <div className="flex-1 h-px bg-surface-variant dark:bg-[#1f2937]" />
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <input
            data-cy="register-name-input"
            placeholder="Nome completo"
            className="p-3.5 rounded-xl border border-surface-variant dark:border-[#1f2937] bg-white dark:bg-[#111827] text-on-surface placeholder-outline focus:outline-none focus:border-primary transition-colors text-xs font-medium"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            autoComplete="name"
          />
          <input
            data-cy="register-email-input"
            type="email"
            placeholder="Seu e-mail"
            className="p-3.5 rounded-xl border border-surface-variant dark:border-[#1f2937] bg-white dark:bg-[#111827] text-on-surface placeholder-outline focus:outline-none focus:border-primary transition-colors text-xs font-medium"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            autoComplete="email"
          />
          <input
            data-cy="register-password-input"
            type="password"
            placeholder="Senha (mínimo 8 caracteres)"
            className="p-3.5 rounded-xl border border-surface-variant dark:border-[#1f2937] bg-white dark:bg-[#111827] text-on-surface placeholder-outline focus:outline-none focus:border-primary transition-colors text-xs font-medium"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            autoComplete="new-password"
          />
          <input
            data-cy="register-confirm-password-input"
            type="password"
            placeholder="Confirmar senha"
            className={`p-3.5 rounded-xl border bg-white dark:bg-[#111827] text-on-surface placeholder-outline focus:outline-none transition-colors text-xs font-medium ${
              passwordMismatch
                ? 'border-rose-500 focus:border-rose-500'
                : 'border-surface-variant dark:border-[#1f2937] focus:border-primary'
            }`}
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            required
            autoComplete="new-password"
          />
          {passwordMismatch && (
            <p className="text-rose-500 text-xs font-bold -mt-1">As senhas não coincidem</p>
          )}
          <button
            data-cy="register-submit-button"
            type="submit"
            disabled={loading || !!passwordMismatch}
            className="bg-primary text-on-primary p-3.5 rounded-xl font-bold mt-1 transition-all hover:opacity-95 active:scale-98 shadow-xs text-xs"
          >
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs font-semibold">
          <Link
            href="/login"
            data-cy="register-login-link"
            className="text-primary dark:text-[#34d399] hover:underline"
          >
            Já tenho conta
          </Link>
        </div>
      </div>
    </div>
  );
}
