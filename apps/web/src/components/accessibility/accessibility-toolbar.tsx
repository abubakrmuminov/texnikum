'use client';

import React from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Image as ImageIcon, Settings, Volume2, VolumeX } from 'lucide-react';
import { useAccessibility } from './accessibility-provider';
import { useAppLocale } from '@/components/i18n/locale-provider';

export function AccessibilityToolbar(): JSX.Element {
  const { locale } = useAppLocale();
  const {
    theme,
    setTheme,
    fontSize,
    setFontSize,
    imagesMode,
    setImagesMode,
    isSpeaking,
    speakText,
    stopSpeech,
    isHighContrast,
  } = useAccessibility();

  const handleToolbarSpeak = () => {
    if (isSpeaking) {
      stopSpeech();
      return;
    }

    // 1. Agar foydalanuvchi matn belgilagan boʻlsa, oʻshani oʻqiymiz
    const selection = typeof window !== 'undefined' ? window.getSelection()?.toString().trim() : '';
    if (selection && selection.length > 0) {
      speakText(selection);
      return;
    }

    // 2. Sahifadagi asosiy kontentni topib oʻqiymiz
    if (typeof document !== 'undefined') {
      const mainEl = document.getElementById('main-content');
      if (mainEl) {
        // Matnli bloklarni yigʻamiz (h1, h2, h3, p)
        const textElements = Array.from(mainEl.querySelectorAll('h1, h2, h3, p'))
          .map((el) => (el as HTMLElement).innerText?.trim())
          .filter(Boolean);

        const textToRead = textElements.join('. ').slice(0, 3000);
        if (textToRead) {
          speakText(textToRead);
          return;
        }
      }

      const pageTitle = document.title || 'Rasmiy taʼlim portali';
      speakText(pageTitle);
    }
  };

  return (
    <aside
      aria-label="Koʻrish imkoniyati cheklanganlar uchun maxsus panel"
      className="bg-muted/80 border-b border-border py-1.5 px-4 text-xs font-medium text-foreground transition-all"
    >
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Левая группа: Статус версии для слабовидящих */}
        <div className="flex items-center gap-2">
          <Link
            href="/settings"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors font-semibold"
            aria-label="Maxsus imkoniyatlar sozlamalari (WCAG 2.1 AA, OʻRQ-641)"
          >
            <Eye className="size-3.5" aria-hidden="true" />
            <span>Maxsus imkoniyatlar (WCAG 2.1 AA)</span>
          </Link>

          {isHighContrast && (
            <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 font-semibold text-[11px]">
              Yuqori kontrast faol
            </span>
          )}
        </div>

        {/* Правая группа: Быстрые переключатели параметров */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          {/* Размер шрифта */}
          <div className="flex items-center gap-1 bg-background/60 rounded-md p-1 border border-border" role="group" aria-label="Shrift oʻlchami">
            <span className="sr-only">Shrift oʻlchami:</span>
            <button
              type="button"
              onClick={() => setFontSize('normal')}
              className={`min-w-[28px] min-h-[28px] px-2 py-1 rounded text-xs flex items-center justify-center transition-colors ${fontSize === 'normal' ? 'bg-primary text-primary-foreground font-bold' : 'hover:bg-accent'}`}
              aria-pressed={fontSize === 'normal'}
              title="Standart shrift 100%"
            >
              А
            </button>
            <button
              type="button"
              onClick={() => setFontSize('large')}
              className={`min-w-[28px] min-h-[28px] px-2 py-1 rounded text-sm flex items-center justify-center transition-colors ${fontSize === 'large' ? 'bg-primary text-primary-foreground font-bold' : 'hover:bg-accent'}`}
              aria-pressed={fontSize === 'large'}
              title="Katta shrift 120%"
            >
              А+
            </button>
            <button
              type="button"
              onClick={() => setFontSize('xlarge')}
              className={`min-w-[28px] min-h-[28px] px-2 py-1 rounded text-base flex items-center justify-center transition-colors ${fontSize === 'xlarge' ? 'bg-primary text-primary-foreground font-bold' : 'hover:bg-accent'}`}
              aria-pressed={fontSize === 'xlarge'}
              title="Juda katta shrift 140%"
            >
              А++
            </button>
          </div>

          {/* Быстрые цветовые схемы */}
          <div className="flex items-center gap-1 bg-background/60 rounded-md p-1 border border-border" role="group" aria-label="Rang sxemasi">
            <button
              type="button"
              onClick={() => setTheme('default')}
              className={`min-w-[28px] min-h-[28px] px-2 py-1 rounded text-xs flex items-center justify-center transition-colors ${theme === 'default' ? 'bg-primary text-primary-foreground font-bold' : 'hover:bg-accent'}`}
              aria-pressed={theme === 'default'}
              title="Standart rang sxemasi"
            >
              R
            </button>
            <button
              type="button"
              onClick={() => setTheme('contrast-bw')}
              className={`min-w-[28px] min-h-[28px] px-1.5 py-1 rounded border border-black bg-white text-black text-xs flex items-center justify-center transition-colors ${theme === 'contrast-bw' ? 'ring-2 ring-primary font-bold' : 'hover:opacity-80'}`}
              aria-pressed={theme === 'contrast-bw'}
              title="Oq fonda qora"
            >
              O/Q
            </button>
            <button
              type="button"
              onClick={() => setTheme('contrast-wb')}
              className={`min-w-[28px] min-h-[28px] px-1.5 py-1 rounded border border-white bg-black text-white text-xs flex items-center justify-center transition-colors ${theme === 'contrast-wb' ? 'ring-2 ring-primary font-bold' : 'hover:opacity-80'}`}
              aria-pressed={theme === 'contrast-wb'}
              title="Qora fonda oq"
            >
              Q/O
            </button>
            <button
              type="button"
              onClick={() => setTheme('contrast-blue')}
              className={`min-w-[28px] min-h-[28px] px-1.5 py-1 rounded border border-blue-900 bg-sky-200 text-blue-950 text-xs flex items-center justify-center transition-colors ${theme === 'contrast-blue' ? 'ring-2 ring-primary font-bold' : 'hover:opacity-80'}`}
              aria-pressed={theme === 'contrast-blue'}
              title="Moviy fonda toʻq koʻk"
            >
              M/K
            </button>
          </div>

          {/* Изображения */}
          <button
            type="button"
            onClick={() => setImagesMode(imagesMode === 'hide' ? 'show' : imagesMode === 'show' ? 'grayscale' : 'hide')}
            className={`min-h-[28px] flex items-center gap-1.5 px-2.5 py-1 rounded border border-border bg-background/60 hover:bg-accent transition-colors ${imagesMode !== 'show' ? 'border-primary text-primary' : ''}`}
            title={`Rasmlar tartibi: ${imagesMode === 'show' ? 'Rangli' : imagesMode === 'grayscale' ? 'Oq-qora' : 'Yashirilgan'}`}
            aria-label="Rasmlarni koʻrsatish tartibi"
          >
            {imagesMode === 'hide' ? (
              <EyeOff className="size-3.5" aria-hidden="true" />
            ) : (
              <ImageIcon className="size-3.5" aria-hidden="true" />
            )}
            <span className="hidden md:inline">
              {imagesMode === 'show' ? 'Rasmlar' : imagesMode === 'grayscale' ? 'Oq-qora' : 'Rasmsiz'}
            </span>
          </button>

          {/* Синтез речи */}
          <button
            type="button"
            onClick={handleToolbarSpeak}
            className={`flex items-center gap-1.5 px-2 py-1 rounded border border-border bg-background/60 hover:bg-accent transition-colors ${isSpeaking ? 'bg-primary/20 text-primary border-primary font-bold' : ''}`}
            title={
              isSpeaking
                ? locale === 'uz'
                  ? 'Ovozli oʻqishni toʻxtatish'
                  : 'Остановить чтение'
                : locale === 'uz'
                  ? 'Sahifani yoki belgilangan matnni ovozli tinglash'
                  : 'Озвучить страницу или выделенный текст'
            }
            aria-label={
              isSpeaking
                ? locale === 'uz'
                  ? 'Toʻxtatish'
                  : 'Остановить'
                : locale === 'uz'
                  ? 'Ovozli oʻqish'
                  : 'Озвучить'
            }
          >
            {isSpeaking ? (
              <VolumeX className="size-3.5 text-destructive animate-pulse" aria-hidden="true" />
            ) : (
              <Volume2 className="size-3.5" aria-hidden="true" />
            )}
            <span className="hidden lg:inline">
              {isSpeaking
                ? locale === 'uz'
                  ? 'Toʻxtatish'
                  : 'Остановить'
                : locale === 'uz'
                  ? 'Ovozli oʻqish'
                  : 'Озвучить'}
            </span>
          </button>

          {/* Ссылка в полные настройки */}
          <Link
            href="/settings"
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
            title="Barcha maxsus imkoniyat sozlamalari"
          >
            <Settings className="size-3.5" aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">Sozlamalar</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
