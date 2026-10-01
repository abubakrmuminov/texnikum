'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Eye, Home, AlertTriangle } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { PageItem } from '@college/shared';
import { BlockRenderer } from '@/components/pages/block-renderer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAdminAuth } from '@/components/admin/admin-auth-context';

export default function PagePreview(): JSX.Element {
  const params = useParams();
  const id = params?.id as string;
  const { token } = useAdminAuth();

  const [page, setPage] = useState<PageItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<'uz' | 'ru'>('uz');
  const isUz = lang === 'uz';

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    apiClient
      .getPageById(id, token || undefined)
      .then((data) => {
        if (!isMounted) return;
        setPage(data);
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-2">
          <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted-foreground">Sahifa yuklanmoqda / Загрузка страницы...</p>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
        <div className="text-center space-y-4 max-w-md">
          <AlertTriangle className="size-10 text-amber-500 mx-auto" />
          <h1 className="text-lg font-bold">Sahifa topilmadi / Страница не найдена</h1>
          <p className="text-xs text-muted-foreground">
            Bunday ID li sahifa mavjud emas yoki oʻchirilgan.
          </p>
          <Link href="/admin/pages">
            <Button size="sm" variant="outline" className="text-xs">
              Sahifalar roʻyxatiga qaytish
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const title = isUz
    ? page.titleUz || page.title || page.titleRu
    : page.titleRu || page.title || page.titleUz;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Верхний баннер предпросмотра (Preview Mode Bar) */}
      <div className="sticky top-0 z-50 bg-amber-500/90 text-amber-950 backdrop-blur-md px-4 py-2.5 border-b border-amber-600/30 flex items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Eye className="size-4 shrink-0" />
          <span className="text-xs font-bold uppercase tracking-wider">
            {isUz
              ? 'Oldindan koʻrish rejimi (Qoralama)'
              : 'Режим предпросмотра (Черновик)'}
          </span>
          <Badge variant="outline" className="text-[10px] bg-amber-600/20 text-amber-950 border-amber-600/40">
            /{page.slug}
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          {/* Переключатель языка предпросмотра */}
          <div className="flex items-center bg-amber-600/20 rounded-lg p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setLang('uz')}
              className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                isUz ? 'bg-white text-amber-950 shadow-xs' : 'text-amber-950/70 hover:text-amber-950'
              }`}
            >
              UZ
            </button>
            <button
              type="button"
              onClick={() => setLang('ru')}
              className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                !isUz ? 'bg-white text-amber-950 shadow-xs' : 'text-amber-950/70 hover:text-amber-950'
              }`}
            >
              RU
            </button>
          </div>

          <Link href={`/admin/pages/${page.id}`}>
            <Button size="sm" variant="secondary" className="text-xs bg-white text-amber-950 hover:bg-white/90 font-bold">
              <ArrowLeft className="size-3.5 mr-1" />
              <span>{isUz ? 'Tahrirga qaytish' : 'Вернуться к редактору'}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Контент страницы как на публичном сайте */}
      <main className="container mx-auto px-4 max-w-5xl py-8 flex-1">
        <header className="border-b border-border pb-6 mb-8">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 font-mono">
            <Home className="size-3.5" />
            <span>/</span>
            <span>{page.section === 'info' ? 'info' : 'sahifa'}</span>
            <span>/</span>
            <span className="text-foreground font-semibold">{page.slug}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            {title}
          </h1>

          {page.metaDescription && (
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {page.metaDescription}
            </p>
          )}
        </header>

        <article>
          {(page.rows && page.rows.length > 0) || (page.blocks && page.blocks.length > 0) ? (
            <BlockRenderer rows={page.rows} blocks={page.blocks} lang={lang} />
          ) : page.contentHtml ? (
            <div
              className="prose prose-slate dark:prose-invert max-w-none text-foreground leading-relaxed"
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
      </main>
    </div>
  );
}
