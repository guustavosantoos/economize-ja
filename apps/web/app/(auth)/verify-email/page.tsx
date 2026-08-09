'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '../../../lib/api-client';
import { useAuthStore } from '../../../stores/auth.store';
import { useThemeStore } from '../../../stores/theme.store';
import Link from 'next/link';

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get('email') || '';
  const { theme, toggleTheme } = useThemeStore();

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-advance focus to next input box
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if all 6 digits are filled
    if (newOtp.every((digit) => digit !== '')) {
      handleVerifyCode(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasteData)) {
      const digits = pasteData.split('');
      setOtp(digits);
      inputRefs.current[5]?.focus();
      handleVerifyCode(pasteData);
    }
  };

  const handleVerifyCode = async (codeToVerify?: string) => {
    const code = codeToVerify || otp.join('');
    if (code.length !== 6) {
      setError('Por favor, informe o código completo de 6 dígitos.');
      return;
    }
    if (!email) {
      setError('Por favor, informe seu e-mail.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await apiClient.post('/auth/verify-email', { email: email.trim(), code });
      const token = res?.accessToken || res?.data?.accessToken;
      if (token) {
        localStorage.setItem('accessToken', token);
      }
      setSuccessMsg('E-mail verificado com sucesso! Redirecionando...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Código de verificação incorreto ou expirado.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setError('Por favor, informe seu e-mail para reenviar o código.');
      return;
    }
    setError('');
    setSuccessMsg('');
    try {
      await apiClient.post('/auth/resend-code', { email: email.trim() });
      setSuccessMsg('Um novo código de 6 dígitos foi enviado para o seu e-mail!');
      setTimer(60);
    } catch (err: any) {
      setError(err.message || 'Erro ao reenviar o código. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-on-background px-4 py-8 relative transition-colors duration-200">
      {/* Dark/Light Theme Toggle */}
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

      <div className="w-full max-w-md bg-white dark:bg-[#111827] p-8 rounded-2xl border border-surface-variant dark:border-[#1f2937] shadow-2xl text-center space-y-6">
        {/* Icon & Title */}
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3 border border-emerald-500/20 shadow-xs">
            <span className="material-symbols-outlined text-3xl">mark_email_read</span>
          </div>
          <h1 data-cy="verify-email-title" className="text-2xl font-extrabold text-on-surface tracking-tight">
            Confirme seu E-mail
          </h1>
          <p data-cy="verify-email-description" className="text-xs text-outline font-medium mt-1">
            Enviamos um código de 6 dígitos para o e-mail:
          </p>
        </div>

        {/* Email Input Field if missing */}
        <input
          type="email"
          placeholder="seu-email@exemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3.5 rounded-xl border border-surface-variant dark:border-[#1f2937] bg-surface-container/30 dark:bg-[#1a2234] text-xs font-bold text-center text-on-surface outline-none focus:border-primary"
        />

        {error && (
          <div className="bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs p-3 rounded-xl font-bold border border-rose-500/20">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs p-3 rounded-xl font-bold border border-emerald-500/20">
            {successMsg}
          </div>
        )}

        {/* 6-Digit OTP Box Grid */}
        <div className="flex justify-center gap-2 sm:gap-3 py-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-11 h-13 sm:w-12 sm:h-14 rounded-xl border border-surface-variant dark:border-[#1f2937] bg-white dark:bg-[#1a2234] text-center text-xl font-black text-on-surface tabular-nums outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-xs"
            />
          ))}
        </div>

        {/* Action Button */}
        <button
          data-cy="verify-submit-button"
          onClick={() => handleVerifyCode()}
          disabled={loading || otp.join('').length !== 6}
          className="w-full py-3.5 px-4 bg-primary text-on-primary font-bold text-xs rounded-xl shadow-xs hover:opacity-95 transition-all active:scale-98 disabled:opacity-50"
        >
          {loading ? 'Validando código...' : 'Confirmar e Acessar'}
        </button>

        {/* Resend Code Section */}
        <div className="pt-2 border-t border-surface-variant dark:border-[#1f2937] flex items-center justify-between text-xs">
          <span className="text-outline">Não recebeu o código?</span>
          <button
            data-cy="verify-resend-button"
            onClick={handleResendCode}
            disabled={timer > 0}
            className="text-primary dark:text-[#34d399] font-bold hover:underline disabled:opacity-50 disabled:no-underline"
          >
            {timer > 0 ? `Reenviar em ${timer}s` : 'Reenviar Código'}
          </button>
        </div>

        <div className="pt-1">
          <Link href="/login" className="text-xs text-outline hover:text-on-surface font-semibold">
            ← Voltar para o Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs text-outline">Carregando...</div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}
