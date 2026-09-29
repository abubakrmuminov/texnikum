'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Calendar, Clock, Search, X } from 'lucide-react';
import { NewsCategory, NewsItem, NewsStatus } from '@college/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface NewsFeedProps {
  initialNews: NewsItem[];
  categories: NewsCategory[];
}

export function NewsFeed({ initialNews, categories }: NewsFeedProps): JSX.Element {
  const [newsList, setNewsList] = useState<NewsItem[]>(initialNews);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('college_custom_news');
      if (raw) {
        const parsed: NewsItem[] = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const published = parsed.filter((n) => n.status === NewsStatus.PUBLISHED);
          const initialIds = new Set(initialNews.map((n) => n.id));
          const newItems = published.filter((n) => !initialIds.has(n.id));
          if (newItems.length > 0) {
            setNewsList([...newItems, ...initialNews]);
          }
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, [initialNews]);

  const filteredNews = useMemo(() => {
    return newsList.filter((item) => {
      const matchesCategory =
        selectedCategory === null || item.categoryId === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.leadText.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [newsList, selectedCategory, searchQuery]);

  const categoryMap = useMemo(() => {
    const map = new Map<number, NewsCategory>();
    for (const cat of categories) {
      map.set(cat.id, cat);
    }
    return map;
  }, [categories]);

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('uz-UZ', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-8">
      {/* Панель фильтров и поиска */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card shadow-sm">
        {/* Рубрики / Категории */}
        <div
          role="tablist"
          aria-label="Yangiliklarni ruknlar boʻyicha saralash"
          className="flex flex-wrap items-center gap-2"
        >
          <button
            type="button"
            role="tab"
            aria-selected={selectedCategory === null}
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-ring ${
              selectedCategory === null
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            }`}
          >
            Barcha ruknlar
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={selectedCategory === cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-ring ${
                selectedCategory === cat.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Поле поиска */}
        <div className="relative w-full md:w-72">
          <label htmlFor="news-search" className="sr-only">
            Yangiliklarni qidirish
          </label>
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="news-search"
            type="search"
            placeholder="Kalit soʻzlar boʻyicha qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-8 h-9 text-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Qidiruvni tozalash"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Индикатор результатов */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Topilgan xabarlar soni: <strong className="text-foreground font-semibold">{filteredNews.length}</strong>
        </span>
        {(selectedCategory !== null || searchQuery !== '') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedCategory(null);
              setSearchQuery('');
            }}
            className="text-xs h-7 text-primary hover:text-primary"
          >
            Filtrlarni tozalash
          </Button>
        )}
      </div>

      {/* Сетка новостей */}
      {filteredNews.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-xl border border-dashed border-border bg-card">
          <p className="text-base font-semibold text-foreground">
            Tanlangan mezonlar boʻyicha eʼlonlar topilmadi
          </p>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Qidiruv soʻrovini oʻzgartirib koʻring yoki boshqa ruknni tanlang.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedCategory(null);
              setSearchQuery('');
            }}
            className="mt-4"
          >
            Barcha yangiliklarni koʻrsatish
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map((item) => {
            const cat = item.categoryId ? categoryMap.get(item.categoryId) : undefined;
            return (
              <article
                key={item.id}
                itemScope
                itemType="https://schema.org/NewsArticle"
                className="group flex flex-col h-full rounded-xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-all focus-within:ring-2 focus-within:ring-ring"
              >
                {/* Обложка */}
                <div className="aspect-[16/9] w-full bg-muted relative overflow-hidden flex items-center justify-center">
                  <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                    TEX
                  </div>
                  {cat && (
                    <span className="absolute top-3 left-3">
                      <Badge variant="secondary" className="shadow-sm font-medium text-[11px]">
                        {cat.name}
                      </Badge>
                    </span>
                  )}
                  {item.isFeatured && (
                    <span className="absolute top-3 right-3">
                      <Badge className="bg-amber-600 hover:bg-amber-600 text-white font-semibold text-[10px]">
                        Asosiy
                      </Badge>
                    </span>
                  )}
                </div>

                {/* Содержимое карточки */}
                <CardContent className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Мета: дата и время чтения */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2.5">
                      <div className="flex items-center gap-1">
                        <Calendar className="size-3.5" aria-hidden="true" />
                        <time dateTime={item.publishedAt || item.createdAt}>
                          {formatDate(item.publishedAt || item.createdAt)}
                        </time>
                      </div>
                      {item.readingTimeMin && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Clock className="size-3.5" aria-hidden="true" />
                            <span>{item.readingTimeMin} daqiqa</span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Заголовок */}
                    <h3
                      itemProp="headline"
                      className="font-bold text-base sm:text-lg leading-snug group-hover:text-primary transition-colors mb-2.5 line-clamp-2"
                    >
                      <Link
                        href={`/news/${item.slug}`}
                        className="focus:outline-none focus:underline"
                      >
                        {item.title}
                      </Link>
                    </h3>

                    {/* Лид */}
                    <p
                      itemProp="description"
                      className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4"
                    >
                      {item.leadText}
                    </p>
                  </div>

                  {/* Ссылка на чтение */}
                  <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Matbuot xizmati</span>
                    <span className="font-semibold text-primary group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      Batafsil →
                    </span>
                  </div>
                </CardContent>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
