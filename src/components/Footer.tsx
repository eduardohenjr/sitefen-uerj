import logo from '../assets/logo.png';
import type { Tab } from '../types';

interface FooterProps {
  onNavigate: (tab: Tab) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const linkClass = 'text-left text-navy-200 transition-colors hover:text-white';

  return (
    <footer className="mt-24 bg-navy-950 text-sm text-navy-200">
      <div className="h-1 bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500" aria-hidden="true" />
      <div className="container-page grid gap-10 py-14 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="flex items-center gap-3.5">
            <span className="flex h-12 w-12 items-center justify-center rounded-md bg-navy-800">
              <img src={logo} alt="" className="h-8 w-8 object-contain" />
            </span>
            <div className="leading-tight">
              <p className="font-serif text-lg font-semibold text-white">Faculdade de Engenharia</p>
              <p className="text-[11px] uppercase tracking-[0.16em] text-navy-300">UERJ</p>
            </div>
          </div>
          <address className="mt-6 not-italic leading-relaxed">
            Rua São Francisco Xavier, 524 — Maracanã
            <br />
            Rio de Janeiro, RJ — CEP 20550-900
            <br />
            Pavilhão João Lyra Filho, Blocos A e B
          </address>
        </div>

        <nav aria-label="Rodapé: navegação" className="md:col-span-3">
          <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-gold-400">Navegação</h2>
          <ul className="mt-4 space-y-2.5">
            <li><button type="button" className={linkClass} onClick={() => onNavigate('news')}>Notícias e editais</button></li>
            <li><button type="button" className={linkClass} onClick={() => onNavigate('departments')}>Departamentos e cursos</button></li>
            <li><button type="button" className={linkClass} onClick={() => onNavigate('postgrad')}>Pós-graduação</button></li>
            <li><button type="button" className={linkClass} onClick={() => onNavigate('secfen')}>Secretaria de Graduação</button></li>
          </ul>
        </nav>

        <div className="md:col-span-4">
          <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-gold-400">Institucional</h2>
          <ul className="mt-4 space-y-2.5">
            <li>
              <a href="https://www.uerj.br" target="_blank" rel="noreferrer" className={linkClass}>
                Portal da UERJ<span className="sr-only"> (abre em nova aba)</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-navy-800">
        <div className="container-page py-5 text-xs text-navy-300">
          <p>© Faculdade de Engenharia da UERJ. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
