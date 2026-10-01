import { GridRow, GridCell, RowStyleConfig, PageBlock } from '@college/shared';

export interface BlockLocation {
  rowIndex: number;
  cellIndex: number;
  blockIndex: number;
  row: GridRow;
  cell: GridCell;
  block: PageBlock;
}

/**
 * Поиск координат блока в древовидной структуре строк и ячеек
 */
export function findBlockLocation(rows: GridRow[], blockId: string): BlockLocation | null {
  for (let rIdx = 0; rIdx < rows.length; rIdx++) {
    const row = rows[rIdx];
    if (!row) continue;
    for (let cIdx = 0; cIdx < row.cells.length; cIdx++) {
      const cell = row.cells[cIdx];
      if (!cell) continue;
      for (let bIdx = 0; bIdx < cell.blocks.length; bIdx++) {
        const block = cell.blocks[bIdx];
        if (block && block.id === blockId) {
          return {
            rowIndex: rIdx,
            cellIndex: cIdx,
            blockIndex: bIdx,
            row,
            cell,
            block,
          };
        }
      }
    }
  }
  return null;
}

/**
 * Очистка пустых ячеек и пустых строк с пропорциональным расширением оставшихся ячеек до 12 колонок
 */
export function cleanupEmptyRowsAndCells(rows: GridRow[]): GridRow[] {
  const result: GridRow[] = [];

  for (const row of rows) {
    // Оставляем только непустые ячейки
    const nonEmptyCells = row.cells.filter((c) => c.blocks.length > 0);
    if (nonEmptyCells.length === 0) {
      // Строка полностью пуста — пропускаем ее
      continue;
    }

    // Если в строке осталась 1 ячейка, она должна занять все 12 колонок
    if (nonEmptyCells.length === 1) {
      result.push({
        ...row,
        cells: [
          {
            ...nonEmptyCells[0]!,
            colSpan: 12,
          },
        ],
      });
      continue;
    }

    // Если несколько ячеек, проверяем их сумму
    const currentSum = nonEmptyCells.reduce((sum, c) => sum + c.colSpan, 0);
    if (currentSum === 12) {
      result.push({
        ...row,
        cells: nonEmptyCells,
      });
      continue;
    }

    // Пропорциональное перераспределение до 12 колонок с минимальным span = 3
    const count = nonEmptyCells.length;
    let distributed: GridCell[];

    if (count === 2) {
      distributed = [
        { ...nonEmptyCells[0]!, colSpan: 6 },
        { ...nonEmptyCells[1]!, colSpan: 6 },
      ];
    } else if (count === 3) {
      distributed = [
        { ...nonEmptyCells[0]!, colSpan: 4 },
        { ...nonEmptyCells[1]!, colSpan: 4 },
        { ...nonEmptyCells[2]!, colSpan: 4 },
      ];
    } else if (count === 4) {
      distributed = [
        { ...nonEmptyCells[0]!, colSpan: 3 },
        { ...nonEmptyCells[1]!, colSpan: 3 },
        { ...nonEmptyCells[2]!, colSpan: 3 },
        { ...nonEmptyCells[3]!, colSpan: 3 },
      ];
    } else {
      // Запасной вариант
      distributed = nonEmptyCells.map((c) => ({
        ...c,
        colSpan: Math.max(3, Math.min(12, Math.floor(12 / count))),
      }));
    }

    result.push({
      ...row,
      cells: distributed,
    });
  }

  return result;
}

/**
 * Создание новой строки со стилями по умолчанию
 */
