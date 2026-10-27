import { ArrowRight } from 'lucide-react';
import logo from '../assets/logo.png';
import { formatDate } from '../lib/format';
import type { NewsItem } from '../types';

interface NewsCardProps {
  item: NewsItem;
  onOpen: (item: NewsItem) => void;
}

function Thumb({ item, className }: { item: NewsItem; className: string }) {
  if (item.featuredImage) {
    return <img src={item.featuredImage} alt="" loading="lazy" className={`${className} object-cover`} />;
  }
  return (
    <div className={`${className} flex items-center justify-center bg-gradient-to-br from-navy-800 to-navy-950`}>
      <img src={logo} alt="" className="h-10 w-10 object-contain opacity-60" />
    </div>
  );
}

export default function NewsCard({ item, onOpen }: NewsCardProps) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-navy-100 bg-white shadow-card transition-shadow hover:shadow-lift">
      <div className="overflow-hidden">
        <Thumb item={item} className="aspect-[2/1] w-full transition-transform duration-500 group-hover:scale-[1.03] sm:aspect-[16/10]" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="flex flex-wrap items-center gap-x-3 text-xs text-slate-500">
          <span className="font-semibold uppercase tracking-wider text-gold-600">{item.categoryLabel}</span>
          <time dateTime={item.publishedAt}>{formatDate(item.publishedAt)}</time>
        </p>
        <h3 className="mt-2.5 line-clamp-3 font-serif text-lg font-semibold leading-snug text-navy-950">
          <button
            type="button"
            onClick={() => onOpen(item)}
            className="text-left after:absolute after:inset-0 after:content-[''] focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-gold-500"
          >
            {item.title}
          </button>
        </h3>
        <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-slate-600 max-sm:hidden">{item.summary}</p>
        <span className="mt-auto flex items-center gap-1.5 pt-5 text-sm font-semibold text-navy-700" aria-hidden="true">
          Ler notícia <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </article>
  );
}
