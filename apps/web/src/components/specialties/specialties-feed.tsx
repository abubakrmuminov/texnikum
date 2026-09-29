'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Award,
  Calculator,
  CheckCircle2,
  FileCheck,
} from 'lucide-react';
import { Specialty } from '@college/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface SpecialtiesFeedProps {
  initialSpecialties: Specialty[];
}

export function SpecialtiesFeed({
  initialSpecialties,
}: SpecialtiesFeedProps): JSX.Element {
  const [baseEducationFilter, setBaseEducationFilter] = useState<'all' | '9_classes' | '11_classes'>('all');
  const [calculatorScore, setCalculatorScore] = useState<string>('4.5');

  const filteredSpecialties = useMemo(() => {
    return initialSpecialties.filter((s) => {
      if (baseEducationFilter === 'all') return true;
      return s.baseEducation === baseEducationFilter;
    });
  }, [initialSpecialties, baseEducationFilter]);

  const parsedGpa = parseFloat(calculatorScore) || 0;

  return (
    <div className="space-y-16">
      {/* 1. Блок навигации по специальностям */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Oʻrta maxsus professional taʼlim dasturlari
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Davlat namunasidagi diplom, kunduzgi taʼlim shakli, harbiy xizmatni kechiktirish huquqi
            </p>
          </div>

          {/* Фильтр по базовому образованию */}
          <div
            role="tablist"
            aria-label="Taʼlim negizi boʻyicha saralash"
            className="flex items-center gap-1.5 p-1 rounded-lg bg-muted self-stretch sm:self-auto"
          >
            <button
              type="button"
              role="tab"
              aria-selected={baseEducationFilter === 'all'}
              onClick={() => setBaseEducationFilter('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-ring ${
                baseEducationFilter === 'all'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Barcha dasturlar
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={baseEducationFilter === '9_classes'}
              onClick={() => setBaseEducationFilter('9_classes')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-ring ${
                baseEducationFilter === '9_classes'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              9-sinf negizida
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={baseEducationFilter === '11_classes'}
              onClick={() => setBaseEducationFilter('11_classes')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-ring ${
                baseEducationFilter === '11_classes'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              11-sinf negizida
            </button>
          </div>
        </div>

        {/* Сетка карточек специальностей */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSpecialties.map((spec) => {
            const meetsGpa = parsedGpa > 0 && spec.passingScore !== null && parsedGpa >= spec.passingScore;

            return (
              <Card
                key={spec.id}
                className={`flex flex-col justify-between hover:shadow-lg transition-all border ${
                  meetsGpa ? 'border-primary/50 ring-1 ring-primary/20 bg-primary/[0.01]' : 'border-border'
                }`}
              >
                <CardHeader className="p-6 pb-4">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-primary/10 text-primary font-mono font-bold text-xs">
                      {spec.code}
                    </span>
                    <Badge variant="outline" className="text-[11px] font-normal">
                      {spec.baseEducation === '9_classes' ? '9-sinfdan soʻng' : '11-sinfdan soʻng'}
                    </Badge>
                  </div>

                  <CardTitle className="text-lg font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                    <Link href={`/specialties/${spec.slug}`} className="hover:underline focus:outline-none">
                      {spec.name}
                    </Link>
                  </CardTitle>

                  <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Award className="size-3.5 text-primary" aria-hidden="true" />
                    <span>Malaka: </span>
                    <strong className="text-foreground">{spec.qualification}</strong>
                  </div>
                </CardHeader>

                <CardContent className="p-6 pt-0 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Метрики специальности */}
                    <div className="grid grid-cols-2 gap-2 my-3 p-3 rounded-lg bg-muted/50 text-xs">
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Davlat granti:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                          {spec.budgetPlaces} oʻrin
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Oʻtish bali (2025):</span>
                        <span className="font-bold text-foreground text-sm">
                          {spec.passingScore !== null ? spec.passingScore.toFixed(2) : 'Tanlov asosida'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Oʻqish muddati:</span>
                        <span className="font-medium text-foreground">{spec.durationText}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Toʻlov-kontrakt:</span>
                        <span className="font-medium text-foreground">
                          {spec.commercialPlaces} oʻrin{spec.costPerYear ? ` (${spec.costPerYear.toLocaleString('uz-UZ')} soʻm/yil)` : ''}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-4">
                      {spec.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-border flex items-center justify-between gap-2">
                    <Link href={`/specialties/${spec.slug}`} className="w-full">
                      <Button variant="default" size="sm" className="w-full text-xs font-semibold gap-1.5">
                        <span>Dastur haqida batafsil</span>
                        <ArrowRight className="size-3.5" aria-hidden="true" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 2. Интерактивный калькулятор шансов поступления */}
      <section className="p-6 sm:p-8 rounded-2xl border border-border bg-gradient-to-br from-card via-card to-primary/[0.04] shadow-sm">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
              <Calculator className="size-3.5" aria-hidden="true" />
              <span>Abituriyent yordamchisi</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              Shahodatnoma oʻrtacha bali kalkulyatori
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Shahodatnomangizdagi oʻrtacha ballni kiriting va texnikumning qaysi davlat granti oʻrinlariga oʻtish ehtimolingiz yuqori ekanligini bilib oling.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <div className="w-full">
              <label htmlFor="gpa-input" className="sr-only">
                Shahodatnoma oʻrtacha bali
              </label>
              <Input
                id="gpa-input"
                type="number"
                step="0.01"
                min="3.0"
                max="5.0"
                value={calculatorScore}
                onChange={(e) => setCalculatorScore(e.target.value)}
                className="text-center font-bold text-lg h-12 shadow-sm"
                placeholder="4.50"
              />
            </div>
          </div>

          {/* Результат калькулятора */}
          <div className="p-4 rounded-xl bg-background border border-border text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              Oʻrtacha ball <strong>{parsedGpa.toFixed(2)}</strong> boʻlganda:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {initialSpecialties.map((s) => {
                const isPass = s.passingScore !== null && parsedGpa >= s.passingScore;
                return (
                  <span
                    key={s.id}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                      isPass
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-muted text-muted-foreground line-through opacity-70'
                    }`}
                  >
                    {isPass && <CheckCircle2 className="size-3" aria-hidden="true" />}
                    <span>
                      {s.code} ({s.passingScore !== null ? s.passingScore.toFixed(2) : '—'})
                    </span>
                  </span>
                );
              })}
            </div>
            <p className="text-[11px] text-muted-foreground pt-1">
              * Oʻtish ballari 2025-yilgi qabul komissiyasi buyrugʻi asosida namunaviy koʻrsatilgan.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Воронка поступления: 5 простых шагов */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            2026-yilda texnikumga qanday oʻqishga kirish mumkin
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Abituriyentlar va ota-onalar uchun qabul jarayonining bosqichma-bosqich yoʻl xaritasi
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            {
              step: '01',
              title: 'Yoʻnalish tanlash',
              desc: 'Mutaxassisliklar roʻyxati, oʻquv rejalari va oʻtgan yilgi ballar bilan tanishing.',
            },
            {
              step: '02',
              title: 'Hujjatlar toʻplash',
              desc: 'ID-karta yoki pasport, shahodatnoma, JSHSHIR, fotosuratlar va 086-U maʼlumotnomasi.',
            },
            {
              step: '03',
              title: 'Ariza topshirish',
              desc: 'my.edu.uz portali orqali onlayn yoki texnikum qabul komissiyasiga bevosita ariza bering.',
            },
            {
              step: '04',
              title: 'Reyting roʻyxati',
              desc: 'my.edu.uz portali orqali oʻz oʻrningiz va toʻplangan ballingizni muntazam kuzatib boring.',
            },
            {
              step: '05',
              title: 'Qabul buyrugʻi',
              desc: 'Shahodatnomaning asl nusxasini belgilangan muddatgacha topshiring va buyruq bilan tanishing.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl border border-border bg-card shadow-sm flex flex-col justify-between"
            >
              <div>
                <span className="font-mono text-2xl font-black text-primary/40 block mb-2">
                  {item.step}
                </span>
                <h3 className="font-bold text-sm text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Необходимые документы для поступления */}
      <section className="p-6 sm:p-8 rounded-2xl border border-border bg-muted/30">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
              <FileCheck className="size-3.5" aria-hidden="true" />
              <span>Rasmiy hujjatlar roʻyxati</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              Qabul uchun zarur boʻlgan hujjatlar toʻplami
            </h2>
            <ul className="space-y-2.5 text-xs sm:text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                <span>Shaxsni tasdiqlovchi hujjat (ID-karta yoki pasport) nusxasi;</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                <span>Umumiy oʻrta taʼlim toʻgʻrisida shahodatnoma (9 yoki 11-sinf shahodatnomasi) asl nusxasi;</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                <span>Jismoniy shaxsning shaxsiy identifikatsiya raqami (JSHSHIR / PINFL);</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                <span>3x4 sm oʻlchamli 4 dona rangli fotosurat;</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                <span>086-U shaklidagi tibbiy maʼlumotnoma;</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                <span>Imtiyoz va yutuqlarni tasdiqlovchi hujjatlar (mavjud boʻlgan taqdirda).</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-xl border border-border bg-card space-y-4 text-center">
            <h3 className="text-lg font-bold text-foreground">
              Fargʻona 2-son texnikumi qabul komissiyasi
            </h3>
            <p className="text-xs text-muted-foreground">
              Oʻqishga kirish boʻyicha bepul konsultatsiyalar, hujjatlarni tekshirish va my.edu.uz portali orqali ariza topshirishda amaliy koʻmak.
            </p>
            <div className="p-4 rounded-lg bg-muted text-left text-xs space-y-1.5">
              <div>
                <span className="text-muted-foreground">Manzil: </span>
                <strong className="text-foreground">Bosh bino, 105-xona</strong>
              </div>
              <div>
                <span className="text-muted-foreground">Telefon: </span>
                <strong className="text-foreground">+998 (73) 244-00-00</strong>
              </div>
              <div>
                <span className="text-muted-foreground">Email: </span>
                <strong className="text-foreground">priem@texnikum2.uz</strong>
              </div>
              <div>
                <span className="text-muted-foreground">Ish tartibi: </span>
                <strong className="text-foreground">Dush–Shanba: 08:30 – 17:30</strong>
              </div>
            </div>
            <a
              href="tel:+998732440000"
              className="inline-block w-full"
            >
              <Button className="w-full text-xs font-semibold">
                Qabul komissiyasiga qoʻngʻiroq qilish
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
