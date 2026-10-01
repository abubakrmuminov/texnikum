import { PageBlock, validatePageBlock, BlockValidationResult } from './page-blocks';

export type RowBackgroundStyle = 'none' | 'subtle' | 'card' | 'brand' | 'dark';
export type RowPaddingVertical = 'none' | 'compact' | 'normal' | 'relaxed';
export type RowContainerWidth = 'prose' | 'standard' | 'wide' | 'full';

export interface RowStyleConfig {
  backgroundStyle?: RowBackgroundStyle;
  paddingVertical?: RowPaddingVertical;
  containerWidth?: RowContainerWidth;
  paddingVerticalTablet?: RowPaddingVertical;
  paddingVerticalMobile?: RowPaddingVertical;
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
  hideOnDesktop?: boolean;
}

export type CellVerticalAlign = 'top' | 'center' | 'bottom';

export interface GridCell {
  id: string;
  colSpan: number; // 3 to 12 (Desktop colSpan)
  colSpanTablet?: number; // 3 to 12 (Tablet override)
  colSpanMobile?: number; // 3 to 12 (Mobile override)
  verticalAlign?: CellVerticalAlign;
  isCard?: boolean;
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
  hideOnDesktop?: boolean;
  blocks: PageBlock[];
}

export interface GridRow {
  id: string;
  style?: RowStyleConfig;
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
  hideOnDesktop?: boolean;
  cells: GridCell[];
}

/**
 * Преобразование устаревшего плоского массива блоков в 12-колоночную структуру строк
 * (Zero Data Loss адаптер: каждый блок становится строкой на 12 колонок)
 */
export function migrateBlocksToRows(blocks: PageBlock[]): GridRow[] {
  if (!Array.isArray(blocks) || blocks.length === 0) return [];
  return blocks.map((block, idx) => ({
    id: `row-${block.id || idx}`,
    style: {
      backgroundStyle: 'none',
      paddingVertical: 'normal',
      containerWidth: 'standard',
    },
    cells: [
      {
        id: `cell-${block.id || idx}`,
        colSpan: 12,
        verticalAlign: 'top',
        isCard: false,
        blocks: [block],
      },
    ],
  }));
}

/**
 * Нормализация структуры страницы: возвращает GridRow[], даже если страница сохранена в старом формате
 */
export function normalizePageRows(pageLike: {
  rows?: GridRow[];
  blocks?: PageBlock[];
  schemaVersion?: number;
}): GridRow[] {
  if (Array.isArray(pageLike.rows) && pageLike.rows.length > 0) {
    return pageLike.rows;
  }
  if (Array.isArray(pageLike.blocks) && pageLike.blocks.length > 0) {
    return migrateBlocksToRows(pageLike.blocks);
  }
  return [];
}

/**
 * Валидация 12-колоночной сетки строк и ячеек (с контролем максимальной глубины вложенности <= 2)
 */
