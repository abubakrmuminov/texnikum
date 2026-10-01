'use client';

import React, { useState, useRef, useCallback } from 'react';
import { GripVertical, Minus, Plus } from 'lucide-react';

interface ColumnSplitterProps {
  leftCellId: string;
  rightCellId: string;
  leftSpan: number;
  rightSpan: number;
  onResize: (leftSpan: number) => void;
  onAnnounce?: (msg: string) => void;
  isUz: boolean;
}

export function ColumnSplitter({
  leftCellId: _leftCellId,
  rightCellId: _rightCellId,
  leftSpan,
  rightSpan,
  onResize,
  onAnnounce,
  isUz,
}: ColumnSplitterProps): JSX.Element {
  const [isDragging, setIsDragging] = useState(false);
  const splitterRef = useRef<HTMLDivElement | null>(null);
  const startXRef = useRef(0);
  const startLeftSpanRef = useRef(leftSpan);
  const totalCombinedSpan = leftSpan + rightSpan;

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startXRef.current = e.clientX;
    startLeftSpanRef.current = leftSpan;
    if (splitterRef.current) {
      splitterRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !splitterRef.current) return;

    // Считаем ширину контейнера ряда (родительского элемента)
    const parentRow = splitterRef.current.closest('[data-grid-row="true"]');
    if (!parentRow) return;

    const rowRect = parentRow.getBoundingClientRect();
    const colWidthPx = rowRect.width / 12;

    const deltaPx = e.clientX - startXRef.current;
    const deltaSpan = Math.round(deltaPx / colWidthPx);

    const proposedLeft = startLeftSpanRef.current + deltaSpan;
    const clampedLeft = Math.max(3, Math.min(totalCombinedSpan - 3, proposedLeft));

    if (clampedLeft !== leftSpan) {
      onResize(clampedLeft);
      if (onAnnounce) {
        onAnnounce(
          isUz
            ? `Ustunlar kengligi oʻzgardi: ${clampedLeft} va ${totalCombinedSpan - clampedLeft}`
            : `Ширина колонок изменена: ${clampedLeft} и ${totalCombinedSpan - clampedLeft}`,
        );
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        splitterRef.current?.releasePointerCapture(e.pointerId);
      } catch {
        // Ignore if pointer capture already released
      }
    }
  };

  const handleDecreaseLeft = useCallback(() => {
    if (leftSpan > 3) {
      const nextLeft = leftSpan - 1;
      onResize(nextLeft);
      if (onAnnounce) {
        onAnnounce(
          isUz
            ? `Chap ustun toraytirildi (${nextLeft} col)`
            : `Левая колонка сужена (${nextLeft} col)`,
        );
      }
    }
  }, [leftSpan, onResize, onAnnounce, isUz]);

  const handleIncreaseLeft = useCallback(() => {
    if (rightSpan > 3) {
      const nextLeft = leftSpan + 1;
      onResize(nextLeft);
      if (onAnnounce) {
        onAnnounce(
          isUz
            ? `Chap ustun kengaytirildi (${nextLeft} col)`
            : `Левая колонка расширена (${nextLeft} col)`,
        );
      }
    }
  }, [leftSpan, rightSpan, onResize, onAnnounce, isUz]);

  // Клавиатурные стрелки при фокусе на сплиттере
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handleDecreaseLeft();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleIncreaseLeft();
    }
  };

  return (
    <div
      ref={splitterRef}
      role="separator"
      tabIndex={0}
      data-tour="page-builder.col-resize"
      aria-orientation="vertical"
      aria-valuenow={leftSpan}
      aria-valuemin={3}
      aria-valuemax={totalCombinedSpan - 3}
      aria-label={
        isUz
          ? `Ustunlar chegarasi: chap ${leftSpan}, oʻng ${rightSpan}. Qisqartirish uchun Chapga, kengaytirish uchun Oʻngga bosing`
          : `Граница колонок: слева ${leftSpan}, справа ${rightSpan}. Нажмите Влево/Вправо для изменения размера`
      }
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onKeyDown={handleKeyDown}
      className={`relative group flex items-center justify-center w-3 -mx-1.5 z-20 cursor-col-resize select-none touch-none focus:outline-none transition-colors ${
        isDragging ? 'bg-primary/20' : 'hover:bg-primary/10'
      }`}
    >
      {/* Вертикальная линия разделителя */}
      <div
        className={`w-1 h-full rounded-full transition-colors ${
          isDragging ? 'bg-primary' : 'bg-border group-hover:bg-primary/70 group-focus:bg-primary'
        }`}
      />

      {/* Маркер с ручкой по центру */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 p-0.5 rounded shadow-sm border border-border bg-card flex flex-col items-center gap-0.5 transition-transform ${
          isDragging ? 'scale-110 border-primary bg-primary text-primary-foreground' : 'group-hover:scale-105'
        }`}
      >
        <GripVertical className="size-3 text-muted-foreground group-hover:text-foreground" />
      </div>

      {/* Всплывающие кнопки для клавиатуры и мыши при фокусе / наведении */}
      <div className="absolute -top-7 hidden group-hover:flex group-focus-within:flex items-center gap-1 bg-card border border-border rounded shadow-md px-1 py-0.5 z-30 text-[10px]">
        <button
          type="button"
          id="btn-splitter-decrease"
          onClick={(e) => {
            e.stopPropagation();
            handleDecreaseLeft();
          }}
          disabled={leftSpan <= 3}
          className="p-0.5 rounded hover:bg-muted disabled:opacity-30 text-muted-foreground hover:text-foreground"
          title={isUz ? 'Chap ustunni toraytirish' : 'Сузить левую колонку'}
          aria-label={isUz ? 'Chap ustunni toraytirish' : 'Сузить левую колонку'}
        >
          <Minus className="size-3" />
        </button>
        <span className="font-mono font-bold text-foreground px-1">
          {leftSpan}:{rightSpan}
        </span>
        <button
          type="button"
          id="btn-splitter-increase"
          onClick={(e) => {
            e.stopPropagation();
            handleIncreaseLeft();
          }}
          disabled={rightSpan <= 3}
          className="p-0.5 rounded hover:bg-muted disabled:opacity-30 text-muted-foreground hover:text-foreground"
          title={isUz ? 'Chap ustunni kengaytirish' : 'Расширить левую колонку'}
          aria-label={isUz ? 'Chap ustunni kengaytirish' : 'Расширить левую колонку'}
        >
          <Plus className="size-3" />
        </button>
      </div>
    </div>
  );
}
