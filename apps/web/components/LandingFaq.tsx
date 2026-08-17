'use client';

import { useState } from 'react';

const faqs = [
  { q: 'O Economize Já é realmente grátis?', a: 'Sim. O plano Free é gratuito para sempre e inclui transações ilimitadas, dashboard completo e o bot do Telegram com comandos simples. Você só migra para o Pro se quiser recursos avançados como a IA e lembretes.' },
  { q: 'Preciso informar dados do meu banco?', a: 'Não. Você registra suas transações manualmente ou pelo Telegram. A conexão automática com bancos (Open Finance) chegará no futuro como recurso Pro, sempre por meio de um agregador certificado e com a sua autorização.' },
  { q: 'Como funciona o bot do Telegram?', a: 'Você gera um código de vínculo dentro do app e envia para o bot no Telegram. A partir daí, é só mandar mensagens como "gasto uber 55" que o bot registra e confirma o lançamento na hora.' },
  { q: 'Meus dados financeiros estão seguros?', a: 'Sim. Usamos criptografia forte para senhas e dados sensíveis, conexões seguras (HTTPS) e registros de auditoria em ações críticas. Você também pode exportar ou apagar todos os seus dados quando quiser.' },
  { q: 'Funciona no computador ou só no celular?', a: 'O Economize Já é pensado para o celular (mobile-first), mas funciona muito bem também no notebook e no desktop — seus dados ficam sincronizados em qualquer dispositivo.' },
];

export default function LandingFaq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="w-full flex flex-col gap-2">
      {faqs.map((item, i) => (
        <div
          key={i}
          className="rounded-2xl border overflow-hidden transition-all"
          style={{ borderColor: '#E1E3E4', background: '#FFFFFF' }}
        >
          <button
            className="w-full flex items-center justify-between px-5 py-4 text-left"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span className="text-sm font-semibold" style={{ color: '#191C1D' }}>{item.q}</span>
            <span
              className="material-symbols-outlined text-xl flex-shrink-0 ml-3 transition-transform duration-200"
              style={{
                color: '#003535',
                pointerEvents: 'none',
                transform: open === i ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            >
              expand_more
            </span>
          </button>
          {open === i && (
            <div className="px-5 pb-4 text-sm leading-relaxed border-t border-slate-100 pt-3" style={{ color: '#404848' }}>
              {item.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
