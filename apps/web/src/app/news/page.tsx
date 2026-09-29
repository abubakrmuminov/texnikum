import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { collegeApi } from '@/lib/api-client';
import { NewsFeed } from '@/components/news/news-feed';

export const metadata: Metadata = {
  title: 'Yangiliklar va voqealar — Fargʻona 2-son texnikumi',
  description:
    'Texnikum hayotiga oid soʻnggi yangiliklar, talabalar va oʻqituvchilar yutuqlari, rasmiy buyruqlar va muhim eʼlonlar.',
};

export default async function NewsPage(): Promise<JSX.Element> {
  const [newsResponse, categories] = await Promise.all([
    collegeApi.getNews({ limit: 30 }),
    collegeApi.getCategories(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Заголовок раздела */}
      <div className="mb-8">
        <nav aria-label="Xleb kırıntilari" className="mb-3 text-xs text-muted-foreground flex items-center gap-1.5">
          <Link href="/" className="hover:text-primary transition-colors">
            Bosh sahifa
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium" aria-current="page">
            Yangiliklar
          </span>
        </nav>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Texnikum yangiliklari va hayoti
        </h1>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
          Rasmiy xabarlar, kasbiy mahorat chempionatlari hisobotlari, talabalar tadbirlari va abituriyentlar uchun muhim maʼlumotlar.
        </p>
      </div>

      {/* Интерактивная лента */}
      <NewsFeed initialNews={newsResponse.items} categories={categories} />
    </div>
  );
}