export function createDefaultRow(id?: string, style?: RowStyleConfig): GridRow {
  return {
    id: id || `row-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    style: {
      backgroundStyle: style?.backgroundStyle || 'none',
      paddingVertical: style?.paddingVertical || 'normal',
      containerWidth: style?.containerWidth || 'standard',
    },
    cells: [],
  };
}

/**
 * Разделение ячейки / строки "Рядом" (Put beside left or right)
 */
export function putBlockBeside(
  rows: GridRow[],
  targetBlockId: string,
  side: 'left' | 'right',
  newBlock?: PageBlock,
): { nextRows: GridRow[]; newBlockId: string } {
  const loc = findBlockLocation(rows, targetBlockId);
  if (!loc) {
    return { nextRows: rows, newBlockId: '' };
  }

  const { block } = loc;
  const createdBlock: PageBlock = newBlock || {
    id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type: 'heading',
    sortOrder: 0,
    isVisible: true,
    config: { level: 3, textUz: 'Yangi boʻlim', textRu: 'Новая секция', align: 'left' },
  };

  // Клонируем строки
  const nextRows = rows.map((r) => ({
    ...r,
    cells: r.cells.map((c) => ({
      ...c,
      blocks: [...c.blocks],
    })),
  }));

  const targetRow = nextRows[loc.rowIndex];
  if (!targetRow) return { nextRows: rows, newBlockId: '' };

  const targetCell = targetRow.cells[loc.cellIndex];
  if (!targetCell) return { nextRows: rows, newBlockId: '' };

  // Если в строке уже 4 ячейки (максимум), нельзя добавить еще одну ячейку в этот ряд
  if (targetRow.cells.length >= 4) {
    // Вставляем новую двухколоночную строку ниже
    const newRowId = `row-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newRow: GridRow = {
      id: newRowId,
      style: { ...targetRow.style },
      cells: [
        {
          id: `cell-${Date.now()}-1`,
          colSpan: 6,
          verticalAlign: 'top',
          blocks: side === 'left' ? [createdBlock] : [{ ...block, id: `block-${Date.now()}-c1` }],
        },
        {
          id: `cell-${Date.now()}-2`,
          colSpan: 6,
          verticalAlign: 'top',
          blocks: side === 'left' ? [{ ...block, id: `block-${Date.now()}-c2` }] : [createdBlock],
        },
      ],
    };
    nextRows.splice(loc.rowIndex + 1, 0, newRow);
    return { nextRows: cleanupEmptyRowsAndCells(nextRows), newBlockId: createdBlock.id };
  }

  // Расчет колонок при разделении
  const oldSpan = targetCell.colSpan;
  const newCellSpan = Math.max(3, Math.floor(oldSpan / 2));
  targetCell.colSpan = Math.max(3, oldSpan - newCellSpan);

  const newCellId = `cell-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const newCell: GridCell = {
    id: newCellId,
    colSpan: newCellSpan,
    verticalAlign: 'top',
    isCard: false,
    blocks: [createdBlock],
  };

  const insertIndex = side === 'left' ? loc.cellIndex : loc.cellIndex + 1;
  targetRow.cells.splice(insertIndex, 0, newCell);

  return {
    nextRows: cleanupEmptyRowsAndCells(nextRows),
    newBlockId: createdBlock.id,
  };
}

/**
 * Растянуть блок на всю ширину (Make full width: переносит блок в отдельную 12-колоночную строку)
 */
export function makeBlockFullWidth(rows: GridRow[], blockId: string): GridRow[] {
  const loc = findBlockLocation(rows, blockId);
  if (!loc) return rows;

  const targetBlock = { ...loc.block };

  // Удаляем блок из текущего места
  const nextRows = rows.map((r) => ({
    ...r,
    cells: r.cells.map((c) => ({
      ...c,
      blocks: c.blocks.filter((b) => b.id !== blockId),
    })),
  }));

  // Создаем новую строку на 12 колонок с этим блоком
  const newRow: GridRow = {
    id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    style: {
      backgroundStyle: 'none',
      paddingVertical: 'normal',
      containerWidth: 'standard',
    },
    cells: [
      {
        id: `cell-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        colSpan: 12,
        verticalAlign: 'top',
        isCard: false,
        blocks: [targetBlock],
      },
    ],
  };

  // Вставляем сразу после текущей строки
  nextRows.splice(loc.rowIndex + 1, 0, newRow);

  return cleanupEmptyRowsAndCells(nextRows);
}

/**
 * Изменение ширины ячейки (изменение colSpan на delta в диапазоне 3..12)
 */
