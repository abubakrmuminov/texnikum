'use client';

import React from 'react';
import { Sparkles, X, ChevronRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAppLocale } from '@/components/i18n/locale-provider';
import { OnboardingSectionItem } from './onboarding-data';

interface SectionPromptCardProps {
  section: OnboardingSectionItem;
  onShow: () => void;
  onSkip: () => void;
  onLater: () => void;
}

export function SectionPromptCard({
  section,
  onShow,
  onSkip,
  onLater,
}: SectionPromptCardProps): JSX.Element {
  const { locale } = useAppLocale();
  const lang: 'uz' | 'ru' = locale === 'ru' ? 'ru' : 'uz';
  const isUz = lang === 'uz';
  const Icon = section.icon;

  return (
    <aside
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-5 right-5 z-40 max-w-sm sm:max-w-md w-[calc(100vw-2.5rem)] pointer-events-auto animate-in slide-in-from-bottom-5 duration-300"
    >
      <Card className="p-4 shadow-xl border-border bg-card/95 backdrop-blur-md text-card-foreground rounded-xl relative overflow-hidden border-2">
        {/* Декоративная тонкая полоса цвета раздела */}
        <div className="absolute top-0 inset-x-0 h-1 bg-primary" />

        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-lg border ${section.accentColor} shrink-0 mt-0.5`}>
            <Icon className="size-5" aria-hidden="true" />
          </div>

          <div className="flex-1 space-y-1 pr-6">
            <div className="flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
              <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                {isUz ? 'Boʻlim boʻyicha qoʻllanma' : 'Гид по разделу'}
              </span>
            </div>

            <h4 className="text-sm font-bold text-foreground leading-snug">
              {isUz
                ? `«${section.title.uz}» qanday ishlashini koʻrib chiqasizmi?`
                : `Посмотреть, как работает «${section.title.ru}»?`}
            </h4>

            <p className="text-xs text-muted-foreground line-clamp-2">
              {section.blurb[lang] || section.blurb.uz}
            </p>
          </div>

          {/* Быстрое сессионное скрытие (Later) в углу */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onLater}
            className="absolute top-3 right-3 size-7 p-0 text-muted-foreground hover:text-foreground rounded-md"
            title={isUz ? 'Keyinroq' : 'Позже'}
            aria-label={isUz ? 'Bildirishnomani yopish' : 'Закрыть подсказку'}
          >
            <X className="size-3.5" />
          </Button>
        </div>

        {/* Действия: Показать / Пропустить (DB) / Позже (Session) */}
        <div className="mt-3.5 pt-3 border-t border-border flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="text-[11px] h-7 px-2 text-muted-foreground hover:text-foreground"
              title={isUz ? 'Bu boʻlim boʻyicha qayta soʻralmasin' : 'Больше не показывать для этого раздела'}
            >
              <span>{isUz ? 'Oʻtkazib yuborish' : 'Пропустить'}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLater}
              className="text-[11px] h-7 px-2 text-muted-foreground hover:text-foreground gap-1 hidden sm:flex"
              title={isUz ? 'Keyingi tashrifda yana koʻrsatish' : 'Напомнить при следующем визите'}
            >
              <Clock className="size-3" aria-hidden="true" />
              <span>{isUz ? 'Keyinroq' : 'Позже'}</span>
            </Button>
          </div>

          <Button
            variant="default"
            size="sm"
            onClick={onShow}
            className="text-xs h-7 px-3 font-semibold gap-1 shadow-xs"
          >
            <span>{isUz ? 'Koʻrsatish' : 'Показать'}</span>
            <ChevronRight className="size-3" aria-hidden="true" />
          </Button>
        </div>
      </Card>
    </aside>
  );
}
