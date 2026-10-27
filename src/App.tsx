import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Footer from './components/Footer';
import Header from './components/Header';
import NewsModal from './components/NewsModal';
import NoticeBar from './components/NoticeBar';
import DepartmentsPage from './pages/DepartmentsPage';
import Home from './pages/Home';
import NewsPage from './pages/NewsPage';
import PostGradPage from './pages/PostGradPage';
import SecfenPage from './pages/SecfenPage';
import type { Department, NewsItem, Tab } from './types';

const tabPaths: Record<Tab, string> = {
  home: '/',
  news: '/noticias',
  departments: '/departamentos',
  postgrad: '/pos-graduacao',
  secfen: '/secfen',
};

function tabFromSegment(segment?: string): Tab {
  const entry = (Object.entries(tabPaths) as [Tab, string][]).find(([, path]) => path === `/${segment ?? ''}`);
  return entry ? entry[0] : 'home';
}

// Carrega o índice e cada JSON listado; os arquivos em /public são editáveis sem rebuild.
async function loadCollection<T>(folder: string, label: string): Promise<T[]> {
  const indexRes = await fetch(`/${folder}/index.json`, { cache: 'no-store' });
  if (!indexRes.ok) throw new Error(`Não foi possível carregar o índice de ${label}.`);
  const ids: string[] = await indexRes.json();

  return Promise.all(
    ids.map(async (id) => {
      const res = await fetch(`/${folder}/${id}.json`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Falha ao carregar ${label}: ${id}`);
      return (await res.json()) as T;
    })
  );
}

export default function App() {
  const location = useLocation();
  const routerNavigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  const [departmentsError, setDepartmentsError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const segments = location.pathname.split('/').filter(Boolean);
  const currentTab = tabFromSegment(segments[0]);
  const selectedDepartment =
    currentTab === 'departments' && segments[1] ? departments.find((d) => d.id === segments[1]) ?? null : null;
  const newsId = searchParams.get('noticia');
  const openNews = newsId ? news.find((n) => n.id === newsId) ?? null : null;

  useEffect(() => {
    loadCollection<NewsItem>('news', 'notícias')
      .then((items) => {
        setNews(items.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)));
        setNewsError('');
      })
      .catch((err) => {
        console.error(err);
        setNewsError('Erro ao carregar as notícias. Verifique os arquivos em /public/news/.');
      })
      .finally(() => setNewsLoading(false));

    loadCollection<Department>('departments', 'departamentos')
      .then((items) => {
        setDepartments(items);
        setDepartmentsError('');
      })
      .catch((err) => {
        console.error(err);
        setDepartmentsError('Erro ao carregar os departamentos. Verifique os arquivos em /public/departments/.');
      })
      .finally(() => setDepartmentsLoading(false));
  }, []);

  const filteredNews = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return news.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch =
        query === '' ||
        item.title.toLowerCase().includes(query) ||
        item.summary.toLowerCase().includes(query) ||
        item.content.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [news, selectedCategory, searchQuery]);

  // Rola ao topo só depois de a nova página renderizar; antes disso a altura da página ainda é a da tela anterior.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  const navigate = useCallback(
    (tab: Tab) => {
      const path = tabPaths[tab];
      if (location.pathname !== path) routerNavigate(path);
    },
    [location.pathname, routerNavigate]
  );

  const openDepartment = (department: Department | null) => {
    routerNavigate(department ? `/departamentos/${department.id}` : tabPaths.departments);
  };

  const openCategory = (category: string) => {
    setSelectedCategory(category);
    navigate('news');
  };

  const openNewsItem = (item: NewsItem) => {
    routerNavigate({ search: `?noticia=${encodeURIComponent(item.id)}` });
  };

  // A notícia aberta ocupa uma entrada do histórico; fechar volta uma entrada (ou limpa a URL se a página foi aberta direto no link).
  const closeNews = useCallback(() => {
    if (location.key !== 'default') routerNavigate(-1);
    else routerNavigate({ search: '' }, { replace: true });
  }, [location.key, routerNavigate]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header currentTab={currentTab} onNavigate={navigate} />
      {currentTab === 'home' && (
        <NoticeBar
          title="Opção pelo Novo Curso de Engenharia de Produção:"
          text="edital publicado. Estudantes interessados devem consultar os requisitos."
          onAction={() => openCategory('secfen')}
        />
      )}

      <main id="conteudo" tabIndex={-1} className="flex-1 outline-none">
        {currentTab === 'home' && (
          <Home
            news={news}
            newsLoading={newsLoading}
            newsError={newsError}
            departments={departments}
            departmentsLoading={departmentsLoading}
            departmentsError={departmentsError}
            onNavigate={navigate}
            onOpenNews={openNewsItem}
            onOpenDepartment={openDepartment}
          />
        )}
        {currentTab === 'news' && (
          <NewsPage
            news={filteredNews}
            loading={newsLoading}
            error={newsError}
            selectedCategory={selectedCategory}
            searchQuery={searchQuery}
            onCategoryChange={setSelectedCategory}
            onSearchChange={setSearchQuery}
            onOpenNews={openNewsItem}
          />
        )}
        {currentTab === 'departments' && (
          <DepartmentsPage
            departments={departments}
            loading={departmentsLoading}
            error={departmentsError}
            selected={selectedDepartment}
            news={news}
            onSelect={openDepartment}
            onOpenNews={openNewsItem}
          />
        )}
        {currentTab === 'postgrad' && <PostGradPage />}
        {currentTab === 'secfen' && <SecfenPage news={news} onOpenNews={openNewsItem} />}
      </main>

      <Footer onNavigate={navigate} />
      {openNews && <NewsModal item={openNews} onClose={closeNews} />}
    </div>
  );
}
