import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Award,
  Briefcase,
  CheckCircle2,
  GraduationCap,
} from 'lucide-react';
import { collegeApi, FALLBACK_SPECIALTIES } from '@/lib/api-client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SpecialtyPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  return FALLBACK_SPECIALTIES.map((spec) => ({
    slug: spec.slug,
  }));
}

export async function generateMetadata({ params }: SpecialtyPageProps): Promise<Metadata> {
  const spec = await collegeApi.getSpecialtyBySlug(params.slug);
  if (!spec) {
    return { title: 'Mutaxassislik topilmadi — Fargʻona 2-son texnikumi' };
  }
  return {
    title: `${spec.code} «${spec.name}» — Fargʻona 2-son texnikumi`,
    description: spec.description,
  };
}

export default async function SpecialtyDetailPage({ params }: SpecialtyPageProps): Promise<JSX.Element> {
  const spec = await collegeApi.getSpecialtyBySlug(params.slug);

  if (!spec) {
    notFound();
  }

  const departments = await collegeApi.getDepartments();
  const department = departments.find((d) => d.id === spec.departmentId);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Хлебные крошки */}
      <nav aria-label="Xleb kırıntilari" className="mb-6 text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-primary transition-colors">
          Bosh sahifa
        </Link>
        <span>/</span>
        <Link href="/specialties" className="hover:text-primary transition-colors">
          Mutaxassisliklar
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium truncate max-w-md" aria-current="page">
          {spec.code} {spec.name}
        </span>
      </nav>

      {/* Кнопка назад */}
      <div className="mb-6">
        <Link href="/specialties">
          <Button variant="ghost" size="sm" className="text-xs gap-1.5 pl-0 hover:bg-transparent hover:text-primary">
            <ArrowLeft className="size-4" aria-hidden="true" />
            <span>Barcha mutaxassisliklarga qaytish</span>
          </Button>
        </Link>
      </div>

      <div className="space-y-8">
        {/* Заглавный блок программы */}
        <div className="p-6 sm:p-8 rounded-2xl border border-border bg-card shadow-sm space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-md bg-primary text-primary-foreground font-mono font-bold text-xs">
              {spec.code}
            </span>
            <Badge variant="secondary" className="text-xs">
              {spec.baseEducation === '9_classes' ? '9-sinf negizida' : '11-sinf negizida'}
            </Badge>
            {department && (
              <Badge variant="outline" className="text-xs">
                {department.name}
              </Badge>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
            {spec.name}
          </h1>

          <div className="flex items-center gap-2 text-sm sm:text-base text-muted-foreground font-medium">
            <Award className="size-4 text-primary shrink-0" aria-hidden="true" />
            <span>Beriladigan kasbiy malaka: </span>
            <strong className="text-foreground">{spec.qualification}</strong>
          </div>

          {/* Плашка основных показателей */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border">
            <div className="p-3 rounded-xl bg-muted/50">
              <span className="text-xs text-muted-foreground block">Davlat granti:</span>
              <strong className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {spec.budgetPlaces} oʻrin
              </strong>
            </div>
            <div className="p-3 rounded-xl bg-muted/50">
              <span className="text-xs text-muted-foreground block">Oʻtish bali:</span>
              <strong className="text-base sm:text-lg font-bold text-foreground">
                {spec.passingScore !== null ? spec.passingScore.toFixed(2) : 'Tanlov asosida'}
              </strong>
            </div>
            <div className="p-3 rounded-xl bg-muted/50">
              <span className="text-xs text-muted-foreground block">Oʻqish muddati:</span>
              <strong className="text-xs sm:text-sm font-semibold text-foreground">
                {spec.durationText}
              </strong>
            </div>
            <div className="p-3 rounded-xl bg-muted/50">
              <span className="text-xs text-muted-foreground block">Toʻlov-kontrakt:</span>
              <strong className="text-xs sm:text-sm font-semibold text-foreground">
                {spec.costPerYear ? `${spec.costPerYear.toLocaleString('uz-UZ')} soʻm / yil` : 'Davlat granti'}
              </strong>
            </div>
          </div>
        </div>

        {/* Описание специальности и компетенции */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <GraduationCap className="size-5 text-primary" aria-hidden="true" />
              <span>Mutaxassislik va oʻquv jarayoni toʻgʻrisida</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {spec.description}
            </p>
            <div className="p-4 rounded-xl bg-muted/40 border border-border/60 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Bitiruvchining asosiy kasbiy koʻnikmalari:
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-primary shrink-0" aria-hidden="true" />
                  <span>Axborot tizimlari arxitekturasini loyihalash va tahlil qilish</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-primary shrink-0" aria-hidden="true" />
                  <span>Zamonaviy dasturlash muhitlari va freymvorklar bilan ishlash</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-primary shrink-0" aria-hidden="true" />
                  <span>Axborot va kiberxavfsizlik talablariga qatʼiy rioya etish</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-primary shrink-0" aria-hidden="true" />
                  <span>Dasturiy yechimlarni sinovdan oʻtkazish va texnik qoʻllab-quvvatlash</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Кем работают выпускники / Карьера */}
        {spec.careerOpportunities && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Briefcase className="size-5 text-primary" aria-hidden="true" />
                <span>Karyera va kasbiy imkoniyatlar</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {spec.careerOpportunities}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Блок призыва к подаче заявления */}
        <div className="p-6 sm:p-8 rounded-2xl border border-primary/20 bg-primary/[0.03] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-bold text-foreground">
              {spec.code} yoʻnalishida tahsil olishni xohlaysizmi?
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              my.edu.uz portali orqali onlayn ariza yuboring yoki texnikum qabul komissiyasiga murojaat qiling.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a href="tel:+998732440000">
              <Button variant="outline" size="sm" className="text-xs">
                Savol berish
              </Button>
            </a>
            <Link href="/contacts">
              <Button size="sm" className="text-xs font-semibold">
                Qabul komissiyasi
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
