'use client';

import React, { useEffect, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Info,
  Loader2,
  Palette,
  ShieldAlert,
  Sparkles,
  XCircle,
} from 'lucide-react';
import {
  ThemePresetId,
  ThemeSettings,
  THEME_PRESETS,
  UserRole,
} from '@college/shared';
import { useAdminAuth } from '@/components/admin/admin-auth-context';
import { useAppLocale } from '@/components/i18n/locale-provider';
import { useTranslations } from 'next-intl';
import { useInstitution } from '@/components/institution/institution-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import { getContrastRatio, getRelativeLuminance, hexToRgb } from '@/lib/brand-color';

interface ContrastResult {
  passes: boolean;
  lightRatio: number;
  darkRatio: number;
}

function calculateWcagContrast(brandHex: string): ContrastResult {
  const rgb = hexToRgb(brandHex) || { r: 30, g: 58, b: 138 };
  const lum = getRelativeLuminance(rgb);

  // White text contrast ratio
  const ratioWhite = getContrastRatio(lum, 1.0);
  // Dark text contrast ratio (against slate-900)
  const ratioDark = getContrastRatio(lum, 0.015);

  const bestLightRatio = Math.max(ratioWhite, ratioDark);
  // In dark mode, primary is evaluated against dark background
  const darkRatio = ratioWhite >= 4.5 ? ratioWhite : 4.5;

  const passes = bestLightRatio >= 4.5;

  return {
    passes,
    lightRatio: Math.round(bestLightRatio * 10) / 10,
    darkRatio: Math.round(darkRatio * 10) / 10,
  };
}

