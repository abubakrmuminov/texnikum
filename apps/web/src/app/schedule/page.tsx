import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { collegeApi } from '@/lib/api-client';
import { ScheduleViewer } from '@/components/schedule/schedule-viewer';

export const metadata: Metadata = {
  title: 'Elektron dars jadvali — Fargʻona 2-son texnikumi',
  description:
    'Fargʻona 2-son texnikumi kunduzgi taʼlim dars jadvali. Guruhlar, oʻqituvchilar va hafta kunlari boʻyicha saralash.',
};

export default async function SchedulePage(): Promise<JSX.Element> {
  const [schedule, groups, teachers] = await Promise.all([
    collegeApi.getSchedule(),
    collegeApi.getScheduleGroups(),
    collegeApi.getTeachers({ limit: 100 }),
  ]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Хлебные крошки и заголовок */}
      <div className="mb-8">
        <nav aria-label="Xleb kırıntilari" className="mb-3 text-xs text-muted-foreground flex items-center gap-1.5">
          <Link href="/" className="hover:text-primary transition-colors">
            Bosh sahifa
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium" aria-current="page">
            Dars jadvali
          </span>
        </nav>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Elektron dars jadvali
        </h1>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
          Maʼruza, laboratoriya va amaliy mashgʻulotlar jadvali. WCAG 2.1 AA va OʻRQ-641 talablari asosida moslashtirilgan.
        </p>
      </div>

      <ScheduleViewer
        initialSchedule={schedule}
        groups={groups.length > 0 ? groups : ['DASTUR-21', 'TARMOQ-22']}
        teachers={teachers.items}
      />
    </div>
  );
}
