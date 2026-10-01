'use client';

import React, { useState, useEffect } from 'react';
import {
  GridRow,
  RowBackgroundStyle,
  RowPaddingVertical,
  RowContainerWidth,
  validateRowContrast,
  calculateWcagContrast,
  ROW_BACKGROUND_COLORS,
} from '@college/shared';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Palette, CheckCircle2, AlertTriangle, XCircle, EyeOff } from 'lucide-react';

interface RowStyleDialogProps {
  open: boolean;
  row: GridRow | null;
  onOpenChange: (open: boolean) => void;
  onSave: (rowId: string, style: GridRow['style']) => void;
  isUz: boolean;
}

export function RowStyleDialog({
  open,
  row,
  onOpenChange,
  onSave,
  isUz,
}: RowStyleDialogProps): JSX.Element | null {
  const [backgroundStyle, setBackgroundStyle] = useState<RowBackgroundStyle>('none');
  const [paddingVertical, setPaddingVertical] = useState<RowPaddingVertical>('normal');
  const [containerWidth, setContainerWidth] = useState<RowContainerWidth>('standard');
  const [hideOnMobile, setHideOnMobile] = useState<boolean>(false);
  const [hideOnTablet, setHideOnTablet] = useState<boolean>(false);
  const [hideOnDesktop, setHideOnDesktop] = useState<boolean>(false);
  const [customTextColor, setCustomTextColor] = useState<string>(''); // For intentional WCAG failure testing
  const [contrastError, setContrastError] = useState<string | null>(null);
  const [contrastRatio, setContrastRatio] = useState<number>(21);

  useEffect(() => {
    if (row?.style) {
      setBackgroundStyle(row.style.backgroundStyle || 'none');
      setPaddingVertical(row.style.paddingVertical || 'normal');
      setContainerWidth(row.style.containerWidth || 'standard');
      setHideOnMobile(Boolean(row.style.hideOnMobile));
      setHideOnTablet(Boolean(row.style.hideOnTablet));
      setHideOnDesktop(Boolean(row.style.hideOnDesktop));
      setCustomTextColor('');
    }
  }, [row]);

  // Recalculate contrast when background or custom color changes
  useEffect(() => {
    if (customTextColor) {
      // Testing custom contrast (e.g. user or test tries an inaccessible low-contrast text color)
      const colors = ROW_BACKGROUND_COLORS[backgroundStyle] || ROW_BACKGROUND_COLORS.none;
      const bgHex = colors.light.bg;
      const ratio = calculateWcagContrast(customTextColor, bgHex);
      setContrastRatio(ratio);
      if (ratio < 4.5) {
        setContrastError(
          `Ошибка доступности WCAG AA: цветовой контраст ${ratio}:1 ниже обязательного минимума 4.5:1. Сохранение заблокировано.`,
        );
      } else {
        setContrastError(null);
      }
    } else {
      const res = validateRowContrast(backgroundStyle, false);
      setContrastRatio(res.ratio);
      if (!res.passes) {
        setContrastError(res.error || 'Ошибка доступности WCAG AA: недостаточный контраст');
      } else {
        setContrastError(null);
      }
    }
  }, [backgroundStyle, customTextColor]);

  if (!row) return null;

  const handleApply = () => {
    if (contrastError) return;
    onSave(row.id, {
      backgroundStyle,
      paddingVertical,
      containerWidth,
      hideOnMobile,
      hideOnTablet,
      hideOnDesktop,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Palette className="size-5 text-primary" />
            <span>{isUz ? 'Qator uslubi va dizayn tokenlari' : 'Стиль строки и дизайн-токены'}</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            {isUz
              ? 'Fon rangi, vertikal oraliqlar va konteyner kengligini sozlash'
              : 'Настройка фонового стиля, вертикальных отступов и ширины контейнера'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
          {/* 1. Фоновый стиль (Background Token) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">
              {isUz ? 'Fon rangi (Дизайн-токен)' : 'Фоновый стиль (Дизайн-токен)'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(
                [
                  { id: 'none', labelUz: 'Shaffof', labelRu: 'Прозрачный', previewBg: 'bg-background' },
                  { id: 'subtle', labelUz: 'Neytral kulrang', labelRu: 'Светло-серый', previewBg: 'bg-muted' },
                  { id: 'card', labelUz: 'Kartochka', labelRu: 'Карточка', previewBg: 'bg-card border' },
                  { id: 'brand', labelUz: 'Brend koʻk', labelRu: 'Цвет бренда', previewBg: 'bg-primary text-white' },
                  { id: 'dark', labelUz: 'Qora toʻq', labelRu: 'Темный контрастный', previewBg: 'bg-slate-900 text-white' },
                ] as const
              ).map((bg) => (
                <button
                  key={bg.id}
                  type="button"
                  onClick={() => {
                    setBackgroundStyle(bg.id);
                    setCustomTextColor('');
                  }}
                  className={`p-2.5 rounded-lg border text-left transition-all flex flex-col gap-1.5 focus:outline-none focus:ring-2 focus:ring-primary ${
                    backgroundStyle === bg.id
                      ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                      : 'border-border hover:bg-muted/40'
                  }`}
                >
                  <div className={`h-4 w-full rounded border border-border/40 ${bg.previewBg}`} />
                  <span className="text-[11px] font-semibold text-foreground truncate">
                    {isUz ? bg.labelUz : bg.labelRu}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Вертикальные отступы (Padding Vertical) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">
              {isUz ? 'Vertikal boʻshliq (Padding)' : 'Вертикальные отступы (Padding)'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(
                [
                  { id: 'none', labelUz: 'Boʻshliqsiz', labelRu: '0 px' },
                  { id: 'compact', labelUz: 'Ixcham', labelRu: 'Компактный' },
                  { id: 'normal', labelUz: 'Oʻrtacha', labelRu: 'Обычный' },
                  { id: 'relaxed', labelUz: 'Keng', labelRu: 'Большой' },
                ] as const
              ).map((pad) => (
                <button
                  key={pad.id}
                  type="button"
                  onClick={() => setPaddingVertical(pad.id)}
                  className={`p-2 rounded-lg border text-center transition-all text-xs font-medium ${
                    paddingVertical === pad.id
                      ? 'border-primary bg-primary/5 text-primary font-bold'
                      : 'border-border text-foreground hover:bg-muted/40'
                  }`}
                >
                  {isUz ? pad.labelUz : pad.labelRu}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Ширина контейнера (Container Width) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">
              {isUz ? 'Maksimal kenglik' : 'Ширина контейнера'}
            </label>
            <select
              value={containerWidth}
              onChange={(e) => setContainerWidth(e.target.value as RowContainerWidth)}
              className="w-full text-xs p-2 rounded-md border border-border bg-background text-foreground"
            >
              <option value="prose">
                {isUz ? 'Kitobiy / Matn uchun (Prose — max-w-3xl)' : 'Текстовая (Prose — max-w-3xl)'}
              </option>
              <option value="standard">
                {isUz ? 'Standart (Standard — max-w-5xl)' : 'Стандартная (Standard — max-w-5xl)'}
              </option>
              <option value="wide">
                {isUz ? 'Kengaytirilgan (Wide — max-w-7xl)' : 'Широкая (Wide — max-w-7xl)'}
              </option>
              <option value="full">
                {isUz ? 'Toʻliq ekran (Full width — 100%)' : 'На всю ширину (Full — 100%)'}
              </option>
            </select>
          </div>

          {/* 4. Адаптивная видимость на устройствах */}
          <div className="space-y-2.5 p-3 rounded-xl border border-border bg-muted/20">
            <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
              <EyeOff className="size-3.5 text-primary" />
              <span>{isUz ? 'Qurilmalarda koʻrinishi (Visibility)' : 'Видимость строки на устройствах'}</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {isUz ? 'Mobil telefonlarda yashirish (<640px)' : 'Скрыть на мобильных (<640px)'}
                </span>
                <Switch checked={hideOnMobile} onCheckedChange={setHideOnMobile} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {isUz ? 'Planshetlarda yashirish (640-1023px)' : 'Скрыть на планшетах (640-1023px)'}
                </span>
                <Switch checked={hideOnTablet} onCheckedChange={setHideOnTablet} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {isUz ? 'Kompyuterlarda yashirish (≥1024px)' : 'Скрыть на десктопе (≥1024px)'}
                </span>
                <Switch checked={hideOnDesktop} onCheckedChange={setHideOnDesktop} />
              </div>
            </div>
            {hideOnMobile && hideOnTablet && hideOnDesktop && (
              <div className="p-2 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive text-[11px] flex items-center gap-1.5">
                <AlertTriangle className="size-3.5 shrink-0" />
                <span>
                  {isUz
                    ? 'Diqqat: qator barcha qurilmalarda yashirilgan va koʻrinmaydi!'
                    : 'Внимание: строка скрыта на всех устройствах и не будет видна!'}
                </span>
              </div>
            )}
          </div>

          {/* 5. Тест контрастности WCAG AA (Luminance & Automated Verification) */}
          <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <span>{isUz ? 'WCAG 2.1 AA Kontrast tekshiruvi' : 'Проверка контраста WCAG AA'}</span>
              </span>
              {contrastError ? (
                <Badge variant="destructive" className="text-[10px] gap-1">
                  <XCircle className="size-3" />
                  <span>{contrastRatio}:1 (FAIL)</span>
                </Badge>
              ) : (
                <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] gap-1">
                  <CheckCircle2 className="size-3" />
                  <span>{contrastRatio}:1 (PASS)</span>
                </Badge>
              )}
            </div>

            {contrastError ? (
              <div
                id="wcag-contrast-error-alert"
                className="p-2.5 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive text-xs font-medium flex items-start gap-2"
              >
                <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                <span className="leading-snug">{contrastError}</span>
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                {isUz
                  ? 'Ushbu rang birikmasi WCAG 2.1 AA talablariga toʻliq javob beradi (kamida 4.5:1).'
                  : 'Цветовая пара полностью удовлетворяет стандарту WCAG 2.1 AA (не менее 4.5:1).'}
              </p>
            )}

            {/* Специальная кнопка тестирования недопустимого контраста для верификационного сценария */}
            <div className="pt-1 flex items-center justify-between text-[11px] border-t border-border/50">
              <span className="text-muted-foreground">
                {isUz ? 'Nomaqbul kontrastni tekshirish:' : 'Тест недопустимого контраста:'}
              </span>
              <button
                type="button"
                id="btn-simulate-wcag-fail"
                onClick={() => setCustomTextColor('#d1d5db')} // Light gray on white -> ~1.4:1 contrast -> FAILS!
                className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-mono"
              >
                [Симулировать отказ WCAG]
              </button>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            {isUz ? 'Bekor qilish' : 'Отмена'}
          </Button>
          <Button
            type="button"
            id="btn-apply-row-style"
            disabled={Boolean(contrastError)}
            onClick={handleApply}
            className="text-xs"
          >
            {isUz ? 'Qoʻllash' : 'Применить стиль'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
