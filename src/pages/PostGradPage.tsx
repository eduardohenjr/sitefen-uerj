import { ArrowRight } from 'lucide-react';
import Reveal from '../components/Reveal';
import { PageHeader } from '../components/Section';
import { postGradData } from '../data/postgrad';

export default function PostGradPage() {
  return (
    <>
      <PageHeader
        eyebrow="Pós-Graduação"
        title="Programas stricto sensu"
        description="Mestrado e doutorado em engenharia, com linhas de pesquisa alinhadas aos desafios da sociedade."
      />
      <div className="container-page py-12">
        <div className="grid gap-6 md:grid-cols-2">
          {postGradData.map((pg, i) => (
            <Reveal key={pg.id} delay={(i % 2) * 100}>
            <article className="flex h-full flex-col rounded-lg border border-navy-100 bg-white p-7 shadow-card">
              <div className="flex items-center justify-between gap-4">
                <span className="rounded bg-navy-900 px-2.5 py-1 text-xs font-semibold tracking-[0.14em] text-gold-300">{pg.code}</span>
                <span className="text-sm font-medium text-navy-600">{pg.degree}</span>
              </div>
              <h2 className="mt-5 text-2xl font-semibold leading-snug">{pg.name}</h2>
              <p className="mt-3 leading-relaxed text-slate-600">{pg.description}</p>

              <h3 className="mt-6 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Linhas de pesquisa</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {pg.researchLines.map((line) => (
                  <li key={line} className="rounded-full bg-navy-50 px-3 py-1 text-xs font-medium text-navy-800">{line}</li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => alert(`Para mais informações sobre o ${pg.code}, entre em contato com a secretaria de pós-graduação.`)}
                className="link-arrow mt-auto self-start pt-7"
              >
                Editais de seleção <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </article>
            </Reveal>
          ))}
        </div>
      </div>
    </>
  );
}
