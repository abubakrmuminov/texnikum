'use client';

import React from 'react';
import {
  GridRow,
  PageBlock,
} from '@college/shared';
import {
  Layers,
  ChevronDown,
  ChevronUp,
  Trash2,
  Columns,
  Edit2,
} from 'lucide-react';
import { PALETTE_BLOCKS } from './palette';
import { Badge } from '@/components/ui/badge';

interface OutlinePanelProps {
  rows: GridRow[];
  selectedBlockId: string | null;
  selectedRowId: string | null;
  onSelectBlock: (blockId: string) => void;
  onSelectRow: (rowId: string) => void;
  onMoveBlock: (blockId: string, direction: 'up' | 'down') => void;
  onMoveRow: (rowId: string, direction: 'up' | 'down') => void;
  onDeleteBlock: (blockId: string) => void;
  onDeleteRow: (rowId: string) => void;
  onEditBlock: (blockId: string) => void;
  onEditRowStyle: (rowId: string) => void;
  isUz: boolean;
}

export function OutlinePanel({
  rows,
  selectedBlockId,
  selectedRowId,
  onSelectBlock,
  onSelectRow,
  onMoveBlock,
  onMoveRow,
  onDeleteBlock,
  onDeleteRow,
  onEditBlock,
  onEditRowStyle,
  isUz,
}: OutlinePanelProps): JSX.Element {
  const getBlockName = (block: PageBlock) => {
    const def = PALETTE_BLOCKS.find((p) => p.type === block.type);
    const typeTitle = def ? (isUz ? def.nameUz : def.nameRu) : block.type;
    const cfg = block.config as Record<string, unknown>;
    let snippet = '';
    if (cfg.textUz || cfg.textRu) snippet = String(cfg.textUz || cfg.textRu);
    else if (cfg.titleUz || cfg.titleRu) snippet = String(cfg.titleUz || cfg.titleRu);
    else if (cfg.captionUz || cfg.captionRu) snippet = String(cfg.captionUz || cfg.captionRu);
    else if (cfg.url) snippet = String(cfg.url);

    return { typeTitle, snippet: snippet ? snippet.slice(0, 30) : '' };
  };

  const scrollToElement = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div
      data-tour="page-builder.outline-tab"
      className="p-2 space-y-2 text-xs"
      role="tree"
      aria-label={isUz ? 'Sahifa tuzilishi daraxti' : 'Дерево структуры страницы'}
    >
      <div className="flex items-center justify-between px-2 py-1 text-muted-foreground font-semibold">
        <span className="flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
          <Layers className="size-3.5 text-primary" />
          <span>{isUz ? 'Sahifa iyerarxiyasi' : 'Иерархия элементов'}</span>
        </span>
        <Badge variant="outline" className="text-[10px] font-mono">
          {rows.length} {isUz ? 'qator' : 'строк'}
        </Badge>
      </div>

      {rows.length === 0 ? (
        <div className="p-4 text-center text-muted-foreground text-xs italic">
          {isUz ? 'Hozircha qatorlar mavjud emas' : 'Строки пока отсутствуют'}
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((row, rIdx) => {
            const isRowSelected = selectedRowId === row.id;

            return (
              <div
                key={row.id}
                className={`rounded-lg border transition-all ${
                  isRowSelected
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                    : 'border-border bg-card'
                }`}
                role="treeitem"
                aria-selected={isRowSelected}
              >
                {/* Заголовок строки */}
                <div className="p-2 flex items-center justify-between gap-1 border-b border-border/40 bg-muted/20">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectRow(row.id);
                      scrollToElement(`canvas-row-${row.id}`);
                    }}
                    className="flex items-center gap-1.5 font-bold text-foreground text-left hover:text-primary transition-colors flex-1 truncate"
                  >
                    <span className="font-mono text-muted-foreground text-[10px]">#{rIdx + 1}</span>
                    <span className="truncate">
                      {isUz ? 'Qator' : 'Строка'} ({row.cells.length}{' '}
                      {isUz ? 'katak' : 'яч.'})
                    </span>
                    {row.style?.backgroundStyle && row.style.backgroundStyle !== 'none' && (
                      <Badge variant="secondary" className="text-[9px] px-1 py-0">
                        {row.style.backgroundStyle}
                      </Badge>
                    )}
                  </button>

                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onEditRowStyle(row.id)}
                      className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted"
                      title={isUz ? 'Uslubni sozlash' : 'Настроить стиль строки'}
                    >
                      <Edit2 className="size-3" />
                    </button>
                    <button
                      type="button"
                      disabled={rIdx === 0}
                      onClick={() => onMoveRow(row.id, 'up')}
                      className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30"
                      title={isUz ? 'Yuqoriga koʻchirish' : 'Переместить вверх'}
                    >
                      <ChevronUp className="size-3" />
                    </button>
                    <button
                      type="button"
                      disabled={rIdx === rows.length - 1}
                      onClick={() => onMoveRow(row.id, 'down')}
                      className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30"
                      title={isUz ? 'Pastga koʻchirish' : 'Переместить вниз'}
                    >
                      <ChevronDown className="size-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteRow(row.id)}
                      className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      title={isUz ? 'Qatorni oʻchirish' : 'Удалить строку'}
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                </div>

                {/* Ячейки и блоки внутри строки */}
                <div className="p-1.5 space-y-1.5">
                  {row.cells.map((cell, cIdx) => (
                    <div
                      key={cell.id}
                      className="pl-2 border-l-2 border-border/80 ml-1 space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground py-0.5">
                        <span className="flex items-center gap-1 font-mono">
                          <Columns className="size-3 text-muted-foreground" />
                          <span>
                            {isUz ? 'Katak' : 'Ячейка'} {cIdx + 1} ({cell.colSpan}/12)
                          </span>
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {cell.blocks.length} {isUz ? 'blok' : 'бл.'}
                        </span>
                      </div>

                      {/* Список блоков в ячейке */}
                      <div className="space-y-1">
                        {cell.blocks.map((b, bIdx) => {
                          const isBlockSelected = selectedBlockId === b.id;
                          const { typeTitle, snippet } = getBlockName(b);

                          return (
                            <div
                              key={b.id}
                              className={`p-1.5 rounded-md flex items-center justify-between gap-1 transition-all ${
                                isBlockSelected
                                  ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                                  : 'bg-muted/40 hover:bg-muted text-foreground'
                              }`}
                              role="treeitem"
                              aria-selected={isBlockSelected}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  onSelectBlock(b.id);
                                  scrollToElement(`canvas-block-${b.id}`);
                                }}
                                className="flex items-center gap-1.5 text-left truncate flex-1 focus:outline-none"
                              >
                                <span className="truncate text-xs">
                                  {typeTitle}
                                  {snippet && (
                                    <span
                                      className={`text-[10px] ml-1 font-normal ${
                                        isBlockSelected ? 'text-white/80' : 'text-muted-foreground'
                                      }`}
                                    >
                                      — {snippet}
                                    </span>
                                  )}
                                </span>
                              </button>

                              <div className="flex items-center gap-0.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => onEditBlock(b.id)}
                                  className={`p-0.5 rounded transition-colors ${
                                    isBlockSelected
                                      ? 'hover:bg-white/20 text-white'
                                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                                  }`}
                                  title={isUz ? 'Tahrirlash' : 'Редактировать'}
                                >
                                  <Edit2 className="size-3" />
                                </button>
                                <button
                                  type="button"
                                  disabled={bIdx === 0}
                                  onClick={() => onMoveBlock(b.id, 'up')}
                                  className={`p-0.5 rounded transition-colors disabled:opacity-20 ${
                                    isBlockSelected
                                      ? 'hover:bg-white/20 text-white'
                                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                                  }`}
                                  title={isUz ? 'Yuqoriga' : 'Вверх'}
                                >
                                  <ChevronUp className="size-3" />
                                </button>
                                <button
                                  type="button"
                                  disabled={bIdx === cell.blocks.length - 1}
                                  onClick={() => onMoveBlock(b.id, 'down')}
                                  className={`p-0.5 rounded transition-colors disabled:opacity-20 ${
                                    isBlockSelected
                                      ? 'hover:bg-white/20 text-white'
                                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                                  }`}
                                  title={isUz ? 'Pastga' : 'Вниз'}
                                >
                                  <ChevronDown className="size-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onDeleteBlock(b.id)}
                                  className={`p-0.5 rounded transition-colors ${
                                    isBlockSelected
                                      ? 'hover:bg-white/20 text-white hover:text-red-200'
                                      : 'hover:bg-destructive/10 text-muted-foreground hover:text-destructive'
                                  }`}
                                  title={isUz ? 'Oʻchirish' : 'Удалить'}
                                >
                                  <Trash2 className="size-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
