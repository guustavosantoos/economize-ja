'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../stores/auth.store';
import { apiClient } from '../../../lib/api-client';

type Toast = { text: string; type: 'success' | 'error' } | null;

function Toast({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  if (!toast) return null;
  return (
    <div
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-semibold transition-all ${
        toast.type === 'success'
          ? 'bg-secondary text-on-secondary'
          : 'bg-error text-on-error'
      }`}
      style={{ minWidth: 260 }}
    >
      <span className="material-symbols-outlined text-xl">
        {toast.type === 'success' ? 'check_circle' : 'error'}
      </span>
      <span className="flex-1">{toast.text}</span>
      <button onClick={onClose} className="opacity-70 hover:opacity-100">
        <span className="material-symbols-outlined text-lg">close</span>
      </button>
    </div>
  );
}

export default function Settings() {
  const { user, logoutAction, loadUser } = useAuthStore();
  const router = useRouter();

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || '');
  const [savingName, setSavingName] = useState(false);

  // Credit Card Limit
  const [cardLimitInput, setCardLimitInput] = useState<string>('');
  const [savingCardLimit, setSavingCardLimit] = useState(false);
  const [isEditingCardLimit, setIsEditingCardLimit] = useState(false);

  const [exporting, setExporting] = useState(false);

  // Reset Modal
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetConfirm, setResetConfirm] = useState('');

  // Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const [toast, setToast] = useState<Toast>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setNameInput(user.name || '');
      setCardLimitInput((user as any).creditCardLimit ? String((user as any).creditCardLimit) : '');
    }
  }, [user]);

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'EJ';

  const isPro = user?.plan === 'pro';

  function showToast(text: string, type: 'success' | 'error' = 'success') {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  }

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    setSavingName(true);
    try {
      await apiClient.put('/users/me', { name: nameInput.trim() });
      await loadUser();
      setIsEditingName(false);
      showToast('Nome atualizado com sucesso!');
    } catch (err: any) {
      showToast(err.message || 'Erro ao atualizar nome.', 'error');
    } finally {
      setSavingName(false);
    }
  };

  const handleSaveCardLimit = async () => {
    setSavingCardLimit(true);
    try {
      const numValue = cardLimitInput.trim() ? parseFloat(cardLimitInput.replace(',', '.')) : 0;
      await apiClient.put('/users/me', { creditCardLimit: isNaN(numValue) ? 0 : numValue });
      await loadUser();
      setIsEditingCardLimit(false);
      showToast('Meta de cartão de crédito atualizada com sucesso!');
    } catch (err: any) {
      showToast(err.message || 'Erro ao atualizar limite do cartão.', 'error');
    } finally {
      setSavingCardLimit(false);
    }
  };

  const handleResetTransactions = async () => {
    setResetting(true);
    try {
      await apiClient.post('/transactions/reset');
      await loadUser();
      setShowResetModal(false);
      setResetConfirm('');
      showToast('Histórico zerado com sucesso! Saldo resetado para R$ 0,00.');
    } catch (err: any) {
      showToast(err.message || 'Erro ao zerar histórico.', 'error');
    } finally {
      setResetting(false);
    }
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      const data = await apiClient.post('/users/me/export');
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `economizeja-dados-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Dados exportados com sucesso! (LGPD)');
    } catch (err: any) {
      showToast(err.message || 'Erro ao exportar dados.', 'error');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await apiClient.del('/users/me');
      logoutAction();
    } catch (err: any) {
      showToast(err.message || 'Erro ao excluir conta.', 'error');
      setDeleting(false);
    }
  };

  const handleLogout = async () => {
    await logoutAction();
    router.push('/login');
  };

  const menuSections = [
    {
      title: 'Conta & Planejamento',
      items: [
        {
          icon: 'person',
          label: 'Editar Nome',
          sublabel: user?.name || 'Toque para editar',
          onClick: () => {
            setNameInput(user?.name || '');
            setIsEditingName(true);
            setTimeout(() => nameInputRef.current?.focus(), 50);
          },
          trailing: 'chevron_right',
          accent: false,
        },
        {
          icon: 'credit_card',
          label: 'Meta de Cartão de Crédito',
          sublabel: (user as any)?.creditCardLimit
            ? `Limite definido: R$ ${Number((user as any).creditCardLimit).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
            : 'Toque para definir o limite mensal',
          onClick: () => setIsEditingCardLimit(!isEditingCardLimit),
          trailing: 'chevron_right',
          accent: true,
        },
        {
          icon: 'mail',
          label: 'E-mail',
          sublabel: user?.email || '—',
          onClick: undefined,
          trailing: null,
          accent: false,
        },
        {
          icon: 'workspace_premium',
          label: 'Plano Atual',
          sublabel: isPro ? 'Pro — Todos os recursos desbloqueados' : 'Free — Clique para fazer upgrade',
          href: '/pro',
          trailing: 'chevron_right',
          accent: isPro,
        },
      ],
    },
    {
      title: 'Integrações',
      items: [
        {
          icon: 'send',
          label: 'Bot no Telegram',
          sublabel: 'Registre gastos e consulte metas via mensagem',
          href: '/settings/telegram',
          trailing: 'chevron_right',
          accent: false,
        },
        {
          icon: 'account_balance',
          label: 'Open Finance',
          sublabel: 'Sincronize suas contas bancárias',
          href: '/pro',
          trailing: isPro ? 'chevron_right' : 'lock',
          accent: false,
          disabled: !isPro,
        },
      ],
    },
    {
      title: 'Privacidade & Segurança',
      items: [
        {
          icon: 'shield',
          label: 'Política de Privacidade & LGPD',
          sublabel: 'Como protegemos e tratamos seus dados',
          href: '/privacidade',
          trailing: 'chevron_right',
          accent: false,
        },
        {
          icon: 'download',
          label: 'Exportar Meus Dados',
          sublabel: 'Baixar JSON completo (Direito LGPD)',
          onClick: handleExportData,
          trailing: exporting ? 'hourglass_top' : 'download',
          accent: false,
          loading: exporting,
        },
        {
          icon: 'mail',
          label: 'Suporte & Atendimento',
          sublabel: 'onboarding.economizeja@gmail.com',
          href: 'mailto:onboarding.economizeja@gmail.com',
          trailing: 'chevron_right',
          accent: false,
        },
      ],
    },
  ];

  return (
    <>
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="p-4 md:p-8 max-w-2xl mx-auto pb-28 space-y-6">

        {/* ── Hero Profile Card ── */}
        <div className="relative bg-gradient-to-br from-[#003535] via-[#0d4d4d] to-[#002626] rounded-3xl p-6 overflow-hidden shadow-xl">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-secondary/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex items-center gap-5">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-secondary to-[#006c49] text-white flex items-center justify-center text-2xl font-black shadow-lg select-none">
                {initials}
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#6cf8bb] border-2 border-[#003535] rounded-full" />
            </div>

            <div className="flex-1 min-w-0">
              {isEditingName ? (
                <div className="flex gap-2 items-center">
                  <input
                    ref={nameInputRef}
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                    className="flex-1 min-w-0 px-3 py-2 rounded-xl text-sm font-bold text-on-surface bg-white/90 border-0 outline-none"
                    placeholder="Seu nome"
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={savingName}
                    className="px-3 py-2 bg-secondary text-on-secondary text-xs font-bold rounded-xl flex-shrink-0 hover:opacity-90 active:scale-95 transition-all"
                  >
                    {savingName ? '...' : 'Salvar'}
                  </button>
                  <button
                    onClick={() => setIsEditingName(false)}
                    className="px-2 py-2 bg-white/10 text-white text-xs font-bold rounded-xl flex-shrink-0"
                  >
                    <span className="material-symbols-outlined text-base">close</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 data-cy="settings-user-name" className="font-extrabold text-white text-xl truncate">
                    {user?.name || 'Usuário'}
                  </h2>
                  <button
                    onClick={() => {
                      setNameInput(user?.name || '');
                      setIsEditingName(true);
                    }}
                    className="w-7 h-7 bg-white/15 rounded-lg flex items-center justify-center hover:bg-white/25 transition-all flex-shrink-0"
                    title="Editar nome"
                  >
                    <span className="material-symbols-outlined text-white text-sm">edit</span>
                  </button>
                </div>
              )}

              <p data-cy="settings-user-email" className="text-primary-fixed/80 text-xs mt-1 truncate flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">mail</span>
                {user?.email || 'email@exemplo.com'}
              </p>

              <span
                className={`inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                  isPro ? 'bg-[#6cf8bb] text-[#003535]' : 'bg-white/15 text-white'
                }`}
              >
                <span className="material-symbols-outlined text-xs">{isPro ? 'workspace_premium' : 'star'}</span>
                {isPro ? 'Plano Pro' : 'Plano Gratuito'}
              </span>
            </div>
          </div>
        </div>

        {/* ── Editor de Meta de Cartão de Crédito ── */}
        {isEditingCardLimit && (
          <div className="bg-white p-5 rounded-2xl border border-secondary/30 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-primary text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">credit_card</span> Meta / Limite de Cartão de Crédito
              </h3>
              <button onClick={() => setIsEditingCardLimit(false)} className="text-outline hover:text-on-surface">
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>
            <p className="text-xs text-on-surface-variant">
              Defina seu limite mensal do cartão de crédito em Reais (R$). O aplicativo e o bot do Telegram alertarão quando você estiver próximo de atingir a meta.
            </p>
            <div className="flex gap-2 items-center">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-outline">R$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={cardLimitInput}
                  onChange={(e) => setCardLimitInput(e.target.value)}
                  placeholder="2000,00"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm font-bold border border-surface-variant outline-none focus:border-secondary transition-colors"
                />
              </div>
              <button
                onClick={handleSaveCardLimit}
                disabled={savingCardLimit}
                className="px-5 py-2.5 bg-secondary text-on-secondary text-xs font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
              >
                {savingCardLimit ? 'Salvando...' : 'Salvar Meta'}
              </button>
            </div>
          </div>
        )}

        {/* ── Upgrade Banner (Free only) ── */}
        {!isPro && (
          <Link
            href="/pro"
            data-cy="settings-pro-plan-link"
            className="block bg-gradient-to-r from-secondary to-[#004d35] p-4 rounded-2xl hover:opacity-95 active:scale-[0.99] transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-xl">workspace_premium</span>
                </span>
                <div>
                  <p className="text-white font-bold text-sm">Desbloqueie o Pro</p>
                  <p className="text-white/70 text-xs">IA, lembretes de contas e banco automático</p>
                </div>
              </div>
              <span className="bg-white text-secondary text-xs font-extrabold px-3 py-1.5 rounded-full flex-shrink-0">
                Ver Planos
              </span>
            </div>
          </Link>
        )}

        {/* ── Menu Sections ── */}
        {menuSections.map((section) => (
          <div key={section.title} className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-widest text-outline px-1">{section.title}</p>
            <div className="bg-white rounded-2xl border border-surface-variant shadow-sm overflow-hidden divide-y divide-surface-variant/60">
              {section.items.map((item: any, idx) => {
                const inner = (
                  <div className={`flex items-center gap-4 p-4 ${item.disabled ? 'opacity-50' : ''}`}>
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        item.accent ? 'bg-secondary-container text-secondary' : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      <span className="material-symbols-outlined text-xl">{item.loading ? 'hourglass_top' : item.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${item.accent ? 'text-secondary' : 'text-on-surface'}`}>{item.label}</p>
                      <p className="text-xs text-outline truncate mt-0.5">{item.sublabel}</p>
                    </div>
                    {item.trailing && (
                      <span className="material-symbols-outlined text-outline text-xl flex-shrink-0">{item.trailing}</span>
                    )}
                  </div>
                );

                if (item.href) {
                  return (
                    <Link key={idx} href={item.href} className="block hover:bg-surface-container-lowest active:bg-surface-container transition-colors">
                      {inner}
                    </Link>
                  );
                }

                return (
                  <button
                    key={idx}
                    onClick={item.onClick}
                    disabled={item.loading || item.disabled}
                    className="w-full text-left hover:bg-surface-container-lowest active:bg-surface-container transition-colors disabled:opacity-50"
                  >
                    {inner}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* ── Danger Zone ── */}
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-widest text-outline px-1">Zona de Perigo</p>
          <div className="bg-white rounded-2xl border border-surface-variant shadow-sm overflow-hidden divide-y divide-surface-variant/60">
            {/* Zerar Dados / Começar do zero */}
            <button
              data-cy="settings-reset-data-button"
              onClick={() => setShowResetModal(true)}
              className="w-full p-4 flex items-center gap-4 hover:bg-warning-container/20 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
                <span className="material-symbols-outlined text-xl">cleaning_services</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-900">Zerar Histórico (Começar do Zero)</p>
                <p className="text-xs text-outline">Arquivar todos os lançamentos e resetar o saldo para R$ 0,00</p>
              </div>
              <span className="material-symbols-outlined text-amber-800 text-xl">chevron_right</span>
            </button>

            <button
              data-cy="settings-logout-button"
              onClick={handleLogout}
              className="w-full p-4 flex items-center gap-4 hover:bg-surface-container-lowest transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-xl">logout</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-on-surface">Sair da Conta</p>
                <p className="text-xs text-outline">Encerrar sessão atual</p>
              </div>
              <span className="material-symbols-outlined text-outline text-xl">chevron_right</span>
            </button>

            <button
              data-cy="settings-delete-account-button"
              onClick={() => setShowDeleteModal(true)}
              className="w-full p-4 flex items-center gap-4 hover:bg-error-container/30 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-error-container flex items-center justify-center text-error">
                <span className="material-symbols-outlined text-xl">delete_forever</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-error">Excluir Conta</p>
                <p className="text-xs text-outline">Anonimização conforme a LGPD</p>
              </div>
              <span className="material-symbols-outlined text-error text-xl">chevron_right</span>
            </button>
          </div>
        </div>

        {/* App version */}
        <p className="text-center text-[11px] text-outline/60 pb-2">Economize Já v1.0.0</p>
      </div>

      {/* ── Modal Zerar Dados (Começar do Zero) ── */}
      {showResetModal && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => !resetting && setShowResetModal(false)} />
          <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl p-6 w-[90vw] max-w-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800 flex-shrink-0">
                <span className="material-symbols-outlined text-amber-800 text-2xl">cleaning_services</span>
              </div>
              <div>
                <h3 className="font-extrabold text-on-surface text-lg">Zerar Histórico?</h3>
                <p className="text-xs text-outline">Comece do zero com saldo limpo.</p>
              </div>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Esta ação irá arquivar todas as suas receitas e despesas registradas até o momento. Seu saldo voltará para <strong>R$ 0,00</strong>.
            </p>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-on-surface-variant">
                Digite <span className="font-extrabold text-amber-800">ZERAR</span> para confirmar:
              </label>
              <input
                type="text"
                value={resetConfirm}
                onChange={(e) => setResetConfirm(e.target.value)}
                placeholder="ZERAR"
                className="w-full px-3 py-2.5 border border-surface-variant rounded-xl text-sm font-bold outline-none focus:border-amber-700 transition-colors"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => { setShowResetModal(false); setResetConfirm(''); }}
                disabled={resetting}
                className="flex-1 py-3 rounded-xl border border-surface-variant text-sm font-bold text-on-surface hover:bg-surface-container transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleResetTransactions}
                disabled={resetting || resetConfirm !== 'ZERAR'}
                className="flex-1 py-3 rounded-xl bg-amber-800 text-white text-sm font-bold hover:bg-amber-900 active:scale-95 transition-all disabled:opacity-40"
              >
                {resetting ? 'Zerando...' : 'Zerar Tudo'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {showDeleteModal && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => !deleting && setShowDeleteModal(false)} />
          <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl p-6 w-[90vw] max-w-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-error-container flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-error text-2xl">delete_forever</span>
              </div>
              <div>
                <h3 className="font-extrabold text-on-surface text-lg">Excluir Conta?</h3>
                <p className="text-xs text-outline">Esta ação não pode ser desfeita.</p>
              </div>
            </div>
            <p className="text-sm text-on-surface-variant">
              Todos os seus dados serão anonimizados conforme a Lei Geral de Proteção de Dados (LGPD).
            </p>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-on-surface-variant">
                Digite <span className="font-extrabold text-error">EXCLUIR</span> para confirmar:
              </label>
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="EXCLUIR"
                className="w-full px-3 py-2.5 border border-surface-variant rounded-xl text-sm font-bold outline-none focus:border-error transition-colors"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteConfirm(''); }}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl border border-surface-variant text-sm font-bold text-on-surface hover:bg-surface-container transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting || deleteConfirm !== 'EXCLUIR'}
                className="flex-1 py-3 rounded-xl bg-error text-on-error text-sm font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-40"
              >
                {deleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
