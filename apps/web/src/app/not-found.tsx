'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  ArrowLeft,
  Building2,
  Clock,
  Compass,
  FileQuestion,
  GraduationCap,
  Home,
  Newspaper,
  PhoneCall,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function NotFound(): JSX.Element {
  const router = useRouter();
  const t = useTranslations('notFound');

  const navLinks = [
    {
      href: '/specialties',
      label: t('navSpecialties'),
      icon: GraduationCap,
      desc: '2026/2027 qabul va grantlar',
    },
    {
      href: '/news',
      label: t('navNews'),
      icon: Newspaper,
      desc: 'Soʻnggi voqealar va eʼlonlar',
    },
    {
      href: '/info',
      label: t('navInfo'),
      icon: Building2,
      desc: 'OʻRQ-637 (37-modda) boʻlimlari',
    },
    {
      href: '/schedule',
      label: t('navSchedule'),
      icon: Clock,
      desc: 'Darslar va qoʻngʻiroqlar jadvali',
    },
    {
      href: '/contacts',
      label: t('navContacts'),
      icon: PhoneCall,
      desc: 'Manzil, telefon va elektron murojaat',
    },
  ];

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-3xl mx-auto text-center space-y-8">
        {/* Иконка и бейдж статуса */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="size-20 sm:size-24 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
              <FileQuestion className="size-10 sm:size-12 stroke-[1.5]" aria-hidden="true" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-primary"></span>
            </span>
          </div>

          <Badge variant="outline" className="px-3 py-1 text-xs font-bold tracking-widest uppercase border-primary/30 text-primary">
            {t('badge')}
          </Badge>
        </div>

        {/* Заголовок и описание */}
        <div className="space-y-3 max-w-xl mx-auto">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
            {t('title')}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {t('description')}
          </p>
        </div>

        {/* Кнопки основных действий */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link href="/">
            <Button size="lg" className="h-11 px-6 font-semibold gap-2 shadow-md">
              <Home className="size-4" aria-hidden="true" />
              <span>{t('homeButton')}</span>
            </Button>
          </Link>

          <Button
            variant="outline"
            size="lg"
            onClick={() => router.back()}
            className="h-11 px-6 font-semibold gap-2"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            <span>{t('backButton')}</span>
          </Button>
        </div>

        {/* Блок полезных разделов */}
        <div className="pt-8 border-t border-border/60 text-left space-y-4">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Compass className="size-4 text-primary" aria-hidden="true" />
            <span>{t('suggestedTitle')}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group p-3.5 rounded-xl border border-border/70 bg-card hover:bg-accent/60 hover:border-primary/40 transition-all flex items-start gap-3 shadow-2xs"
                >
                  <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon className="size-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                      {item.label}
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {item.desc}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
