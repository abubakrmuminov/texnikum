import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { collegeApi } from '@/lib/api-client';
import { SpecialtiesFeed } from '@/components/specialties/specialties-feed';

export const metadata: Metadata = {
  title: 'Специальности и поступление 2026 — ГБПОУ ПКИТУ',
  description:
    'Программы подготовки специалистов среднего звена СПО. Контрольные цифры приема, проходные баллы, бюджетные места, правила подачи документов.',
};

export default async function SpecialtiesPage(): Promise<JSX.Element> {
  const specialtiesResponse = await collegeApi.getSpecialties({ limit: 50 });

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Хлебные крошки и заголовок */}
      <div className="mb-8">
        <nav aria-label="Хлебные крошки" className="mb-3 text-xs text-muted-foreground flex items-center gap-1.5">
          <Link href="/" className="hover:text-primary transition-colors">
            Главная
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium" aria-current="page">
            Специальности и абитуриенту
          </span>
        </nav>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Специальности колледжа и условия приема
        </h1>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-3xl leading-relaxed">
          Обучение по передовым образовательным стандартам ФГОС СПО. Бюджетные места, отсрочка от армии, современная учебно-производственная база и гарантированное содействие в трудоустройстве.
        </p>
      </div>

      <SpecialtiesFeed initialSpecialties={specialtiesResponse.items} />
    </div>
  );
}
