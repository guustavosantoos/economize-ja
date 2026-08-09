'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { apiClient } from '../../../../lib/api-client';

export default function TelegramLink() {
  const [code, setCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [linked, setLinked] = useState<boolean>(false);
  const [linkedAt, setLinkedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const checkStatus = async () => {
    try {
      const res = await apiClient.get('/telegram/status');
      if (res) {
        if (res.linked) {
          setLinked(true);
          setLinkedAt(res.linkedAt || null);
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
        } else {
          setLinked(false);
        }
      }
    } catch (err) {
      // Silent catch during polling
    }
  };

  const generateCode = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.post('/telegram/link-code');
      if (res) {
        setCode(res.linkCode || res.code || '1A2B3C');
        setExpiresAt(res.expiresAt || null);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar código do Telegram.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlink = async () => {
    if (!confirm('Tem certeza que deseja desvincular sua conta do Telegram?')) return;
    setUnlinking(true);
    setError('');
    try {
      await apiClient.post('/telegram/unlink');
      setLinked(false);
      setLinkedAt(null);
      generateCode();
    } catch (err: any) {
      setError(err.message || 'Erro ao desvincular conta.');
    } finally {
      setUnlinking(false);
    }
  };

  const handleCopyCode = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    // Initial check
    checkStatus().then(() => {
      generateCode();
    });

    // Auto-poll status every 3 seconds while on screen
    pollIntervalRef.current = setInterval(() => {
      checkStatus();
    }, 3000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="p-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/settings" className="text-on-surface-variant flex items-center gap-1 font-medium text-sm hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-lg">arrow_back</span> Voltar
        </Link>
        <h1 className="text-xl font-bold text-primary">Vincular Telegram</h1>
        <div className="w-12" />
      </div>

      {/* Error alert */}
      {error && (
        <div className="bg-error-container text-on-error-container p-4 rounded-xl mb-4 text-xs font-medium border border-error/20">
          {error}
        </div>
      )}

      {/* 🟢 CARD SE JÁ ESTIVER VINCULADO */}
      {linked ? (
        <div className="bg-white p-6 rounded-2xl border border-secondary/20 shadow-lg text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-secondary-container text-on-secondary-container mx-auto flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-secondary font-bold">check_circle</span>
          </div>

          <div>
            <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-block mb-2">
              🟢 Conta Vinculada
            </span>
            <h2 className="text-xl font-bold text-primary">Sua conta está conectada!</h2>
            <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
              Sua conta já está permanentemente vinculada ao Telegram. Você pode lançar transações e ver resumos a qualquer momento enviando mensagens para o bot.
            </p>

            {linkedAt && (
              <p className="text-xs text-outline mt-3">
                Vinculado em: {new Date(linkedAt).toLocaleDateString('pt-BR')} às {new Date(linkedAt).toLocaleTimeString('pt-BR')}
              </p>
            )}
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <a
              href="https://t.me/meu_economizeJa_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#0088cc] hover:bg-[#0077b3] text-white p-4 rounded-xl font-bold shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-xl">send</span>
              Abrir Bot no Telegram (@meu_economizeJa_bot)
            </a>

            <button
              data-cy="telegram-unlink-button"
              onClick={handleUnlink}
              disabled={unlinking}
              className="w-full text-error font-semibold p-3 hover:bg-error-container/20 rounded-xl transition-all border border-error/20 text-sm disabled:opacity-50"
            >
              {unlinking ? 'Desvinculando...' : 'Desvincular Telegram'}
            </button>
          </div>
        </div>
      ) : (
        /* 🔴 PASSO A PASSO E GERADOR SE NÃO ESTIVER VINCULADO */
        <div className="space-y-6">
          {/* Passo a Passo */}
          <div className="bg-surface p-6 rounded-2xl border border-surface-variant shadow-ambient space-y-4">
            <h3 className="font-bold text-on-surface text-base flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">send</span> Passo a passo para conectar:
            </h3>
            <ol className="space-y-3 text-sm text-on-surface-variant font-medium">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-primary text-on-primary text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">1</span>
                <div>
                  Clique no botão abaixo ou busque por <strong className="text-primary">@meu_economizeJa_bot</strong> no Telegram.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-primary text-on-primary text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">2</span>
                <div>
                  No Telegram, envie o comando <code className="bg-surface-variant px-1.5 py-0.5 rounded font-mono text-primary font-bold">/start</code> ou digite o código de vinculação abaixo.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-primary text-on-primary text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">3</span>
                <div>
                  Pronto! Seu Telegram ficará vinculado e este status atualizará automaticamente para <span className="text-secondary font-bold">Vinculado</span>!
                </div>
              </li>
            </ol>

            <a
              href="https://t.me/meu_economizeJa_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#0088cc] hover:bg-[#0077b3] text-white py-3 px-4 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 mt-2"
            >
              <span className="material-symbols-outlined text-lg">open_in_new</span>
              Abrir Bot no Telegram (@meu_economizeJa_bot)
            </a>
          </div>

          {/* Código de Vinculação */}
          <div className="bg-primary text-on-primary p-6 rounded-2xl shadow-ambient text-center relative overflow-hidden">
            <p className="text-xs opacity-75 mb-2 font-medium">Seu Código de Vinculação Temporário</p>
            <div className="flex items-center justify-center gap-3">
              <h2 data-cy="telegram-link-code" className="text-4xl font-mono tracking-widest font-bold">
                {loading ? '......' : code || '------'}
              </h2>
              {code && (
                <button
                  onClick={handleCopyCode}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-xs font-semibold flex items-center gap-1"
                  title="Copiar Código"
                >
                  <span className="material-symbols-outlined text-base">
                    {copied ? 'check' : 'content_copy'}
                  </span>
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
              )}
            </div>
            <p data-cy="telegram-code-expiry" className="text-[11px] opacity-75 mt-3">
              {expiresAt ? `Válido até: ${new Date(expiresAt).toLocaleTimeString('pt-BR')}` : 'Válido por 10 minutos'}
            </p>
          </div>

          {/* Status Badge & Botão Gerar */}
          <div className="text-center space-y-4">
            <span
              data-cy="telegram-status"
              className="text-xs font-semibold px-4 py-2 rounded-full inline-flex items-center gap-1.5 bg-surface-variant text-on-surface-variant border border-outline-variant/30"
            >
              <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
              Aguardando vínculo no Telegram...
            </span>

            <button
              data-cy="telegram-generate-button"
              onClick={generateCode}
              disabled={loading}
              className="w-full bg-surface hover:bg-surface-variant text-primary border border-surface-variant p-3.5 rounded-xl font-bold shadow-ambient transition-all disabled:opacity-50 text-sm"
            >
              {loading ? 'Gerando novo código...' : 'Gerar novo código'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
