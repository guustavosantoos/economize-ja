'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navLinks = [
    { href: '#recursos', label: 'Recursos' },
    { href: '#telegram', label: 'Telegram' },
    { href: '#como-funciona', label: 'Como funciona' },
    { href: '#planos', label: 'Planos' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 gap-3">
        {/* Logo */}
        <a href="#topo" className="flex items-center gap-2.5 font-black text-base sm:text-lg text-slate-900 transition-opacity hover:opacity-90">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center p-0.5 shadow-xs overflow-hidden">
            <Image
              src="/logo.png"
              alt="Economize Já Logo"
              width={32}
              height={32}
              priority
              className="object-contain w-full h-full"
            />
          </div>
          <span className="tracking-tight font-extrabold text-slate-900">
            Economize <span className="text-emerald-600 font-extrabold">Já</span>
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-emerald-600 transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/login"
            className="hidden sm:inline-flex text-xs font-bold px-3.5 py-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Entrar
          </Link>

          <Link
            href="/register"
            className="hidden sm:inline-flex text-xs font-bold px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all hover:shadow-emerald-600/20 active:scale-95"
          >
            Criar conta grátis
          </Link>

          {/* Mobile CTA */}
          <Link
            href="/register"
            className="sm:hidden text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-600 text-white shadow-xs whitespace-nowrap"
          >
            Criar conta
          </Link>

          {/* Hamburger toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Abrir menu"
          >
            <span className="material-symbols-outlined text-xl">
              {menuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile nav overlay */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 flex flex-col gap-3 shadow-lg">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="text-sm font-bold text-slate-700 py-2 border-b border-slate-100"
            >
              {l.label}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-2">
            <Link
              href="/login"
              className="w-full text-center text-xs font-bold py-2.5 rounded-xl border border-slate-200 text-slate-700"
            >
              Entrar na conta
            </Link>
            <Link
              href="/register"
              className="w-full text-center text-xs font-bold py-2.5 rounded-xl bg-emerald-600 text-white shadow-xs"
            >
              Criar conta grátis
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
