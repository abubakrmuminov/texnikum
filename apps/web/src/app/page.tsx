import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import { api } from '@/lib/api-client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { HomeNewsBento } from '@/components/home/home-news-bento';

export default async function HomePage(): Promise<JSX.Element> {
  const [featuredNews, newsData, specialtiesData, eventsData] = await Promise.all([
    api.getFeaturedNews(),
    api.getNews({ limit: 4 }),
    api.getSpecialties({ limit: 3 }),
    api.getEvents({ limit: 3 }),
  ]);

  const secondaryNews = newsData.items
    .filter((n) => n.id !== featuredNews?.id)
    .slice(0, 3);

  return (
    <div className="space-y-16 pb-16">
      {/* -------------------------------------------------------------------- */}
      {/* 1. БЛОК HERO: БЕНТО-СЕТКА НОВОСТЕЙ ВЫШЕ ЛИНИИ СГИБА (ABOVE THE FOLD) */}
      {/* -------------------------------------------------------------------- */}
      <section className="container mx-auto px-4 pt-6 sm:pt-8" aria-labelledby="hero-heading">
        <div className="flex flex-col gap-2 mb-6">
          <div className="flex items-center gap-2">
            <span className="inline-block size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Kampusning dolzarb voqealari
            </span>
          </div>
          <h1 id="hero-heading" className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
            Texnikumning asosiy yangiliklari va tadbirlari
          </h1>
        </div>

        {/* Bento Grid: 12 колонок */}
        <HomeNewsBento
          initialFeaturedNews={featuredNews}
          initialSecondaryNews={secondaryNews}
        />
      </section>

      {/* -------------------------------------------------------------------- */}
      {/* 2. БАННЕР АБИТУРИЕНТА (ВОРОНКА ПОСТУПЛЕНИЯ) */}
      {/* -------------------------------------------------------------------- */}
      <section className="container mx-auto px-4" aria-label="Qabul kampaniyasi">
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6 sm:p-8 lg:p-10 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-xs">
              <Sparkles className="size-3.5" />
              <span>Qabul kampaniyasi 2026</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              9 yoki 11-sinfdan soʻng zamonaviy IT-mutaxassisiga aylaning
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              150 ta davlat granti va toʻlov-kontrakt oʻrinlari, zamonaviy laboratoriyalar, soha korxonalari bilan dual taʼlim va davlat namunasidagi diplom.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-foreground pt-1">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-600" />
                Kirish imtihonlarisiz (shahodatnoma balli boʻyicha)
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-600" />
                my.edu.uz portali orqali ariza topshirish
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-600" />
                Muddatli harbiy xizmatni kechiktirish
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 w-full sm:w-auto">
            <Link href="/specialties" className="w-full sm:w-auto">
              <Button size="lg" className="w-full font-bold shadow-md">
                <GraduationCap className="size-5 mr-2" />
                Mutaxassislikni tanlash
              </Button>
            </Link>
            <Link href="/events" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full font-semibold">
                <Calendar className="size-4 mr-2" />
                Ochiq eshiklar kuni
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------- */}
      {/* 3. ВИДЖЕТ СПЕЦИАЛЬНОСТЕЙ ТЕХНИКУМА */}
      {/* -------------------------------------------------------------------- */}
      <section className="container mx-auto px-4" aria-labelledby="specialties-heading">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Taʼlim dasturlari
            </span>
            <h2 id="specialties-heading" className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              Texnikumning ommabop mutaxassisliklari
            </h2>
          </div>
          <Link href="/specialties" className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1">
            <span>Barcha taʼlim yoʻnalishlari</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {specialtiesData.items.map((spec) => (
            <Card key={spec.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge variant="outline" className="font-mono text-xs font-bold">
                    {spec.code}
                  </Badge>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                    {spec.budgetPlaces} davlat granti oʻrni
                  </span>
                </div>
                <CardTitle className="text-lg leading-snug">
                  {spec.name}
                </CardTitle>
                <CardDescription className="text-xs font-medium text-foreground/80 mt-1">
                  Malaka: <strong>{spec.qualification}</strong>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-muted-foreground">
                <p className="line-clamp-3 leading-relaxed">
                  {spec.description}
                </p>
                <div className="border-t border-border pt-3 flex flex-col gap-1 text-[11px]">
                  <span>Oʻqish muddati: <strong>{spec.durationText}</strong></span>
                  <span>Oʻtish bali: <strong>{spec.passingScore || 'Tanlov asosida'}</strong></span>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Link href={`/specialties/${spec.slug}`} className="w-full">
                  <Button variant="secondary" size="sm" className="w-full text-xs font-semibold">
                    <span>Dastur haqida batafsil</span>
                    <ArrowRight className="size-3.5 ml-1" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------------------- */}
      {/* 4. БЛИЖАЙШИЕ МЕРОПРИЯТИЯ И КАЛЕНДАРЬ */}
      {/* -------------------------------------------------------------------- */}
      <section className="container mx-auto px-4" aria-labelledby="events-heading">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Tadbirlar va uchrashuvlar
            </span>
            <h2 id="events-heading" className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              Boʻlajak tadbirlar taqvimi
            </h2>
          </div>
          <Link href="/events" className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1">
            <span>Barcha tadbirlarni koʻrish</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {eventsData.items.map((ev) => {
            const evDate = new Date(ev.eventDate);
            return (
              <article
                key={ev.id}
                itemScope
                itemType="https://schema.org/Event"
                className="flex items-start gap-4 p-5 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors shadow-xs"
              >
                {/* Бейдж с датой */}
                <div className="flex flex-col items-center justify-center size-16 rounded-xl bg-primary text-primary-foreground shrink-0 shadow-sm text-center">
                  <span className="text-xl font-extrabold leading-none">{evDate.getDate()}</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider mt-0.5">
                    {evDate.toLocaleDateString('uz-UZ', { month: 'short' })}
                  </span>
                </div>

                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="indigo" className="text-[10px]">
                      {ev.category === 'open_doors'
                        ? 'Ochiq eshiklar kuni'
                        : ev.category === 'science'
                        ? 'Fan va IT'
                        : ev.category === 'sports'
                        ? 'Sport'
                        : 'Tadbir'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {evDate.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <Link href={`/events/${ev.slug}`}>
                    <h3 itemProp="name" className="font-bold text-base hover:text-primary transition-colors line-clamp-2">
                      {ev.title}
                    </h3>
                  </Link>
                  <p itemProp="location" className="text-xs text-muted-foreground truncate">
                    📍 {ev.location}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* -------------------------------------------------------------------- */}
      {/* 5. ПОЧЕМУ ВЫБИРАЮТ НАШ ТЕХНИКУМ (ФАКТЫ И ЦИФРЫ) */}
      {/* -------------------------------------------------------------------- */}
      <section className="bg-muted/40 border-y border-border py-12" aria-labelledby="stats-heading">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Taʼlim afzalliklari
            </span>
            <h2 id="stats-heading" className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Texnikum raqamlar va faktlarda
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Yuqori texnologiyali tarmoqlarda sifatli kasbiy karyera boshlash uchun qulay sharoit yaratamiz.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-xl bg-card border border-border space-y-1 shadow-xs">
              <Users className="size-6 text-primary mx-auto mb-2" />
              <div className="text-3xl font-black text-foreground">1 450+</div>
              <div className="text-xs text-muted-foreground font-medium">Kunduzgi taʼlim talabalari</div>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border space-y-1 shadow-xs">
              <TrendingUp className="size-6 text-emerald-600 mx-auto mb-2" />
              <div className="text-3xl font-black text-foreground">96%</div>
              <div className="text-xs text-muted-foreground font-medium">Bitiruvchilar bandligi</div>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border space-y-1 shadow-xs">
              <Award className="size-6 text-amber-500 mx-auto mb-2" />
              <div className="text-3xl font-black text-foreground">12</div>
              <div className="text-xs text-muted-foreground font-medium">Zamonaviy laboratoriyalar</div>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border space-y-1 shadow-xs">
              <BookOpen className="size-6 text-indigo-600 mx-auto mb-2" />
              <div className="text-3xl font-black text-foreground">55+</div>
              <div className="text-xs text-muted-foreground font-medium">Yillik taʼlim anʼanalari</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
