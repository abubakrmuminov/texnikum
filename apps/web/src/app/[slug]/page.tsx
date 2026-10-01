import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ChevronRight, Home } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { TtsButton } from '@/components/accessibility/tts-button';
import { BlockRenderer } from '@/components/pages/block-renderer';

const RESERVED_SLUGS = new Set([
  'admin',
  'api',
  'setup',
  'login',
  'logout',
  '_next',
  'public',
  'media',
  'static',
  'sitemap',
  'robots',
  'news',
  'events',
  'teachers',
  'specialties',
  'administration',
  'contacts',
  'info',
  'settings',
  'schedule',
  'about',
  'sveden',
]);

interface CustomPageProps {
  params: {
    slug: string;
  };
  searchParams?: {
    lang?: string;
  };
}

export async function generateMetadata({
  params,
  searchParams,
}: CustomPageProps): Promise<Metadata> {
  if (RESERVED_SLUGS.has(params.slug)) {
    return {};
  }

  const page = await apiClient.getPageBySlug(params.slug).catch(() => null);
  if (!page || !page.isPublished) {
    return {
      title: 'Sahifa topilmadi',
      description: 'Soʻralgan sahifa mavjud emas',
    };
  }

  const isRu = searchParams?.lang === 'ru';
  const title = isRu
    ? page.titleRu || page.title || page.titleUz
    : page.titleUz || page.title || page.titleRu;

  const description = page.metaDescription || undefined;
  const canonicalUrl = `/${page.slug}`;

  return {
    title: page.metaTitle || title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        uz: `/${page.slug}?lang=uz`,
        ru: `/${page.slug}?lang=ru`,
      },
    },
    openGraph: {
      title: page.metaTitle || title,
      description,
      url: canonicalUrl,
      images: page.ogImageUrl ? [{ url: page.ogImageUrl }] : undefined,
    },
  };
}

export default async function CustomPageView({
  params,
  searchParams,
}: CustomPageProps): Promise<JSX.Element> {
  if (RESERVED_SLUGS.has(params.slug)) {
    notFound();
  }

  const page = await apiClient.getPageBySlug(params.slug).catch(() => null);

  if (!page || !page.isPublished) {
    notFound();
  }

  const lang = searchParams?.lang === 'ru' ? 'ru' : 'uz';
  const isUz = lang === 'uz';

  const title = isUz
    ? page.titleUz || page.title || page.titleRu
    : page.titleRu || page.title || page.titleUz;

  return (
    <main id="main-content" className="min-h-screen bg-background text-foreground py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Хлебные крошки (Breadcrumbs) */}
        <nav aria-label="Xleb kırıntilari" className="mb-6">
          <ol className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            <li>
              <Link
                href="/"
                className="hover:text-foreground transition-colors flex items-center gap-1"
              >
                <Home className="size-3.5" />
                <span>{isUz ? 'Bosh sahifa' : 'Главная'}</span>
              </Link>
            </li>
            <li>
              <ChevronRight className="size-3 text-muted-foreground/60" />
            </li>
            <li aria-current="page" className="font-semibold text-foreground truncate max-w-xs">
              {title}
            </li>
          </ol>
        </nav>

        {/* Заголовок страницы и кнопка озвучки TTS */}
        <header className="border-b border-border pb-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              {title}
            </h1>
            {page.metaDescription && (
              <p className="text-sm sm:text-base text-muted-foreground max-w-3xl leading-relaxed">
                {page.metaDescription}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
            <TtsButton
              textToSpeak={`${title}. ${page.metaDescription || ''}`}
            />
          </div>
        </header>

        {/* Контент страницы */}
        <article id="page-main-content">
          {(page.rows && page.rows.length > 0) || (page.blocks && page.blocks.length > 0) ? (
            <BlockRenderer rows={page.rows} blocks={page.blocks} lang={lang} />
          ) : page.contentHtml ? (
            <div
              className="prose prose-slate dark:prose-invert max-w-none leading-relaxed text-foreground"
              dangerouslySetInnerHTML={{ __html: page.contentHtml }}
            />
          ) : (
            <div className="py-12 text-center text-muted-foreground text-sm">
              {isUz
                ? 'Sahifada hozircha kontent mavjud emas.'
                : 'На странице пока нет контента.'}
            </div>
          )}
        </article>

        {/* Кнопка возврата назад */}
        <div className="mt-12 pt-6 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-primary hover:underline font-medium"
          >
            <ArrowLeft className="size-4" />
            <span>{isUz ? 'Bosh sahifaga qaytish' : 'Вернуться на главную'}</span>
          </Link>
          {page.updatedAt && (
            <span>
              {isUz ? 'Yangilangan' : 'Обновлено'}:{' '}
              {new Date(page.updatedAt).toLocaleDateString(isUz ? 'uz-UZ' : 'ru-RU')}
            </span>
          )}
        </div>
      </div>
    </main>
  );
}
