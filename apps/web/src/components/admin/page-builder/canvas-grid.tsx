'use client';

import React, { useRef, useEffect } from 'react';
import {
  GridRow,
  GridCell,
  PageBlock,
} from '@college/shared';
import {
  SingleBlockRenderer,
  ROW_BG_CLASSES,
  ROW_PADDING_CLASSES,
  ROW_CONTAINER_CLASSES,
  CELL_ALIGN_CLASSES,
} from '@/components/pages/block-renderer';
import { ColumnSplitter } from './column-splitter';
import { FloatingToolbar } from './floating-toolbar';
import {
  putBlockBeside,
  makeBlockFullWidth,
  adjustCellSpan,
  resizeSplitter,
  moveBlock,
  duplicateBlock,
  deleteBlock,
  createDefaultRow,
} from './grid-operations';
import {
  Plus,
  Palette,
  ChevronUp,
  ChevronDown,
  Trash2,
  PlusCircle,
  Layers,
  Copy,
  BookmarkPlus,
  ClipboardPaste,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { InlineEditProvider } from '@/components/pages/inline-edit-context';

interface CanvasGridProps {
  rows: GridRow[];
  selectedBlockId: string | null;
  viewport: 'desktop' | 'tablet' | 'mobile';
  customWidth?: number;
  isUz: boolean;
  onSelectBlock: (blockId: string | null) => void;
  onUpdateRows: (rows: GridRow[]) => void;
  onEditBlockSettings: (block: PageBlock) => void;
  onOpenRowStyles: (row: GridRow) => void;
  onAnnounce: (msg: string) => void;
  onSaveRowAsReusable?: (row: GridRow) => void;
  onCopyRow?: (row: GridRow) => void;
  onPasteRow?: (index: number) => void;
  hasRowClipboard?: boolean;
  onCopyBlock?: (block: PageBlock) => void;
}

const SPAN_CLASS_MAP: Record<number, string> = {
  1: 'col-span-1',
  2: 'col-span-2',
  3: 'col-span-3',
  4: 'col-span-4',
  5: 'col-span-5',
  6: 'col-span-6',
  7: 'col-span-7',
  8: 'col-span-8',
  9: 'col-span-9',
  10: 'col-span-10',
  11: 'col-span-11',
  12: 'col-span-12',
};

function getEffectiveSpan(
  cell: GridCell,
  siblingCells: GridCell[],
  mode: 'desktop' | 'tablet' | 'mobile'
): number {
  if (mode === 'mobile') {
    return cell.colSpanMobile && cell.colSpanMobile >= 1 && cell.colSpanMobile <= 12
      ? cell.colSpanMobile
      : 12;
  }
  if (mode === 'tablet') {
    if (cell.colSpanTablet && cell.colSpanTablet >= 1 && cell.colSpanTablet <= 12) {
      return cell.colSpanTablet;
    }
    const total = siblingCells.length;
    if (total >= 3) return 6;
    if (total === 2) {
      const allLarge = siblingCells.every((c) => (c.colSpan || 6) >= 5);
      return allLarge ? 6 : 12;
    }
    return 12;
  }
  return cell.colSpan || 12;
}

export function CanvasGrid({
  rows,
  selectedBlockId,
  viewport,
  customWidth,
  isUz,
  onSelectBlock,
  onUpdateRows,
  onEditBlockSettings,
  onOpenRowStyles,
  onAnnounce,
  onSaveRowAsReusable,
  onCopyRow,
  onPasteRow,
  hasRowClipboard,
  onCopyBlock,
}: CanvasGridProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Клавиатурные действия: Escape для сброса выделения, Delete для удаления блока
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Игнорируем, если фокус в поле ввода
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === 'Escape') {
        if (selectedBlockId) {
          e.preventDefault();
          onSelectBlock(null);
          onAnnounce(isUz ? 'Tanlov bekor qilindi' : 'Выделение снято');
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedBlockId) {
          e.preventDefault();
          const next = deleteBlock(rows, selectedBlockId);
          onUpdateRows(next);
          onSelectBlock(null);
          onAnnounce(isUz ? 'Blok oʻchirildi' : 'Блок удален');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBlockId, rows, onSelectBlock, onUpdateRows, onAnnounce, isUz]);

  // Вычисление режима адаптивности и стилей контейнера
  const effectiveMode: 'desktop' | 'tablet' | 'mobile' = customWidth
    ? customWidth < 640
      ? 'mobile'
      : customWidth < 1024
      ? 'tablet'
      : 'desktop'
    : viewport;

  const containerStyle: React.CSSProperties = customWidth
    ? {
        width: `${customWidth}px`,
        maxWidth: '100%',
        margin: '0 auto',
      }
    : {};

  const isSimulatedDevice = customWidth ? customWidth < 1024 : viewport !== 'desktop';
  const viewportClasses = isSimulatedDevice
    ? 'mx-auto border border-primary/30 shadow-2xl bg-card rounded-b-xl min-h-[600px] transition-all'
    : 'w-full max-w-7xl mx-auto transition-all';

  // Добавление новой строки в позицию
  const handleAddNewRow = (index: number) => {
    const newRow = createDefaultRow();
    const defaultBlock: PageBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: 'rich_text',
      sortOrder: 0,
      isVisible: true,
      config: {
        containerWidth: 'full',
        contentUzHtml: '<p>Yangi matn bloki mazmuni...</p>',
        contentRuHtml: '<p>Содержимое нового текстового блока...</p>',
      },
    };
    newRow.cells = [
      {
        id: `cell-${Date.now()}-1`,
        colSpan: 12,
        verticalAlign: 'top',
        isCard: false,
        blocks: [defaultBlock],
      },
    ];

    const nextRows = [...rows];
    nextRows.splice(index, 0, newRow);
    onUpdateRows(nextRows);
    onSelectBlock(defaultBlock.id);
    onAnnounce(isUz ? 'Yangi 12-ustunli qator qoʻshildi' : 'Добавлена новая 12-колоночная строка');
  };

  // Перемещение строки
  const handleMoveRow = (rowIndex: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? rowIndex - 1 : rowIndex + 1;
    if (targetIndex < 0 || targetIndex >= rows.length) return;
    const nextRows = [...rows];
    const temp = nextRows[rowIndex]!;
    nextRows[rowIndex] = nextRows[targetIndex]!;
    nextRows[targetIndex] = temp;
    onUpdateRows(nextRows);
    onAnnounce(
      isUz
        ? `Qator ${targetIndex + 1}-oʻringa koʻchirildi`
        : `Строка перемещена на позицию ${targetIndex + 1}`,
    );
  };

  // Удаление строки
  const handleDeleteRow = (rowIndex: number) => {
    const nextRows = rows.filter((_, idx) => idx !== rowIndex);
    onUpdateRows(nextRows);
    onSelectBlock(null);
    onAnnounce(isUz ? 'Qator oʻchirildi' : 'Строка удалена');
  };

  // Добавление ячейки в строку
  const handleAddCellToRow = (rowIndex: number) => {
    const row = rows[rowIndex];
    if (!row || row.cells.length >= 4) return;

    const count = row.cells.length + 1;
    let newSpan = 3;
    if (count === 2) newSpan = 6;
    else if (count === 3) newSpan = 4;
    else if (count === 4) newSpan = 3;

    const defaultBlock: PageBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: 'heading',
      sortOrder: 0,
      isVisible: true,
      config: { level: 3, textUz: 'Yangi ustun', textRu: 'Новая колонка', align: 'left' },
    };

    const newCell: GridCell = {
      id: `cell-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      colSpan: newSpan,
      verticalAlign: 'top',
      isCard: false,
      blocks: [defaultBlock],
    };

    const nextRows = rows.map((r, idx) => {
      if (idx !== rowIndex) return r;
      // Перераспределяем ширину всех ячеек
      const updatedCells = r.cells.map((c) => ({ ...c, colSpan: newSpan }));
      return {
        ...r,
        cells: [...updatedCells, newCell],
      };
    });

    onUpdateRows(nextRows);
    onSelectBlock(defaultBlock.id);
    onAnnounce(isUz ? 'Qatorga yangi ustun qoʻshildi' : 'В строку добавлена новая колонка');
  };

  // Добавление блока в конкретную ячейку
  const handleAddBlockToCell = (rowIndex: number, cellIndex: number) => {
    const defaultBlock: PageBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: 'rich_text',
      sortOrder: 0,
      isVisible: true,
      config: {
        containerWidth: 'full',
        contentUzHtml: '<p>Yangi matn mazmuni...</p>',
        contentRuHtml: '<p>Новый текстовый фрагмент...</p>',
      },
    };

    const nextRows = rows.map((r, rIdx) => {
      if (rIdx !== rowIndex) return r;
      return {
        ...r,
        cells: r.cells.map((c, cIdx) => {
          if (cIdx !== cellIndex) return c;
          return {
            ...c,
            blocks: [...c.blocks, defaultBlock],
          };
        }),
      };
    });

    onUpdateRows(nextRows);
    onSelectBlock(defaultBlock.id);
    onAnnounce(isUz ? 'Ustunga yangi blok qoʻshildi' : 'В колонку добавлен новый блок');
  };

  // Удаление ячейки из строки (с автоматической балансировкой оставшихся ячеек)
  const handleDeleteCell = (rowIndex: number, cellIndex: number) => {
    const row = rows[rowIndex];
    if (!row) return;

    if (row.cells.length <= 1) {
      handleDeleteRow(rowIndex);
      return;
    }

    const remainingCells = row.cells.filter((_, idx) => idx !== cellIndex);
    const count = remainingCells.length;
    let newSpan = 12;
    if (count === 2) newSpan = 6;
    else if (count === 3) newSpan = 4;
    else if (count === 4) newSpan = 3;

    const rebalancedCells = remainingCells.map((c) => ({
      ...c,
      colSpan: newSpan,
    }));

    const nextRows = rows.map((r, idx) => {
      if (idx !== rowIndex) return r;
      return {
        ...r,
        cells: rebalancedCells,
      };
    });

    onUpdateRows(nextRows);
    onSelectBlock(null);
    onAnnounce(
      isUz
        ? `Ustun oʻchirildi, qolgan ${count} ta ustun boʻshliqni toʻldirdi`
        : `Колонка удалена, оставшиеся ${count} заняли всю ширину`,
    );
  };

  // Инлайн-обновление конфигурации блока (без открытия модального окна)
  const handleUpdateBlockConfig = (blockId: string, updatedFields: Record<string, unknown>) => {
    const nextRows = rows.map((r) => ({
      ...r,
      cells: r.cells.map((c) => ({
        ...c,
        blocks: c.blocks.map((b) => {
          if (b.id !== blockId) return b;
          return {
            ...b,
            config: {
              ...(b.config as Record<string, unknown>),
              ...updatedFields,
            },
          };
        }),
      })),
    }));
    onUpdateRows(nextRows);
  };

  return (
    <InlineEditProvider
      value={{
        isEditable: true,
        isUz,
        effectiveViewport: effectiveMode,
        onUpdateBlockConfig: handleUpdateBlockConfig,
      }}
    >
      <div
        ref={containerRef}
        className={`transition-all duration-300 ${viewportClasses} container-canvas`}
        style={containerStyle}
        data-viewport-mode={effectiveMode}
        data-tour="page-builder.canvas"
        onClick={() => onSelectBlock(null)}
      >
      {rows.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border-2 border-dashed border-border bg-card/60 space-y-4">
          <div className="size-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Layers className="size-7" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-foreground">
              {isUz ? 'Sahifada hozircha qatorlar yoʻq' : 'На странице пока нет строк'}
            </h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
              {isUz
                ? 'Pastdagi tugmani bosing yoki chapdagi kutubxonadan blok tanlab 12-ustunli qator yarating.'
                : 'Нажмите кнопку ниже или выберите блок в палитре слева для создания первой 12-колоночной строки.'}
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-2">
            <Button
              type="button"
              id="btn-add-initial-row"
              onClick={() => handleAddNewRow(0)}
              className="text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              <Plus className="size-4 mr-1.5" />
              <span>{isUz ? '12-ustunli qator qoʻshish' : 'Добавить 12-колоночную строку'}</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {rows.map((row, rowIndex) => {
            const bgClass = ROW_BG_CLASSES[row.style?.backgroundStyle || 'none'];
            const padClass = ROW_PADDING_CLASSES[row.style?.paddingVertical || 'normal'];
            const widthClass = ROW_CONTAINER_CLASSES[row.style?.containerWidth || 'standard'];
            const isRowHidden =
              (effectiveMode === 'mobile' && row.style?.hideOnMobile) ||
              (effectiveMode === 'tablet' && row.style?.hideOnTablet) ||
              (effectiveMode === 'desktop' && row.style?.hideOnDesktop);

            return (
              <div key={row.id} className="relative group/row" data-grid-row="true">
                {/* Разделитель между строками с кнопкой вставки новой строки */}
                <div className="relative py-1 group/gap flex items-center justify-center -my-3 z-10">
                  <div className="h-[2px] w-full bg-transparent group-hover/gap:bg-primary/40 transition-colors" />
                  <div className="absolute opacity-0 group-hover/gap:opacity-100 transition-opacity flex items-center gap-1.5 focus-within:opacity-100">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddNewRow(rowIndex);
                      }}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-2.5 py-0.5 text-[10px] font-bold shadow-md flex items-center gap-1 focus:opacity-100"
                      title={isUz ? 'Shu yerga yangi qator qoʻshish' : 'Вставить строку сюда'}
                    >
                      <Plus className="size-3" />
                      <span>{isUz ? 'Qator qoʻshish' : 'Добавить строку'}</span>
                    </button>

                    {hasRowClipboard && onPasteRow && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPasteRow(rowIndex);
                        }}
                        className="bg-card text-foreground border border-primary/40 hover:bg-primary/10 rounded-full px-2.5 py-0.5 text-[10px] font-bold shadow-md flex items-center gap-1 focus:opacity-100"
                        title={isUz ? 'Xotiradagi boʻlimni joylashtirish' : 'Вставить секцию из буфера'}
                      >
                        <ClipboardPaste className="size-3 text-primary" />
                        <span>{isUz ? 'Boʻlimni joylash' : 'Вставить секцию'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Обертка строки с визуальной рамкой при наведении */}
                <section
                  className={`w-full rounded-2xl border ${
                    isRowHidden
                      ? 'opacity-40 border-amber-500/60 border-dashed'
                      : 'border-transparent hover:border-primary/30'
                  } transition-all ${bgClass} ${padClass} relative`}
                >
                  {/* Панель управления строкой (Row Header Toolbar) */}
                  <div className="absolute top-2 right-4 opacity-0 group-hover/row:opacity-100 focus-within:opacity-100 transition-opacity z-30 flex items-center gap-1 bg-card/90 backdrop-blur-xs border border-border rounded-lg shadow-sm px-2 py-1 text-xs">
                    <span className="font-mono text-[10px] text-muted-foreground font-bold">
                      Row #{rowIndex + 1}
                    </span>
                    <Badge variant="outline" className="text-[9px] px-1 py-0 font-mono">
                      {row.cells.length} col
                    </Badge>
                    {isRowHidden && (
                      <Badge className="bg-amber-500/20 text-amber-800 dark:text-amber-200 border-amber-500/40 text-[9px] px-1.5 py-0 font-semibold">
                        {isUz ? 'Yashirilgan' : 'Скрыто'}
                      </Badge>
                    )}

                    <div className="w-[1px] h-3 bg-border mx-1" />

                    {/* Настройка стилей строки (открывает RowStyleDialog) */}
                    <button
                      type="button"
                      id={`btn-row-style-${row.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenRowStyles(row);
                      }}
                      className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      title={isUz ? 'Qator uslublari (Fon, oʻlcham, kontrast)' : 'Стили строки (Фон, отступы, контраст)'}
                      aria-label="Row style settings"
                    >
                      <Palette className="size-3.5" />
                    </button>

                    {/* Скопировать секцию в буфер обмена */}
                    {onCopyRow && (
                      <button
                        type="button"
                        id={`btn-copy-row-${rowIndex}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onCopyRow(row);
                        }}
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title={isUz ? 'Boʻlimdan nusxa olish (Xotiraga)' : 'Скопировать секцию в буфер'}
                        aria-label="Copy section"
                      >
                        <Copy className="size-3.5 text-primary" />
                      </button>
                    )}

                    {/* Сохранить секцию как переиспользуемый шаблон */}
                    {onSaveRowAsReusable && (
                      <button
                        type="button"
                        id={`btn-save-reusable-row-${rowIndex}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSaveRowAsReusable(row);
                        }}
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-primary transition-colors flex items-center gap-0.5"
                        title={isUz ? 'Boʻlimni shablon sifatida saqlash' : 'Сохранить секцию как шаблон'}
                        aria-label="Save section as template"
                      >
                        <BookmarkPlus className="size-3.5 text-primary" />
                        <span className="hidden xl:inline text-[10px] font-semibold">{isUz ? 'Shablon' : 'Шаблон'}</span>
                      </button>
                    )}

                    {/* Добавить еще одну колонку в строку */}
                    {row.cells.length < 4 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddCellToRow(rowIndex);
                        }}
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title={isUz ? 'Yangi ustun qoʻshish' : 'Добавить колонку в строку'}
                        aria-label="Add cell"
                      >
                        <PlusCircle className="size-3.5" />
                      </button>
                    )}

                    {/* Переместить строку вверх */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveRow(rowIndex, 'up');
                      }}
                      disabled={rowIndex === 0}
                      className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30"
                      title={isUz ? 'Qatorni yuqoriga surish' : 'Переместить строку выше'}
                      aria-label="Move row up"
                    >
                      <ChevronUp className="size-3.5" />
                    </button>

                    {/* Переместить строку вниз */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveRow(rowIndex, 'down');
                      }}
                      disabled={rowIndex === rows.length - 1}
                      className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30"
                      title={isUz ? 'Qatorni pastga surish' : 'Переместить строку ниже'}
                      aria-label="Move row down"
                    >
                      <ChevronDown className="size-3.5" />
                    </button>

                    {/* Удалить строку */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRow(rowIndex);
                      }}
                      className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      title={isUz ? 'Qatorni oʻchirish' : 'Удалить строку'}
                      aria-label="Delete row"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>

                  {/* Контейнер строки с 12-колоночной CSS Grid */}
                  <div className={widthClass}>
                    <div className="grid grid-cols-12 gap-4 items-stretch">
                      {row.cells.map((cell, cellIndex) => {
                        const effectiveSpan = getEffectiveSpan(cell, row.cells, effectiveMode);
                        const spanClass = SPAN_CLASS_MAP[effectiveSpan] || 'col-span-12';
                        const alignClass = CELL_ALIGN_CLASSES[cell.verticalAlign || 'top'];
                        const isCellHidden =
                          (effectiveMode === 'mobile' && cell.hideOnMobile) ||
                          (effectiveMode === 'tablet' && cell.hideOnTablet) ||
                          (effectiveMode === 'desktop' && cell.hideOnDesktop);
                        const isCardClass = cell.isCard
                          ? 'p-4 sm:p-5 rounded-xl border border-border bg-card shadow-xs'
                          : 'p-2 rounded-lg border border-dashed border-border/40 hover:border-border/80 transition-colors';

                        const nextCell = row.cells[cellIndex + 1];

                        return (
                          <React.Fragment key={cell.id}>
                            <div
                              className={`${spanClass} ${alignClass} ${isCardClass} ${
                                isCellHidden ? 'opacity-40 border-amber-500/60 border-dashed' : ''
                              } container-cell flex flex-col justify-start relative group/cell min-h-[90px]`}
                            >
                              {/* Индикатор ширины ячейки */}
                              <div className="absolute top-1 left-2 opacity-0 group-hover/cell:opacity-100 transition-opacity z-10 flex items-center gap-1">
                                <span className="font-mono text-[9px] bg-muted/90 px-1 py-0.5 rounded text-muted-foreground">
                                  {effectiveSpan}/12 col
                                </span>
                                {row.cells.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteCell(rowIndex, cellIndex);
                                    }}
                                    className="p-0.5 rounded bg-muted/90 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                    title={isUz ? 'Ustunni oʻchirish (qolganlari kengayadi)' : 'Удалить колонку (остальные расширятся)'}
                                    aria-label="Delete column"
                                  >
                                    <Trash2 className="size-3" />
                                  </button>
                                )}
                                {isCellHidden && (
                                  <Badge className="bg-amber-500/20 text-amber-800 dark:text-amber-200 border-amber-500/40 text-[9px] px-1 py-0 font-semibold">
                                    {isUz ? 'Yashirilgan' : 'Скрыто'}
                                  </Badge>
                                )}
                              </div>

                              {/* Блоки внутри ячейки */}
                              <div className="space-y-4 w-full pt-1">
                                {cell.blocks.map((block) => {
                                  const isSelected = selectedBlockId === block.id;
                                  const isBlockHidden =
                                    (effectiveMode === 'mobile' && block.style?.hideOnMobile) ||
                                    (effectiveMode === 'tablet' && block.style?.hideOnTablet) ||
                                    (effectiveMode === 'desktop' && block.style?.hideOnDesktop);

                                  return (
                                    <div
                                      key={block.id}
                                      role="button"
                                      tabIndex={0}
                                      id={`canvas-block-${block.id}`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onSelectBlock(block.id);
                                      }}
                                      onDoubleClick={(e) => {
                                        e.stopPropagation();
                                        onEditBlockSettings(block);
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          e.stopPropagation();
                                          if (isSelected) onEditBlockSettings(block);
                                          else onSelectBlock(block.id);
                                        }
                                      }}
                                      className={`relative rounded-xl transition-all cursor-pointer select-none outline-none ${
                                        isBlockHidden
                                          ? 'opacity-40 border border-amber-500/60 border-dashed'
                                          : ''
                                      } ${
                                        isSelected
                                          ? 'ring-2 ring-primary ring-offset-2 bg-primary/5 shadow-md'
                                          : 'hover:ring-1 hover:ring-primary/40'
                                      }`}
                                    >
                                      {/* Бейдж скрытого блока на текущем брейкпоинте */}
                                      {isBlockHidden && (
                                        <div className="absolute top-1 right-2 z-20 pointer-events-none">
                                          <Badge className="bg-amber-500/20 text-amber-800 dark:text-amber-200 border-amber-500/40 text-[9px] px-1.5 py-0 font-semibold">
                                            {isUz ? 'Yashirilgan' : 'Скрыто'}
                                          </Badge>
                                        </div>
                                      )}
                                      {/* Всплывающий Floating Toolbar над выбранным блоком */}
                                      {isSelected && (
                                        <FloatingToolbar
                                          block={block}
                                          cellSpan={cell.colSpan}
                                          isUz={isUz}
                                          canMoveUp={
                                            cell.blocks.indexOf(block) > 0 || rowIndex > 0
                                          }
                                          canMoveDown={
                                            cell.blocks.indexOf(block) < cell.blocks.length - 1 ||
                                            rowIndex < rows.length - 1
                                          }
                                          canMoveLeft={cellIndex > 0}
                                          canMoveRight={cellIndex < row.cells.length - 1}
                                          onEditSettings={() => onEditBlockSettings(block)}
                                          onDuplicate={() => {
                                            const { nextRows, newBlockId } = duplicateBlock(
                                              rows,
                                              block.id,
                                            );
                                            onUpdateRows(nextRows);
                                            onSelectBlock(newBlockId);
                                            onAnnounce(
                                              isUz
                                                ? 'Blokdan nusxa olindi'
                                                : 'Создана копия блока',
                                            );
                                          }}
                                          onCopy={() => {
                                            onCopyBlock?.(block);
                                          }}
                                          onDelete={() => {
                                            const nextRows = deleteBlock(rows, block.id);
                                            onUpdateRows(nextRows);
                                            onSelectBlock(null);
                                            onAnnounce(isUz ? 'Blok oʻchirildi' : 'Блок удален');
                                          }}
                                          onPutBeside={(side) => {
                                            const { nextRows, newBlockId } = putBlockBeside(
                                              rows,
                                              block.id,
                                              side,
                                            );
                                            onUpdateRows(nextRows);
                                            onSelectBlock(newBlockId);
                                            onAnnounce(
                                              isUz
                                                ? 'Yoniga yangi ustun qoʻshildi'
                                                : 'Добавлен блок рядом',
                                            );
                                          }}
                                          onMakeFullWidth={() => {
                                            const nextRows = makeBlockFullWidth(rows, block.id);
                                            onUpdateRows(nextRows);
                                            onAnnounce(
                                              isUz
                                                ? 'Blok toʻliq 12-ustunli qatorga aylantirildi'
                                                : 'Блок растянут на всю ширину',
                                            );
                                          }}
                                          onAdjustSpan={(delta) => {
                                            const { nextRows, newSpan } = adjustCellSpan(
                                              rows,
                                              cell.id,
                                              delta,
                                            );
                                            onUpdateRows(nextRows);
                                            onAnnounce(
                                              isUz
                                                ? `Ustun kengligi: ${newSpan} col`
                                                : `Ширина колонки: ${newSpan} col`,
                                            );
                                          }}
                                          onMove={(direction) => {
                                            const nextRows = moveBlock(rows, block.id, direction);
                                            onUpdateRows(nextRows);
                                            onAnnounce(
                                              isUz ? 'Blok koʻchirildi' : 'Блок перемещен',
                                            );
                                          }}
                                        />
                                      )}

                                      {/* Рендеринг реального содержимого блока через публичный рендерер */}
                                      <div className="p-1">
                                        <SingleBlockRenderer block={block} isUz={isUz} />
                                      </div>
                                    </div>
                                  );
                                })}

                                {/* Кнопка добавления блока в ячейку */}
                                <div className="pt-2 text-center">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddBlockToCell(rowIndex, cellIndex);
                                    }}
                                    className="opacity-0 group-hover/cell:opacity-100 focus:opacity-100 transition-opacity text-[11px] text-muted-foreground hover:text-primary p-1.5 rounded-md hover:bg-muted/80 flex items-center justify-center gap-1 mx-auto"
                                    title={isUz ? 'Ushbu ustunga blok qoʻshish' : 'Добавить блок в колонку'}
                                  >
                                    <Plus className="size-3" />
                                    <span>{isUz ? 'Blok qoʻshish' : 'Добавить блок'}</span>
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Сплиттер между смежными ячейками (если viewport не mobile) */}
                            {nextCell && viewport !== 'mobile' && (
                              <ColumnSplitter
                                leftCellId={cell.id}
                                rightCellId={nextCell.id}
                                leftSpan={cell.colSpan}
                                rightSpan={nextCell.colSpan}
                                isUz={isUz}
                                onResize={(newLeft) => {
                                  const nextRows = resizeSplitter(
                                    rows,
                                    cell.id,
                                    nextCell.id,
                                    newLeft,
                                  );
                                  onUpdateRows(nextRows);
                                }}
                                onAnnounce={onAnnounce}
                              />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                </section>
              </div>
            );
          })}

          {/* Кнопка добавления строки в самом конце холста */}
          <div className="pt-4 flex items-center justify-center gap-2.5 flex-wrap">
            <Button
              type="button"
              id="btn-add-end-row"
              variant="outline"
              size="sm"
              onClick={() => handleAddNewRow(rows.length)}
              className="text-xs border-dashed hover:border-primary hover:text-primary"
            >
              <Plus className="size-4 mr-1.5" />
              <span>{isUz ? 'Yangi 12-ustunli qator qoʻshish' : 'Добавить 12-колоночную строку'}</span>
            </Button>

            {hasRowClipboard && onPasteRow && (
              <Button
                type="button"
                id="btn-paste-end-row"
                variant="outline"
                size="sm"
                onClick={() => onPasteRow(rows.length)}
                className="text-xs border-primary/40 text-primary hover:bg-primary/5 gap-1.5 font-semibold"
              >
                <ClipboardPaste className="size-4" />
                <span>{isUz ? 'Boʻlimni joylashtirish' : 'Вставить секцию из буфера'}</span>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
    </InlineEditProvider>
  );
}
