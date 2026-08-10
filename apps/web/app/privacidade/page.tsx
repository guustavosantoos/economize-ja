'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useThemeStore } from '../../stores/theme.store';

export default function PrivacyPolicyPage() {
  const { theme, toggleTheme } = useThemeStore();
  const contactEmail = 'onboarding.economizeja@gmail.com';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d12] text-slate-800 dark:text-slate-100 transition-colors">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-[#090d12]/85 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 font-black text-base sm:text-lg text-slate-900 dark:text-white">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-400/10 border border-emerald-500/20 dark:border-emerald-400/20 flex items-center justify-center p-0.5 shadow-xs overflow-hidden">
              <Image src="/logo.png" alt="Economize Já Logo" width={32} height={32} className="object-contain w-full h-full" />
            </div>
            <span>Economize <span className="text-emerald-600 dark:text-emerald-400">Já</span></span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-center text-amber-500"
              title="Alternar Tema"
            >
              <span className="material-symbols-outlined text-lg">{theme === 'dark' ? 'dark_mode' : 'light_mode'}</span>
            </button>

            <Link
              href="/login"
              className="text-xs font-bold px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all"
            >
              Acessar App
            </Link>
          </div>
        </div>
      </header>

      {/* ── Content Container ── */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
        
        {/* Title / Hero */}
        <div className="space-y-4 border-b border-slate-200 dark:border-slate-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
            <span className="material-symbols-outlined text-sm">shield</span>
            LGPD & Segurança Cibernética
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Política de Privacidade e Proteção de Dados
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Última atualização: {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}. Entenda como o <strong>Economize Já</strong> protege seus registros financeiros com transparência e segurança de nível bancário.
          </p>
        </div>

        {/* Highlight Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-900/10 via-teal-900/10 to-slate-900/10 border border-emerald-500/20 dark:border-emerald-400/20 space-y-2">
          <h2 className="text-sm font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <span className="material-symbols-outlined text-base">verified_user</span>
            Compromisso de Zero Compartilhamento
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
            Seus dados financeiros são <strong>100% privados e seus</strong>. O Economize Já <strong>nunca vende, aluga ou compartilha</strong> suas informações pessoais ou histórico financeiro com corretores de dados, parceiros comerciais ou plataformas de anúncios.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8 text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed">

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm font-bold">1</span>
              Quais dados coletamos e para que servem
            </h2>
            <p>Coletamos apenas o estritamente necessário para o funcionamento do seu controle financeiro:</p>
            <ul className="list-disc pl-6 space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <li><strong>Informações de Cadastro:</strong> Nome, endereço de e-mail e senha criptografada.</li>
              <li><strong>Registros Financeiros:</strong> Transações de despesas e receitas inseridas voluntariamente por você no App ou via Bot do Telegram (valor, data, categoria e descrição).</li>
              <li><strong>Metas e Limites:</strong> Valor estipulado por você para acompanhamento da fatura de cartão de crédito. NUNCA solicitamos o número real do seu cartão nem senhas bancárias.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm font-bold">2</span>
              Como protegemos seus dados (Arquitetura de Segurança)
            </h2>
            <p>Adotamos práticas avançadas de proteção cibernética:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-white dark:bg-[#111720] border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="material-symbols-outlined text-emerald-500 text-xl">lock</span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Criptografia AES-256</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Descrições e campos sensíveis são criptografados no nível da aplicação no banco de dados.</p>
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-[#111720] border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="material-symbols-outlined text-emerald-500 text-xl">key</span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Hashing Bcrypt</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Sua senha nunca é armazenada em texto puro. Utilizamos algoritmo Bcrypt com salt rounds de alto desempenho.</p>
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-[#111720] border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="material-symbols-outlined text-emerald-500 text-xl">vpn_lock</span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Tráfego Criptografado (TLS/HTTPS)</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Toda a comunicação entre o navegador/bot e nossos servidores viaja com proteção HTTPS/TLS 1.3.</p>
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-[#111720] border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="material-symbols-outlined text-emerald-500 text-xl">password</span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Vínculo Seguro Telegram (OTP)</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">A integração com o bot exige vinculação via código numérico temporário (OTP) com tempo limite.</p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm font-bold">3</span>
              Seus Direitos sob a LGPD (Lei nº 13.709/2018)
            </h2>
            <p>Garantimos controle total sobre a sua conta diretamente pelas configurações do aplicativo:</p>
            <ul className="list-disc pl-6 space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <li><strong>Direito de Portabilidade e Exportação:</strong> Você pode baixar um arquivo JSON com 100% dos seus dados salvos em <code>Perfil &gt; Exportar Meus Dados</code>.</li>
              <li><strong>Direito ao Esquecimento e Anonimização:</strong> Ao selecionar <code>Perfil &gt; Excluir Conta</code>, todos os seus dados e históricos são anonimizados e apagados de forma irreversível.</li>
              <li><strong>Direito de Zerar Histórico:</strong> Permite arquivar seus gastos e reiniciar o saldo para R$ 0,00 mantendo o seu perfil ativo em <code>Perfil &gt; Zerar Histórico</code>.</li>
            </ul>
          </section>

          {/* Section 4 - Contact */}
          <section className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-500">mail</span>
              Contato do Encarregado de Dados (DPO) & Suporte
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Para tirar dúvidas sobre a sua privacidade, solicitar dados adicionais ou suporte técnico, entre em contato direto pelo e-mail oficial:
            </p>
            <div className="p-4 rounded-2xl bg-white dark:bg-[#111720] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">alternate_email</span>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">E-mail de Suporte & Privacidade</p>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white">{contactEmail}</p>
                </div>
              </div>
              <a
                href={`mailto:${contactEmail}`}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-xs"
              >
                Enviar E-mail
              </a>
            </div>
          </section>

        </div>

        {/* Footer info */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} Economize Já. Todos os direitos reservados.</p>
          <Link href="/" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline mt-1 inline-block">
            ← Voltar para a Página Inicial
          </Link>
        </div>

      </main>
    </div>
  );
}
