'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Clock } from 'lucide-react';
import { NewsItem, NewsStatus } from '@college/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface HomeNewsBentoProps {
  initialFeaturedNews: NewsItem | null;
  initialSecondaryNews: NewsItem[];
}

function formatUzbekDate(dateStr?: string | null): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    const months = [
      'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
      'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr',
    ];
    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day}-${month}, ${year}`;
  } catch {
    return dateStr;
  }
}


export function HomeNewsBento({
  initialFeaturedNews,
  initialSecondaryNews,
}: HomeNewsBentoProps): JSX.Element {
  const router = useRouter();
  const [featuredNews, setFeaturedNews] = useState<NewsItem | null>(initialFeaturedNews);
  const [secondaryNews, setSecondaryNews] = useState<NewsItem[]>(initialSecondaryNews);

  useEffect(() => {
    // Check if there are client-side created/updated news items from Admin CMS
    try {
      const raw = localStorage.getItem('college_custom_news');
      if (raw) {
        const parsed: NewsItem[] = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const published = parsed.filter((n) => n.status === NewsStatus.PUBLISHED);
          if (published.length > 0) {
            // Find custom featured news
            const customFeatured = published.find((n) => n.isFeatured) || published[0];
            if (customFeatured) {
              setFeaturedNews(customFeatured);
              const customSecondary = [
                ...published.filter((n) => n.id !== customFeatured.id),
                ...initialSecondaryNews.filter((n) => n.id !== customFeatured.id),
              ].slice(0, 3);
              setSecondaryNews(customSecondary);
            }
          }
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, [initialSecondaryNews]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Главная новость дня (Bento Hero: 7 колонок) — клик по всей карточке открывает статью */}
      {featuredNews ? (
        <article
          itemScope
          itemType="https://schema.org/NewsArticle"
          onClick={() => router.push(`/news/${featuredNews.slug}`)}
          className="lg:col-span-7 relative overflow-hidden rounded-2xl border border-border/80 min-h-[420px] sm:min-h-[460px] flex flex-col justify-between p-6 sm:p-8 group shadow-sm hover:shadow-xl transition-all duration-500 focus-within:ring-2 focus-within:ring-primary cursor-pointer"
        >
          {/* Фоновое фото статьи с плавным увеличением на hover */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={featuredNews.coverImageUrl || '/images/news/default-cover.jpg'}
              alt={featuredNews.title}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            {/* Глубокий, мягкий затемняющий оверлей для максимальной читаемости текста */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/40 group-hover:via-slate-950/65 transition-colors duration-500" />
          </div>

          {/* Содержимое поверх фона */}
          <div className="relative z-10 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="emerald"
                className="font-bold text-xs bg-emerald-500 text-white shadow-xs backdrop-blur-xs"
              >
                Diqqat markazida
              </Badge>
              <span className="text-xs text-white/80 flex items-center gap-1 font-medium drop-shadow-xs">
                <Clock className="size-3 text-emerald-400" />
                <span>{featuredNews.readingTimeMin || 3} daqiqa mutolaa</span>
              </span>
              {featuredNews.publishedAt && (
                <time
                  dateTime={featuredNews.publishedAt}
                  className="text-xs text-white/80 font-medium drop-shadow-xs"
                >
                  {formatUzbekDate(featuredNews.publishedAt)}
                </time>
              )}
            </div>

            <Link
              href={`/news/${featuredNews.slug}`}
              className="block group-hover:text-emerald-300 transition-colors focus:outline-none focus-visible:underline after:absolute after:inset-0 after:z-20"
            >
              <h2
                itemProp="headline"
                className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight text-white drop-shadow-md"
              >
                {featuredNews.title}
              </h2>
            </Link>

            <p
              itemProp="description"
              className="text-white/85 text-sm sm:text-base leading-relaxed line-clamp-3 drop-shadow-xs font-normal max-w-2xl"
            >
              {featuredNews.leadText}
            </p>
          </div>

          {/* Нижняя панель с кнопкой перехода */}
          <div className="relative z-30 pt-6 mt-6 border-t border-white/15 flex items-center justify-between pointer-events-none">
            <span
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 group-hover:bg-primary group-hover:border-primary group-hover:text-primary-foreground backdrop-blur-md border border-white/20 text-xs sm:text-sm font-semibold text-white transition-all shadow-xs"
            >
              <span>Batafsil oʻqish</span>
              <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </span>
            <span className="text-xs text-white/70 font-medium drop-shadow-xs hidden sm:inline">
              Fargʻona 2-son texnikumi
            </span>
          </div>
        </article>
      ) : (
        <div className="lg:col-span-7 p-12 text-center border rounded-2xl text-muted-foreground bg-card">
          Eʼlon qilingan asosiy yangiliklar mavjud emas
        </div>
      )}

      {/* Второстепенные новости (5 колонок) — клик по всей карточке открывает статью */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        {secondaryNews.map((news) => (
          <article
            key={news.id}
            itemScope
            itemType="https://schema.org/NewsArticle"
            onClick={() => router.push(`/news/${news.slug}`)}
            className="relative overflow-hidden rounded-xl border border-border/80 min-h-[145px] flex flex-col justify-between p-4 sm:p-5 group shadow-2xs hover:shadow-md transition-all duration-300 focus-within:ring-2 focus-within:ring-primary cursor-pointer"
          >
            {/* Фоновое фото карточки с зумом на hover */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={news.coverImageUrl || '/images/news/default-cover.jpg'}
                alt={news.title}
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
              {/* Плавный темный градиент для контраста текста */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/80 to-slate-950/45 group-hover:from-slate-950 group-hover:via-slate-950/70 transition-colors duration-300" />
            </div>

            {/* Контент карточки */}
            <div className="relative z-10 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-white/80">
                <Badge
                  variant="outline"
                  className="text-[10px] font-semibold bg-white/15 text-white/90 border-white/20 backdrop-blur-xs"
                >
                  Matbuot xizmati
                </Badge>
                {news.publishedAt && (
                  <time dateTime={news.publishedAt} className="font-mono text-white/75 text-[11px]">
                    {formatUzbekDate(news.publishedAt)}
                  </time>
                )}
              </div>

              <Link
                href={`/news/${news.slug}`}
                className="block focus:outline-none focus-visible:underline after:absolute after:inset-0 after:z-20"
              >
                <h3
                  itemProp="headline"
                  className="font-bold text-sm sm:text-base line-clamp-2 text-white group-hover:text-emerald-300 transition-colors leading-snug drop-shadow-xs"
                >
                  {news.title}
                </h3>
              </Link>

              <p className="text-xs text-white/80 line-clamp-1 drop-shadow-xs">
                {news.leadText}
              </p>
            </div>

            <div className="relative z-30 pt-2 text-right pointer-events-none">
              <span
                className="text-xs font-semibold text-white/90 group-hover:text-white inline-flex items-center gap-1 group-hover:translate-x-1 transition-all"
              >
                <span>Batafsil</span>
                <ArrowRight className="size-3" />
              </span>
            </div>
          </article>
        ))}

        <Link href="/news" className="w-full">
          <Button variant="outline" className="w-full justify-center text-xs font-semibold h-10 shadow-2xs hover:bg-muted/80">
            <span>Barcha yangiliklar lentasiga oʻtish</span>
            <ArrowRight className="size-3.5 ml-1.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
