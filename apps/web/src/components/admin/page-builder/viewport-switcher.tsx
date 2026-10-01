'use client';

import React from 'react';
import { Monitor, Tablet, Smartphone, Sliders } from 'lucide-react';
import { getBreakpointFromWidth } from '@college/shared';

export type ViewportMode = 'desktop' | 'tablet' | 'mobile';
export type BuilderViewport = ViewportMode;

interface ViewportSwitcherProps {
  viewport: ViewportMode;
  customWidth?: number;
  onChange: (v: ViewportMode) => void;
  onCustomWidthChange?: (width: number) => void;
  isUz: boolean;
}

export function ViewportSwitcher({
  viewport,
  customWidth = 1280,
  onChange,
  onCustomWidthChange,
  isUz,
}: ViewportSwitcherProps): JSX.Element {
  const currentBp = getBreakpointFromWidth(customWidth);
  const bpLabels: Record<string, { uz: string; ru: string }> = {
    mobile: { uz: 'Mobil (<640px)', ru: 'Мобильный (<640px)' },
    tablet: { uz: 'Planshet (640-1023px)', ru: 'Планшет (640-1023px)' },
    desktop: { uz: 'Kompyuter (≥1024px)', ru: 'Десктоп (≥1024px)' },
  };

  const handlePreset = (mode: ViewportMode, width: number) => {
    onChange(mode);
    onCustomWidthChange?.(width);
  };

  return (
    <div
      data-tour="page-builder.viewport-switcher"
      className="inline-flex items-center gap-2 rounded-lg border border-border bg-card p-1 shadow-2xs flex-wrap"
      role="group"
      aria-label={isUz ? 'Ekran oʻlchamini tanlash' : 'Выбор видового экрана'}
    >
      <div className="inline-flex items-center rounded-md bg-muted/60 p-0.5">
        <button
          type="button"
          onClick={() => handlePreset('desktop', 1280)}
          aria-pressed={viewport === 'desktop' && customWidth >= 1024}
          title={isUz ? 'Kompyuter ekrani (1280px)' : 'Компьютерный экран (1280px)'}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
            viewport === 'desktop' && customWidth >= 1024
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          <Monitor className="size-3.5" />
          <span className="hidden sm:inline">1280px</span>
        </button>

        <button
          type="button"
          onClick={() => handlePreset('tablet', 768)}
          aria-pressed={viewport === 'tablet' && customWidth >= 640 && customWidth < 1024}
          title={isUz ? 'Planshet ekrani (768px)' : 'Планшетный экран (768px)'}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
            viewport === 'tablet' && customWidth >= 640 && customWidth < 1024
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          <Tablet className="size-3.5" />
          <span className="hidden sm:inline">768px</span>
        </button>

        <button
          type="button"
          onClick={() => handlePreset('mobile', 375)}
          aria-pressed={viewport === 'mobile' && customWidth === 375}
          title={isUz ? 'Mobil telefon ekrani (375px)' : 'Мобильный экран (375px)'}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
            viewport === 'mobile' && customWidth === 375
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          <Smartphone className="size-3.5" />
          <span className="hidden sm:inline">375px</span>
        </button>

        <button
          type="button"
          onClick={() => handlePreset('mobile', 320)}
          aria-pressed={customWidth === 320}
          title={isUz ? 'Kichik mobil ekran (320px)' : 'Компактный мобильный (320px)'}
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all ${
            customWidth === 320
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          <span className="font-mono text-[10px]">320</span>
        </button>
      </div>

      {/* Custom Width Slider 320px to 1536px */}
      <div
        data-tour="page-builder.viewport-slider"
        className="flex items-center gap-2 px-2 py-0.5 border-l border-border text-xs"
      >
        <Sliders className="size-3 text-muted-foreground shrink-0" />
        <input
          type="range"
          min={320}
          max={1536}
          step={4}
          value={customWidth}
          onChange={(e) => {
            const w = Number(e.target.value);
            onCustomWidthChange?.(w);
            const bp = getBreakpointFromWidth(w);
            onChange(bp as ViewportMode);
          }}
          className="w-20 sm:w-28 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          aria-label={isUz ? 'Erkin kenglik slayderi' : 'Слайдер произвольной ширины'}
        />
        <span className="font-mono font-bold text-[11px] text-foreground min-w-[48px]">
          {customWidth}px
        </span>
        <span className="hidden lg:inline text-[10px] text-muted-foreground px-1.5 py-0.5 rounded bg-muted/60">
          {isUz ? bpLabels[currentBp]?.uz : bpLabels[currentBp]?.ru}
        </span>
      </div>
    </div>
  );
}
