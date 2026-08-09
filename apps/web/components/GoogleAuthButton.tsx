'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../stores/auth.store';

type Props = {
  mode?: 'login' | 'register';
};

export default function GoogleAuthButton({ mode = 'login' }: Props) {
  const router = useRouter();
  const googleLoginAction = useAuthStore((s) => s.googleLoginAction);
  const [showModal, setShowModal] = useState(false);
  const [gmailInput, setGmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    // Only load Google SDK script if a real Google Client ID is configured in .env
    if (googleClientId && typeof window !== 'undefined' && !document.getElementById('google-gsi-script')) {
      const script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, [googleClientId]);

  const parseJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  };

  const handleGoogleClick = () => {
    const google = (window as any).google;
    // If real Google Client ID is configured and GSI is ready
    if (googleClientId && google?.accounts?.id) {
      try {
        google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response: any) => {
            if (response?.credential) {
              const payload = parseJwt(response.credential);
              if (payload?.email) {
                await executeGoogleLogin(payload.email, payload.name, payload.sub, response.credential);
              }
            }
          },
        });
        google.accounts.id.prompt();
        return;
      } catch (e) {
        console.warn('Google GSI Prompt Fallback:', e);
      }
    }

    // Interactive Google Auth Dialog (desenvolvimento / sem Client ID no .env)
    setShowModal(true);
  };

  const executeGoogleLogin = async (email: string, name?: string, googleId?: string, credential?: string) => {
    setLoading(true);
    setError('');

    try {
      await googleLoginAction({
        email: email.trim(),
        name: name ? name.trim() : email.split('@')[0],
        googleId,
        credential,
      });
      setShowModal(false);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erro ao conectar com a conta do Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmGoogleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gmailInput) return;
    executeGoogleLogin(gmailInput, nameInput);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleGoogleClick}
        className="w-full bg-white dark:bg-[#111827] text-on-surface dark:text-slate-200 border border-surface-variant dark:border-[#1f2937] hover:bg-slate-50 dark:hover:bg-[#1a2234] transition-all font-bold text-xs shadow-xs rounded-xl py-3.5 px-4 flex items-center justify-center gap-3 active:scale-98"
      >
        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.15C3.25 21.3 7.31 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.27C.46 8.2.01 10.05.01 12s.45 3.8 1.26 5.42l4.01-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.58l4.01 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
          />
        </svg>
        <span>{mode === 'login' ? 'Continuar com o Google' : 'Cadastrar com o Google'}</span>
      </button>

      {/* Floating Studio Google Sign-In Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-[#111827] rounded-2xl border border-surface-variant dark:border-[#1f2937] shadow-2xl p-6 z-10 animate-in fade-in zoom-in-95 duration-150 text-on-surface">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.15C3.25 21.3 7.31 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.27C.46 8.2.01 10.05.01 12s.45 3.8 1.26 5.42l4.01-3.15z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.58l4.01 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                </svg>
                <h3 className="font-extrabold text-sm text-on-surface">Login via Google / Gmail</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-outline hover:text-on-surface">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <p className="text-xs text-outline mb-4">
              Digite seu e-mail do Gmail para autenticar no Economize Já:
            </p>

            {error && (
              <div className="bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs p-3 rounded-xl mb-3 border border-rose-500/20 font-bold">
                {error}
              </div>
            )}

            <form onSubmit={handleConfirmGoogleAuth} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-outline block mb-1">Seu E-mail Gmail</label>
                <input
                  type="email"
                  placeholder="exemplo@gmail.com"
                  value={gmailInput}
                  onChange={(e) => setGmailInput(e.target.value)}
                  className="w-full p-3 rounded-xl border border-surface-variant dark:border-[#1f2937] bg-white dark:bg-[#1a2234] text-xs font-medium text-on-surface outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-outline block mb-1">Seu Nome (Opcional)</label>
                <input
                  type="text"
                  placeholder="Seu Nome"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full p-3 rounded-xl border border-surface-variant dark:border-[#1f2937] bg-white dark:bg-[#1a2234] text-xs font-medium text-on-surface outline-none focus:border-primary"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-primary text-on-primary font-bold text-xs rounded-xl shadow-xs hover:opacity-95 transition-all mt-2"
              >
                {loading ? 'Autenticando...' : 'Conectar com Gmail'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
