import { useEffect, useRef } from 'react';
import { FileText, X } from 'lucide-react';
import { formatDate } from '../lib/format';
import type { NewsItem } from '../types';

interface NewsModalProps {
  item: NewsItem;
  onClose: () => void;
}

export default function NewsModal({ item, onClose }: NewsModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-navy-950/70 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="noticia-titulo"
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-xl bg-white shadow-2xl sm:rounded-xl"
      >
        <div className="flex items-start justify-between gap-6 border-b border-navy-100 px-6 py-5 sm:px-8">
          <div>
            <p className="eyebrow">{item.categoryLabel}</p>
            <h2 id="noticia-titulo" className="mt-2 text-2xl font-semibold leading-snug sm:text-3xl">
              {item.title}
            </h2>
            <p className="mt-3 text-sm text-slate-500">
              <time dateTime={item.publishedAt}>{formatDate(item.publishedAt)}</time> · {item.author}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Fechar notícia"
            className="-mr-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-navy-50 hover:text-navy-950"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-6 overflow-y-auto px-6 py-6 sm:px-8">
          {item.featuredImage && (
            <img src={item.featuredImage} alt="" className="aspect-[16/8] w-full rounded-lg object-cover" />
          )}
          <p className="border-l-2 border-gold-500 pl-4 font-serif text-lg leading-relaxed text-navy-900">{item.summary}</p>
          <p className="leading-relaxed text-slate-700">{item.content}</p>

          {item.attachments && item.attachments.length > 0 && (
            <div className="border-t border-navy-100 pt-5">
              <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Documentos e anexos</h3>
              <ul className="mt-3 space-y-2">
                {item.attachments.map((att) => (
                  <li key={att.url}>
                    <a
                      href={att.url}
                      onClick={(event) => {
                        event.preventDefault();
                        alert(`Download simulado do arquivo: ${att.name}`);
                      }}
                      className="flex items-center gap-3 rounded-md border border-navy-100 px-4 py-3 text-sm font-medium text-navy-800 transition-colors hover:bg-navy-50"
                    >
                      <FileText className="h-4 w-4 text-gold-600" aria-hidden="true" /> {att.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
