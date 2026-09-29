'use client';

import React from 'react';
import { Globe } from 'lucide-react';
import { useAppLocale } from '@/components/i18n/locale-provider';
import { Button } from '@/components/ui/button';

export function LanguageSwitcher(): JSX.Element {
  const { locale, setLocale } = useAppLocale();

  const toggleLocale = () => {
    setLocale(locale === 'uz' ? 'ru' : 'uz');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLocale}
      className="h-8 px-2.5 text-xs font-semibold flex items-center gap-1.5 rounded-lg border border-border/60 hover:bg-accent/80 transition-all focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={`Tilni o'zgartirish / Сменить язык (Hozirgi til: ${locale.toUpperCase()})`}
      title="Tilni o'zgartirish / Сменить язык (O'zbekcha / Русский)"
    >
      <Globe className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
      <span className={locale === 'uz' ? 'font-bold text-primary' : 'text-muted-foreground'}>
        Oʻzb
      </span>
      <span className="text-muted-foreground/40">|</span>
      <span className={locale === 'ru' ? 'font-bold text-primary' : 'text-muted-foreground'}>
        Рус
      </span>
    </Button>
  );
}
