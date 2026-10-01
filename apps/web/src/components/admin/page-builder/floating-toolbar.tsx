'use client';

import React from 'react';
import {
  Settings2,
  Copy,
  Trash2,
  Columns,
  Maximize2,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  GripVertical,
} from 'lucide-react';
import { PageBlock } from '@college/shared';

interface FloatingToolbarProps {
  block: PageBlock;
  cellSpan: number;
  isUz: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  onEditSettings: () => void;
  onDuplicate: () => void;
  onCopy?: () => void;
  onDelete: () => void;
  onPutBeside: (side: 'left' | 'right') => void;
  onMakeFullWidth: () => void;
  onAdjustSpan: (delta: number) => void;
  onMove: (direction: 'up' | 'down' | 'left' | 'right') => void;
}

export function FloatingToolbar({
  block,
  cellSpan,
  isUz,
  canMoveUp,
  canMoveDown,
  canMoveLeft,
  canMoveRight,
  onEditSettings,
  onDuplicate,
  onCopy,
  onDelete,
  onPutBeside,
  onMakeFullWidth,
  onAdjustSpan,
  onMove,
}: FloatingToolbarProps): JSX.Element {
  return (
    <div
      role="toolbar"
      aria-label={isUz ? 'Tanlangan blok amallari' : 'Панель действий выбранного блока'}
      className="absolute -top-11 left-0 z-40 flex items-center gap-1 p-1 bg-card/95 backdrop-blur-md border border-primary/40 rounded-lg shadow-lg text-xs animate-in fade-in zoom-in-95 duration-100"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Метка типа блока с иконкой перетаскивания */}
      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold text-[11px]">
        <GripVertical className="size-3 opacity-60" />
        <span className="capitalize">{block.type.replace('_', ' ')}</span>
      </div>

      <div className="w-[1px] h-4 bg-border mx-0.5" />

      {/* Кнопка настроек блока */}
      <button
        type="button"
        id="btn-edit-block-settings"
        onClick={onEditSettings}
        className="p-1.5 rounded hover:bg-primary/10 text-foreground hover:text-primary transition-colors flex items-center gap-1"
        title={isUz ? 'Blok sozlamalari (Enter)' : 'Настройки блока (Enter)'}
        aria-label={isUz ? 'Blok sozlamalari' : 'Настройки блока'}
      >
        <Settings2 className="size-3.5" />
        <span className="hidden sm:inline text-[11px]">{isUz ? 'Tahrirlash' : 'Настроить'}</span>
      </button>

      <div className="w-[1px] h-4 bg-border mx-0.5" />

      {/* Управление шириной ячейки (+/- colSpan) */}
      <div className="flex items-center bg-muted/60 rounded px-1 py-0.5 gap-0.5">
        <button
          type="button"
          onClick={() => onAdjustSpan(-1)}
          disabled={cellSpan <= 3}
          className="p-0.5 rounded hover:bg-background disabled:opacity-30 text-muted-foreground hover:text-foreground"
          title={isUz ? 'Ustunni toraytirish (-1 col)' : 'Сузить ячейку (-1 col)'}
          aria-label={isUz ? 'Ustunni toraytirish' : 'Сузить ячейку'}
        >
          <Minus className="size-3" />
        </button>
        <span className="font-mono font-bold text-[11px] px-1 text-foreground" title="Количество колонок">
          {cellSpan}c
        </span>
        <button
          type="button"
          onClick={() => onAdjustSpan(1)}
          disabled={cellSpan >= 12}
          className="p-0.5 rounded hover:bg-background disabled:opacity-30 text-muted-foreground hover:text-foreground"
          title={isUz ? 'Ustunni kengaytirish (+1 col)' : 'Расширить ячейку (+1 col)'}
          aria-label={isUz ? 'Ustunni kengaytirish' : 'Расширить ячейку'}
        >
          <Plus className="size-3" />
        </button>
      </div>

      <div className="w-[1px] h-4 bg-border mx-0.5" />

      {/* Кнопка "Рядом" (Put beside) */}
      <div className="flex items-center">
        <button
          type="button"
          id="btn-put-beside-left"
          onClick={() => onPutBeside('left')}
          className="p-1.5 rounded-l hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title={isUz ? 'Chapiga blok qoʻshish' : 'Добавить блок слева'}
          aria-label={isUz ? 'Chapiga blok qoʻshish' : 'Добавить блок слева'}
        >
          <Columns className="size-3.5 -scale-x-100" />
        </button>
        <button
          type="button"
          id="btn-put-beside"
          onClick={() => onPutBeside('right')}
          className="p-1.5 rounded-r hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5"
          title={isUz ? 'Oʻngiga blok qoʻshish (Yoniga)' : 'Добавить блок справа (Рядом)'}
          aria-label={isUz ? 'Oʻngiga blok qoʻshish' : 'Добавить блок справа'}
        >
          <Columns className="size-3.5" />
          <span className="hidden md:inline text-[11px]">{isUz ? 'Yoniga' : 'Рядом'}</span>
        </button>
      </div>

      {/* Кнопка "На всю ширину" (Make full width) */}
      {cellSpan < 12 && (
        <button
          type="button"
          id="btn-make-full-width"
          onClick={onMakeFullWidth}
          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          title={isUz ? 'Toʻliq kenglikka yoyish (12 col)' : 'Растянуть на всю ширину (12 col)'}
          aria-label={isUz ? 'Toʻliq kenglikka yoyish' : 'Растянуть на всю ширину'}
        >
          <Maximize2 className="size-3.5" />
          <span className="hidden md:inline text-[11px]">{isUz ? 'Toʻliq' : 'Во всю'}</span>
        </button>
      )}

      <div className="w-[1px] h-4 bg-border mx-0.5" />

      {/* Перемещение: Вверх / Вниз / Влево / Вправо */}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => onMove('left')}
          disabled={!canMoveLeft}
          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30"
          title={isUz ? 'Chap ustunga koʻchirish' : 'В левую колонку'}
          aria-label={isUz ? 'Chap ustunga koʻchirish' : 'В левую колонку'}
        >
          <ChevronLeft className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onMove('right')}
          disabled={!canMoveRight}
          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30"
          title={isUz ? 'Oʻng ustunga koʻchirish' : 'В правую колонку'}
          aria-label={isUz ? 'Oʻng ustunga koʻchirish' : 'В правую колонку'}
        >
          <ChevronRight className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onMove('up')}
          disabled={!canMoveUp}
          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30"
          title={isUz ? 'Yuqoriga koʻchirish' : 'Переместить выше'}
          aria-label={isUz ? 'Yuqoriga koʻchirish' : 'Переместить выше'}
        >
          <ChevronUp className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onMove('down')}
          disabled={!canMoveDown}
          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30"
          title={isUz ? 'Pastga koʻchirish' : 'Переместить ниже'}
          aria-label={isUz ? 'Pastga koʻchirish' : 'Переместить ниже'}
        >
          <ChevronDown className="size-3.5" />
        </button>
      </div>

      <div className="w-[1px] h-4 bg-border mx-0.5" />

      {/* Дублировать */}
      <button
        type="button"
        id="btn-duplicate-block"
        onClick={onDuplicate}
        className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        title={isUz ? 'Blokdan nusxa olish' : 'Дублировать блок'}
        aria-label={isUz ? 'Blokdan nusxa olish' : 'Дублировать блок'}
      >
        <Copy className="size-3.5" />
      </button>

      {/* Копировать в буфер обмена */}
      {onCopy && (
        <button
          type="button"
          id="btn-copy-block-clipboard"
          onClick={onCopy}
          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title={isUz ? 'Xotiraga nusxalash (boshqa sahifaga joylash uchun)' : 'Скопировать блок в буфер обмена'}
          aria-label={isUz ? 'Xotiraga nusxalash' : 'Скопировать блок'}
        >
          <Copy className="size-3.5 text-primary" />
        </button>
      )}

      {/* Удалить */}
      <button
        type="button"
        id="btn-delete-block"
        onClick={onDelete}
        className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
        title={isUz ? 'Oʻchirish (Del)' : 'Удалить блок (Del)'}
        aria-label={isUz ? 'Oʻchirish' : 'Удалить блок'}
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
}
