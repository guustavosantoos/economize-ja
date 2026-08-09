'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

type Message = {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
};

const SIMULATION_STEPS = [
  {
    type: 'user',
    text: 'gasto uber 55',
    delay: 1000,
  },
  {
    type: 'typing',
    delay: 1200,
  },
  {
    type: 'bot',
    text: '📝 *Entendi:*\n• Tipo: ➖ Despesa\n• Descrição: Uber\n• Valor: R$ 55,00\n\nConfirmar? Responda *sim* ou *não*',
    delay: 1800,
  },
  {
    type: 'user',
    text: 'sim',
    delay: 1000,
  },
  {
    type: 'typing',
    delay: 1000,
  },
  {
    type: 'bot',
    text: '✅ *Transação registrada com sucesso!*\n\n💡 *Aviso:* Você já utilizou 35% da sua meta de cartão este mês.',
    delay: 2200,
  },
  {
    type: 'user',
    text: '/resumo',
    delay: 1200,
  },
  {
    type: 'typing',
    delay: 1200,
  },
  {
    type: 'bot',
    text: '📊 *Resumo Financeiro — Agosto de 2026*\n\n💰 *Entradas:* R$ 5.000,00\n💸 *Saídas:* R$ 1.550,00\n───────────────\n⚖️ *Balanço:* +R$ 3.450,00 🟢 *No Azul!*',
    delay: 4500,
  },
];

export default function TelegramChatSimulation() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    let timeouts: NodeJS.Timeout[] = [];

    const runLoop = () => {
      if (!isMounted) return;
      setMessages([]);
      setIsTyping(false);

      let accumulatedTime = 400;

      SIMULATION_STEPS.forEach((step, index) => {
        const timer = setTimeout(() => {
          if (!isMounted) return;

          if (step.type === 'user' || step.type === 'bot') {
            setIsTyping(false);
            const timeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            setMessages((prev) => [
              ...prev,
              {
                id: `${index}-${Date.now()}`,
                sender: step.type as 'user' | 'bot',
                text: step.text!,
                time: timeStr,
              },
            ]);
          } else if (step.type === 'typing') {
            setIsTyping(true);
          }

          // Loop reset at the last step
          if (index === SIMULATION_STEPS.length - 1) {
            const loopTimer = setTimeout(() => {
              if (isMounted) runLoop();
            }, step.delay);
            timeouts.push(loopTimer);
          }
        }, accumulatedTime);

        timeouts.push(timer);
        accumulatedTime += step.delay;
      });
    };

    runLoop();

    return () => {
      isMounted = false;
      timeouts.forEach(clearTimeout);
    };
  }, []);

  // Internal container scroll ONLY (does NOT scroll the outer web page)
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div className="w-full max-w-md mx-auto bg-[#17212b] rounded-3xl overflow-hidden shadow-2xl border border-white/10 text-white font-sans flex flex-col h-[460px] pointer-events-none select-none">
      {/* Header Telegram */}
      <div className="bg-[#242f3d] px-4 py-3 flex items-center justify-between border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Image
              src="/logo.png"
              alt="Bot Avatar"
              width={40}
              height={40}
              className="rounded-full bg-white p-0.5 object-contain"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#242f3d]" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white leading-tight">Economize Já Bot</h4>
            <p className="text-[11px] text-emerald-400 font-medium">online • assistente de finanças</p>
          </div>
        </div>
        <span className="material-symbols-outlined text-gray-400 text-xl">more_vert</span>
      </div>

      {/* Message Area (Internal scroll container) */}
      <div ref={containerRef} className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0e1621] text-xs no-scrollbar">
        <div className="flex justify-center my-1">
          <span className="bg-white/10 text-white/70 text-[10px] px-3 py-0.5 rounded-full font-medium backdrop-blur-xs">
            Hoje
          </span>
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 relative shadow-md ${
                msg.sender === 'user'
                  ? 'bg-[#2b5278] text-white rounded-br-none'
                  : 'bg-[#182533] text-gray-100 rounded-bl-none border border-white/5'
              }`}
            >
              <div className="whitespace-pre-line leading-relaxed font-medium">
                {msg.text.split('\n').map((line, i) => (
                  <p key={i}>
                    {line.startsWith('•') || line.startsWith('💰') || line.startsWith('💸') || line.startsWith('⚖️') ? (
                      <span className="font-semibold">{line}</span>
                    ) : (
                      line
                    )}
                  </p>
                ))}
              </div>
              <div className="text-[9px] text-gray-400 text-right mt-1 flex items-center justify-end gap-1">
                <span>{msg.time}</span>
                {msg.sender === 'user' && <span className="text-emerald-400 font-bold">✓✓</span>}
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator dots */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-[#182533] text-gray-100 rounded-2xl rounded-bl-none px-4 py-2.5 border border-white/5 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* Static Footer Bar (Visual Mockup Telegram Input) */}
      <div className="bg-[#17212b] px-4 py-3 border-t border-white/10 flex items-center gap-2.5 flex-shrink-0">
        <span className="material-symbols-outlined text-gray-400 text-xl">attach_file</span>
        <div className="flex-1 bg-[#242f3d] text-gray-400 px-4 py-2 rounded-full text-xs border border-white/5 flex items-center justify-between">
          <span>Mensagem...</span>
          <span className="material-symbols-outlined text-gray-500 text-base">sentiment_satisfied</span>
        </div>
        <div className="w-9 h-9 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-md flex-shrink-0">
          <span className="material-symbols-outlined text-base">mic</span>
        </div>
      </div>
    </div>
  );
}
