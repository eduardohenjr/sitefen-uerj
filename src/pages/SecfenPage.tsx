import { ArrowRight, Award, Calendar, FileText } from 'lucide-react';
import { PageHeader } from '../components/Section';
import { formatDate } from '../lib/format';
import type { NewsItem } from '../types';

interface SecfenPageProps {
  news: NewsItem[];
  onOpenNews: (item: NewsItem) => void;
}

const services = [
  {
    icon: FileText,
    title: 'Requerimentos acadêmicos',
    text: 'Trancamento de disciplina, isenção, histórico assinado e declarações.',
    action: 'Formulários oficiais',
    message: 'Formulário digital de requerimento.',
  },
  {
    icon: Calendar,
    title: 'Calendário e prazos',
    text: 'Datas-limite para mudança de ênfase, inscrição em disciplinas e prova final.',
    action: 'Calendário completo',
    message: 'Calendário Acadêmico 2026/1.',
  },
  {
    icon: Award,
    title: 'Colação de grau',
    text: 'Instruções e cadastro de formandos para a cerimônia oficial de formatura.',
    action: 'Edital de formandos',
    message: 'Informações para concluintes.',
  },
];

export default function SecfenPage({ news, onOpenNews }: SecfenPageProps) {
  const notices = news.filter((n) => n.category === 'secfen');

  return (
    <>
      <PageHeader
        eyebrow="SECFEN"
        title="Secretaria de Graduação"
        description="Atendimento acadêmico centralizado para estudantes de todos os cursos de engenharia da Faculdade."
      />
      <div className="container-page py-12">
        <ul className="grid gap-6 md:grid-cols-3">
          {services.map(({ icon: Icon, title, text, action, message }) => (
            <li key={title} className="flex flex-col rounded-lg border border-navy-100 bg-white p-6 shadow-card">
              <span className="flex h-11 w-11 items-center justify-center rounded-md bg-navy-50 text-navy-700">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="mt-5 text-xl font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
              <button type="button" onClick={() => alert(message)} className="link-arrow mt-auto self-start pt-6">
                {action} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>

        <section className="mt-16" aria-labelledby="secfen-comunicados">
          <h2 id="secfen-comunicados" className="text-3xl font-semibold tracking-tight">Últimos comunicados</h2>
          <ul className="mt-6 divide-y divide-navy-100 rounded-lg border border-navy-100 bg-white">
            {notices.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onOpenNews(item)}
                  className="flex w-full flex-col gap-1 px-6 py-5 text-left transition-colors hover:bg-navy-50 sm:flex-row sm:items-center sm:justify-between sm:gap-8"
                >
                  <span>
                    <span className="block font-serif text-lg font-semibold text-navy-950">{item.title}</span>
                    <span className="mt-1 block text-sm text-slate-600 max-sm:hidden">{item.summary}</span>
                  </span>
                  <time dateTime={item.publishedAt} className="shrink-0 text-sm text-slate-500">{formatDate(item.publishedAt)}</time>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
