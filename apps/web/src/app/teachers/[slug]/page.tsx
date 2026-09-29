import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Award,
  BookOpen,
  Calendar,
  Clock,
  GraduationCap,
  Mail,
} from 'lucide-react';
import { collegeApi, FALLBACK_TEACHERS } from '@/lib/api-client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TeacherPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  return FALLBACK_TEACHERS.map((teacher) => ({
    slug: teacher.slug,
  }));
}

export async function generateMetadata({ params }: TeacherPageProps): Promise<Metadata> {
  const teacher = await collegeApi.getTeacherBySlug(params.slug);
  if (!teacher) {
    return { title: 'Oʻqituvchi topilmadi — Fargʻona 2-son texnikumi' };
  }
  return {
    title: `${teacher.fullName} — Fargʻona 2-son texnikumi oʻqituvchisi`,
    description: `${teacher.position}. Fanlar: ${teacher.subjects.join(', ')}.`,
  };
}

export default async function TeacherDetailPage({ params }: TeacherPageProps): Promise<JSX.Element> {
  const teacher = await collegeApi.getTeacherBySlug(params.slug);

  if (!teacher) {
    notFound();
  }

  const departments = await collegeApi.getDepartments();
  const department = departments.find((d) => d.id === teacher.departmentId);

  const getInitials = (name: string) => {
    const parts = name.split(' ').filter(Boolean);
    const p0 = parts[0];
    const p1 = parts[1];
    if (p0 && p1) {
      return `${p0[0] || ''}${p1[0] || ''}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Хлебные крошки */}
      <nav aria-label="Xleb kırıntilari" className="mb-6 text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-primary transition-colors">
          Bosh sahifa
        </Link>
        <span>/</span>
        <Link href="/teachers" className="hover:text-primary transition-colors">
          Oʻqituvchilar
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium truncate max-w-md" aria-current="page">
          {teacher.fullName}
        </span>
      </nav>

      {/* Кнопка назад */}
      <div className="mb-6">
        <Link href="/teachers">
          <Button variant="ghost" size="sm" className="text-xs gap-1.5 pl-0 hover:bg-transparent hover:text-primary">
            <ArrowLeft className="size-4" aria-hidden="true" />
            <span>Barcha oʻqituvchilarga qaytish</span>
          </Button>
        </Link>
      </div>

      <div className="space-y-8">
        {/* Карточка визитки преподавателя */}
        <Card className="overflow-hidden border border-border shadow-sm">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              <div className="size-24 sm:size-28 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-2xl sm:text-3xl tracking-wider shrink-0 border border-primary/20 shadow">
                {getInitials(teacher.fullName)}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  {department && (
                    <Badge variant="secondary" className="text-xs font-medium">
                      {department.name}
                    </Badge>
                  )}
                  {teacher.qualification && (
                    <Badge variant="outline" className="text-xs font-normal border-amber-500/40 text-amber-700 dark:text-amber-300">
                      {teacher.qualification}
                    </Badge>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  {teacher.fullName}
                </h1>

                <p className="text-sm sm:text-base text-muted-foreground font-medium">
                  {teacher.position}
                </p>

                {/* Контакты и кнопка расписания */}
                <div className="pt-3 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs">
                  {teacher.email && (
                    <a
                      href={`mailto:${teacher.email}`}
                      className="text-primary hover:underline flex items-center gap-1.5 font-medium"
                    >
                      <Mail className="size-4" aria-hidden="true" />
                      <span>{teacher.email}</span>
                    </a>
                  )}
                  <Link href={`/schedule`}>
                    <Button size="sm" variant="outline" className="text-xs gap-1.5 h-8">
                      <Calendar className="size-3.5" aria-hidden="true" />
                      <span>Dars jadvali</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Сетка данных: Квалификация, Стаж, Дисциплины */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Блок 1: Образование и квалификация */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="size-4 text-primary" aria-hidden="true" />
                <span>Maʼlumoti va malakasi</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <span className="text-xs text-muted-foreground block mb-0.5">Boshlangʻich maʼlumoti:</span>
                <p className="font-semibold text-foreground">{teacher.education}</p>
              </div>
              {teacher.qualification && (
                <div>
                  <span className="text-xs text-muted-foreground block mb-0.5">Malaka toifasi:</span>
                  <p className="text-foreground">{teacher.qualification}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Блок 2: Трудовой стаж */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="size-4 text-primary" aria-hidden="true" />
                <span>Mehnat staji</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/60">
                <span className="text-muted-foreground">Umumiy mehnat staji:</span>
                <strong className="text-foreground font-bold text-base">{teacher.experienceYears} yil</strong>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/60">
                <span className="text-muted-foreground">Pedagogik staj:</span>
                <strong className="text-foreground font-bold text-base">{teacher.teachingExperienceYears} yil</strong>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Преподаваемые дисциплины */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="size-4 text-primary" aria-hidden="true" />
              <span>Oʻqitadigan fanlari</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {teacher.subjects.map((subject, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-3 rounded-lg border border-border bg-card text-xs sm:text-sm font-medium text-foreground"
                >
                  <span className="size-1.5 rounded-full bg-primary shrink-0" aria-hidden="true" />
                  <span>{subject}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Профессиональная биография */}
        {teacher.bio && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="size-4 text-primary" aria-hidden="true" />
                <span>Kasbiy faoliyati va uslubiy yutuqlari</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {teacher.bio}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
