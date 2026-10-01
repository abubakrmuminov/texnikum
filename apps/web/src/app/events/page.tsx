import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { collegeApi } from '@/lib/api-client';
import { EventFeed } from '@/components/events/event-feed';
import { assertModuleEnabled } from '@/lib/module-guard';

export const metadata: Metadata = {
  title: 'Tadbirlar va uchrashuvlar taqvimi',
  description:
    'Abituriyentlar uchun ochiq eshiklar kuni, ilmiy-amaliy konferensiyalar, xakatonlar, master-klasslar va sport musobaqalari anonslari.',
};

export default async function EventsPage(): Promise<JSX.Element> {
  await assertModuleEnabled('/events');
  const eventsResponse = await collegeApi.getEvents({ limit: 50 });

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Хлебные крошки и заголовок */}
      <div className="mb-8">
        <nav aria-label="Xleb kırıntilari" className="mb-3 text-xs text-muted-foreground flex items-center gap-1.5">
          <Link href="/" className="hover:text-primary transition-colors">
            Bosh sahifa
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium" aria-current="page">
            Tadbirlar
          </span>
        </nav>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Tadbirlar va uchrashuvlar taqvimi
        </h1>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
          Abituriyentlar uchun ochiq eshiklar kuni, talabalar olimpiadalari, ilmiy-amaliy konferensiyalar va talabalik hayotining yorqin voqealari.
        </p>
      </div>

      <EventFeed initialEvents={eventsResponse.items} />
    </div>
  );
}
