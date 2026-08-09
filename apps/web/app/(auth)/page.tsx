'use client';
import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';

const slides = [
  {
    icon: 'account_balance_wallet',
    title: 'Bem-vindo ao Economize Já',
    description: 'Sua jornada para controlar suas finanças começa aqui. Simples, visual e inteligente.',
  },
  {
    icon: 'bar_chart',
    title: 'Controle seus gastos',
    description: 'Acompanhe cada centavo com gráficos e categorias automáticas.',
  },
  {
    icon: 'send',
    title: 'Integração com Telegram',
    description: 'Lance transações pelo bot só digitando: "gasto uber 55". Rápido assim!',
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [slide, setSlide] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  function goToSlide(idx: number) {
    setSlide(idx);
    const el = scrollRef.current;
    if (el) el.scrollTo({ left: idx * el.offsetWidth, behavior: 'smooth' });
  }

  function handleNext() {
    if (slide < slides.length - 1) goToSlide(slide + 1);
    else router.push('/login');
  }

  function handleSkip() {
    router.push('/login');
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      {/* Card container — mobile: full screen, desktop: card */}
      <div className="w-full max-w-md flex flex-col" style={{ minHeight: 'min(600px, 100svh)' }}>
        {/* Slides */}
        <div
          ref={scrollRef}
          className="flex-1 flex overflow-x-auto snap-x snap-mandatory"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
          } as React.CSSProperties}
          onScroll={(e) => {
            const el = e.currentTarget;
            const idx = Math.round(el.scrollLeft / el.offsetWidth);
            if (idx !== slide) setSlide(idx);
          }}
        >
          {slides.map((s, i) => (
            <div
              key={i}
              data-cy={`onboarding-slide-${i + 1}`}
              style={{ minWidth: '100%', scrollSnapAlign: 'center' }}
              className="flex flex-col items-center justify-center p-10 text-center select-none"
            >
              {/* Ícone */}
              <div
                className="w-28 h-28 rounded-full flex items-center justify-center mb-8"
                style={{ background: '#b4edec' }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: '64px',
                    color: '#003535',
                    fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 48",
                    pointerEvents: 'none',
                  }}
                >
                  {s.icon}
                </span>
              </div>

              <h1 className="text-2xl font-bold mb-4" style={{ color: '#003535' }}>
                {s.title}
              </h1>
              <p className="text-base leading-relaxed max-w-xs" style={{ color: '#404848' }}>
                {s.description}
              </p>
            </div>
          ))}
        </div>

        {/* Footer: skip | dots | próximo */}
        <div className="px-8 pb-10 pt-6 flex justify-between items-center bg-background">
          <button
            data-cy="onboarding-skip-button"
            className="font-medium px-4 py-2 rounded-full transition-all hover:bg-surface-container active:scale-95"
            style={{ color: '#707978' }}
            onClick={handleSkip}
          >
            Pular
          </button>

          {/* Indicadores de slide */}
          <div className="flex gap-2 items-center">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                aria-label={`Ir para slide ${i + 1}`}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === slide ? '24px' : '8px',
                  height: '8px',
                  background: i === slide ? '#003535' : '#bfc8c8',
                  border: 'none',
                  padding: 0,
                }}
              />
            ))}
          </div>

          <button
            data-cy="onboarding-next-button"
            onClick={handleNext}
            className="font-semibold px-6 py-3 rounded-full text-white transition-all active:scale-95 hover:opacity-90"
            style={{ background: '#003535' }}
          >
            {slide === slides.length - 1 ? 'Começar' : 'Próximo'}
          </button>
        </div>
      </div>
    </div>
  );
}