export function validatePageGrid(
  rows: unknown,
  currentDepth = 0,
  maxDepth = 2,
): BlockValidationResult {
  if (!Array.isArray(rows)) {
    return { valid: false, error: 'Поле rows должно быть массивом строк' };
  }

  if (currentDepth > maxDepth) {
    return {
      valid: false,
      error: `Превышена максимальная глубина вложенности контейнеров (допустимо максимум ${maxDepth} уровня)`,
    };
  }

  for (let rIdx = 0; rIdx < rows.length; rIdx++) {
    const row = rows[rIdx] as Record<string, unknown>;
    if (!row || typeof row !== 'object') {
      return { valid: false, error: `Строка #${rIdx + 1} должна быть объектом` };
    }

    if (typeof row.id !== 'string' || !row.id.trim()) {
      return { valid: false, error: `Строка #${rIdx + 1} должна иметь непустой строковый id` };
    }

    // Проверка настроек стиля строки
    if (row.style && typeof row.style === 'object') {
      const s = row.style as Record<string, unknown>;
      const validBgs: RowBackgroundStyle[] = ['none', 'subtle', 'card', 'brand', 'dark'];
      if (s.backgroundStyle && !validBgs.includes(s.backgroundStyle as RowBackgroundStyle)) {
        return {
          valid: false,
          error: `В строке #${rIdx + 1} недопустимый backgroundStyle «${s.backgroundStyle}»`,
        };
      }
      const validPaddings: RowPaddingVertical[] = ['none', 'compact', 'normal', 'relaxed'];
      if (s.paddingVertical && !validPaddings.includes(s.paddingVertical as RowPaddingVertical)) {
        return {
          valid: false,
          error: `В строке #${rIdx + 1} недопустимый paddingVertical «${s.paddingVertical}»`,
        };
      }
      const validWidths: RowContainerWidth[] = ['prose', 'standard', 'wide', 'full'];
      if (s.containerWidth && !validWidths.includes(s.containerWidth as RowContainerWidth)) {
        return {
          valid: false,
          error: `В строке #${rIdx + 1} недопустимый containerWidth «${s.containerWidth}»`,
        };
      }
    }

    // Проверка ячеек строки
    if (!Array.isArray(row.cells) || row.cells.length === 0) {
      return { valid: false, error: `Строка #${rIdx + 1} должна содержать хотя бы одну ячейку` };
    }

    if (row.cells.length > 4) {
      return {
        valid: false,
        error: `Строка #${rIdx + 1} содержит ${row.cells.length} ячеек (максимум допустимо 4 ячейки в строке)`,
      };
    }

    let totalColSpan = 0;
    for (let cIdx = 0; cIdx < row.cells.length; cIdx++) {
      const cell = row.cells[cIdx] as Record<string, unknown>;
      if (!cell || typeof cell !== 'object') {
        return { valid: false, error: `В строке #${rIdx + 1} ячейка #${cIdx + 1} должна быть объектом` };
      }

      if (typeof cell.id !== 'string' || !cell.id.trim()) {
        return {
          valid: false,
          error: `В строке #${rIdx + 1} ячейка #${cIdx + 1} должна иметь непустой строковый id`,
        };
      }

      const span = Number(cell.colSpan);
      if (isNaN(span) || span < 3 || span > 12) {
        return {
          valid: false,
          error: `В строке #${rIdx + 1} ячейка #${cIdx + 1} имеет недопустимый colSpan «${cell.colSpan}» (допустимо от 3 до 12)`,
        };
      }
      totalColSpan += span;

      if (cell.colSpanTablet !== undefined) {
        const spanT = Number(cell.colSpanTablet);
        if (isNaN(spanT) || spanT < 3 || spanT > 12) {
          return {
            valid: false,
            error: `В строке #${rIdx + 1} ячейка #${cIdx + 1} имеет недопустимый colSpanTablet «${cell.colSpanTablet}» (допустимо от 3 до 12)`,
          };
        }
      }

      if (cell.colSpanMobile !== undefined) {
        const spanM = Number(cell.colSpanMobile);
        if (isNaN(spanM) || spanM < 3 || spanM > 12) {
          return {
            valid: false,
            error: `В строке #${rIdx + 1} ячейка #${cIdx + 1} имеет недопустимый colSpanMobile «${cell.colSpanMobile}» (допустимо от 3 до 12)`,
          };
        }
      }

      if (!Array.isArray(cell.blocks)) {
        return {
          valid: false,
          error: `В строке #${rIdx + 1} ячейка #${cIdx + 1} должна содержать массив blocks`,
        };
      }

      for (let bIdx = 0; bIdx < cell.blocks.length; bIdx++) {
        const block = cell.blocks[bIdx] as Record<string, unknown>;
        const bRes = validatePageBlock(block);
        if (!bRes.valid) {
          return {
            valid: false,
            error: `В строке #${rIdx + 1}, ячейка #${cIdx + 1}, блок #${bIdx + 1}: ${bRes.error}`,
          };
        }

        // Проверка вложенных строк (nestedRows)
        if (Array.isArray(block.nestedRows) && block.nestedRows.length > 0) {
          const nestedRes = validatePageGrid(block.nestedRows, currentDepth + 1, maxDepth);
          if (!nestedRes.valid) {
            return nestedRes;
          }
        }
      }
    }

    if (totalColSpan > 12) {
      return {
        valid: false,
        error: `В строке #${rIdx + 1} сумма colSpan ячеек (${totalColSpan}) превышает допустимый максимум 12`,
      };
    }
  }

  return { valid: true };
}

