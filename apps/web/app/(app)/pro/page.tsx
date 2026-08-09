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
