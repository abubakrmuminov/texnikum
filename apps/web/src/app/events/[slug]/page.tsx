import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Clock,
  ExternalLink,
  MapPin,
} from 'lucide-react';
import { collegeApi, FALLBACK_EVENTS } from '@/lib/api-client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TtsButton } from '@/components/accessibility/tts-button';

interface EventPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  return FALLBACK_EVENTS.map((event) => ({
    slug: event.slug,
  }));
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const event = await collegeApi.getEventBySlug(params.slug);
  if (!event) {
    return { title: 'Tadbir topilmadi — Fargʻona 2-son texnikumi' };
  }
  return {
    title: `${event.title} — Fargʻona 2-son texnikumi`,
    description: event.description,
  };
}

export default async function EventDetailPage({ params }: EventPageProps): Promise<JSX.Element> {
  const event = await collegeApi.getEventBySlug(params.slug);

  if (!event) {
    notFound();
  }

  const parseDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return {
        formattedDate: d.toLocaleDateString('uz-UZ', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        formattedTime: d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
      };
    } catch {
      return { formattedDate: dateString, formattedTime: '10:00' };
    }
  };

  const { formattedDate, formattedTime } = parseDate(event.eventDate);

  const plainText = `${event.title}. ${event.description}. Oʻtkazilish joyi: ${event.location}. Sana: ${formattedDate}, soat ${formattedTime}.`;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Хлебные крошки */}
      <nav aria-label="Xleb kırıntilari" className="mb-6 text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-primary transition-colors">
          Bosh sahifa
        </Link>
        <span>/</span>
        <Link href="/events" className="hover:text-primary transition-colors">
          Tadbirlar
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium truncate max-w-md" aria-current="page">
          {event.title}
        </span>
      </nav>

      {/* Кнопка назад и TTS */}
      <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-border">
        <Link href="/events">
          <Button variant="ghost" size="sm" className="text-xs gap-1.5 pl-0 hover:bg-transparent hover:text-primary">
            <ArrowLeft className="size-4" aria-hidden="true" />
            <span>Barcha tadbirlarga qaytish</span>
          </Button>
        </Link>
        <TtsButton textToSpeak={plainText} />
      </div>

      <article itemScope itemType="https://schema.org/Event" className="space-y-8">
        <header className="space-y-4">
          <Badge variant="secondary" className="text-xs font-semibold">
            {event.category === 'open_doors'
              ? 'Ochiq eshiklar kuni'
              : event.category === 'science'
              ? 'Fan va innovatsiyalar'
              : 'Texnikum tadbiri'}
          </Badge>

          <h1
            itemProp="name"
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground leading-tight"
          >
            {event.title}
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            {event.description}
          </p>
        </header>

        {/* Ключевые сведения о событии (Время, место, организатор) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-xl border border-border bg-card shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="size-3.5 text-primary" aria-hidden="true" />
              <span>Oʻtkazilish sanasi:</span>
            </div>
            <strong className="text-sm font-bold text-foreground block">
              {formattedDate}
            </strong>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="size-3.5 text-primary" aria-hidden="true" />
              <span>Boshlanish vaqti:</span>
            </div>
            <strong className="text-sm font-bold text-foreground block">
              {formattedTime}
            </strong>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="size-3.5 text-primary" aria-hidden="true" />
              <span>Oʻtkazilish joyi:</span>
            </div>
            <strong itemProp="location" className="text-sm font-semibold text-foreground block">
              {event.location}
            </strong>
          </div>
        </div>

        {/* Подробное содержание программы */}
        {event.contentHtml && (
          <div
            itemProp="description"
            className="prose prose-slate dark:prose-invert max-w-none text-foreground text-sm sm:text-base leading-relaxed space-y-4 pt-2"
            dangerouslySetInnerHTML={{ __html: event.contentHtml }}
          />
        )}

        {/* Регистрация на событие */}
        <div className="p-6 sm:p-8 rounded-2xl border border-primary/20 bg-primary/[0.03] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-bold text-foreground">
              Tadbirga tashrif buyurmoqchimisiz?
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Texnikum hududiga kirish yoki ishtirokchi sertifikatini olish uchun oldindan roʻyxatdan oʻting.
            </p>
          </div>

          {event.registrationUrl ? (
            <a
              href={event.registrationUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block"
            >
              <Button size="sm" className="font-semibold text-xs gap-1.5 shadow">
                <span>Onlayn roʻyxatdan oʻtish</span>
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </Button>
            </a>
          ) : (
            <Button size="sm" variant="outline" className="text-xs">
              Kirish erkin
            </Button>
          )}
        </div>
      </article>
    </div>
  );
}
