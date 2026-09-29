'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  ExternalLink,
  MapPin,
  Users,
} from 'lucide-react';
import { EventItem } from '@college/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface EventFeedProps {
  initialEvents: EventItem[];
}

const CATEGORY_NAMES: Record<string, string> = {
  open_doors: 'Ochiq eshiklar kuni',
  science: 'Fan va konferensiyalar',
  sports: 'Sport va salomatlik',
  culture: 'Madaniyat va maʼnaviyat',
  career: 'Karyera va vakansiyalar',
};

export function EventFeed({ initialEvents }: EventFeedProps): JSX.Element {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredEvents = useMemo(() => {
    return initialEvents.filter((e) => {
      if (!selectedCategory) return true;
      return e.category === selectedCategory;
    });
  }, [initialEvents, selectedCategory]);

  const parseDateParts = (dateString: string) => {
    try {
      const d = new Date(dateString);
      const day = d.getDate();
      const month = d.toLocaleDateString('uz-UZ', { month: 'short' }).toUpperCase();
      const time = d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
      const fullDate = d.toLocaleDateString('uz-UZ', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      return { day, month, time, fullDate };
    } catch {
      return { day: '01', month: 'YAN', time: '10:00', fullDate: dateString };
    }
  };

  return (
    <div className="space-y-8">
      {/* Рубрикатор мероприятий */}
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl border border-border bg-card shadow-sm">
        <button
          type="button"
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-ring ${
            selectedCategory === null
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
          }`}
        >
          Barcha tadbirlar
        </button>
        {Object.entries(CATEGORY_NAMES).map(([key, name]) => (
          <button
            key={key}
            type="button"
            onClick={() => setSelectedCategory(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-ring ${
              selectedCategory === key
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Список событий */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-xl border border-dashed border-border bg-card">
          <Calendar className="size-10 mx-auto text-muted-foreground mb-3 opacity-60" aria-hidden="true" />
          <p className="text-base font-semibold text-foreground">
            Ushbu toifada hozircha rejalashtirilgan tadbirlar mavjud emas
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className="mt-4"
          >
            Barcha tadbirlarni koʻrsatish
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((event) => {
            const { day, month, time } = parseDateParts(event.eventDate);
            const categoryLabel = CATEGORY_NAMES[event.category] || 'Tadbir';

            return (
              <article
                key={event.id}
                itemScope
                itemType="https://schema.org/Event"
                className="group flex flex-col sm:flex-row items-stretch gap-4 p-5 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-all"
              >
                {/* Календарная плашка-бейдж даты */}
                <div className="flex sm:flex-col items-center justify-center p-4 rounded-xl bg-primary/10 text-primary shrink-0 w-full sm:w-28 text-center border border-primary/20">
                  <span className="text-2xl sm:text-3xl font-black leading-none tracking-tight">
                    {day}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider mt-1 text-primary">
                    {month}
                  </span>
                  <span className="text-[11px] font-mono font-medium text-muted-foreground mt-1 hidden sm:block">
                    {time}
                  </span>
                </div>

                {/* Основная информация */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-[11px] font-medium">
                        {categoryLabel}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="size-3 text-muted-foreground" aria-hidden="true" />
                        <span>Boshlanish vaqti: {time}</span>
                      </div>
                    </div>

                    <h3
                      itemProp="name"
                      className="text-lg sm:text-xl font-bold text-foreground leading-snug group-hover:text-primary transition-colors mb-2"
                    >
                      <Link href={`/events/${event.slug}`} className="focus:outline-none focus:underline">
                        {event.title}
                      </Link>
                    </h3>

                    <p
                      itemProp="description"
                      className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-3"
                    >
                      {event.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="size-3.5 text-primary" aria-hidden="true" />
                        <span itemProp="location">{event.location}</span>
                      </div>
                      {event.organizer && (
                        <div className="flex items-center gap-1.5">
                          <Users className="size-3.5 text-muted-foreground" aria-hidden="true" />
                          <span>Tashkilotchi: {event.organizer}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Кнопки действия */}
                  <div className="pt-4 mt-3 border-t border-border flex items-center justify-between gap-3">
                    <Link href={`/events/${event.slug}`}>
                      <Button variant="ghost" size="sm" className="text-xs pl-0 text-primary hover:text-primary">
                        Batafsil dastur →
                      </Button>
                    </Link>

                    {event.registrationUrl ? (
                      <a
                        href={event.registrationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block"
                      >
                        <Button size="sm" className="text-xs font-semibold gap-1.5 shadow-sm">
                          <span>Roʻyxatdan oʻtish</span>
                          <ExternalLink className="size-3" aria-hidden="true" />
                        </Button>
                      </a>
                    ) : (
                      <Link href={`/events/${event.slug}`}>
                        <Button size="sm" variant="outline" className="text-xs">
                          Kirish erkin
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
