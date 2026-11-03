import { useEffect, useState } from 'react';
import { ArrowRight, Bell, X } from 'lucide-react';

interface NoticeToastProps {
  id: string;
  title: string;
  text: string;
  actionLabel?: string;
  onAction?: () => void;
}

const storageKey = (id: string) => `aviso-fechado:${id}`;

export default function NoticeToast({ id, title, text, actionLabel = 'Ver detalhes', onAction }: NoticeToastProps) {
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem(storageKey(id)) === '1');
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setShown(true), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(storageKey(id), '1');
    setDismissed(true);
  };

  if (dismissed || !shown) return null;

  return (
    <aside
      role="status"
      aria-label="Aviso"
      className="notice-in fixed inset-x-4 bottom-4 z-40 rounded-lg border border-navy-100 border-l-4 border-l-gold-500 bg-white p-4 shadow-lift sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-96"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Fechar aviso"
        className="absolute right-1.5 top-1.5 flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-navy-50 hover:text-navy-950"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>

      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-gold-600">
        <Bell className="h-3 w-3" aria-hidden="true" /> Aviso
      </p>
      <p className="mt-1.5 pr-8 font-serif text-base font-semibold leading-snug text-navy-950">{title}</p>
      <p className="mt-1 text-sm leading-relaxed text-slate-600">{text}</p>
      {onAction && (
        <button
          type="button"
          onClick={() => {
            onAction();
            dismiss();
          }}
          className="link-arrow mt-3"
        >
          {actionLabel} <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </aside>
  );
}
