#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const write = (file, content) => {
  const p = path.resolve('/Users/gustavobraulio/Desktop/EconomizeJá/apps/web', file);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content.trim() + '\n', 'utf8');
};

write('app/(auth)/page.tsx', `
'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Onboarding() {
  const router = useRouter();
  const [slide, setSlide] = useState(0);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex-1 flex overflow-x-auto snap-x snap-mandatory hide-scrollbar">
        {[1, 2, 3].map((s, i) => (
          <div key={s} data-cy={\`onboarding-slide-\${s}\`} className="w-full h-full flex-shrink-0 snap-center flex flex-col items-center justify-center p-8 text-center">
            <h1 className="text-2xl font-bold text-primary mb-4">Bem-vindo \${s}</h1>
            <p className="text-on-surface-variant">Conheça o Economize Já \${s}</p>
          </div>
        ))}
      </div>
      <div className="p-8 flex justify-between items-center bg-surface">
        <button data-cy="onboarding-skip-button" className="text-outline font-medium" onClick={() => router.push('/login')}>Skip</button>
        <div className="flex gap-2">
           <div className="w-2 h-2 rounded-full bg-primary" />
           <div className="w-2 h-2 rounded-full bg-surface-variant" />
           <div className="w-2 h-2 rounded-full bg-surface-variant" />
        </div>
        <button data-cy="onboarding-next-button" className="bg-primary text-on-primary px-6 py-2 rounded-full font-medium" onClick={() => router.push('/login')}>Começar</button>
      </div>
    </div>
  );
}
`);

write('app/(auth)/login/page.tsx', `
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../stores/auth.store';
import Link from 'next/link';

export default function Login() {
  const router = useRouter();
  const loginAction = useAuthStore((s) => s.loginAction);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginAction(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erro');
    }
  };

  return (
    <div className="p-8 flex flex-col justify-center min-h-screen">
      <h1 className="text-2xl font-bold text-primary mb-8 text-center">Login</h1>
      {error && <p data-cy="login-error-message" className="text-error mb-4">{error}</p>}
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <input data-cy="login-email-input" type="email" placeholder="Email" className="p-4 rounded-xl border border-outline-variant bg-surface" value={email} onChange={e => setEmail(e.target.value)} />
        <input data-cy="login-password-input" type="password" placeholder="Senha" className="p-4 rounded-xl border border-outline-variant bg-surface" value={password} onChange={e => setPassword(e.target.value)} />
        <button data-cy="login-submit-button" type="submit" className="bg-primary text-on-primary p-4 rounded-xl font-bold mt-4">Entrar</button>
      </form>
      <div className="mt-8 flex justify-between">
        <Link href="/register" data-cy="login-register-link" className="text-primary font-medium">Criar conta</Link>
        <Link href="#" data-cy="login-forgot-link" className="text-outline font-medium">Esqueci a senha</Link>
      </div>
    </div>
  );
}
`);

write('app/(auth)/register/page.tsx', `
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../stores/auth.store';
import Link from 'next/link';

export default function Register() {
  const router = useRouter();
  const registerAction = useAuthStore((s) => s.registerAction);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) return;
    try {
      await registerAction(form.name, form.email, form.password);
      router.push('/verify-email');
    } catch {}
  };

  return (
    <div className="p-8 flex flex-col justify-center min-h-screen">
      <h1 className="text-2xl font-bold text-primary mb-8 text-center">Cadastro</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <input data-cy="register-name-input" placeholder="Nome" className="p-4 rounded-xl border border-outline-variant" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
        <input data-cy="register-email-input" type="email" placeholder="Email" className="p-4 rounded-xl border border-outline-variant" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
        <input data-cy="register-password-input" type="password" placeholder="Senha" className="p-4 rounded-xl border border-outline-variant" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
        <input data-cy="register-confirm-password-input" type="password" placeholder="Confirmar Senha" className={\`p-4 rounded-xl border \${form.password && form.confirm && form.password !== form.confirm ? 'border-error' : 'border-outline-variant'}\`} value={form.confirm} onChange={e => setForm({...form, confirm: e.target.value})} />
        <button data-cy="register-submit-button" type="submit" className="bg-primary text-on-primary p-4 rounded-xl font-bold mt-4">Cadastrar</button>
      </form>
      <div className="mt-8 text-center">
        <Link href="/login" data-cy="register-login-link" className="text-primary font-medium">Já tenho conta</Link>
      </div>
    </div>
  );
}
`);

write('app/(auth)/verify-email/page.tsx', `
export default function VerifyEmail() {
  return (
    <div className="p-8 flex flex-col justify-center items-center min-h-screen text-center">
      <span className="material-symbols-outlined text-6xl text-primary mb-6">mark_email_read</span>
      <h1 data-cy="verify-email-title" className="text-2xl font-bold text-on-background mb-4">Verifique seu email</h1>
      <p data-cy="verify-email-description" className="text-on-surface-variant mb-8">Enviamos um link para o seu email.</p>
      <button data-cy="verify-resend-button" className="text-primary font-bold">Reenviar</button>
    </div>
  );
}
`);

write('app/(app)/dashboard/page.tsx', `
'use client';
import Link from 'next/link';

export default function Dashboard() {
  return (
    <div className="p-4">
      <header className="flex justify-between items-center mb-6">
        <div className="w-10 h-10 rounded-full bg-primary-container" />
        <h1 className="font-bold text-primary">Economize Já</h1>
        <span className="material-symbols-outlined">notifications</span>
      </header>
      
      <div data-cy="dashboard-balance-card" className="bg-primary text-on-primary p-6 rounded-2xl mb-6 shadow-ambient">
        <p className="text-sm opacity-80 mb-1">Saldo Atual</p>
        <h2 data-cy="dashboard-balance-amount" className="text-3xl font-bold">R$ 1.250,00</h2>
        <p data-cy="dashboard-balance-change" className="text-sm text-secondary-container mt-2">+5% este mês</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div data-cy="dashboard-category-chart" className="bg-surface p-4 rounded-2xl border border-surface-variant h-32 flex items-center justify-center">Gráfico Pizza</div>
        <div data-cy="dashboard-monthly-chart" className="bg-surface p-4 rounded-2xl border border-surface-variant h-32 flex items-center justify-center">Gráfico Barras</div>
      </div>

      <div data-cy="dashboard-recent-transactions" className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-on-background">Recentes</h3>
          <Link href="/transactions" data-cy="dashboard-see-all-link" className="text-sm text-primary font-medium">Ver todas</Link>
        </div>
      </div>

      <Link href="/transactions/new" data-cy="dashboard-add-fab" className="fixed bottom-20 right-4 w-14 h-14 bg-secondary text-on-secondary rounded-2xl flex items-center justify-center shadow-ambient-md z-40">
        <span className="material-symbols-outlined">add</span>
      </Link>
    </div>
  );
}
`);
