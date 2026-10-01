import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { collegeApi } from '@/lib/api-client';
import { TeacherFeed } from '@/components/teachers/teacher-feed';
import { assertModuleEnabled } from '@/lib/module-guard';

export const metadata: Metadata = {
  title: 'Pedagogik tarkib',
  description:
    'Muassasa oʻqituvchilari va ishlab chiqarish taʼlimi ustalari. Malakasi, ilmiy darajalari, oʻqitadigan fanlari va kontaktlari.',
};

export default async function TeachersPage(): Promise<JSX.Element> {
  await assertModuleEnabled('/teachers');
  const [teachersResponse, departments] = await Promise.all([
    collegeApi.getTeachers({ limit: 50 }),
    collegeApi.getDepartments(),
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
            Oʻqituvchilar
          </span>
        </nav>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Texnikum pedagogik tarkibi
        </h1>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
          Yuqori malakali oʻqituvchilar, kasbiy taʼlim aʼlochilari, xalqaro va milliy kasbiy mahorat chempionatlari bosh ekspertlari.
        </p>
      </div>

      {/* Интерактивный каталог */}
      <TeacherFeed initialTeachers={teachersResponse.items} departments={departments} />
    </div>
  );
}
