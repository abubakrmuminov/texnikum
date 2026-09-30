'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AdminSectionKey,
  UserRole,
} from '@college/shared';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Compass,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppLocale } from '@/components/i18n/locale-provider';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import {
  getSectionsForRole,
  OnboardingSectionItem,
} from './onboarding-data';

interface WelcomeTourModalProps {
  isOpen: boolean;
  role: UserRole;
  initialSectionKey?: AdminSectionKey;
  onComplete: () => void;
  onSkip: () => void;
  onLater: () => void;
}

export function WelcomeTourModal({
  isOpen,
  role,
  initialSectionKey,
  onComplete,
  onSkip,
  onLater,
}: WelcomeTourModalProps): JSX.Element | null {
  const { locale } = useAppLocale();
  const lang: 'uz' | 'ru' = locale === 'ru' ? 'ru' : 'uz';
  const isUz = lang === 'uz';

  const sections = useMemo(() => getSectionsForRole(role), [role]);
  const totalSteps = sections.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);

  // Синхронизация начального шага ТОЛЬКО при первичном открытии модального окна
  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      if (initialSectionKey) {
        const idx = sections.findIndex((s) => s.key === initialSectionKey);
        setCurrentIndex(idx !== -1 ? idx : 0);
      } else {
        setCurrentIndex(0);
      }
    } else if (isOpen && initialSectionKey && wasOpenRef.current) {
      const idx = sections.findIndex((s) => s.key === initialSectionKey);
      if (idx !== -1) {
        setCurrentIndex(idx);
      }
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, initialSectionKey, sections]);

  // Фокус и доступность клавиатуры (ArrowLeft, ArrowRight, Escape)
  useEffect(() => {
    if (!isOpen) return;

    // Фокусируемся на модальном окне или кнопке «Далее»
    const timer = setTimeout(() => {
      nextButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onLater();
      } else if (e.key === 'ArrowRight' && currentIndex < totalSteps - 1) {
        e.preventDefault();
        setCurrentIndex((prev) => prev + 1);
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        e.preventDefault();
        setCurrentIndex((prev) => prev - 1);
      } else if (e.key === 'Tab' && modalRef.current) {
        // Простой focus trap
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, currentIndex, totalSteps, onLater]);

  if (!isOpen || sections.length === 0) {
    return null;
  }

  const currentSection: OnboardingSectionItem = sections[currentIndex] || sections[0]!;
  const isFirstStep = currentIndex === 0;
  const isLastStep = currentIndex === totalSteps - 1;
  const Icon = currentSection.icon;

  const titleText = currentSection.title[lang] || currentSection.title.uz;
  const blurbText = currentSection.blurb[lang] || currentSection.blurb.uz;
  const stepsList = currentSection.steps[lang] || currentSection.steps.uz;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentIndex((prev) => Math.min(prev + 1, totalSteps - 1));
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentIndex((prev) => Math.max(prev - 1, 0));
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-dialog-title"
      aria-describedby="tour-dialog-description"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl rounded-2xl border border-border bg-card p-6 sm:p-7 shadow-2xl text-card-foreground flex flex-col motion-safe:transition-all animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
      >
        {/* Верхняя строка: логотип/заголовок тура, переключатель языка, индикатор шага и кнопка закрытия */}
        <div className="flex items-center justify-between pb-4 border-b border-border gap-2">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
              <Compass className="size-4" aria-hidden="true" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                {isUz ? 'Tizim bilan tanishuv' : 'Знакомство с системой'}
              </span>
              <h2 id="tour-dialog-title" className="text-base sm:text-lg font-bold text-foreground">
                {isUz ? 'Boshqaruv paneli ekskursiyasi' : 'Экскурсия по панели управления'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Переключатель языка прямо внутри модального окна тура */}
            <LanguageSwitcher />

            <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5 border-primary/30 text-primary">
              {currentIndex + 1} / {totalSteps}
            </Badge>

            <Button
              variant="ghost"
              size="sm"
              onClick={onLater}
              className="size-8 p-0 text-muted-foreground hover:text-foreground rounded-lg"
              title={isUz ? 'Keyinroq koʻrish (Yopish)' : 'Позже (Закрыть)'}
              aria-label={isUz ? 'Yopish' : 'Закрыть'}
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        {/* Индикатор прогресса в виде тонкой полосы и кликабельных точек */}
        <div className="pt-3 pb-2">
          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / totalSteps) * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 px-1">
            {sections.map((sec, idx) => {
              const active = idx === currentIndex;
              const completed = idx < currentIndex;
              return (
                <button
                  key={sec.key}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`size-2.5 rounded-full transition-all focus:outline-hidden focus:ring-2 focus:ring-primary ${
                    active
                      ? 'bg-primary scale-125 ring-2 ring-primary/40'
                      : completed
                      ? 'bg-primary/50'
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/60'
                  }`}
                  aria-label={`${sec.title[lang]} (${idx + 1}/${totalSteps})`}
                  title={sec.title[lang]}
                />
              );
            })}
          </div>
        </div>

        {/* Основной контент активного раздела */}
        <div className="py-4 space-y-4">
          <div className="flex items-start gap-3.5">
            <div className={`p-3 rounded-xl border ${currentSection.accentColor} shrink-0`}>
              <Icon className="size-6" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-foreground">
                  {titleText}
                </h3>
                <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  {currentSection.path}
                </span>
              </div>
              <p
                id="tour-dialog-description"
                className="text-sm text-foreground/80 leading-relaxed font-medium"
              >
                {blurbText}
              </p>
            </div>
          </div>

          {/* Список реальных шагов */}
          <div className="bg-muted/40 rounded-xl p-4 border border-border/80 space-y-2.5">
            <span className="text-xs font-bold text-foreground block uppercase tracking-wider">
              {isUz ? 'Asosiy harakatlar:' : 'Основные сценарии работы:'}
            </span>
            <ol className="space-y-2 text-xs sm:text-sm">
              {stepsList.map((stepText, sIdx) => (
                <li key={sIdx} className="flex items-start gap-2.5 text-foreground/90">
                  <span className="size-5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {sIdx + 1}
                  </span>
                  <span>{stepText}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Нижняя панель действий */}
        <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Кнопка Skip (всегда доступна на любом шаге) и Later (сессионная) */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="text-xs text-muted-foreground hover:text-foreground h-9"
              title={isUz ? 'Ekskursiyani butunlay oʻtkazib yuborish' : 'Пропустить обучение полностью'}
            >
              <span>{isUz ? 'Oʻtkazib yuborish' : 'Пропустить тур'}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLater}
              className="text-xs text-muted-foreground hover:text-foreground h-9 gap-1.5"
              title={isUz ? 'Keyingi safar yana koʻrsatish' : 'Напомнить при следующем визите'}
            >
              <Clock className="size-3.5" aria-hidden="true" />
              <span>{isUz ? 'Keyinroq' : 'Позже'}</span>
            </Button>
          </div>

          {/* Кнопки навигации: Назад / Далее / Завершить */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              disabled={isFirstStep}
              className="text-xs h-9 gap-1.5"
            >
              <ArrowLeft className="size-3.5" aria-hidden="true" />
              <span>{isUz ? 'Orqaga' : 'Назад'}</span>
            </Button>

            <Button
              ref={nextButtonRef}
              variant="default"
              size="sm"
              onClick={handleNext}
              className="text-xs h-9 gap-1.5 font-bold shadow-xs"
            >
              {isLastStep ? (
                <>
                  <CheckCircle2 className="size-4" aria-hidden="true" />
                  <span>{isUz ? 'Boshlash' : 'Начать работу'}</span>
                </>
              ) : (
                <>
                  <span>{isUz ? 'Keyingisi' : 'Далее'}</span>
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
