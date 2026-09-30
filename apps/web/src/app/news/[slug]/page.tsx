import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, ImageOff } from 'lucide-react';
import { collegeApi, FALLBACK_NEWS } from '@/lib/api-client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TtsButton } from '@/components/accessibility/tts-button';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

  const formatArticleContent = (content: string) => {
    if (!content) return '';
    return content
      // Convert markdown images to responsive styled figures with captions
      .replace(
        /!\[([^\]]*)\]\(([^)]+)\)/g,
        '<figure class="my-6 rounded-2xl overflow-hidden border border-border bg-card shadow-sm"><div class="relative w-full max-h-[550px] overflow-hidden bg-muted/30 flex items-center justify-center"><img src="$2" alt="$1" class="w-full h-auto max-h-[550px] object-cover" /></div><figcaption class="px-4 py-2.5 text-xs text-center text-muted-foreground bg-muted/30 border-t border-border">$1</figcaption></figure>'
      )
      // Convert markdown headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg sm:text-xl font-bold mt-5 mb-2 text-foreground">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl sm:text-2xl font-bold mt-6 mb-3 text-foreground pb-1.5 border-b border-border">$1</h2>')
      // Blockquotes
      .replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-primary pl-4 py-2 my-4 italic text-muted-foreground bg-muted/30 rounded-r">$1</blockquote>')
      // Bold & Italic
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      // Lists
      .replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc text-foreground/90 my-1">$1</li>');
  };

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

        {/* Обложка статьи или уведомление об отсутствии фото */}
        {item.coverImageUrl &&
        item.coverImageUrl.trim() !== '' &&
        item.coverImageUrl !== '/images/news/default-cover.jpg' ? (
          <figure className="w-full rounded-2xl overflow-hidden border border-border shadow-sm bg-muted">
            <div className="aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.coverImageUrl}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
            <figcaption className="px-4 py-2.5 text-xs text-muted-foreground bg-muted/40 border-t border-border flex flex-wrap items-center justify-between gap-2">
              <span>Texnikum axborot xizmati fotomateriali</span>
              <span className="font-medium text-foreground">Fargʻona 2-son texnikumi</span>
            </figcaption>
          </figure>
        ) : (
          <div
            role="note"
            aria-label="Fotomaterial haqida maʼlumot"
            className="w-full rounded-2xl border border-dashed border-border/80 bg-muted/20 p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-4 transition-colors"
          >
            <div className="size-12 rounded-xl bg-background border border-border flex items-center justify-center text-muted-foreground shadow-2xs shrink-0">
              <ImageOff className="size-6 text-muted-foreground/80" aria-hidden="true" />
            </div>
            <div className="space-y-1.5 text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="text-sm sm:text-base font-semibold text-foreground">
                  Ushbu maqola uchun fotosurat biriktirilmagan
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground border border-border">
                  Fotomaterial mavjud emas
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Maqola faqat matnli axborot formatida taqdim etilgan. Texnikum axborot xizmati tomonidan yangi fotomateriallar tayyorlanganda ushbu sahifaga qoʻshiladi.
              </p>
              <p className="text-[11px] text-muted-foreground/75 italic">
                (Для этой статьи фотография не прикреплена. Материал представлен в текстовом формате).
              </p>
            </div>
          </div>
        )}

        {/* Основной текст статьи */}
        <div
          itemProp="articleBody"
          className="prose prose-slate dark:prose-invert max-w-none text-foreground text-base sm:text-lg leading-relaxed space-y-4 pt-4"
          dangerouslySetInnerHTML={{ __html: formatArticleContent(item.contentHtml) }}
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
