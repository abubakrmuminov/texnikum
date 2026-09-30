'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, Sliders, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppLocale } from '@/components/i18n/locale-provider';

const STORAGE_KEY = 'texnikum_a11y_hint_dismissed';

export function PublicA11yHint(): JSX.Element | null {
  const [visible, setVisible] = useState(false);
  const { locale } = useAppLocale();
  const isUz = locale === 'uz';

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const dismissed = localStorage.getItem(STORAGE_KEY);
      if (!dismissed) {
        // Показываем через небольшую задержку, чтобы не отвлекать при первой загрузке
        timer = setTimeout(() => {
          setVisible(true);
        }, 1500);
      }
    } catch {
      // Игнорируем ошибки доступа к localStorage (например, в приватном режиме)
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // Игнорируем
    }
  };

  if (!visible) return null;

  return (
    <aside
      aria-live="polite"
      className="fixed bottom-4 left-4 z-40 max-w-sm w-[calc(100vw-2rem)] pointer-events-auto animate-in slide-in-from-bottom-3 duration-300"
    >
      <div className="rounded-xl border border-border bg-card/95 backdrop-blur-md p-3.5 shadow-xl text-card-foreground flex flex-col gap-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Eye className="size-4" aria-hidden="true" />
            </div>
            <span className="text-xs font-bold text-foreground">
              {isUz ? 'Maxsus imkoniyatlar rejimi' : 'Версия для слабовидящих'}
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="size-6 p-0 text-muted-foreground hover:text-foreground"
            aria-label={isUz ? 'Eslatmani yopish' : 'Закрыть подсказку'}
          >
            <X className="size-3.5" />
          </Button>
        </div>

        <p className="text-[11px] text-muted-foreground leading-relaxed">
          {isUz
            ? 'Saytda koʻzi ojizlar uchun kontrast mavzular, shrift oʻlchami va ovozli oʻqish (TTS) mavjud.'
            : 'На сайте доступны контрастные темы, масштабирование шрифта и голосовое озвучивание (TTS).'}
        </p>

        <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/50">
          <Link href="/settings" onClick={handleDismiss}>
            <Button variant="outline" size="sm" className="text-[11px] h-6 px-2 gap-1">
              <Sliders className="size-3" aria-hidden="true" />
              <span>{isUz ? 'Sozlamalar' : 'Настройки'}</span>
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-[11px] h-6 px-2 text-primary font-medium"
          >
            <span>{isUz ? 'Tushunarli' : 'Понятно'}</span>
          </Button>
        </div>
      </div>
    </aside>
  );
}
