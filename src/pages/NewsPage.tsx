import { Search } from 'lucide-react';
import NewsCard from '../components/NewsCard';
import Reveal from '../components/Reveal';
import { PageHeader, StateMessage } from '../components/Section';
import type { NewsItem } from '../types';

interface NewsPageProps {
  news: NewsItem[];
  loading: boolean;
  error: string;
  selectedCategory: string;
  searchQuery: string;
  onCategoryChange: (category: string) => void;
  onSearchChange: (query: string) => void;
  onOpenNews: (item: NewsItem) => void;
}

const filters = [
  { id: 'all', label: 'Todas' },
  { id: 'secfen', label: 'SECFEN / Administrativo' },
  { id: 'conc', label: 'Concursos' },
  { id: 'curso', label: 'Cursos e graduação' },
  { id: 'evento', label: 'Eventos e seminários' },
  { id: 'estag', label: 'Estágios e bolsas' },
];

export default function NewsPage({
  news,
  loading,
  error,
  selectedCategory,
  searchQuery,
  onCategoryChange,
  onSearchChange,
  onOpenNews,
}: NewsPageProps) {
  return (
    <>
      <PageHeader
        eyebrow="Comunicação"
        title="Notícias e comunicados"
        description="Publicações oficiais, editais e registros da Faculdade de Engenharia."
      >
        <div className="relative max-w-md">
          <label htmlFor="busca-noticias" className="sr-only">Buscar notícias</label>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            id="busca-noticias"
            type="search"
            placeholder="Buscar no acervo"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-md border-0 bg-white py-3 pl-11 pr-4 text-sm text-navy-950 placeholder:text-slate-400"
          />
        </div>
      </PageHeader>

      <div className="container-page py-12">
        <div role="group" aria-label="Filtrar por categoria" className="flex flex-wrap gap-2">
          {filters.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                aria-pressed={active}
                onClick={() => onCategoryChange(cat.id)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? 'border-navy-900 bg-navy-900 text-white'
                    : 'border-navy-200 bg-white text-navy-800 hover:border-navy-400'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        <div className="mt-10">
          <StateMessage loading={loading} error={error} loadingText="Carregando notícias..." />
          {!loading && !error && (
            <>
              <p className="mb-6 text-sm text-slate-500" aria-live="polite">
                {news.length} {news.length === 1 ? 'resultado' : 'resultados'}
              </p>
              {news.length === 0 ? (
                <div className="rounded-lg border border-dashed border-navy-200 bg-white py-16 text-center text-slate-500">
                  Nenhuma notícia encontrada para os critérios selecionados.
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {news.map((item, i) => (
                    <Reveal key={item.id} delay={(i % 3) * 90}>
                      <NewsCard item={item} onOpen={onOpenNews} />
                    </Reveal>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
