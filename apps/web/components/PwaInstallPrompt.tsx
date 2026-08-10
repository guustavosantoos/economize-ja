'use client';

import { useState, useEffect } from 'react';

type PwaInstallPromptProps = {
  forceOpen?: boolean;
  onCloseForce?: () => void;
};

export default function PwaInstallPrompt({ forceOpen = false, onCloseForce }: PwaInstallPromptProps) {
  const [showInitialPrompt, setShowInitialPrompt] = useState(false);
  const [showTutorialModal, setShowTutorialModal] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isApple, setIsApple] = useState(true);

  useEffect(() => {
    // Verificar se já está rodando como App instalado (PWA Standalone)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) return;

    // Detectar sistema operacional
    const ua = window.navigator.userAgent;
    const isIos = /iPhone|iPad|iPod/i.test(ua) || (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
    setIsApple(isIos);

    if (forceOpen) {
      setShowTutorialModal(true);
      return;
    }

    // Verificar se o usuário pediu para ocultar por 3 dias
    const dismissedUntil = localStorage.getItem('pwa_prompt_dismissed_until');
    if (dismissedUntil) {
      const timestamp = parseInt(dismissedUntil, 10);
      if (!isNaN(timestamp) && Date.now() < timestamp) {
        return;
      }
    }

    // Exibir o modal inicial suave após 1.5s
    const timer = setTimeout(() => {
      setShowInitialPrompt(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, [forceOpen]);

  const handleDismissFor3Days = () => {
    const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
    localStorage.setItem('pwa_prompt_dismissed_until', (Date.now() + threeDaysMs).toString());
    setShowInitialPrompt(false);
    if (onCloseForce) onCloseForce();
  };

  const handleOpenTutorial = () => {
    setShowInitialPrompt(false);
    setCurrentStep(1);
    setShowTutorialModal(true);
  };

  const handleCloseTutorial = () => {
    setShowTutorialModal(false);
    if (onCloseForce) onCloseForce();
  };

  return (
    <>
      {/* ── 1. MODAL INICIAL CONVITEL E ACOLHEDOR ── */}
      {showInitialPrompt && !showTutorialModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#111720] rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 text-center animate-in zoom-in-95">
            {/* Ícone com Brilho Warm */}
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-inner">
              <span className="material-symbols-outlined text-3xl">install_mobile</span>
            </div>

            {/* Texto Acolhedor */}
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
                Experiência de App Nativo
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Deseja instalar o Economize Já no seu celular?
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-xs mx-auto">
                Adicione um atalho rápido na sua Tela de Início para acessar suas finanças em 1 toque, sem precisar abrir o navegador!
              </p>
            </div>

            {/* Botões de Ação */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={handleOpenTutorial}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">touch_app</span>
                Sim, ver como instalar
              </button>

              <button
                onClick={handleDismissFor3Days}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                Agora não (Lembrar em 3 dias)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. MODAL TUTORIAL INTERATIVO EM 3 PASSOS (BASEADO NOS PRINTS) ── */}
      {showTutorialModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#111720] rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 animate-in zoom-in-95">
            {/* Header do Tutorial */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-500 text-xl">phone_iphone</span>
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  {isApple ? 'Como salvar no iPhone (Safari)' : 'Como salvar no Celular'}
                </h3>
              </div>
              <button
                onClick={handleCloseTutorial}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Progresso de Passos (Indicators) */}
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  onClick={() => setCurrentStep(step as any)}
                  className={`h-2 rounded-full cursor-pointer transition-all ${
                    currentStep === step
                      ? 'w-8 bg-emerald-500'
                      : 'w-2 bg-slate-200 dark:bg-slate-800'
                  }`}
                />
              ))}
            </div>

            {/* Conteúdo Interativo dos Passos */}
            <div className="min-h-[290px] flex flex-col justify-between space-y-4">
              {/* PASSO 1: Botão Compartilhar */}
              {currentStep === 1 && (
                <div className="space-y-4 text-center animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-black">
                    Passo 1 de 3
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Toque no ícone de Compartilhar
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Na barra inferior do seu Safari (ou menu do navegador), clique no botão de <strong>Compartilhar</strong>.
                  </p>

                  {/* Mockup Ilustrativo do Safari */}
                  <div className="bg-slate-100 dark:bg-[#1a2332] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="bg-white dark:bg-[#111720] p-3 rounded-xl border border-emerald-500/50 shadow-md flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 ring-2 ring-emerald-500/30">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-emerald-500 text-lg">ios_share</span>
                        <span>Share (Compartilhar)</span>
                      </div>
                      <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                        Clique Aqui
                      </span>
                    </div>
                    <div className="opacity-40 space-y-2 text-left text-xs">
                      <div className="bg-slate-200 dark:bg-slate-800 h-6 rounded-lg w-3/4" />
                      <div className="bg-slate-200 dark:bg-slate-800 h-6 rounded-lg w-1/2" />
                    </div>
                  </div>
                </div>
              )}

              {/* PASSO 2: Adicionar à Tela de Início */}
              {currentStep === 2 && (
                <div className="space-y-4 text-center animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-black">
                    Passo 2 de 3
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Selecione "Adicionar à Tela de Início"
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Role a lista de opções para baixo e clique em <strong>Add to Home Screen (Adicionar à Tela de Início)</strong>.
                  </p>

                  {/* Mockup Ilustrativo da Opção */}
                  <div className="bg-slate-100 dark:bg-[#1a2332] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-left">
                    <div className="bg-slate-200 dark:bg-slate-800 p-2.5 rounded-xl opacity-40 text-xs font-medium text-slate-600 dark:text-slate-300">
                      Add to Favorites
                    </div>
                    <div className="bg-emerald-500/15 dark:bg-emerald-500/20 p-3 rounded-xl border-2 border-emerald-500 shadow-md flex items-center justify-between text-xs font-black text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-emerald-500 text-lg">add_box</span>
                        <span>Add to Home Screen</span>
                      </div>
                      <span className="material-symbols-outlined text-emerald-500 text-base">check_circle</span>
                    </div>
                    <div className="bg-slate-200 dark:bg-slate-800 p-2.5 rounded-xl opacity-40 text-xs font-medium text-slate-600 dark:text-slate-300">
                      Open in Safari
                    </div>
                  </div>
                </div>
              )}

              {/* PASSO 3: Confirmar Adicionar */}
              {currentStep === 3 && (
                <div className="space-y-4 text-center animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-black">
                    Passo 3 de 3
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Toque em "Adicionar" (Add)
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    No canto superior direito da tela de confirmação, toque no botão azul <strong>Add (Adicionar)</strong>. Pronto! O ícone estará salvo no seu celular.
                  </p>

                  {/* Mockup Ilustrativo da Tela Final */}
                  <div className="bg-slate-100 dark:bg-[#1a2332] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Add to Home Screen</span>
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-black shadow-md animate-bounce">
                        Add
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-white dark:bg-[#111720] rounded-xl border border-slate-200 dark:border-slate-800">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center border border-slate-700">
                        EJ
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Economize Já</p>
                        <p className="text-[10px] text-slate-500">https://economize-ja...</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Botões de Navegação dos Passos */}
              <div className="flex items-center justify-between gap-3 pt-2">
                {currentStep > 1 ? (
                  <button
                    onClick={() => setCurrentStep((prev) => (prev - 1) as any)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Voltar
                  </button>
                ) : (
                  <div />
                )}

                {currentStep < 3 ? (
                  <button
                    onClick={() => setCurrentStep((prev) => (prev + 1) as any)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-xs transition-all flex items-center gap-1"
                  >
                    <span>Próximo Passo</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                ) : (
                  <button
                    onClick={handleCloseTutorial}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md transition-all flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-base">check</span>
                    <span>Concluído!</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
