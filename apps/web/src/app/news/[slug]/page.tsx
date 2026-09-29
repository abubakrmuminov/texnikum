import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { collegeApi, FALLBACK_NEWS } from '@/lib/api-client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TtsButton } from '@/components/accessibility/tts-button';

interface NewsPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  return FALLBACK_NEWS.map((item) => ({
    slug: item.slug,
  }));
}

export async function generateMetadata({ params }: NewsPageProps): Promise<Metadata> {
  const item = await collegeApi.getNewsBySlug(params.slug);
  if (!item) {
    return { title: 'Yangilik topilmadi — Fargʻona 2-son texnikumi' };
  }
  return {
    title: `${item.title} — Fargʻona 2-son texnikumi`,
    description: item.leadText,
  };
}

export default async function NewsDetailPage({ params }: NewsPageProps): Promise<JSX.Element> {
  const item = await collegeApi.getNewsBySlug(params.slug);

  if (!item) {
    notFound();
  }

  const categories = await collegeApi.getCategories();
  const category = categories.find((c) => c.id === item.categoryId);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
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

  // Очистка HTML для качественного синтеза речи (WCAG 2.1 AA)
  const plainTextForSpeech = `${item.title}. ${item.leadText}. ${item.contentHtml.replace(/<[^>]*>/g, ' ')}`;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Навигационные хлебные крошки */}
      <nav aria-label="Xleb kırıntilari" className="mb-6 text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-primary transition-colors">
          Bosh sahifa
        </Link>
        <span>/</span>
        <Link href="/news" className="hover:text-primary transition-colors">
          Yangiliklar
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium truncate max-w-md" aria-current="page">
          {item.title}
        </span>
      </nav>

      <article itemScope itemType="https://schema.org/NewsArticle" className="space-y-6">
        {/* Кнопка возврата и панель инструментов статьи */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border">
          <Link href="/news">
            <Button variant="ghost" size="sm" className="text-xs gap-1.5 pl-0 hover:bg-transparent hover:text-primary">
              <ArrowLeft className="size-4" aria-hidden="true" />
              <span>Barcha yangiliklarga qaytish</span>
            </Button>
          </Link>

          {/* Инструменты доступности: чтение статьи вслух */}
          <div className="flex items-center gap-2">
            <TtsButton textToSpeak={plainTextForSpeech} />
          </div>
        </div>

        {/* Заголовок и метаданные статьи */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            {category && (
              <Badge variant="secondary" className="font-medium text-xs">
                {category.name}
              </Badge>
            )}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="size-3.5" aria-hidden="true" />
              <time itemProp="datePublished" dateTime={item.publishedAt || item.createdAt}>
                {formatDate(item.publishedAt || item.createdAt)}
              </time>
            </div>
            {item.readingTimeMin && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>•</span>
                <Clock className="size-3.5" aria-hidden="true" />
                <span>{item.readingTimeMin} daqiqa mutolaa</span>
              </div>
            )}
          </div>

          <h1
            itemProp="headline"
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground leading-tight"
          >
            {item.title}
          </h1>

          {/* Лид статьи */}
          <div
            itemProp="description"
            className="p-4 sm:p-5 rounded-xl bg-muted/60 border-l-4 border-primary text-base sm:text-lg font-medium text-foreground leading-relaxed"
          >
            {item.leadText}
          </div>
        </header>

        {/* Обложка статьи */}
        <figure className="aspect-[16/9] w-full rounded-2xl bg-muted overflow-hidden flex items-center justify-center border border-border shadow-sm">
          <div className="text-center p-6">
            <span className="inline-block px-3 py-1 rounded bg-primary/10 text-primary font-bold text-xs uppercase tracking-wider mb-2">
              Fargʻona 2-son texnikumi
            </span>
            <p className="text-xs text-muted-foreground max-w-md">
              Texnikum axborot xizmati • Rasmiy fotomaterial
            </p>
          </div>
        </figure>

        {/* Основной текст статьи */}
        <div
          itemProp="articleBody"
          className="prose prose-slate dark:prose-invert max-w-none text-foreground text-base sm:text-lg leading-relaxed space-y-4 pt-4"
          dangerouslySetInnerHTML={{ __html: item.contentHtml }}
        />

        {/* Подвал статьи */}
        <footer className="pt-8 mt-10 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-muted-foreground">
          <div itemProp="author" itemScope itemType="https://schema.org/Organization">
            <span>Manba: </span>
            <strong itemProp="name" className="text-foreground">
              Fargʻona 2-son texnikumi matbuot xizmati
            </strong>
          </div>
          <Link href="/news">
            <Button variant="outline" size="sm" className="text-xs">
              Barcha yangiliklar
            </Button>
          </Link>
        </footer>
      </article>
    </div>
  );
}