export function adjustCellSpan(
  rows: GridRow[],
  cellId: string,
  delta: number,
): { nextRows: GridRow[]; newSpan: number } {
  const nextRows = rows.map((r) => ({
    ...r,
    cells: r.cells.map((c) => ({ ...c, blocks: [...c.blocks] })),
  }));

  for (const row of nextRows) {
    const cIdx = row.cells.findIndex((c) => c.id === cellId);
    if (cIdx === -1) continue;

    const cell = row.cells[cIdx];
    if (!cell) break;

    const currentSpan = cell.colSpan;
    const targetSpan = Math.max(3, Math.min(12, currentSpan + delta));
    if (targetSpan === currentSpan) {
      return { nextRows: rows, newSpan: currentSpan };
    }

    if (row.cells.length === 1) {
      // Единственная ячейка всегда 12
      return { nextRows: rows, newSpan: 12 };
    }

    // Если есть соседняя ячейка, компенсируем ширину за счет соседа
    const neighborIdx = cIdx === row.cells.length - 1 ? cIdx - 1 : cIdx + 1;
    const neighbor = row.cells[neighborIdx];

    if (neighbor) {
      const neighborTargetSpan = neighbor.colSpan - (targetSpan - currentSpan);
      if (neighborTargetSpan >= 3 && neighborTargetSpan <= 12) {
        cell.colSpan = targetSpan;
        neighbor.colSpan = neighborTargetSpan;
        return { nextRows, newSpan: targetSpan };
      }
    }

    // Если нельзя компенсировать соседом, проверяем сумму строки <= 12
    const otherSum = row.cells.filter((_, idx) => idx !== cIdx).reduce((s, c) => s + c.colSpan, 0);
    if (targetSpan + otherSum <= 12) {
      cell.colSpan = targetSpan;
      return { nextRows, newSpan: targetSpan };
    }

    return { nextRows: rows, newSpan: currentSpan };
  }

  return { nextRows: rows, newSpan: 12 };
}

/**
 * Перемещение разделителя между двумя смежными ячейками (Column boundary resizing)
 */
export function resizeSplitter(
  rows: GridRow[],
  leftCellId: string,
  rightCellId: string,
  newLeftSpan: number,
): GridRow[] {
  const nextRows = rows.map((r) => ({
    ...r,
    cells: r.cells.map((c) => ({ ...c, blocks: [...c.blocks] })),
  }));

  for (const row of nextRows) {
    const leftCell = row.cells.find((c) => c.id === leftCellId);
    const rightCell = row.cells.find((c) => c.id === rightCellId);
    if (!leftCell || !rightCell) continue;

    const totalCombined = leftCell.colSpan + rightCell.colSpan;
    const clampedLeft = Math.max(3, Math.min(totalCombined - 3, Math.round(newLeftSpan)));
    const clampedRight = totalCombined - clampedLeft;

    if (clampedLeft >= 3 && clampedRight >= 3) {
      leftCell.colSpan = clampedLeft;
      rightCell.colSpan = clampedRight;
      return nextRows;
    }
  }

  return rows;
}

/**
 * Перемещение блока вверх/вниз/влево/вправо/в новую строку
 */
