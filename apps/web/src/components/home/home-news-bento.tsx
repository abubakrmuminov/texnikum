'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import { NewsItem, NewsStatus } from '@college/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface HomeNewsBentoProps {
  initialFeaturedNews: NewsItem | null;
  initialSecondaryNews: NewsItem[];
}

export function HomeNewsBento({
  initialFeaturedNews,
  initialSecondaryNews,
}: HomeNewsBentoProps): JSX.Element {
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
      {/* Главная новость дня (Bento Hero: 7 колонок) */}
      {featuredNews ? (
        <article
          itemScope
          itemType="https://schema.org/NewsArticle"
          className="lg:col-span-7 flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all group focus-within:ring-2 focus-within:ring-primary"
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="emerald" className="font-bold">
                Diqqat markazida
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="size-3" />
                <span>{featuredNews.readingTimeMin} daqiqa mutolaa</span>
              </span>
              {featuredNews.publishedAt && (
                <time
                  dateTime={featuredNews.publishedAt}
                  className="text-xs text-muted-foreground"
                >
                  {new Date(featuredNews.publishedAt).toLocaleDateString('uz-UZ', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </time>
              )}
            </div>

            <Link
              href={`/news/${featuredNews.slug}`}
              className="block group-hover:text-primary transition-colors focus:outline-none focus-visible:underline"
            >
              <h2
                itemProp="headline"
                className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight leading-snug"
              >
                {featuredNews.title}
              </h2>
            </Link>

            <p itemProp="description" className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              {featuredNews.leadText}
            </p>
          </div>

          <div className="pt-6 mt-6 border-t border-border/60 flex items-center justify-between">
            <Link
              href={`/news/${featuredNews.slug}`}
              className="text-sm font-semibold text-primary inline-flex items-center gap-1.5 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              <span>Batafsil oʻqish</span>
              <ArrowRight className="size-4" />
            </Link>
            <span className="text-xs text-muted-foreground">Fargʻona 2-son texnikumi</span>
          </div>
        </article>
      ) : (
        <div className="lg:col-span-7 p-12 text-center border rounded-2xl text-muted-foreground">
          Eʼlon qilingan asosiy yangiliklar mavjud emas
        </div>
      )}

      {/* Второстепенные новости (5 колонок) */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        {secondaryNews.map((news) => (
          <article
            key={news.id}
            itemScope
            itemType="https://schema.org/NewsArticle"
            className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition-colors group focus-within:ring-2 focus-within:ring-primary"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <Badge variant="slate" className="text-[10px] font-semibold">
                  Matbuot xizmati
                </Badge>
                {news.publishedAt && (
                  <time dateTime={news.publishedAt}>
                    {new Date(news.publishedAt).toLocaleDateString('uz-UZ', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </time>
                )}
              </div>
              <Link
                href={`/news/${news.slug}`}
                className="block focus:outline-none focus-visible:underline"
              >
                <h3
                  itemProp="headline"
                  className="font-bold text-sm sm:text-base line-clamp-2 group-hover:text-primary transition-colors"
                >
                  {news.title}
                </h3>
              </Link>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {news.leadText}
              </p>
            </div>
            <div className="pt-2 text-right">
              <Link
                href={`/news/${news.slug}`}
                className="text-xs font-semibold text-primary inline-flex items-center gap-1 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
              >
                <span>Batafsil</span>
                <ArrowRight className="size-3" />
              </Link>
            </div>
          </article>
        ))}

        <Link href="/news" className="w-full">
          <Button variant="outline" className="w-full justify-center text-xs font-semibold">
            <span>Barcha yangiliklar lentasiga oʻtish</span>
            <ArrowRight className="size-3.5 ml-1.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
