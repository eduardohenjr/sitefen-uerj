import { ArrowRight, ChevronDown, FlaskConical, GraduationCap } from 'lucide-react';
import DepartmentCard from '../components/DepartmentCard';
import DepartmentGlobe from '../components/DepartmentGlobe';
import NewsCard from '../components/NewsCard';
import Reveal from '../components/Reveal';
import { SectionHeading, StateMessage } from '../components/Section';
import { formatDate } from '../lib/format';
import type { Department, NewsItem, Tab } from '../types';

interface HomeProps {
  news: NewsItem[];
  newsLoading: boolean;
  newsError: string;
  departments: Department[];
  departmentsLoading: boolean;
  departmentsError: string;
  onNavigate: (tab: Tab) => void;
  onOpenNews: (item: NewsItem) => void;
  onOpenDepartment: (department: Department) => void;
}

export default function Home({
  news,
  newsLoading,
  newsError,
  departments,
  departmentsLoading,
  departmentsError,
  onNavigate,
  onOpenNews,
  onOpenDepartment,
}: HomeProps) {
  const featured = news.find((n) => n.isHero && n.featuredImage);
  const latest = news.filter((n) => n.id !== featured?.id).slice(0, 3);

  const scrollToNews = () => {
    document.getElementById('titulo-noticias')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-950 text-white">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(50rem 32rem at 75% 40%, rgb(29 58 98 / 0.75), transparent 65%), radial-gradient(36rem 22rem at 5% 100%, rgb(201 154 46 / 0.12), transparent 60%)',
          }}
          aria-hidden="true"
        />
        <div className="container-page relative flex min-h-[calc(100svh-7.5rem)] flex-col justify-center pb-20 pt-8 lg:min-h-[calc(100svh-9.5rem)]">
          <div className="grid items-center gap-4 lg:grid-cols-12 lg:gap-10">
            <div className="order-2 text-center lg:order-1 lg:col-span-5 lg:text-left">
              <Reveal delay={150}>
                <p className="eyebrow !text-gold-400">Faculdade de Engenharia · UERJ</p>
              </Reveal>
              <Reveal delay={300}>
                <h1 className="mt-4 text-4xl font-semibold leading-[1.08] tracking-tight !text-white sm:text-5xl lg:text-6xl">
                  Engenharia pública de <span className="text-gold-300">excelência</span>.
                </h1>
              </Reveal>
              <Reveal delay={450}>
                <button type="button" className="btn-gold mt-8" onClick={() => onNavigate('departments')}>
                  Explorar departamentos <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </Reveal>
            </div>

            <div className="order-1 lg:order-2 lg:col-span-7">
              <Reveal>
                <DepartmentGlobe departments={departments} onOpen={onOpenDepartment} />
              </Reveal>
            </div>
          </div>

          <button
            type="button"
            onClick={scrollToNews}
            aria-label="Rolar para as notícias"
            className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 text-navy-300 transition-colors hover:text-white sm:block"
          >
            <ChevronDown className="h-7 w-7 motion-safe:animate-bounce" aria-hidden="true" />
          </button>
        </div>
      </section>

      {/* Notícias */}
      <section className="container-page pt-20 sm:pt-28" aria-labelledby="titulo-noticias">
        <Reveal>
          <SectionHeading
            id="titulo-noticias"
            eyebrow="Comunicação"
            title="Notícias"
            actionLabel="Ver todas"
            onAction={() => onNavigate('news')}
          />
        </Reveal>
        <div className="mt-10 space-y-6">
          <StateMessage loading={newsLoading} error={newsError} loadingText="Carregando notícias..." />
          {featured && (
            <Reveal>
              <article className="group relative overflow-hidden rounded-lg bg-navy-950 shadow-card">
                <img
                  src={featured.featuredImage}
                  alt=""
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-[1.03] sm:aspect-[16/8] lg:aspect-[21/8]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent" aria-hidden="true" />
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-9">
                  <p className="eyebrow !text-gold-400">
                    Em destaque · <time dateTime={featured.publishedAt}>{formatDate(featured.publishedAt)}</time>
                  </p>
                  <h3 className="mt-2 line-clamp-3 max-w-3xl font-serif text-xl font-semibold leading-snug !text-white sm:text-3xl">
                    <button
                      type="button"
                      onClick={() => onOpenNews(featured)}
                      className="text-left after:absolute after:inset-0 after:content-['']"
                    >
                      {featured.title}
                    </button>
                  </h3>
                </div>
              </article>
            </Reveal>
          )}
          {!newsLoading && !newsError && (
            <div className="grid gap-6 md:grid-cols-3">
              {latest.map((item, i) => (
                <Reveal key={item.id} delay={i * 120}>
                  <NewsCard item={item} onOpen={onOpenNews} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Departamentos */}
      <section className="mt-20 border-y border-navy-100 bg-white py-16 sm:mt-28 sm:py-24" aria-labelledby="titulo-departamentos">
        <div className="container-page">
          <Reveal>
            <SectionHeading
              id="titulo-departamentos"
              eyebrow="Graduação"
              title="Departamentos"
              actionLabel="Ver detalhes"
              onAction={() => onNavigate('departments')}
            />
          </Reveal>
          <div className="mt-10">
            <StateMessage loading={departmentsLoading} error={departmentsError} loadingText="Carregando departamentos..." />
            {!departmentsLoading && !departmentsError && (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
                {departments.map((dept, i) => (
                  <Reveal key={dept.id} delay={(i % 3) * 90}>
                    <DepartmentCard department={dept} onOpen={onOpenDepartment} compact />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Públicos */}
      <section className="container-page pt-20 sm:pt-28" aria-label="Estudantes e pesquisadores">
        <div className="grid gap-5 md:grid-cols-2">
          <Reveal>
            <button
              type="button"
              onClick={() => onNavigate('secfen')}
              className="group flex h-full w-full flex-col items-start rounded-lg bg-navy-900 p-7 text-left text-white transition-colors hover:bg-navy-800 sm:p-9"
            >
              <GraduationCap className="h-7 w-7 text-gold-400" aria-hidden="true" />
              <span className="mt-6 font-serif text-2xl font-semibold">Para estudantes</span>
              <span className="mt-2 text-navy-200">Requerimentos, prazos e colação de grau na SECFEN.</span>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-gold-300">
                Acessar a secretaria <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </button>
          </Reveal>
          <Reveal delay={120}>
            <button
              type="button"
              onClick={() => onNavigate('postgrad')}
              className="group flex h-full w-full flex-col items-start rounded-lg bg-navy-950 p-7 text-left text-white transition-colors hover:bg-navy-800 sm:p-9"
            >
              <FlaskConical className="h-7 w-7 text-gold-400" aria-hidden="true" />
              <span className="mt-6 font-serif text-2xl font-semibold">Para pesquisadores</span>
              <span className="mt-2 text-navy-200">Mestrado, doutorado e linhas de pesquisa.</span>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-gold-300">
                Conhecer a pós-graduação <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </button>
          </Reveal>
        </div>
      </section>
    </>
  );
}