export function moveBlock(
  rows: GridRow[],
  blockId: string,
  direction: 'up' | 'down' | 'left' | 'right' | 'new_row_above' | 'new_row_below',
): GridRow[] {
  const loc = findBlockLocation(rows, blockId);
  if (!loc) return rows;

  const { rowIndex, cellIndex, blockIndex, block } = loc;

  const nextRows = rows.map((r) => ({
    ...r,
    cells: r.cells.map((c) => ({ ...c, blocks: [...c.blocks] })),
  }));

  const currentRow = nextRows[rowIndex];
  if (!currentRow) return rows;
  const currentCell = currentRow.cells[cellIndex];
  if (!currentCell) return rows;

  switch (direction) {
    case 'up': {
      if (blockIndex > 0) {
        // Перемещение внутри той же ячейки вверх
        const temp = currentCell.blocks[blockIndex - 1]!;
        currentCell.blocks[blockIndex - 1] = currentCell.blocks[blockIndex]!;
        currentCell.blocks[blockIndex] = temp;
        return nextRows;
      }
      // Если это первый блок ячейки и есть строка выше
      if (rowIndex > 0) {
        currentCell.blocks.splice(blockIndex, 1);
        const prevRow = nextRows[rowIndex - 1]!;
        const prevCell = prevRow.cells[Math.min(cellIndex, prevRow.cells.length - 1)]!;
        prevCell.blocks.push(block);
        return cleanupEmptyRowsAndCells(nextRows);
      }
      return rows;
    }

    case 'down': {
      if (blockIndex < currentCell.blocks.length - 1) {
        // Перемещение внутри той же ячейки вниз
        const temp = currentCell.blocks[blockIndex + 1]!;
        currentCell.blocks[blockIndex + 1] = currentCell.blocks[blockIndex]!;
        currentCell.blocks[blockIndex] = temp;
        return nextRows;
      }
      // Если это последний блок ячейки и есть строка ниже
      if (rowIndex < nextRows.length - 1) {
        currentCell.blocks.splice(blockIndex, 1);
        const nextRow = nextRows[rowIndex + 1]!;
        const nextCell = nextRow.cells[Math.min(cellIndex, nextRow.cells.length - 1)]!;
        nextCell.blocks.unshift(block);
        return cleanupEmptyRowsAndCells(nextRows);
      }
      return rows;
    }

    case 'left': {
      if (cellIndex > 0) {
        // Переход в левую ячейку в той же строке
        currentCell.blocks.splice(blockIndex, 1);
        const targetCell = currentRow.cells[cellIndex - 1]!;
        targetCell.blocks.push(block);
        return cleanupEmptyRowsAndCells(nextRows);
      }
      return rows;
    }

    case 'right': {
      if (cellIndex < currentRow.cells.length - 1) {
        // Переход в правую ячейку в той же строке
        currentCell.blocks.splice(blockIndex, 1);
        const targetCell = currentRow.cells[cellIndex + 1]!;
        targetCell.blocks.push(block);
        return cleanupEmptyRowsAndCells(nextRows);
      }
      return rows;
    }

    case 'new_row_above': {
      currentCell.blocks.splice(blockIndex, 1);
      const newRow: GridRow = {
        id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        style: { backgroundStyle: 'none', paddingVertical: 'normal', containerWidth: 'standard' },
        cells: [
          {
            id: `cell-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            colSpan: 12,
            verticalAlign: 'top',
            isCard: false,
            blocks: [block],
          },
        ],
      };
      nextRows.splice(rowIndex, 0, newRow);
      return cleanupEmptyRowsAndCells(nextRows);
    }

    case 'new_row_below': {
      currentCell.blocks.splice(blockIndex, 1);
      const newRow: GridRow = {
        id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        style: { backgroundStyle: 'none', paddingVertical: 'normal', containerWidth: 'standard' },
        cells: [
          {
            id: `cell-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            colSpan: 12,
            verticalAlign: 'top',
            isCard: false,
            blocks: [block],
          },
        ],
      };
      nextRows.splice(rowIndex + 1, 0, newRow);
      return cleanupEmptyRowsAndCells(nextRows);
    }
  }
}

/**
 * Дублирование блока
 */
export function duplicateBlock(
  rows: GridRow[],
  blockId: string,
): { nextRows: GridRow[]; newBlockId: string } {
  const loc = findBlockLocation(rows, blockId);
  if (!loc) return { nextRows: rows, newBlockId: '' };

  const clonedBlock: PageBlock = {
    ...loc.block,
    id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    config: JSON.parse(JSON.stringify(loc.block.config)),
  };

  const nextRows = rows.map((r) => ({
    ...r,
    cells: r.cells.map((c) => ({ ...c, blocks: [...c.blocks] })),
  }));

  const targetCell = nextRows[loc.rowIndex]?.cells[loc.cellIndex];
  if (targetCell) {
    targetCell.blocks.splice(loc.blockIndex + 1, 0, clonedBlock);
  }

  return { nextRows, newBlockId: clonedBlock.id };
}

/**
 * Удаление блока
 */
export function deleteBlock(rows: GridRow[], blockId: string): GridRow[] {
  const nextRows = rows.map((r) => ({
    ...r,
    cells: r.cells.map((c) => ({
      ...c,
      blocks: c.blocks.filter((b) => b.id !== blockId),
    })),
  }));

  return cleanupEmptyRowsAndCells(nextRows);
}