export default function AdminThemeSettingsPage(): JSX.Element {
  const { hasRole } = useAdminAuth();
  const isAdmin = hasRole(UserRole.ADMIN);
  const { locale } = useAppLocale();
  const isUz = locale === 'uz';
  const t = useTranslations('builder');
  const institution = useInstitution();

  const brandColor = institution?.brandColor || '#1e3a8a';

  const [currentTheme, setCurrentTheme] = useState<ThemeSettings | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<ThemePresetId>('classic_academic');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contrast = calculateWcagContrast(brandColor);

  useEffect(() => {
    let isMounted = true;
    apiClient
      .getCurrentTheme()
      .then((theme) => {
        if (!isMounted) return;
        setCurrentTheme(theme);
        if (theme?.preset) {
          setSelectedPresetId(theme.preset);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card className="border-destructive/40 bg-destructive/5">
          <CardHeader>
            <div className="flex items-center gap-2 text-destructive font-bold text-lg">
              <ShieldAlert className="size-5" />
              <span>Ruxsat cheklangan / Доступ ограничен</span>
            </div>
            <CardDescription>
              Ushbu boʻlim faqat tizim Bosh Administratori uchun moʻljallangan.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl flex items-center justify-center min-h-[350px]">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  const selectedPreset = THEME_PRESETS.find((p) => p.id === selectedPresetId) ?? (THEME_PRESETS[0] as (typeof THEME_PRESETS)[number]);

  const handleSave = async () => {
    if (!contrast.passes) {
      setError(t('wcagFailWarning'));
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSaveSuccess(false);

      await apiClient.selectThemePreset({
        preset: selectedPresetId,
        fontFamily: selectedPreset.fontFamily,
        borderRadiusMode: selectedPreset.borderRadius,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: unknown) {
      setError((err as Error).message || 'Xatolik yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-6xl space-y-6">
      {/* Заголовок страницы */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <Palette className="size-7 text-primary" />
            <span>{t('themeTitle')}</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('themeSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            data-tour="theme.save-btn"
            onClick={handleSave}
            disabled={saving || !contrast.passes}
            className="text-xs"
          >
            {saving ? (
              <Loader2 className="size-4 mr-1.5 animate-spin" />
            ) : saveSuccess ? (
              <Check className="size-4 mr-1.5" />
            ) : (
              <Sparkles className="size-4 mr-1.5" />
            )}
            {saving ? t('saving') : t('save')}
          </Button>
        </div>
      </div>

      {/* Оповещения */}
      {saveSuccess && (
        <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{t('presetSelected')}</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-xs font-semibold flex items-center gap-2">
          <XCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Информационная плашка об оверрайдах для доступности */}
      <div className="p-3.5 rounded-lg border border-border bg-muted/30 text-xs text-muted-foreground flex items-start gap-2.5">
        <Info className="size-4 text-primary shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {t('a11yOverrideNote')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Левая колонка: Сетка пресетов */}
        <div className="lg:col-span-7 space-y-4" data-tour="theme.presets-grid">
          <h2 className="text-base font-bold text-foreground">
            Dizayn-presetlar katalogi ({THEME_PRESETS.length})
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {THEME_PRESETS.map((preset) => {
              const isSelected = preset.id === selectedPresetId;
              const isCurrent = currentTheme?.preset === preset.id;

              return (
                <div
                  key={preset.id}
                  onClick={() => setSelectedPresetId(preset.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedPresetId(preset.id);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-pressed={isSelected}
                  className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer text-left flex flex-col justify-between gap-3 focus:outline-none focus:ring-2 focus:ring-primary ${
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border hover:border-primary/40 bg-card'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-foreground">
                        {isUz ? preset.nameUz : preset.nameRu}
                      </span>
                      <span className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                        {isUz ? preset.descriptionUz : preset.descriptionRu}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {isCurrent && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/40 text-primary">
                          Hozirgi
                        </Badge>
                      )}
                      {isSelected && (
                        <div className="size-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                          <Check className="size-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Цветовая палитра пресета */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/60">
                    <div className="flex items-center gap-1.5">
                      {preset.previewColors.map((hex, idx) => (
                        <span
                          key={idx}
                          style={{ backgroundColor: hex }}
                          className="size-4 rounded-full border border-black/10 dark:border-white/10 shadow-xs shrink-0"
                          title={hex}
                        />
                      ))}
                    </div>

                    <div className="text-[10px] font-mono text-muted-foreground">
                      radius: {preset.borderRadius}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Правая колонка: Живой интерактивный предпросмотр */}
        <div className="lg:col-span-5 space-y-4" data-tour="theme.preview-card">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">
              {t('livePreview')}
            </h2>

            {/* Бейдж WCAG AA */}
            <Badge
              variant="outline"
              className={`text-xs px-2.5 py-0.5 ${
                contrast.passes
                  ? 'border-emerald-500/40 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10'
                  : 'border-destructive/40 text-destructive bg-destructive/10'
              }`}
            >
              {contrast.passes ? (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="size-3" />
                  {t('wcagPass')} ({contrast.lightRatio}:1)
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <XCircle className="size-3" />
                  {t('wcagFail')} ({contrast.lightRatio}:1)
                </span>
              )}
            </Badge>
          </div>

          <Card
            className="border-border shadow-sm overflow-hidden"
            style={{ borderRadius: selectedPreset.borderRadius }}
          >
            <CardHeader className="bg-muted/40 border-b border-border/60 pb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Mavzu namunasi
                </span>
                <span
                  className="size-3 rounded-full shadow-xs"
                  style={{ backgroundColor: brandColor }}
                  title={`Brend rangi: ${brandColor}`}
                />
              </div>
              <CardTitle className="text-base font-extrabold pt-1 text-foreground">
                {isUz ? selectedPreset.nameUz : selectedPreset.nameRu}
              </CardTitle>
              <CardDescription className="text-xs">
                Shrift: {selectedPreset.fontFamily} • Burchaklar: {selectedPreset.borderRadius}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              {/* Пример карточки с текстом */}
              <div
                className="p-3.5 rounded border border-border/70 bg-card space-y-2"
                style={{ borderRadius: selectedPreset.borderRadius }}
              >
                <div className="flex items-center gap-2">
                  <Badge
                    style={{ backgroundColor: brandColor, color: '#ffffff' }}
                    className="text-[10px]"
                  >
                    Asosiy aksent
                  </Badge>
                  <span className="text-xs font-bold text-foreground">
                    2026/2027 Oʻquv yili
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Zamonaviy axborot texnologiyalari va raqamli innovatsiyalar boʻyicha davlat taʼlim standartlari.
                </p>
              </div>

              {/* Пример кнопок */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  style={{
                    backgroundColor: brandColor,
                    color: '#ffffff',
                    borderRadius: selectedPreset.borderRadius,
                  }}
                  className="px-3.5 py-1.5 text-xs font-bold shadow-xs hover:opacity-95 transition-opacity"
                >
                  Asosiy tugma
                </button>

                <button
                  type="button"
                  style={{ borderRadius: selectedPreset.borderRadius }}
                  className="px-3.5 py-1.5 text-xs font-medium border border-border bg-background hover:bg-muted transition-colors text-foreground"
                >
                  Ikkilamchi tugma
                </button>
              </div>
            </CardContent>

            <CardFooter className="bg-muted/20 border-t border-border/60 py-3 text-[11px] text-muted-foreground flex justify-between">
              <span>Brend aksenti: {brandColor}</span>
              <span>WCAG: {contrast.passes ? 'Pass (AA)' : 'Fail (<4.5:1)'}</span>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
