import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  id?: string;
}

export function SectionHeading({ eyebrow, title, description, actionLabel, onAction, id }: SectionHeadingProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 id={id} className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
        {description && <p className="mt-3 leading-relaxed text-slate-600">{description}</p>}
      </div>
      {actionLabel && onAction && (
        <button type="button" onClick={onAction} className="link-arrow shrink-0">
          {actionLabel} <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  children?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, children }: PageHeaderProps) {
  return (
    <section className="bg-navy-900 text-white">
      <div className="container-page py-12 sm:py-20">
        <p className="eyebrow !text-gold-400">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight !text-white sm:text-5xl">{title}</h1>
        {description && <p className="mt-4 max-w-2xl text-base leading-relaxed text-navy-200 sm:mt-5 sm:text-lg">{description}</p>}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}

interface StateMessageProps {
  loading: boolean;
  error: string;
  loadingText: string;
}

export function StateMessage({ loading, error, loadingText }: StateMessageProps) {
  if (loading) {
    return (
      <p role="status" className="py-12 text-center text-sm text-slate-500">
        {loadingText}
      </p>
    );
  }
  if (error) {
    return (
      <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
        {error}
      </p>
    );
  }
  return null;
}
