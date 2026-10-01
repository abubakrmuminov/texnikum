import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { collegeApi } from '@/lib/api-client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TtsButton } from '@/components/accessibility/tts-button';
import { BlockRenderer } from '@/components/pages/block-renderer';

interface InfoPageProps {
  params: {
    slug: string;
  };
}

const INFO_SLUGS = [
  'info-common',
  'info-struct',
  'info-documents',
  'info-education',
  'info-leadership',
  'info-environment',
  'info-material',
  'info-grants',
  'info-financial',
  'info-vacant',
  'info-international',
  'info-employment',
  'common',
  'struct',
  'document',
  'accessible-env',
  'objects',
  'paid-edu',
  'financial',
  'vacant',
  'catering',
  'safety',
  'international',
  'employment',
];

export async function generateStaticParams() {
  return INFO_SLUGS.map((slug) => ({ slug }));
}

const TITLES_MAP: Record<string, string> = {
  'info-common': 'Umumiy maʼlumotlar',
  common: 'Umumiy maʼlumotlar',
  'info-struct': 'Tuzilma va boshqaruv organlari',
  struct: 'Tuzilma va boshqaruv organlari',
  'info-documents': 'Rasmiy hujjatlar va litsenziyalar',
  document: 'Rasmiy hujjatlar va litsenziyalar',
  'info-education': 'Taʼlim faoliyati va oʻquv rejalari',
  education: 'Taʼlim faoliyati va oʻquv rejalari',
  'info-leadership': 'Rahbariyat va pedagogik tarkib',
  leadership: 'Rahbariyat va pedagogik tarkib',
  'info-environment': 'Inklyuziv taʼlim va qulay muhit',
  'accessible-env': 'Inklyuziv taʼlim va qulay muhit',
  'info-material': 'Moddiy-texnik taʼminot',
  objects: 'Moddiy-texnik taʼminot',
  'info-grants': 'Davlat grantlari va toʻlov-kontrakt shartlari',
  'paid-edu': 'Davlat grantlari va toʻlov-kontrakt shartlari',
  'info-financial': 'Moliyaviy-xoʻjalik faoliyati',
  financial: 'Moliyaviy-xoʻjalik faoliyati',
  'info-vacant': 'Qabul va koʻchirish uchun boʻsh oʻrinlar',
  vacant: 'Qabul va koʻchirish uchun boʻsh oʻrinlar',
  'info-international': 'Xalqaro hamkorlik',
  international: 'Xalqaro hamkorlik',
  'info-employment': 'Bitiruvchilar bandligi va amaliyot',
  employment: 'Bitiruvchilar bandligi va amaliyot',
  catering: 'Ovqatlanishni tashkil etish',
  safety: 'Mehnat muhofazasi va xavfsizlik',
};

export async function generateMetadata({ params }: InfoPageProps): Promise<Metadata> {
  const title = TITLES_MAP[params.slug] || 'Rasmiy maʼlumotlar';
  return {
    title,
    description: `Oʻzbekiston Respublikasi «Taʼlim toʻgʻrisida»gi Qonuni (OʻRQ-637, 37-modda) boʻyicha «${title}» rasmiy boʻlimi.`,
  };
}

export default async function InfoDetailPage({ params }: InfoPageProps): Promise<JSX.Element> {
  const institution = await collegeApi.getPublicInstitution().catch(() => null);
  const instName = institution?.shortNameUz || institution?.nameUz || 'Taʼlim muassasasi';
  const normalizedSlug = params.slug.startsWith('info-') ? params.slug : `info-${params.slug}`;

  // Ищем страницу в API или среди fallback
  let page = await collegeApi.getPageBySlug(normalizedSlug);
  if (!page || !page.contentHtml) {
    page = await collegeApi.getPageBySlug(params.slug);
  }

  const sectionTitle = TITLES_MAP[params.slug] || page?.title || 'Rasmiy maʼlumotlar';

  // Если специальный контент отсутствует в базе, предоставляем нормативный шаблон
  const fallbackHtml = `
    <div itemprop="copy" class="space-y-4 text-foreground">
      <h2 class="text-xl font-bold">${sectionTitle}</h2>
      <p class="text-muted-foreground leading-relaxed">
        Ushbu maʼlumotlar Oʻzbekiston Respublikasining «Taʼlim toʻgʻrisida»gi Qonuni (OʻRQ-637, 37-moddasi) hamda Oʻzbekiston Respublikasi Prezidentining 2024-yil 16-oktyabrdagi PF-158-son Farmoni talablariga muvofiq joylashtirilgan.
      </p>
      <div class="p-4 rounded-xl border border-border bg-muted/40 space-y-2">
        <h3 class="font-semibold text-sm">Rasmiy tasdiqlangan hujjatlar:</h3>
        <ul class="list-disc pl-5 space-y-1.5 text-xs text-muted-foreground">
          <li>Boʻlim toʻgʻrisidagi nizom (${instName} direktori tomonidan tasdiqlangan)</li>
          <li>Oʻtgan oʻquv va moliyaviy davr boʻyicha hisobot hujjatlari</li>
          <li>Vazirlik va nazorat organlari meʼyoriy aktlari</li>
        </ul>
      </div>
    </div>
  `;

  const contentHtml = page?.contentHtml || fallbackHtml;
  const plainText = `${sectionTitle}. ${contentHtml.replace(/<[^>]*>/g, ' ')}`;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      {/* Хлебные крошки */}
      <nav aria-label="Xleb kırıntilari" className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-primary transition-colors">
          Bosh sahifa
        </Link>
        <span>/</span>
        <Link href="/info" className="hover:text-primary transition-colors">
          Texnikum haqida
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium truncate max-w-md" aria-current="page">
          {sectionTitle}
        </span>
      </nav>

      {/* Панель возврата и доступности */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border">
        <Link href="/info">
          <Button variant="ghost" size="sm" className="text-xs gap-1.5 pl-0 hover:bg-transparent hover:text-primary">
            <ArrowLeft className="size-4" aria-hidden="true" />
            <span>Barcha rasmiy boʻlimlarga qaytish</span>
          </Button>
        </Link>
        <TtsButton textToSpeak={plainText} />
      </div>

      {/* Заголовок страницы с бейджами соответствия */}
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-xs font-semibold border-primary/30 text-primary">
            OʻRQ-637 Qonuni (37-modda)
          </Badge>
          <Badge variant="secondary" className="text-xs">
            Rasmiy maʼlumot
          </Badge>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
          {sectionTitle}
        </h1>
      </header>

      {/* Основной нормативный контент с разметкой Schema.org/EducationalOrganization */}
      <div
        itemScope
        itemType="https://schema.org/EducationalOrganization"
        className="text-foreground text-sm sm:text-base leading-relaxed space-y-4 pt-2"
      >
        {(page?.rows && page.rows.length > 0) || (page?.blocks && page.blocks.length > 0) ? (
          <BlockRenderer rows={page.rows} blocks={page.blocks} lang="uz" />
        ) : (
          <div
            className="prose prose-slate dark:prose-invert max-w-none text-foreground space-y-4"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        )}
      </div>

      {/* Нижняя подтверждающая плашка */}
      <div className="mt-8 p-4 rounded-xl border border-border bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          <span>{instName} direktori tomonidan tasdiqlangan rasmiy maʼlumotlar</span>
        </div>
        <Link href="/info">
          <Button variant="outline" size="sm" className="text-xs">
            Mundarija
          </Button>
        </Link>
      </div>
    </div>
  );
}
