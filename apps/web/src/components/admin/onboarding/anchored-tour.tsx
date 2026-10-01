'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  AdminSectionKey,
  UserRole,
} from '@college/shared';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useAppLocale } from '@/components/i18n/locale-provider';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import {
  getSectionTourSteps,
  getWelcomeTourSteps,
  TourPlacement,
  TourStep,
} from './onboarding-data';

export interface AnchoredTourProps {
  isOpen: boolean;
  role: UserRole;
  mode: 'welcome' | 'section';
  sectionKey?: AdminSectionKey;
  onComplete: () => void;
  onSkip: () => void;
  onLater: () => void;
  onOpenMobileSidebar?: () => void;
}

interface TargetCutout {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
}

interface PopoverLayout {
  top: number;
  left: number;
  placement: TourPlacement;
  arrowStyle: React.CSSProperties;
}

export function AnchoredTour({
  isOpen,
  role,
  mode,
  sectionKey,
  onComplete,
  onSkip,
  onLater,
  onOpenMobileSidebar,
}: AnchoredTourProps): JSX.Element | null {
  const router = useRouter();
  const currentPathname = usePathname();
  const { locale } = useAppLocale();
  const lang: 'uz' | 'ru' = locale === 'ru' ? 'ru' : 'uz';
  const isUz = lang === 'uz';

  // Получаем список шагов для текущего режима и роли
  const steps = useMemo<TourStep[]>(() => {
    if (sectionKey) {
      const sectionSteps = getSectionTourSteps(sectionKey, role);
      if (sectionSteps.length > 0) return sectionSteps;
    }
    if (mode === 'section') {
      const dashSteps = getSectionTourSteps('dashboard', role);
      if (dashSteps.length > 0) return dashSteps;
    }
    // По умолчанию предпочтение отдается туру по дашборду
    const dashSteps = getSectionTourSteps('dashboard', role);
    if (dashSteps.length > 0) return dashSteps;
    return getWelcomeTourSteps(role);
  }, [mode, sectionKey, role]);

  const totalSteps = steps.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cutout, setCutout] = useState<TargetCutout | null>(null);
  const [popoverLayout, setPopoverLayout] = useState<PopoverLayout | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isNarrowScreen, setIsNarrowScreen] = useState(false);

  const popoverRef = useRef<HTMLDivElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const activeStep = steps[currentIndex];

  // Сохраняем элемент с фокусом перед открытием тура и сбрасываем шаг
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement | null;
      setCurrentIndex(0);
    } else {
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
      }
    }
  }, [isOpen, mode, sectionKey]);

  // Определение мобильного экрана
  useEffect(() => {
    const checkWidth = () => {
      setIsNarrowScreen(window.innerWidth < 640);
    };
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  // Расчет координат подсветки и поповера
  const updateTargetPosition = useCallback(() => {
    if (!isOpen || !activeStep) return;

    const el = document.querySelector<HTMLElement>(`[data-tour="${activeStep.target}"]`);
    if (!el) {
      setCutout(null);
      setPopoverLayout(null);
      return;
    }

    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      setCutout(null);
      setPopoverLayout(null);
      return;
    }

    const padding = 6;
    const radius = 8;
    const cX = Math.max(0, rect.left - padding);
    const cY = Math.max(0, rect.top - padding);
    const cW = rect.width + padding * 2;
    const cH = rect.height + padding * 2;

    setCutout({
      x: cX,
      y: cY,
      width: cW,
      height: cH,
      radius,
    });

    // Расчет положения поповера (420px для гарантированного комфортного размещения кнопок)
    const popoverWidth = Math.min(420, window.innerWidth - 24);
    const popoverHeight = popoverRef.current?.offsetHeight || 220;
    const gap = 14;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let resolvedPlacement = activeStep.placement;

    // Авто-флип если не помещается
    if (resolvedPlacement === 'right' && cX + cW + gap + popoverWidth > vw - 12) {
      resolvedPlacement = cX - gap - popoverWidth > 12 ? 'left' : 'bottom';
    } else if (resolvedPlacement === 'left' && cX - gap - popoverWidth < 12) {
      resolvedPlacement = cX + cW + gap + popoverWidth < vw - 12 ? 'right' : 'bottom';
    } else if (resolvedPlacement === 'bottom' && cY + cH + gap + popoverHeight > vh - 12) {
      resolvedPlacement = cY - gap - popoverHeight > 12 ? 'top' : 'bottom';
    } else if (resolvedPlacement === 'top' && cY - gap - popoverHeight < 12) {
      resolvedPlacement = cY + cH + gap + popoverHeight < vh - 12 ? 'bottom' : 'top';
    }

    let top = 0;
    let left = 0;
    const arrowStyle: React.CSSProperties = {};

    if (resolvedPlacement === 'right') {
      left = cX + cW + gap;
      top = cY + cH / 2 - popoverHeight / 2;
      arrowStyle.left = '-8px';
      arrowStyle.top = `${Math.max(16, Math.min(popoverHeight - 16, cY + cH / 2 - top))}px`;
    } else if (resolvedPlacement === 'left') {
      left = cX - popoverWidth - gap;
      top = cY + cH / 2 - popoverHeight / 2;
      arrowStyle.right = '-8px';
      arrowStyle.top = `${Math.max(16, Math.min(popoverHeight - 16, cY + cH / 2 - top))}px`;
    } else if (resolvedPlacement === 'bottom') {
      top = cY + cH + gap;
      left = cX + cW / 2 - popoverWidth / 2;
      arrowStyle.top = '-8px';
      arrowStyle.left = `${Math.max(16, Math.min(popoverWidth - 16, cX + cW / 2 - left))}px`;
    } else {
      top = cY - popoverHeight - gap;
      left = cX + cW / 2 - popoverWidth / 2;
      arrowStyle.bottom = '-8px';
      arrowStyle.left = `${Math.max(16, Math.min(popoverWidth - 16, cX + cW / 2 - left))}px`;
    }

    // Ограничение по границам экрана
    left = Math.max(12, Math.min(vw - popoverWidth - 12, left));
    top = Math.max(12, Math.min(vh - popoverHeight - 12, top));

    setPopoverLayout({
      top,
      left,
      placement: resolvedPlacement,
      arrowStyle,
    });
  }, [isOpen, activeStep]);

  // Навигация между маршрутами и ожидание появления целевого элемента
  useEffect(() => {
    if (!isOpen || !activeStep) return;

    let isMounted = true;
    let pollTimer: ReturnType<typeof setInterval> | null = null;

    const findAndHighlight = () => {
      if (!isMounted) return false;

      // Если мобильное меню закрыто, а цель в сайдбаре
      if (
        activeStep.target.startsWith('sidebar.') &&
        window.innerWidth < 1024 &&
        onOpenMobileSidebar
      ) {
        onOpenMobileSidebar();
      }

      const el = document.querySelector<HTMLElement>(`[data-tour="${activeStep.target}"]`);
      if (el) {
        const prefersReducedMotion =
          typeof window !== 'undefined' &&
          window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        try {
          el.scrollIntoView({
            behavior: prefersReducedMotion ? 'auto' : 'smooth',
            block: 'center',
            inline: 'nearest',
          });
        } catch {
          // Игнорируем ошибки скролла
        }

        updateTargetPosition();
        setTimeout(() => { if (isMounted) updateTargetPosition(); }, 150);
        setTimeout(() => { if (isMounted) updateTargetPosition(); }, 400);
        setIsNavigating(false);

        // Переводим фокус на кнопку «Далее» внутри поповера для a11y
        setTimeout(() => {
          if (isMounted) {
            nextButtonRef.current?.focus();
          }
        }, 80);

        return true;
      }
      return false;
    };

    // Проверяем соответствие текущего маршрута
    if (activeStep.route && activeStep.route !== currentPathname) {
      setIsNavigating(true);
      router.push(activeStep.route);
    }

    // Ищем целевой элемент
    if (!findAndHighlight()) {
      // Опрашиваем DOM с интервалом в 100мс до 4 секунд, пока элемент не смонтируется.
      // НИ В КОЕМ СЛУЧАЕ НЕ ПЕРЕКЛЮЧАТЬ ШАГ АВТОМАТИЧЕСКИ.
      const startTime = Date.now();
      pollTimer = setInterval(() => {
        if (findAndHighlight() || Date.now() - startTime > 4000) {
          if (pollTimer) clearInterval(pollTimer);
          if (isMounted) {
            setIsNavigating(false);
          }
        }
      }, 100);
    }

    return () => {
      isMounted = false;
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [
    isOpen,
    activeStep,
    currentIndex,
    totalSteps,
    currentPathname,
    router,
    updateTargetPosition,
    onOpenMobileSidebar,
  ]);

  // Слушатели скролла, ресайза и мутаций DOM для плавного следования подсветки
  useEffect(() => {
    if (!isOpen) return;

    const handleUpdate = () => {
      updateTargetPosition();
    };

    window.addEventListener('resize', handleUpdate);
    window.addEventListener('scroll', handleUpdate, true);

    const resizeObserver = new ResizeObserver(handleUpdate);
    const targetEl = activeStep
      ? document.querySelector<HTMLElement>(`[data-tour="${activeStep.target}"]`)
      : null;

    if (targetEl) {
      resizeObserver.observe(targetEl);
    }
    resizeObserver.observe(document.body);

    const mutationObserver = new MutationObserver(handleUpdate);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('scroll', handleUpdate, true);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [isOpen, activeStep, updateTargetPosition]);

  // Клавиатурная навигация (ArrowLeft, ArrowRight, Escape, Tab trap)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onLater();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (currentIndex < totalSteps - 1) {
          setCurrentIndex((prev) => prev + 1);
        } else {
          onComplete();
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (currentIndex > 0) {
          setCurrentIndex((prev) => prev - 1);
        }
      } else if (e.key === 'Tab' && popoverRef.current) {
        // Focus trap внутри поповера
        const focusables = popoverRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (!first || !last) return;

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, totalSteps, onLater, onComplete]);

  if (!isOpen || !activeStep) return null;

  const isLast = currentIndex === totalSteps - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* 1. Полноэкранный SVG затемняющий слой с вырезом под целевой элемент */}
      {cutout ? (
        <svg
          className="fixed inset-0 w-full h-full pointer-events-none z-[60] transition-opacity duration-300"
          aria-hidden="true"
        >
          <defs>
            <mask id="admin-tour-spotlight-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <rect
                x={cutout.x}
                y={cutout.y}
                width={cutout.width}
                height={cutout.height}
                rx={cutout.radius}
                ry={cutout.radius}
                fill="black"
              />
            </mask>
          </defs>

          {/* Затемненный фон вокруг подсветки */}
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.72)"
            mask="url(#admin-tour-spotlight-mask)"
            className="pointer-events-auto cursor-pointer"
            onClick={onLater}
            aria-label={isUz ? 'Yopish uchun bosing' : 'Нажмите, чтобы закрыть'}
          >
            <title>{isUz ? 'Yopish uchun bosing' : 'Нажмите, чтобы закрыть'}</title>
          </rect>

          {/* Светящаяся рамка вокруг целевого элемента */}
          <rect
            x={cutout.x}
            y={cutout.y}
            width={cutout.width}
            height={cutout.height}
            rx={cutout.radius}
            ry={cutout.radius}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2.5"
            className="transition-all duration-300 pointer-events-none"
          />
        </svg>
      ) : (
        /* Fallback оверлей при переходе маршрута или загрузке */
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-[60] pointer-events-auto transition-opacity duration-300"
          onClick={onLater}
        />
      )}

      {/* 2. Доступное оповещение для экранных дикторов */}
      <div aria-live="polite" className="sr-only">
        {isUz
          ? `Tanishtiruv qadami ${currentIndex + 1} dan ${totalSteps}: ${activeStep.title.uz}`
          : `Шаг тура ${currentIndex + 1} из ${totalSteps}: ${activeStep.title.ru}`}
      </div>

      {/* 3. Всплывающее окно с подсказкой (Anchored Popover Dialog) */}
      <div
        ref={popoverRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-step-title"
        aria-describedby="tour-step-desc"
        style={
          !isNarrowScreen && popoverLayout
            ? {
                top: `${popoverLayout.top}px`,
                left: `${popoverLayout.left}px`,
                width: '420px',
                maxWidth: 'calc(100vw - 1.5rem)',
              }
            : undefined
        }
        className={
          isNarrowScreen || !popoverLayout
            ? 'fixed bottom-4 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 max-w-md w-[calc(100vw-1.5rem)] z-[70] pointer-events-auto animate-in slide-in-from-bottom-4 duration-200'
            : 'fixed z-[70] pointer-events-auto animate-in fade-in zoom-in-95 duration-200'
        }
      >
        <Card className="relative p-4 sm:p-5 shadow-2xl border-2 border-primary/30 bg-card/95 backdrop-blur-md text-card-foreground rounded-xl">
          {/* Декоративная стрелка-указатель (Pointer Arrow) */}
          {!isNarrowScreen && popoverLayout && (
            <div
              style={popoverLayout.arrowStyle}
              className={`absolute size-4 rotate-45 bg-card border-primary/30 ${
                popoverLayout.placement === 'right'
                  ? 'border-l-2 border-b-2 -translate-y-1/2'
                  : popoverLayout.placement === 'left'
                    ? 'border-r-2 border-t-2 -translate-y-1/2'
                    : popoverLayout.placement === 'bottom'
                      ? 'border-l-2 border-t-2 -translate-x-1/2'
                      : 'border-r-2 border-b-2 -translate-x-1/2'
              }`}
            />
          )}

          {/* Заголовок поповера, счетчик шагов и переключатель языка */}
          <div className="flex items-center justify-between pb-3 border-b border-border/80 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Badge
                variant="outline"
                className="bg-primary/10 text-primary border-primary/30 font-mono text-xs px-2 py-0.5 shrink-0"
              >
                {currentIndex + 1} / {totalSteps}
              </Badge>
              <div className="flex items-center gap-1 text-[11px] font-bold text-primary uppercase tracking-wider truncate">
                <Sparkles className="size-3 shrink-0" aria-hidden="true" />
                <span className="truncate">
                  {mode === 'section'
                    ? (isUz ? 'Boʻlim tahriri' : 'Гид по разделу')
                    : (isUz ? 'Texnikum CMS' : 'Тур по CMS')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <LanguageSwitcher />
              <Button
                variant="ghost"
                size="sm"
                onClick={onLater}
                className="size-7 p-0 text-muted-foreground hover:text-foreground rounded-md shrink-0"
                title={isUz ? 'Keyinroq davom ettirish' : 'Отложить тур'}
                aria-label={isUz ? 'Yopish' : 'Закрыть тур'}
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>

          {/* Содержимое шага */}
          <div className="py-4 space-y-2">
            <h3
              id="tour-step-title"
              className="text-base font-bold text-foreground leading-snug"
            >
              {activeStep.title[lang] || activeStep.title.uz}
            </h3>

            <p
              id="tour-step-desc"
              className="text-xs text-muted-foreground leading-relaxed"
            >
              {isNavigating
                ? (isUz ? 'Sahifaga yoʻnaltirilmoqda...' : 'Переход к разделу...')
                : activeStep.body[lang] || activeStep.body.uz}
            </p>
          </div>

          {/* Панель управления и кнопки навигации */}
          <div className="pt-3 border-t border-border flex items-center justify-between gap-2 flex-wrap">
            {/* Кнопка Skip (персистентная) и Later (сессионная) */}
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={onSkip}
                className="text-[11px] h-8 px-2 text-muted-foreground hover:text-foreground shrink-0"
                title={isUz ? 'Ekskursiyani toʻliq oʻtkazib yuborish' : 'Пропустить весь тур'}
              >
                <span>{isUz ? 'Oʻtkazish' : 'Пропустить'}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={onLater}
                className="text-[11px] h-8 px-2 text-muted-foreground hover:text-foreground gap-1 hidden sm:inline-flex shrink-0"
                title={isUz ? 'Keyingi kirishda davom ettirish' : 'Напомнить при следующем визите'}
              >
                <Clock className="size-3" aria-hidden="true" />
                <span>{isUz ? 'Keyinroq' : 'Позже'}</span>
              </Button>
            </div>

            {/* Кнопки Назад / Далее */}
            <div className="flex items-center gap-1.5 shrink-0 ml-auto">
              {currentIndex > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBack}
                  className="h-8 px-2.5 text-xs gap-1 shrink-0"
                >
                  <ArrowLeft className="size-3.5" aria-hidden="true" />
                  <span>{isUz ? 'Orqaga' : 'Назад'}</span>
                </Button>
              )}

              <Button
                ref={nextButtonRef}
                variant="default"
                size="sm"
                onClick={handleNext}
                className="h-8 px-3.5 text-xs font-semibold gap-1.5 shadow-sm shrink-0"
              >
                <span>
                  {isLast
                    ? (isUz ? 'Tugatish' : 'Завершить')
                    : (isUz ? 'Keyingisi' : 'Далее')}
                </span>
                {isLast ? (
                  <CheckCircle2 className="size-3.5" aria-hidden="true" />
                ) : (
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
