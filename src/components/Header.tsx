import { useState } from 'react';
import { ExternalLink, Menu, X } from 'lucide-react';
import logo from '../assets/logo.png';
import type { Tab } from '../types';

const navItems: { id: Tab; label: string }[] = [
  { id: 'home', label: 'Início' },
  { id: 'news', label: 'Notícias' },
  { id: 'departments', label: 'Departamentos e Cursos' },
  { id: 'postgrad', label: 'Pós-Graduação' },
  { id: 'secfen', label: 'SECFEN' },
];

interface HeaderProps {
  currentTab: Tab;
  onNavigate: (tab: Tab) => void;
}

export default function Header({ currentTab, onNavigate }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const go = (tab: Tab) => {
    onNavigate(tab);
    setMenuOpen(false);
  };

  return (
    <>
      <a
        href="#conteudo"
        onClick={(e) => {
          // Com rotas por hash, o link âncora padrão trocaria a rota.
          e.preventDefault();
          document.getElementById('conteudo')?.focus();
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-gold-400 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-navy-950"
      >
        Pular para o conteúdo
      </a>

      <div className="hidden bg-navy-950 text-xs text-navy-200 sm:block">
        <div className="container-page flex items-center justify-between gap-4 py-2">
          <span>Universidade do Estado do Rio de Janeiro</span>
          <div className="flex items-center gap-5">
            <a
              href="https://www.uerj.br"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-white"
            >
              Portal UERJ <ExternalLink className="h-3 w-3" aria-hidden="true" />
              <span className="sr-only">(abre em nova aba)</span>
            </a>
            <button type="button" onClick={() => go('secfen')} className="transition-colors hover:text-white">
              Atendimento SECFEN
            </button>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-navy-100 bg-white/95 backdrop-blur">
        <div className="container-page flex items-center justify-between gap-6 py-3">
          <button
            type="button"
            onClick={() => go('home')}
            className="group flex items-center gap-3.5 text-left"
            aria-label="Faculdade de Engenharia UERJ - ir para o início"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-navy-900 ring-1 ring-navy-900/10">
              <img src={logo} alt="" className="h-8 w-8 object-contain" />
            </span>
            <span className="leading-tight">
              <span className="block font-serif text-lg font-semibold tracking-tight text-navy-950 sm:text-xl">
                Faculdade de Engenharia
              </span>
              <span className="hidden text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500 sm:block">
                Universidade do Estado do Rio de Janeiro
              </span>
            </span>
          </button>

          <nav aria-label="Navegação principal" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {navItems.map((item) => {
                const active = currentTab === item.id;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => go(item.id)}
                      aria-current={active ? 'page' : undefined}
                      className={`relative px-3.5 py-2 text-sm font-medium transition-colors after:absolute after:inset-x-3.5 after:-bottom-[13px] after:h-0.5 after:transition-colors ${
                        active
                          ? 'text-navy-950 after:bg-gold-500'
                          : 'text-slate-600 after:bg-transparent hover:text-navy-950 hover:after:bg-navy-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-navy-100 text-navy-900 lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="menu-mobile"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>

        {menuOpen && (
          <nav id="menu-mobile" aria-label="Navegação principal" className="border-t border-navy-100 bg-white lg:hidden">
            <ul className="container-page py-2">
              {navItems.map((item) => {
                const active = currentTab === item.id;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => go(item.id)}
                      aria-current={active ? 'page' : undefined}
                      className={`flex w-full items-center justify-between border-l-2 px-4 py-3 text-left text-base font-medium ${
                        active ? 'border-gold-500 bg-navy-50 text-navy-950' : 'border-transparent text-slate-600'
                      }`}
                    >
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
      </header>
    </>
  );
}
