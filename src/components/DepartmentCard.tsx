import { ArrowRight } from 'lucide-react';
import { departmentIcon } from '../lib/format';
import type { Department } from '../types';

interface DepartmentCardProps {
  department: Department;
  onOpen: (department: Department) => void;
  compact?: boolean;
}

const stretchedLink =
  "text-left after:absolute after:inset-0 after:content-[''] focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-gold-500";

export default function DepartmentCard({ department, onOpen, compact = false }: DepartmentCardProps) {
  const Icon = departmentIcon(department.id);

  if (compact) {
    return (
      <article className="group relative flex h-full flex-col rounded-lg border border-navy-100 bg-paper p-4 transition-all hover:border-navy-300 hover:bg-white hover:shadow-card sm:p-5">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-navy-700 ring-1 ring-navy-100 transition-colors group-hover:bg-navy-900 group-hover:text-gold-300 group-hover:ring-navy-900">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <h3 className="mt-4 font-serif text-base font-semibold leading-snug text-navy-950 sm:text-lg">
          <button type="button" onClick={() => onOpen(department)} className={stretchedLink}>
            {department.name}
          </button>
        </h3>
      </article>
    );
  }

  return (
    <article className="group relative flex h-full flex-col rounded-lg border border-navy-100 bg-white p-6 shadow-card transition-all hover:-translate-y-0.5 hover:border-navy-300 hover:shadow-lift">
      <div className="flex items-center justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-md bg-navy-50 text-navy-700 transition-colors group-hover:bg-navy-900 group-hover:text-gold-300">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="text-xs font-semibold tracking-[0.14em] text-slate-400">{department.code}</span>
      </div>
      <h3 className="mt-5 font-serif text-xl font-semibold leading-snug text-navy-950">
        <button type="button" onClick={() => onOpen(department)} className={stretchedLink}>
          {department.name}
        </button>
      </h3>
      <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-slate-600">{department.description}</p>
      <span className="mt-auto flex items-center gap-1.5 pt-5 text-sm font-semibold text-navy-700" aria-hidden="true">
        Conhecer o departamento <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </article>
  );
}
