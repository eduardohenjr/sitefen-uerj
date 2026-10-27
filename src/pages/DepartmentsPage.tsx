import { ArrowLeft, FlaskConical, GraduationCap, Mail, MapPin, UserRound } from 'lucide-react';
import DepartmentCard from '../components/DepartmentCard';
import Reveal from '../components/Reveal';
import { PageHeader, StateMessage } from '../components/Section';
import { departmentIcon, formatDate } from '../lib/format';
import type { Department, NewsItem } from '../types';

interface DepartmentsPageProps {
  departments: Department[];
  loading: boolean;
  error: string;
  selected: Department | null;
  news: NewsItem[];
  onSelect: (department: Department | null) => void;
  onOpenNews: (item: NewsItem) => void;
}

export default function DepartmentsPage({
  departments,
  loading,
  error,
  selected,
  news,
  onSelect,
  onOpenNews,
}: DepartmentsPageProps) {
  if (!selected) {
    return (
      <>
        <PageHeader
          eyebrow="Graduação"
          title="Departamentos e cursos"
          description="A Faculdade de Engenharia reúne departamentos acadêmicos especializados nas diversas áreas da engenharia."
        />
        <div className="container-page py-12">
          <StateMessage loading={loading} error={error} loadingText="Carregando departamentos..." />
          {!loading && !error && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {departments.map((dept, i) => (
                <Reveal key={dept.id} delay={(i % 3) * 90}>
                  <DepartmentCard department={dept} onOpen={onSelect} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </>
    );
  }

  const Icon = departmentIcon(selected.id);
  const related = news.filter((n) => n.departmentId === selected.id);

  return (
    <>
      <section className="bg-navy-900 text-white">
        <div className="container-page py-12 sm:py-16">
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="inline-flex items-center gap-2 text-sm font-medium text-navy-200 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Todos os departamentos
          </button>
          <div className="mt-8 flex items-start gap-5">
            <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-md bg-white/10 text-gold-300 sm:flex">
              <Icon className="h-7 w-7" aria-hidden="true" />
            </span>
            <div>
              <p className="eyebrow !text-gold-400">{selected.code}</p>
              <h1 className="mt-2 max-w-3xl text-4xl font-semibold tracking-tight !text-white sm:text-5xl">{selected.name}</h1>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-navy-200">{selected.description}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container-page grid gap-12 py-14 lg:grid-cols-12">
        <div className="space-y-12 lg:col-span-7">
          <section aria-labelledby="dep-cursos">
            <h2 id="dep-cursos" className="flex items-center gap-3 text-2xl font-semibold">
              <GraduationCap className="h-6 w-6 text-gold-600" aria-hidden="true" /> Cursos oferecidos
            </h2>
            <ul className="mt-5 divide-y divide-navy-100 rounded-lg border border-navy-100 bg-white">
              {selected.courses.map((course) => (
                <li key={course} className="px-5 py-4 font-medium text-navy-900">{course}</li>
              ))}
            </ul>
          </section>

          {selected.laboratories.length > 0 && (
            <section aria-labelledby="dep-labs">
              <h2 id="dep-labs" className="flex items-center gap-3 text-2xl font-semibold">
                <FlaskConical className="h-6 w-6 text-gold-600" aria-hidden="true" /> Laboratórios de pesquisa
              </h2>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {selected.laboratories.map((lab) => (
                  <li key={lab} className="rounded-lg border border-navy-100 bg-white px-5 py-4 text-sm text-navy-900">{lab}</li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="space-y-8 lg:col-span-5">
          <div className="rounded-lg border border-navy-100 bg-white p-6 shadow-card">
            <h2 className="text-xl font-semibold">Contato</h2>
            <dl className="mt-5 space-y-4 text-sm">
              {selected.coordinator && (
                <div className="flex gap-3">
                  <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" aria-hidden="true" />
                  <div><dt className="text-slate-500">Coordenação / chefia</dt><dd className="font-medium text-navy-950">{selected.coordinator}</dd></div>
                </div>
              )}
              <div className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" aria-hidden="true" />
                <div><dt className="text-slate-500">E-mail institucional</dt><dd className="font-medium text-navy-950 break-all">{selected.contactEmail}</dd></div>
              </div>
              <div className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" aria-hidden="true" />
                <div><dt className="text-slate-500">Localização</dt><dd className="font-medium text-navy-950">Pavilhão João Lyra Filho, Blocos A e B</dd></div>
              </div>
            </dl>
          </div>

          <div className="rounded-lg border border-navy-100 bg-white p-6 shadow-card">
            <h2 className="text-xl font-semibold">Notícias do departamento</h2>
            {related.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">Nenhuma notícia publicada para este departamento.</p>
            ) : (
              <ul className="mt-4 divide-y divide-navy-100">
                {related.map((n) => (
                  <li key={n.id}>
                    <button type="button" onClick={() => onOpenNews(n)} className="w-full py-3 text-left">
                      <span className="block text-xs text-slate-500">{formatDate(n.publishedAt)}</span>
                      <span className="mt-0.5 block text-sm font-medium text-navy-900 hover:text-navy-500">{n.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