// -----------------------------------------------------------------------------
// WCAG 2.1 AA Contrast Ratio Utility & Validator
// -----------------------------------------------------------------------------

function parseHexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.replace(/^#/, '').trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0]! + clean[0]!, 16);
    const g = parseInt(clean[1]! + clean[1]!, 16);
    const b = parseInt(clean[2]! + clean[2]!, 16);
    return [r, g, b];
  }
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return [r, g, b];
  }
  return null;
}

function calculateRelativeLuminance(r: number, g: number, b: number): number {
  const [rl, gl, bl] = [r / 255, g / 255, b / 255].map((val) =>
    val <= 0.04045 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4),
  );
  return 0.2126 * (rl ?? 0) + 0.7152 * (gl ?? 0) + 0.0722 * (bl ?? 0);
}

export function calculateWcagContrast(foregroundHex: string, backgroundHex: string): number {
  const fg = parseHexToRgb(foregroundHex);
  const bg = parseHexToRgb(backgroundHex);
  if (!fg || !bg) return 1;

  const l1 = calculateRelativeLuminance(fg[0], fg[1], fg[2]);
  const l2 = calculateRelativeLuminance(bg[0], bg[1], bg[2]);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

export interface ContrastComplianceResult {
  passes: boolean;
  ratio: number;
  requiredRatio: number;
  error?: string;
}

export function checkWcagContrastCompliance(
  foregroundHex: string,
  backgroundHex: string,
  isLargeText = false,
): ContrastComplianceResult {
  const ratio = calculateWcagContrast(foregroundHex, backgroundHex);
  const requiredRatio = isLargeText ? 3.0 : 4.5;
  const passes = ratio >= requiredRatio;

  if (!passes) {
    return {
      passes: false,
      ratio,
      requiredRatio,
      error: `Ошибка доступности WCAG AA: цветовой контраст ${ratio}:1 ниже обязательного минимума ${requiredRatio}:1 (для ${
        isLargeText ? 'крупного' : 'обычного'
      } текста). Выберите более контрастный цвет.`,
    };
  }

  return { passes: true, ratio, requiredRatio };
}

/**
 * Валидация контрастности токенов оформления строк
 */
export const ROW_BACKGROUND_COLORS: Record<
  RowBackgroundStyle,
  { light: { bg: string; text: string }; dark: { bg: string; text: string } }
> = {
  none: {
    light: { bg: '#ffffff', text: '#0f172a' },
    dark: { bg: '#090d16', text: '#f8fafc' },
  },
  subtle: {
    light: { bg: '#f8fafc', text: '#0f172a' },
    dark: { bg: '#0f172a', text: '#f8fafc' },
  },
  card: {
    light: { bg: '#ffffff', text: '#0f172a' },
    dark: { bg: '#1e293b', text: '#f8fafc' },
  },
  brand: {
    light: { bg: '#0369a1', text: '#ffffff' }, // deep academic primary
    dark: { bg: '#075985', text: '#ffffff' },
  },
  dark: {
    light: { bg: '#0f172a', text: '#f8fafc' },
    dark: { bg: '#020617', text: '#f8fafc' },
  },
};

export function validateRowContrast(
  bgStyle: RowBackgroundStyle,
  isDarkTheme = false,
): { passes: boolean; ratio: number; error?: string } {
  const themeKey = isDarkTheme ? 'dark' : 'light';
  const colors = ROW_BACKGROUND_COLORS[bgStyle] || ROW_BACKGROUND_COLORS.none;
  const token = colors[themeKey];
  const res = checkWcagContrastCompliance(token.text, token.bg, false);
  return {
    passes: res.passes,
    ratio: res.ratio,
    error: res.error,
  };
}
