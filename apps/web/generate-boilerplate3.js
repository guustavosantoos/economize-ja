#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const write = (file, content) => {
  const p = path.resolve('/Users/gustavobraulio/Desktop/EconomizeJá/apps/web', file);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content.trim() + '\n', 'utf8');
};

write('app/(app)/transactions/page.tsx', `
'use client';
import Link from 'next/link';

export default function Transactions() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-primary mb-6">Transações</h1>
      <div className="flex gap-4 mb-6">
        <select data-cy="transactions-month-filter" className="bg-surface border border-outline-variant rounded-lg p-2 flex-1">
          <option>Agosto 2026</option>
        </select>
        <select data-cy="transactions-type-filter" className="bg-surface border border-outline-variant rounded-lg p-2 flex-1">
          <option>Todos</option>
        </select>
      </div>
      <Link href="/transactions/new" data-cy="transactions-add-button" className="block text-center bg-primary text-on-primary py-3 rounded-xl font-bold mb-6">
        + Nova Transação
      </Link>
    </div>
  );
}
`);

write('app/(app)/transactions/new/page.tsx', `
'use client';

export default function NewTransaction() {
  return (
    <div className="p-4">
      <div className="bg-primary text-on-primary p-8 rounded-2xl mb-6 text-center">
        <input data-cy="add-transaction-amount-input" type="number" placeholder="0,00" className="bg-transparent text-4xl font-bold text-center outline-none w-full placeholder:text-on-primary/50" />
      </div>
      <div className="flex bg-surface-variant rounded-lg p-1 mb-6">
        <button data-cy="add-transaction-type-expense" className="flex-1 py-2 bg-surface rounded-md shadow-sm font-medium">Despesa</button>
        <button data-cy="add-transaction-type-income" className="flex-1 py-2 font-medium text-on-surface-variant">Receita</button>
        <button data-cy="add-transaction-type-transfer" className="flex-1 py-2 font-medium text-on-surface-variant">Transf.</button>
      </div>
      <div className="flex flex-col gap-4">
        <select data-cy="add-transaction-category-select" className="p-4 rounded-xl border border-outline-variant bg-surface"><option>Categoria</option></select>
        <input data-cy="add-transaction-description-input" placeholder="Descrição" className="p-4 rounded-xl border border-outline-variant bg-surface" />
        <input data-cy="add-transaction-date-input" type="date" className="p-4 rounded-xl border border-outline-variant bg-surface" />
        <button data-cy="add-transaction-save-button" className="bg-primary text-on-primary p-4 rounded-xl font-bold mt-4">Salvar</button>
      </div>
    </div>
  );
}
`);

write('app/(app)/settings/page.tsx', `
'use client';
import Link from 'next/link';
import { useAuthStore } from '../../../stores/auth.store';

export default function Settings() {
  const logoutAction = useAuthStore(s => s.logoutAction);
  return (
    <div className="p-4">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-xl font-bold">GB</div>
        <div>
          <h2 data-cy="settings-user-name" className="font-bold text-lg">Gustavo Braulio</h2>
          <p data-cy="settings-user-email" className="text-on-surface-variant text-sm">gustavo@example.com</p>
        </div>
      </div>
      <div className="flex flex-col gap-2 mb-8">
        <Link href="/settings/telegram" data-cy="settings-telegram-link" className="p-4 bg-surface rounded-xl flex justify-between items-center border border-surface-variant">
          <span className="font-medium">Telegram</span>
          <span className="material-symbols-outlined">chevron_right</span>
        </Link>
        <Link href="/pro" data-cy="settings-pro-plan-link" className="p-4 bg-surface rounded-xl flex justify-between items-center border border-surface-variant">
          <span className="font-medium">Plano Pro</span>
          <span className="material-symbols-outlined">chevron_right</span>
        </Link>
      </div>
      <div className="flex flex-col gap-2">
        <button data-cy="settings-export-data-button" className="p-4 text-left font-medium text-primary">Exportar Dados</button>
        <button data-cy="settings-delete-account-button" className="p-4 text-left font-medium text-error">Excluir Conta</button>
        <button data-cy="settings-logout-button" onClick={logoutAction} className="p-4 text-left font-medium text-outline">Sair</button>
      </div>
    </div>
  );
}
`);

write('app/(app)/settings/telegram/page.tsx', `
'use client';
export default function TelegramLink() {
  return (
    <div className="p-4 text-center">
      <h1 className="text-2xl font-bold text-primary mb-6">Vincular Telegram</h1>
      <div className="text-left bg-surface p-6 rounded-2xl border border-surface-variant mb-6">
        <ol className="list-decimal pl-4 space-y-2 text-on-surface">
          <li>Abra o bot do Economize Já no Telegram</li>
          <li>Digite /start</li>
          <li>Insira o código abaixo:</li>
        </ol>
      </div>
      <div className="bg-primary-container text-on-primary-container p-6 rounded-2xl mb-4">
        <h2 data-cy="telegram-link-code" className="text-4xl font-mono tracking-widest font-bold">1A2B3C</h2>
      </div>
      <p data-cy="telegram-code-expiry" className="text-sm text-on-surface-variant mb-8">Expira em 09:59</p>
      
      <p data-cy="telegram-status" className="mb-4 text-secondary font-medium">Status: Não vinculado</p>
      
      <div className="flex flex-col gap-4">
        <button data-cy="telegram-generate-button" className="bg-primary text-on-primary p-4 rounded-xl font-bold">Gerar novo código</button>
        <button data-cy="telegram-unlink-button" className="text-error font-medium p-4">Desvincular</button>
      </div>
    </div>
  );
}
`);

write('app/(app)/pro/page.tsx', `
'use client';
export default function ProPage() {
  return (
    <div className="p-4 text-center">
      <div className="inline-block bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-xs font-bold mb-4 uppercase tracking-wider">Em Breve</div>
      <h1 data-cy="pro-page-title" className="text-3xl font-bold text-primary mb-8">Economize Já PRO</h1>
      
      <div className="space-y-4 text-left mb-12">
        <div data-cy="pro-feature-ai" className="flex items-center gap-4 bg-surface p-4 rounded-xl border border-surface-variant">
          <span className="material-symbols-outlined text-primary">smart_toy</span>
          <span>Categorização com IA</span>
        </div>
        <div data-cy="pro-feature-bills" className="flex items-center gap-4 bg-surface p-4 rounded-xl border border-surface-variant">
          <span className="material-symbols-outlined text-primary">receipt_long</span>
          <span>Leitura de Notas Fiscais</span>
        </div>
        <div data-cy="pro-feature-openfinance" className="flex items-center gap-4 bg-surface p-4 rounded-xl border border-surface-variant">
          <span className="material-symbols-outlined text-primary">account_balance</span>
          <span>Integração Open Finance</span>
        </div>
      </div>
      
      <button data-cy="pro-upgrade-button" disabled className="w-full bg-surface-variant text-on-surface-variant p-4 rounded-xl font-bold opacity-50 cursor-not-allowed">
        Assinar (Em breve)
      </button>
    </div>
  );
}
`);

write('public/manifest.json', JSON.stringify({
  name: "Economize Já",
  short_name: "EconJá",
  description: "Controle suas finanças pessoais",
  theme_color: "#003535",
  background_color: "#f8f9fa",
  display: "standalone",
  orientation: "portrait",
  start_url: "/",
  icons: [
    { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
    { src: "/icon-512.png", sizes: "512x512", type: "image/png" }
  ]
}, null, 2));

write('next.config.js', `
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
};
module.exports = nextConfig;
`);

write('.env.local', 'NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1\n');
