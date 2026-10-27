import { Bell } from 'lucide-react';

interface NoticeBarProps {
  title: string;
  text: string;
  onAction?: () => void;
}

export default function NoticeBar({ title, text, onAction }: NoticeBarProps) {
  return (
    <div className="border-b border-gold-500/30 bg-gold-300/30">
      <div className="container-page flex items-center gap-3 py-2.5 text-sm text-navy-900">
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded bg-navy-900 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-gold-300">
          <Bell className="h-3 w-3" aria-hidden="true" /> Aviso
        </span>
        <p className="min-w-0 flex-1 truncate">
          <strong className="font-semibold">{title}</strong> <span className="text-navy-800">{text}</span>
        </p>
        {onAction && (
          <button type="button" onClick={onAction} className="hidden shrink-0 text-sm font-semibold underline underline-offset-4 sm:inline">
            Ver edital
          </button>
        )}
      </div>
    </div>
  );
}
