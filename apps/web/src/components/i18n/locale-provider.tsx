'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import uzMessages from '@/messages/uz.json';
import ruMessages from '@/messages/ru.json';
import { initArchitectWatchdog, verifyAuthorIntegrity, TamperReason } from '@/lib/integrity-guard';
import { LockdownScreen } from '@/components/easter-eggs/lockdown-screen';

export type Locale = 'uz' | 'ru';

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextType>({
  locale: 'uz',
  setLocale: () => {},
});

const MESSAGES_MAP: Record<Locale, Record<string, unknown>> = {
  uz: uzMessages,
  ru: ruMessages,
};

const STORAGE_KEY = 'college_locale';

export function LocaleProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [locale, setLocaleState] = useState<Locale>('uz');
  const [isTampered, setIsTampered] = useState<boolean>(false);
  const [tamperReason, setTamperReason] = useState<TamperReason | undefined>();

  useEffect(() => {
    // 1. Управление локалью
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (saved === 'ru' || saved === 'uz') {
        setLocaleState(saved);
        document.documentElement.lang = saved === 'uz' ? 'uz-UZ' : 'ru-RU';
      } else {
        document.documentElement.lang = 'uz-UZ';
      }
    } catch {
      // ignore
    }

    // 2. Архитектурная растяжка (Dead Man's Switch)
    const cleanupWatchdog = initArchitectWatchdog();

    const handleTamperEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ reason?: TamperReason }>;
      setTamperReason(customEvent.detail?.reason || 'NAME_TAMPERED');
      setIsTampered(true);
    };

    window.addEventListener('architect-integrity-tamper', handleTamperEvent);

    // Первичная строгая проверка после загрузки
    const checkTimer = setTimeout(() => {
      const check = verifyAuthorIntegrity();
      if (!check.valid) {
        setTamperReason(check.reason);
        setIsTampered(true);
      }
    }, 800);

    return () => {
      cleanupWatchdog();
      window.removeEventListener('architect-integrity-tamper', handleTamperEvent);
      clearTimeout(checkTimer);
    };
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
      document.documentElement.lang = newLocale === 'uz' ? 'uz-UZ' : 'ru-RU';
    } catch {
      // ignore
    }
  };

  if (isTampered) {
    return <LockdownScreen reason={tamperReason} />;
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <NextIntlClientProvider
        locale={locale}
        messages={MESSAGES_MAP[locale]}
        timeZone="Asia/Tashkent"
      >
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}

export function useAppLocale(): LocaleContextType {
  return useContext(LocaleContext);
}
