'use client';

import React, { useState, useEffect } from 'react';
import {
  PageBlock,
  BlockStyleConfig,
  CardItem,
  TabItem,
  CarouselSlide,
  StatItem,
  TimelineItem,
  DocumentListItem,
  ReusableBlock,
} from '@college/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Settings,
  Upload,
  Plus,
  Trash2,
  Sliders,
  Type,
  ShieldCheck,
  EyeOff,
  Crosshair,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface BlockEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  block: PageBlock | null;
  isUz: boolean;
  onUpdateConfig: (newConfig: unknown, newStyle?: BlockStyleConfig) => void;
  onTriggerUpload: (field: string) => void;
}

export function BlockEditDialog({
  isOpen,
  onClose,
  block,
  isUz,
  onUpdateConfig,
  onTriggerUpload,
}: BlockEditDialogProps): JSX.Element | null {
  const [activeTab, setActiveTab] = useState<'content' | 'style'>('content');

  useEffect(() => {
    if (isOpen) setActiveTab('content');
  }, [isOpen]);

  if (!block) return null;

  const currentStyle: BlockStyleConfig = block.style || {
    marginTop: 'none',
    marginBottom: 'none',
    paddingTop: 'none',
    paddingBottom: 'none',
    textAlign: 'left',
    customClass: '',
  };

  const handleUpdateStyle = (patch: Partial<BlockStyleConfig>) => {
    const nextStyle: BlockStyleConfig = { ...currentStyle, ...patch };
    onUpdateConfig(block.config, nextStyle);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-sm font-bold">
              <Settings className="size-4 text-primary" />
              <span>
                {isUz
                  ? `Blok sozlamalari: ${block.type}`
                  : `Настройки блока: ${block.type}`}
              </span>
            </DialogTitle>
          </div>

          {/* Вкладки: Контент / Стиль */}
          <div className="flex items-center gap-1 p-1 bg-muted/60 border border-border rounded-lg mt-2">
            <button
              type="button"
              onClick={() => setActiveTab('content')}
              className={`flex-1 py-1.5 px-3 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'content'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Type className="size-3.5 text-primary" />
              <span>{isUz ? 'Kontent va maʼlumotlar' : 'Контент и поля'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('style')}
              className={`flex-1 py-1.5 px-3 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'style'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Sliders className="size-3.5 text-primary" />
              <span>{isUz ? 'Uslub va oraliqlar' : 'Стили и отступы'}</span>
            </button>
          </div>
        </DialogHeader>

        <div className="py-2">
          {activeTab === 'content' ? (
            <BlockFormFields
              block={block}
              isUz={isUz}
              onUpdate={(newCfg) => onUpdateConfig(newCfg, block.style)}
              onTriggerUpload={onTriggerUpload}
            />
          ) : (
            <BlockStyleFields
              block={block}
              style={currentStyle}
              isUz={isUz}
              onUpdateStyle={handleUpdateStyle}
            />
          )}
        </div>

        <DialogFooter>
          <Button type="button" size="sm" onClick={onClose} className="text-xs">
            {isUz ? 'Tayyor' : 'Готово'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Вкладка: Стили и отступы блока (с адаптивными переопределениями)
// ---------------------------------------------------------------------------
function BlockStyleFields({
  block,
  style,
  isUz,
  onUpdateStyle,
}: {
  block: PageBlock;
  style: BlockStyleConfig;
  isUz: boolean;
  onUpdateStyle: (patch: Partial<BlockStyleConfig>) => void;
}): JSX.Element {
  const isImageBlock =
    block.type === 'image' || block.type === 'hero' || block.type === 'image_text';

  // Проверка обязательного уставного контента по ст. 37 ЗРУ-637
  const isStatutoryMandatory =
    block.type === 'documents_list' ||
    block.type === 'contact_card' ||
    Boolean((block.config as Record<string, unknown>)?.isStatutory);

  const focalPoint = style.focalPoint || { x: 50, y: 50 };

  return (
    <div className="space-y-4 py-2 text-xs">
      {/* 1. Адаптивная видимость на устройствах */}
      <div className="space-y-2.5 p-3 rounded-xl border border-border bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
            <EyeOff className="size-3.5 text-primary" />
            <span>{isUz ? 'Qurilmalarda koʻrinishi' : 'Видимость блока на устройствах'}</span>
          </div>
          {isStatutoryMandatory && (
            <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] px-1.5 py-0 font-semibold flex items-center gap-1">
              <ShieldCheck className="size-3" />
              <span>ЗРУ-637</span>
            </Badge>
          )}
        </div>

        {isStatutoryMandatory && (
          <div className="p-2.5 rounded-lg border border-primary/30 bg-primary/5 text-primary text-[11px] flex items-start gap-2">
            <ShieldCheck className="size-4 shrink-0 mt-0.5" />
            <span className="leading-snug">
              {isUz
                ? 'Ushbu blok O‘zbekiston Respublikasi «Taʼlim to‘g‘risida»gi qonunining 37-moddasiga muvofiq majburiy axborot hisoblanadi va mobil qurilmalarda yashirilishi mumkin emas.'
                : 'Данный блок содержит обязательную информацию согласно ст. 37 ЗРУ-637 и не может быть скрыт на мобильных устройствах.'}
            </span>
          </div>
        )}

        <div className="space-y-2 text-xs pt-1">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              {isUz ? 'Mobil telefonlarda yashirish (<640px)' : 'Скрыть на мобильных (<640px)'}
            </span>
            <Switch
              checked={Boolean(style.hideOnMobile)}
              disabled={isStatutoryMandatory}
              onCheckedChange={(val) => onUpdateStyle({ hideOnMobile: val })}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              {isUz ? 'Planshetlarda yashirish (640-1023px)' : 'Скрыть на планшетах (640-1023px)'}
            </span>
            <Switch
              checked={Boolean(style.hideOnTablet)}
              onCheckedChange={(val) => onUpdateStyle({ hideOnTablet: val })}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              {isUz ? 'Kompyuterlarda yashirish (≥1024px)' : 'Скрыть на десктопе (≥1024px)'}
            </span>
            <Switch
              checked={Boolean(style.hideOnDesktop)}
              onCheckedChange={(val) => onUpdateStyle({ hideOnDesktop: val })}
            />
          </div>
        </div>

        {style.hideOnMobile && style.hideOnTablet && style.hideOnDesktop && (
          <div className="p-2 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive text-[11px] flex items-center gap-1.5">
            <AlertTriangle className="size-3.5 shrink-0" />
            <span>
              {isUz
                ? 'Diqqat: blok barcha qurilmalarda yashirilgan va koʻrinmaydi!'
                : 'Внимание: блок скрыт на всех типах устройств и не будет виден!'}
            </span>
          </div>
        )}
      </div>

      {/* 2. Для блоков с изображениями: Точка фокуса (Focal Point) и Пропорции (Aspect Ratio) */}
      {isImageBlock && (
        <div className="space-y-3 p-3 rounded-xl border border-border bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
              <Crosshair className="size-3.5 text-primary" />
              <span>{isUz ? 'Fokus nuqtasi va nisbatlar' : 'Точка фокуса и пропорции'}</span>
            </div>
            <button
              type="button"
              onClick={() =>
                onUpdateStyle({
                  focalPoint: { x: 50, y: 50 },
                  aspectRatioPreset: 'original',
                })
              }
              className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1"
              title={isUz ? 'Tiklash' : 'Сброс'}
            >
              <RotateCcw className="size-2.5" />
              <span>{isUz ? 'Tiklash' : 'Сброс'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <div>
              <label className="font-semibold text-foreground block mb-1">
                {isUz ? 'Tasvir nisbati (Aspect Ratio)' : 'Пропорции (Aspect Ratio)'}
              </label>
              <select
                value={style.aspectRatioPreset || 'original'}
                onChange={(e) =>
                  onUpdateStyle({
                    aspectRatioPreset: e.target.value as BlockStyleConfig['aspectRatioPreset'],
                  })
                }
                className="w-full p-2 rounded-md border border-border bg-background"
              >
                <option value="original">{isUz ? 'Asl nisbat (Auto)' : 'Естественный (Auto)'}</option>
                <option value="16:9">{isUz ? 'Keng (16:9)' : 'Широкоформатный (16:9)'}</option>
                <option value="4:3">{isUz ? 'Standart (4:3)' : 'Классический (4:3)'}</option>
                <option value="1:1">{isUz ? 'Kvadrat (1:1)' : 'Квадратный (1:1)'}</option>
                <option value="3:4">{isUz ? 'Vertikal (3:4)' : 'Портретный (3:4)'}</option>
              </select>
            </div>

            <div className="flex items-center gap-3 bg-card p-2 rounded-lg border border-border">
              {/* Визуальный предпросмотр точки фокуса */}
              <div className="relative size-14 rounded border border-border bg-muted/70 shrink-0 overflow-hidden">
                <div
                  className="absolute size-2.5 rounded-full bg-primary border border-white -translate-x-1/2 -translate-y-1/2 shadow-xs transition-all pointer-events-none"
                  style={{ left: `${focalPoint.x}%`, top: `${focalPoint.y}%` }}
                />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>X: {focalPoint.x}%</span>
                  <span>Y: {focalPoint.y}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={focalPoint.x}
                  onChange={(e) =>
                    onUpdateStyle({
                      focalPoint: { ...focalPoint, x: Number(e.target.value) },
                    })
                  }
                  className="w-full h-1 bg-muted rounded appearance-none cursor-pointer accent-primary"
                  aria-label="Focal X"
                />
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={focalPoint.y}
                  onChange={(e) =>
                    onUpdateStyle({
                      focalPoint: { ...focalPoint, y: Number(e.target.value) },
                    })
                  }
                  className="w-full h-1 bg-muted rounded appearance-none cursor-pointer accent-primary"
                  aria-label="Focal Y"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Отступы (Margins & Paddings) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="font-semibold text-foreground block mb-1">
            {isUz ? 'Yuqori tashqi oraliq (Margin Top)' : 'Внешний отступ сверху (Margin Top)'}
          </label>
          <select
            value={style.marginTop || 'none'}
            onChange={(e) =>
              onUpdateStyle({ marginTop: e.target.value as BlockStyleConfig['marginTop'] })
            }
            className="w-full p-2 rounded-md border border-border bg-background"
          >
            <option value="none">{isUz ? 'Yoʻq (0)' : 'Нет (0)'}</option>
            <option value="small">{isUz ? 'Kichik (8px)' : 'Малый (8px)'}</option>
            <option value="normal">{isUz ? 'Standart (24px)' : 'Стандартный (24px)'}</option>
            <option value="large">{isUz ? 'Katta (40px)' : 'Большой (40px)'}</option>
          </select>
        </div>

        <div>
          <label className="font-semibold text-foreground block mb-1">
            {isUz ? 'Quyi tashqi oraliq (Margin Bottom)' : 'Внешний отступ снизу (Margin Bottom)'}
          </label>
          <select
            value={style.marginBottom || 'none'}
            onChange={(e) =>
              onUpdateStyle({ marginBottom: e.target.value as BlockStyleConfig['marginBottom'] })
            }
            className="w-full p-2 rounded-md border border-border bg-background"
          >
            <option value="none">{isUz ? 'Yoʻq (0)' : 'Нет (0)'}</option>
            <option value="small">{isUz ? 'Kichik (8px)' : 'Малый (8px)'}</option>
            <option value="normal">{isUz ? 'Standart (24px)' : 'Стандартный (24px)'}</option>
            <option value="large">{isUz ? 'Katta (40px)' : 'Большой (40px)'}</option>
          </select>
        </div>

        <div>
          <label className="font-semibold text-foreground block mb-1">
            {isUz ? 'Ichki yuqori oraliq (Padding Top)' : 'Внутренний отступ сверху (Padding Top)'}
          </label>
          <select
            value={style.paddingTop || 'none'}
            onChange={(e) =>
              onUpdateStyle({ paddingTop: e.target.value as BlockStyleConfig['paddingTop'] })
            }
            className="w-full p-2 rounded-md border border-border bg-background"
          >
            <option value="none">{isUz ? 'Yoʻq (0)' : 'Нет (0)'}</option>
            <option value="small">{isUz ? 'Kichik (8px)' : 'Малый (8px)'}</option>
            <option value="normal">{isUz ? 'Standart (24px)' : 'Стандартный (24px)'}</option>
            <option value="large">{isUz ? 'Katta (40px)' : 'Большой (40px)'}</option>
          </select>
        </div>

        <div>
          <label className="font-semibold text-foreground block mb-1">
            {isUz ? 'Ichki quyi oraliq (Padding Bottom)' : 'Внутренний отступ снизу (Padding Bottom)'}
          </label>
          <select
            value={style.paddingBottom || 'none'}
            onChange={(e) =>
              onUpdateStyle({ paddingBottom: e.target.value as BlockStyleConfig['paddingBottom'] })
            }
            className="w-full p-2 rounded-md border border-border bg-background"
          >
            <option value="none">{isUz ? 'Yoʻq (0)' : 'Нет (0)'}</option>
            <option value="small">{isUz ? 'Kichik (8px)' : 'Малый (8px)'}</option>
            <option value="normal">{isUz ? 'Standart (24px)' : 'Стандартный (24px)'}</option>
            <option value="large">{isUz ? 'Katta (40px)' : 'Большой (40px)'}</option>
          </select>
        </div>
      </div>

      {/* 4. Выравнивание и пользовательский класс */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <div>
          <label className="font-semibold text-foreground block mb-1">
            {isUz ? 'Matnni tekislash' : 'Выравнивание текста'}
          </label>
          <select
            value={style.textAlign || 'left'}
            onChange={(e) =>
              onUpdateStyle({ textAlign: e.target.value as BlockStyleConfig['textAlign'] })
            }
            className="w-full p-2 rounded-md border border-border bg-background"
          >
            <option value="left">{isUz ? 'Chap tomonga' : 'По левому краю'}</option>
            <option value="center">{isUz ? 'Markazga' : 'По центру'}</option>
            <option value="right">{isUz ? 'Oʻng tomonga' : 'По правому краю'}</option>
          </select>
        </div>

        <div>
          <label className="font-semibold text-foreground block mb-1">
            {isUz ? 'Maxsus CSS-klass' : 'Пользовательский CSS-класс'}
          </label>
          <Input
            value={style.customClass || ''}
            onChange={(e) => onUpdateStyle({ customClass: e.target.value })}
            placeholder="masalan: border-primary shadow-lg"
            className="text-xs"
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Вкладка: Контент и поля всех блоков (Content Fields)
// ---------------------------------------------------------------------------
export function BlockFormFields({
  block,
  isUz,
  onUpdate,
  onTriggerUpload,
}: {
  block: PageBlock;
  isUz: boolean;
  onUpdate: (cfg: unknown) => void;
  onTriggerUpload: (field: string) => void;
}): JSX.Element {
  const cfg = (block.config || {}) as Record<string, unknown>;

  const updateField = (key: string, val: unknown) => {
    onUpdate({ ...cfg, [key]: val });
  };

  switch (block.type) {
    // 1. Heading
    case 'heading': {
      const level = (cfg.level as number) || 2;
      const textUz = (cfg.textUz as string) || '';
      const textRu = (cfg.textRu as string) || '';
      const align = (cfg.align as string) || 'left';

      return (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                {isUz ? 'Sarlavha darajasi' : 'Уровень заголовка'}
              </label>
              <select
                value={level}
                onChange={(e) => updateField('level', Number(e.target.value))}
                className="w-full text-xs p-2 rounded-md border border-border bg-background"
              >
                <option value={1}>H1 — Asosiy sarlavha</option>
                <option value={2}>H2 — Boʻlim sarlavhasi</option>
                <option value={3}>H3 — Kichik sarlavha</option>
                <option value={4}>H4 — 4-daraja</option>
                <option value={5}>H5 — 5-daraja</option>
                <option value={6}>H6 — 6-daraja</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                {isUz ? 'Tekislash' : 'Выравнивание'}
              </label>
              <select
                value={align}
                onChange={(e) => updateField('align', e.target.value)}
                className="w-full text-xs p-2 rounded-md border border-border bg-background"
              >
                <option value="left">{isUz ? 'Chapga' : 'По левому краю'}</option>
                <option value="center">{isUz ? 'Markazga' : 'По центру'}</option>
                <option value="right">{isUz ? 'Oʻngga' : 'По правому краю'}</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              {isUz ? 'Sarlavha matni (Oʻzbekcha) *' : 'Текст заголовка (Узбекский) *'}
            </label>
            <Input
              value={textUz}
              onChange={(e) => updateField('textUz', e.target.value)}
              className="text-xs"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              {isUz ? 'Sarlavha matni (Ruscha) *' : 'Текст заголовка (Русский) *'}
            </label>
            <Input
              value={textRu}
              onChange={(e) => updateField('textRu', e.target.value)}
              className="text-xs"
            />
          </div>
        </div>
      );
    }

    // 2. Rich Text
    case 'rich_text': {
      const contentUzHtml = (cfg.contentUzHtml as string) || '';
      const contentRuHtml = (cfg.contentRuHtml as string) || '';

      return (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              {isUz ? 'Matn (Oʻzbekcha HTML)' : 'Текст (HTML, Узбекский)'}
            </label>
            <Textarea
              value={contentUzHtml}
              onChange={(e) => updateField('contentUzHtml', e.target.value)}
              rows={5}
              className="text-xs font-mono"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              {isUz ? 'Matn (Ruscha HTML)' : 'Текст (HTML, Русский)'}
            </label>
            <Textarea
              value={contentRuHtml}
              onChange={(e) => updateField('contentRuHtml', e.target.value)}
              rows={5}
              className="text-xs font-mono"
            />
          </div>
        </div>
      );
    }

    // 3. Hero
    case 'hero': {
      const titleUz = (cfg.titleUz as string) || '';
      const titleRu = (cfg.titleRu as string) || '';
      const badgeUz = (cfg.badgeUz as string) || '';
      const badgeRu = (cfg.badgeRu as string) || '';
      const subtitleUz = (cfg.subtitleUz as string) || '';
      const subtitleRu = (cfg.subtitleRu as string) || '';
      const pTextUz = (cfg.primaryActionTextUz as string) || '';
      const pUrl = (cfg.primaryActionUrl as string) || '';
      const imageUrl = (cfg.imageUrl as string) || '';
      const imageAltUz = (cfg.imageAltUz as string) || '';

      return (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                {isUz ? 'Nishon (Badge UZ)' : 'Бейдж (UZ)'}
              </label>
              <Input
                value={badgeUz}
                onChange={(e) => updateField('badgeUz', e.target.value)}
                className="text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                {isUz ? 'Nishon (Badge RU)' : 'Бейдж (RU)'}
              </label>
              <Input
                value={badgeRu}
                onChange={(e) => updateField('badgeRu', e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                {isUz ? 'Bosh sarlavha (UZ) *' : 'Главный заголовок (UZ) *'}
              </label>
              <Input
                value={titleUz}
                onChange={(e) => updateField('titleUz', e.target.value)}
                className="text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                {isUz ? 'Bosh sarlavha (RU) *' : 'Главный заголовок (RU) *'}
              </label>
              <Input
                value={titleRu}
                onChange={(e) => updateField('titleRu', e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              {isUz ? 'Quyi sarlavha / Taʼrif (UZ)' : 'Подзаголовок (UZ)'}
            </label>
            <Textarea
              value={subtitleUz}
              onChange={(e) => updateField('subtitleUz', e.target.value)}
              rows={2}
              className="text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              {isUz ? 'Quyi sarlavha / Taʼrif (RU)' : 'Подзаголовок (RU)'}
            </label>
            <Textarea
              value={subtitleRu}
              onChange={(e) => updateField('subtitleRu', e.target.value)}
              rows={2}
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                {isUz ? 'Tugma matni' : 'Текст кнопки'}
              </label>
              <Input
                value={pTextUz}
                onChange={(e) => updateField('primaryActionTextUz', e.target.value)}
                className="text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                {isUz ? 'Tugma havolasi' : 'Ссылка кнопки'}
              </label>
              <Input
                value={pUrl}
                onChange={(e) => updateField('primaryActionUrl', e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              {isUz ? 'Rasm URL manzili' : 'URL изображения'}
            </label>
            <div className="flex gap-2">
              <Input
                value={imageUrl}
                onChange={(e) => updateField('imageUrl', e.target.value)}
                className="text-xs flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onTriggerUpload('imageUrl')}
                className="text-xs shrink-0"
              >
                <Upload className="size-3.5 mr-1" />
                <span>{isUz ? 'Yuklash' : 'Загрузить'}</span>
              </Button>
            </div>
          </div>

          {imageUrl && (
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                {isUz ? 'Rasmning Alt-matni (A11y) *' : 'Alt-текст изображения (A11y) *'}
              </label>
              <Input
                value={imageAltUz}
                onChange={(e) => updateField('imageAltUz', e.target.value)}
                placeholder="Rasmda nima tasvirlangan?"
                className="text-xs"
              />
            </div>
          )}
        </div>
      );
    }

    // 4. Cards Grid
    case 'cards_grid': {
      const titleUz = (cfg.titleUz as string) || '';
      const titleRu = (cfg.titleRu as string) || '';
      const columns = (cfg.columns as number) || 3;
      const cards = (cfg.cards as CardItem[]) || [];

      const addCard = () => {
        const newCard: CardItem = {
          id: `card-${Date.now()}`,
          titleUz: 'Yangi yoʻnalish',
          titleRu: 'Новое направление',
          descriptionUz: 'Yoʻnalish tavsifi',
          descriptionRu: 'Описание направления',
          badgeUz: 'Yangi',
          badgeRu: 'Новое',
          linkUrl: '/specialties',
        };
        updateField('cards', [...cards, newCard]);
      };

      const updateCard = (idx: number, patch: Partial<CardItem>) => {
        const next = [...cards];
        next[idx] = { ...next[idx]!, ...patch };
        updateField('cards', next);
      };

      const removeCard = (idx: number) => {
        updateField('cards', cards.filter((_, i) => i !== idx));
      };

      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                {isUz ? 'Sarlavha (UZ)' : 'Заголовок (UZ)'}
              </label>
              <Input
                value={titleUz}
                onChange={(e) => updateField('titleUz', e.target.value)}
                className="text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                {isUz ? 'Sarlavha (RU)' : 'Заголовок (RU)'}
              </label>
              <Input
                value={titleRu}
                onChange={(e) => updateField('titleRu', e.target.value)}
                className="text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                {isUz ? 'Ustunlar soni' : 'Колонки'}
              </label>
              <select
                value={columns}
                onChange={(e) => updateField('columns', Number(e.target.value))}
                className="w-full text-xs p-2 rounded-md border border-border bg-background"
              >
                <option value={2}>2 ta ustun</option>
                <option value={3}>3 ta ustun</option>
                <option value={4}>4 ta ustun</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">
                {isUz ? `Kartochkalar roʻyxati (${cards.length})` : `Карточки (${cards.length})`}
              </span>
              <Button type="button" size="sm" variant="outline" onClick={addCard} className="text-xs h-7">
                <Plus className="size-3 mr-1" />
                <span>{isUz ? 'Kartochka qoʻshish' : 'Добавить'}</span>
              </Button>
            </div>

            {cards.map((c, idx) => (
              <div key={c.id} className="p-3 rounded-lg border border-border bg-muted/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">#{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeCard(idx)}
                    className="text-destructive hover:opacity-80 p-1"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Input
                    value={c.titleUz}
                    onChange={(e) => updateCard(idx, { titleUz: e.target.value })}
                    placeholder="Sarlavha (UZ)"
                    className="text-xs"
                  />
                  <Input
                    value={c.titleRu}
                    onChange={(e) => updateCard(idx, { titleRu: e.target.value })}
                    placeholder="Заголовок (RU)"
                    className="text-xs"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Input
                    value={c.badgeUz || ''}
                    onChange={(e) => updateCard(idx, { badgeUz: e.target.value })}
                    placeholder="Nishon (Badge)"
                    className="text-xs"
                  />
                  <Input
                    value={c.linkUrl || ''}
                    onChange={(e) => updateCard(idx, { linkUrl: e.target.value })}
                    placeholder="Havola (URL)"
                    className="text-xs"
                  />
                </div>
                <Textarea
                  value={c.descriptionUz || ''}
                  onChange={(e) => updateCard(idx, { descriptionUz: e.target.value })}
                  placeholder="Tavsif matni"
                  rows={2}
                  className="text-xs"
                />
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 5. Tabs
    case 'tabs': {
      const titleUz = (cfg.titleUz as string) || '';
      const titleRu = (cfg.titleRu as string) || '';
      const items = (cfg.items as TabItem[]) || [];

      const addTab = () => {
        const newTab: TabItem = {
          id: `tab-${Date.now()}`,
          labelUz: 'Yangi vkladka',
          labelRu: 'Новая вкладка',
          contentUzHtml: '<p>Vkladka matni</p>',
          contentRuHtml: '<p>Текст вкладки</p>',
        };
        updateField('items', [...items, newTab]);
      };

      const updateTab = (idx: number, patch: Partial<TabItem>) => {
        const next = [...items];
        next[idx] = { ...next[idx]!, ...patch };
        updateField('items', next);
      };

      const removeTab = (idx: number) => {
        if (items.length <= 1) return;
        updateField('items', items.filter((_, i) => i !== idx));
      };

      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                {isUz ? 'Sarlavha (UZ)' : 'Заголовок (UZ)'}
              </label>
              <Input
                value={titleUz}
                onChange={(e) => updateField('titleUz', e.target.value)}
                className="text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                {isUz ? 'Sarlavha (RU)' : 'Заголовок (RU)'}
              </label>
              <Input
                value={titleRu}
                onChange={(e) => updateField('titleRu', e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">
                {isUz ? `Vkladkalar (${items.length})` : `Вкладки (${items.length})`}
              </span>
              <Button type="button" size="sm" variant="outline" onClick={addTab} className="text-xs h-7">
                <Plus className="size-3 mr-1" />
                <span>{isUz ? 'Vkladka qoʻshish' : 'Добавить вкладку'}</span>
              </Button>
            </div>

            {items.map((tab, idx) => (
              <div key={tab.id} className="p-3 rounded-lg border border-border bg-muted/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">#{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeTab(idx)}
                    disabled={items.length <= 1}
                    className="text-destructive hover:opacity-80 p-1 disabled:opacity-30"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Input
                    value={tab.labelUz}
                    onChange={(e) => updateTab(idx, { labelUz: e.target.value })}
                    placeholder="Vkladka nomi (UZ)"
                    className="text-xs"
                  />
                  <Input
                    value={tab.labelRu}
                    onChange={(e) => updateTab(idx, { labelRu: e.target.value })}
                    placeholder="Название вкладки (RU)"
                    className="text-xs"
                  />
                </div>
                <Textarea
                  value={tab.contentUzHtml}
                  onChange={(e) => updateTab(idx, { contentUzHtml: e.target.value })}
                  placeholder="Vkladka mazmuni (HTML, UZ)"
                  rows={3}
                  className="text-xs font-mono"
                />
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 6. Image Carousel (WCAG 2.2.2)
    case 'image_carousel': {
      const titleUz = (cfg.titleUz as string) || '';
      const titleRu = (cfg.titleRu as string) || '';
      const autoAdvance = Boolean(cfg.autoAdvance);
      const intervalSeconds = (cfg.intervalSeconds as number) || 5;
      const slides = (cfg.slides as CarouselSlide[]) || [];

      const addSlide = () => {
        const newSlide: CarouselSlide = {
          id: `sl-${Date.now()}`,
          imageUrl: '/images/news/champion-2026.svg',
          altTextUz: 'Yangi rasm tavsifi',
          altTextRu: 'Описание нового изображения',
        };
        updateField('slides', [...slides, newSlide]);
      };

      const updateSlide = (idx: number, patch: Partial<CarouselSlide>) => {
        const next = [...slides];
        next[idx] = { ...next[idx]!, ...patch };
        updateField('slides', next);
      };

      const removeSlide = (idx: number) => {
        if (slides.length <= 1) return;
        updateField('slides', slides.filter((_, i) => i !== idx));
      };

      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                {isUz ? 'Sarlavha (UZ)' : 'Заголовок (UZ)'}
              </label>
              <Input
                value={titleUz}
                onChange={(e) => updateField('titleUz', e.target.value)}
                className="text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                {isUz ? 'Sarlavha (RU)' : 'Заголовок (RU)'}
              </label>
              <Input
                value={titleRu}
                onChange={(e) => updateField('titleRu', e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <div className="p-3 rounded-lg border border-border bg-muted/40 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-foreground block">
                  {isUz ? 'Avtomatik aylanish (Auto-advance)' : 'Автопрокрутка слайдов'}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {isUz
                    ? 'WCAG 2.2.2 boʻyicha pauza tugmasi majburiy va oʻchirilgan tavsiya etiladi'
                    : 'По стандарту WCAG 2.2.2 рекомендуется отключить по умолчанию'}
                </span>
              </div>
              <Switch checked={autoAdvance} onCheckedChange={(val) => updateField('autoAdvance', val)} />
            </div>

            {autoAdvance && (
              <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                <span className="text-xs text-foreground">
                  {isUz ? 'Aylanish oraligʻi (soniya)' : 'Интервал переключения (сек)'}
                </span>
                <Input
                  type="number"
                  min={3}
                  max={30}
                  value={intervalSeconds}
                  onChange={(e) => updateField('intervalSeconds', Number(e.target.value) || 5)}
                  className="w-20 text-xs text-right h-8"
                />
              </div>
            )}
          </div>

          <div className="space-y-3 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">
                {isUz ? `Slaydlar (${slides.length})` : `Слайды (${slides.length})`}
              </span>
              <Button type="button" size="sm" variant="outline" onClick={addSlide} className="text-xs h-7">
                <Plus className="size-3 mr-1" />
                <span>{isUz ? 'Slayd qoʻshish' : 'Добавить слайд'}</span>
              </Button>
            </div>

            {slides.map((s, idx) => (
              <div key={s.id} className="p-3 rounded-lg border border-border bg-muted/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">Slayd #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeSlide(idx)}
                    disabled={slides.length <= 1}
                    className="text-destructive hover:opacity-80 p-1 disabled:opacity-30"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground block mb-0.5">Rasm URL</label>
                  <Input
                    value={s.imageUrl}
                    onChange={(e) => updateSlide(idx, { imageUrl: e.target.value })}
                    className="text-xs"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Input
                    value={s.altTextUz}
                    onChange={(e) => updateSlide(idx, { altTextUz: e.target.value })}
                    placeholder="Alt-matn (UZ) *"
                    className="text-xs"
                  />
                  <Input
                    value={s.altTextRu}
                    onChange={(e) => updateSlide(idx, { altTextRu: e.target.value })}
                    placeholder="Alt-текст (RU) *"
                    className="text-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 7. Stats Counter
    case 'stats_counter': {
      const titleUz = (cfg.titleUz as string) || '';
      const titleRu = (cfg.titleRu as string) || '';
      const stats = (cfg.stats as StatItem[]) || [];

      const addStat = () => {
        const newStat: StatItem = {
          id: `st-${Date.now()}`,
          value: '100+',
          labelUz: 'Koʻrsatkich',
          labelRu: 'Показатель',
        };
        updateField('stats', [...stats, newStat]);
      };

      const updateStat = (idx: number, patch: Partial<StatItem>) => {
        const next = [...stats];
        next[idx] = { ...next[idx]!, ...patch };
        updateField('stats', next);
      };

      const removeStat = (idx: number) => {
        updateField('stats', stats.filter((_, i) => i !== idx));
      };

      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                {isUz ? 'Sarlavha (UZ)' : 'Заголовок (UZ)'}
              </label>
              <Input
                value={titleUz}
                onChange={(e) => updateField('titleUz', e.target.value)}
                className="text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                {isUz ? 'Sarlavha (RU)' : 'Заголовок (RU)'}
              </label>
              <Input
                value={titleRu}
                onChange={(e) => updateField('titleRu', e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">
                {isUz ? `Koʻrsatkichlar (${stats.length})` : `Показатели (${stats.length})`}
              </span>
              <Button type="button" size="sm" variant="outline" onClick={addStat} className="text-xs h-7">
                <Plus className="size-3 mr-1" />
                <span>{isUz ? 'Qoʻshish' : 'Добавить'}</span>
              </Button>
            </div>

            {stats.map((st, idx) => (
              <div key={st.id} className="p-3 rounded-lg border border-border bg-muted/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">#{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeStat(idx)}
                    className="text-destructive hover:opacity-80 p-1"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Input
                    value={st.value}
                    onChange={(e) => updateStat(idx, { value: e.target.value })}
                    placeholder="Raqam (masalan: 1,200+)"
                    className="text-xs font-bold text-primary"
                  />
                  <Input
                    value={st.labelUz}
                    onChange={(e) => updateStat(idx, { labelUz: e.target.value })}
                    placeholder="Nomi (UZ)"
                    className="text-xs"
                  />
                  <Input
                    value={st.labelRu}
                    onChange={(e) => updateStat(idx, { labelRu: e.target.value })}
                    placeholder="Название (RU)"
                    className="text-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 8. Timeline
    case 'timeline': {
      const titleUz = (cfg.titleUz as string) || '';
      const titleRu = (cfg.titleRu as string) || '';
      const items = (cfg.items as TimelineItem[]) || [];

      const addItem = () => {
        const newItem: TimelineItem = {
          id: `tm-${Date.now()}`,
          dateOrYear: '2026-yil',
          titleUz: 'Yangi voqea',
          titleRu: 'Новое событие',
          descriptionUz: 'Voqea tavsifi',
          descriptionRu: 'Описание события',
        };
        updateField('items', [...items, newItem]);
      };

      const updateItem = (idx: number, patch: Partial<TimelineItem>) => {
        const next = [...items];
        next[idx] = { ...next[idx]!, ...patch };
        updateField('items', next);
      };

      const removeItem = (idx: number) => {
        updateField('items', items.filter((_, i) => i !== idx));
      };

      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                {isUz ? 'Sarlavha (UZ)' : 'Заголовок (UZ)'}
              </label>
              <Input
                value={titleUz}
                onChange={(e) => updateField('titleUz', e.target.value)}
                className="text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                {isUz ? 'Sarlavha (RU)' : 'Заголовок (RU)'}
              </label>
              <Input
                value={titleRu}
                onChange={(e) => updateField('titleRu', e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">
                {isUz ? `Voqealar (${items.length})` : `События (${items.length})`}
              </span>
              <Button type="button" size="sm" variant="outline" onClick={addItem} className="text-xs h-7">
                <Plus className="size-3 mr-1" />
                <span>{isUz ? 'Voqea qoʻshish' : 'Добавить'}</span>
              </Button>
            </div>

            {items.map((item, idx) => (
              <div key={item.id} className="p-3 rounded-lg border border-border bg-muted/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">#{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="text-destructive hover:opacity-80 p-1"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Input
                    value={item.dateOrYear}
                    onChange={(e) => updateItem(idx, { dateOrYear: e.target.value })}
                    placeholder="Sana / Yil"
                    className="text-xs font-bold"
                  />
                  <Input
                    value={item.titleUz}
                    onChange={(e) => updateItem(idx, { titleUz: e.target.value })}
                    placeholder="Voqea sarlavhasi (UZ)"
                    className="text-xs"
                  />
                  <Input
                    value={item.titleRu}
                    onChange={(e) => updateItem(idx, { titleRu: e.target.value })}
                    placeholder="Название (RU)"
                    className="text-xs"
                  />
                </div>
                <Textarea
                  value={item.descriptionUz || ''}
                  onChange={(e) => updateItem(idx, { descriptionUz: e.target.value })}
                  placeholder="Voqea tavsifi (UZ)"
                  rows={2}
                  className="text-xs"
                />
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 9. Documents List
    case 'documents_list': {
      const titleUz = (cfg.titleUz as string) || '';
      const titleRu = (cfg.titleRu as string) || '';
      const enableSearch = Boolean(cfg.enableSearch);
      const docs = (cfg.documents as DocumentListItem[]) || [];

      const addDoc = () => {
        const newDoc: DocumentListItem = {
          id: `doc-${Date.now()}`,
          titleUz: 'Yangi rasmiy hujjat',
          titleRu: 'Новый официальный документ',
          fileUrl: '/documents/sample.pdf',
          fileType: 'pdf',
        };
        updateField('documents', [...docs, newDoc]);
      };

      const updateDoc = (idx: number, patch: Partial<DocumentListItem>) => {
        const next = [...docs];
        next[idx] = { ...next[idx]!, ...patch };
        updateField('documents', next);
      };

      const removeDoc = (idx: number) => {
        updateField('documents', docs.filter((_, i) => i !== idx));
      };

      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                {isUz ? 'Sarlavha (UZ)' : 'Заголовок (UZ)'}
              </label>
              <Input
                value={titleUz}
                onChange={(e) => updateField('titleUz', e.target.value)}
                className="text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                {isUz ? 'Sarlavha (RU)' : 'Заголовок (RU)'}
              </label>
              <Input
                value={titleRu}
                onChange={(e) => updateField('titleRu', e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border">
            <span className="text-xs font-semibold">{isUz ? 'Qidiruv maydonini yoqish' : 'Включить строку поиска'}</span>
            <Switch checked={enableSearch} onCheckedChange={(val) => updateField('enableSearch', val)} />
          </div>

          <div className="space-y-3 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">
                {isUz ? `Hujjatlar (${docs.length})` : `Документы (${docs.length})`}
              </span>
              <Button type="button" size="sm" variant="outline" onClick={addDoc} className="text-xs h-7">
                <Plus className="size-3 mr-1" />
                <span>{isUz ? 'Hujjat qoʻshish' : 'Добавить'}</span>
              </Button>
            </div>

            {docs.map((doc, idx) => (
              <div key={doc.id} className="p-3 rounded-lg border border-border bg-muted/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">#{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeDoc(idx)}
                    className="text-destructive hover:opacity-80 p-1"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Input
                    value={doc.titleUz}
                    onChange={(e) => updateDoc(idx, { titleUz: e.target.value })}
                    placeholder="Hujjat nomi (UZ)"
                    className="text-xs"
                  />
                  <Input
                    value={doc.titleRu}
                    onChange={(e) => updateDoc(idx, { titleRu: e.target.value })}
                    placeholder="Название (RU)"
                    className="text-xs"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Input
                    value={doc.documentNumber || ''}
                    onChange={(e) => updateDoc(idx, { documentNumber: e.target.value })}
                    placeholder="Hujjat raqami (masalan: № 14-B)"
                    className="text-xs"
                  />
                  <Input
                    value={doc.fileUrl}
                    onChange={(e) => updateDoc(idx, { fileUrl: e.target.value })}
                    placeholder="Fayl URL manzili"
                    className="text-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 10. Map Embed
    case 'map_embed': {
      const titleUz = (cfg.titleUz as string) || '';
      const titleRu = (cfg.titleRu as string) || '';
      const lat = (cfg.latitude as number) || 40.3864;
      const lon = (cfg.longitude as number) || 71.7864;
      const height = (cfg.height as number) || 360;

      return (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                {isUz ? 'Sarlavha (UZ)' : 'Заголовок (UZ)'}
              </label>
              <Input
                value={titleUz}
                onChange={(e) => updateField('titleUz', e.target.value)}
                className="text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                {isUz ? 'Sarlavha (RU)' : 'Заголовок (RU)'}
              </label>
              <Input
                value={titleRu}
                onChange={(e) => updateField('titleRu', e.target.value)}
                className="text-xs"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Kenglik (Latitude)</label>
              <Input
                type="number"
                step="0.0001"
                value={lat}
                onChange={(e) => updateField('latitude', Number(e.target.value))}
                className="text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Uzunlik (Longitude)</label>
              <Input
                type="number"
                step="0.0001"
                value={lon}
                onChange={(e) => updateField('longitude', Number(e.target.value))}
                className="text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Balandlik (px)</label>
              <Input
                type="number"
                value={height}
                onChange={(e) => updateField('height', Number(e.target.value))}
                className="text-xs"
              />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground italic">
            {isUz
              ? 'OpenStreetMap xaritasi Oʻzbekiston qonunchiligiga toʻliq mos va bepul koʻrsatiladi.'
              : 'Карта OpenStreetMap полностью бесплатна и соответствует требованиям законодательства РУз.'}
          </p>
        </div>
      );
    }

    // 11. Reusable Reference Block
    case 'reusable_ref': {
      const reusableBlockId = (cfg.reusableBlockId as string) || '';
      return <ReusableBlockSelector blockId={reusableBlockId} isUz={isUz} onSelect={(id) => updateField('reusableBlockId', id)} />;
    }

    // 12. Dynamic feeds & widgets
    case 'specialties_feed':
    case 'events_feed':
    case 'schedule_widget':
    case 'staff_cards':
    case 'latest_news_list':
    case 'teachers_list': {
      const titleUz = (cfg.titleUz as string) || '';
      const titleRu = (cfg.titleRu as string) || '';
      const limit = (cfg.limit as number) || 4;

      return (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                {isUz ? 'Vidjet sarlavhasi (UZ)' : 'Заголовок виджета (UZ)'}
              </label>
              <Input
                value={titleUz}
                onChange={(e) => updateField('titleUz', e.target.value)}
                className="text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                {isUz ? 'Vidjet sarlavhasi (RU)' : 'Заголовок виджета (RU)'}
              </label>
              <Input
                value={titleRu}
                onChange={(e) => updateField('titleRu', e.target.value)}
                className="text-xs"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              {isUz ? 'Koʻrsatiladigan elementlar soni' : 'Лимит элементов'}
            </label>
            <Input
              type="number"
              min={1}
              max={16}
              value={limit}
              onChange={(e) => updateField('limit', Number(e.target.value))}
              className="text-xs w-32"
            />
          </div>
        </div>
      );
    }

    // Default fallback
    default:
      return (
        <div className="text-xs text-muted-foreground italic py-2">
          {isUz
            ? 'Ushbu blokning qoʻshimcha sozlamalari mavjud emas'
            : 'Для данного блока нет дополнительных параметров'}
        </div>
      );
  }
}

// ---------------------------------------------------------------------------
// Селектор глобального переиспользуемого блока
// ---------------------------------------------------------------------------
function ReusableBlockSelector({
  blockId,
  isUz,
  onSelect,
}: {
  blockId: string;
  isUz: boolean;
  onSelect: (id: string) => void;
}): JSX.Element {
  const [list, setList] = useState<ReusableBlock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    apiClient
      .getPublicReusableBlocks()
      .then((res) => {
        if (!isMounted) return;
        setList(res);
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-semibold text-foreground block mb-1">
          {isUz ? 'Ulanadigan global blokni tanlang' : 'Выберите глобальный блок для вставки'}
        </label>
        {loading ? (
          <div className="text-xs text-muted-foreground py-2">Yuklanmoqda...</div>
        ) : (
          <select
            value={blockId}
            onChange={(e) => onSelect(e.target.value)}
            className="w-full text-xs p-2 rounded-md border border-border bg-background"
          >
            <option value="">{isUz ? 'Tanlanmagan' : 'Не выбрано'}</option>
            {list.map((b) => (
              <option key={b.id} value={b.id}>
                {isUz ? b.titleUz : b.titleRu} {b.isGlobal ? '(Global)' : ''}
              </option>
            ))}
          </select>
        )}
      </div>
      <p className="text-[11px] text-muted-foreground leading-relaxed">
        {isUz
          ? 'Global blok boshqaruv panelida oʻzgartirilganda ushbu blok qoʻllanilgan barcha sahifalarda bir vaqtning oʻzida avtomatik yangilanadi.'
          : 'При изменении глобального блока в панели управления он обновится на всех страницах автоматически.'}
      </p>
    </div>
  );
}
