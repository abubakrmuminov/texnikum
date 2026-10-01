import { GridCell } from '@college/shared';

// Safe explicit class dictionaries so Tailwind JIT compiler detects every class
const MOBILE_SPAN_CLASSES: Record<number, string> = {
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

const TABLET_SPAN_CLASSES: Record<number, string> = {
  1: 'sm:col-span-1',
  2: 'sm:col-span-2',
  3: 'sm:col-span-3',
  4: 'sm:col-span-4',
  5: 'sm:col-span-5',
  6: 'sm:col-span-6',
  7: 'sm:col-span-7',
  8: 'sm:col-span-8',
  9: 'sm:col-span-9',
  10: 'sm:col-span-10',
  11: 'sm:col-span-11',
  12: 'sm:col-span-12',
};

const DESKTOP_SPAN_CLASSES: Record<number, string> = {
  1: 'lg:col-span-1',
  2: 'lg:col-span-2',
  3: 'lg:col-span-3',
  4: 'lg:col-span-4',
  5: 'lg:col-span-5',
  6: 'lg:col-span-6',
  7: 'lg:col-span-7',
  8: 'lg:col-span-8',
  9: 'lg:col-span-9',
  10: 'lg:col-span-10',
  11: 'lg:col-span-11',
  12: 'lg:col-span-12',
};

/**
 * Returns Tailwind grid column classes for a cell across Mobile, Tablet, and Desktop.
 * Applies automatic defaults so existing pages improve with zero manual editing:
 * - Mobile (<640px): col-span-12 (stacked full width), unless colSpanMobile is set
 * - Tablet (640-1023px):
 *   - 3-4 cells: sm:col-span-6 (2x2 grid)
 *   - 2 cells: sm:col-span-6 if both >= 5, otherwise sm:col-span-12
 *   - 1 cell: sm:col-span-12
 *   (Unless colSpanTablet is explicitly set)
 * - Desktop (>=1024px): lg:col-span-${colSpan}
 */
export function getResponsiveCellSpanClasses(
  cell: GridCell,
  siblingCells: GridCell[] = []
): string {
  // 1. Mobile Span
  const mobileSpan = cell.colSpanMobile && cell.colSpanMobile >= 1 && cell.colSpanMobile <= 12
    ? cell.colSpanMobile
    : 12;
  const mobileClass = MOBILE_SPAN_CLASSES[mobileSpan] || 'col-span-12';

  // 2. Tablet Span
  let tabletSpan: number;
  if (cell.colSpanTablet && cell.colSpanTablet >= 1 && cell.colSpanTablet <= 12) {
    tabletSpan = cell.colSpanTablet;
  } else {
    // Automatic defaults
    const totalCells = siblingCells.length || 1;
    if (totalCells >= 3) {
      tabletSpan = 6; // 2x2 layout on tablet
    } else if (totalCells === 2) {
      const allLargeEnough = siblingCells.every((c) => (c.colSpan || 6) >= 5);
      tabletSpan = allLargeEnough ? 6 : 12;
    } else {
      tabletSpan = 12;
    }
  }
  const tabletClass = TABLET_SPAN_CLASSES[tabletSpan] || 'sm:col-span-12';

  // 3. Desktop Span
  const desktopSpan = Math.min(12, Math.max(1, cell.colSpan || 12));
  const desktopClass = DESKTOP_SPAN_CLASSES[desktopSpan] || 'lg:col-span-12';

  return `${mobileClass} ${tabletClass} ${desktopClass}`;
}

/**
 * Returns visibility classes for entities that support hideOnMobile, hideOnTablet, hideOnDesktop
 */
export function getResponsiveVisibilityClasses(entity?: {
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
  hideOnDesktop?: boolean;
}): string {
  if (!entity) return '';
  const classes: string[] = [];
  if (entity.hideOnMobile) classes.push('hide-on-mobile');
  if (entity.hideOnTablet) classes.push('hide-on-tablet');
  if (entity.hideOnDesktop) classes.push('hide-on-desktop');
  return classes.join(' ');
}

/**
 * Dynamic container-adaptive grid configuration for multi-item blocks
 * (CardsGrid, StaffCards, TeachersList, LatestNews, Specialties, Stats, Columns, Gallery).
 *
 * Guarantees:
 * - In editor mobile preview (effectiveViewport === 'mobile'): strictly 1 column, 100% full width, zero squashing.
 * - In editor tablet preview (effectiveViewport === 'tablet'): up to 2 columns.
 * - In editor desktop preview (effectiveViewport === 'desktop'): up to desiredCols.
 * - On public page: uses CSS grid auto-fit with minmax(min(100%, minColWidth), 1fr) so it adapts to ANY container width (from a 3-col cell to full screen) without squashing.
 */
export function getResponsiveGridConfig(
  itemCount: number,
  desiredCols: number,
  effectiveViewport?: 'desktop' | 'tablet' | 'mobile',
  minColWidth = 240
): { className: string; style?: React.CSSProperties } {
  // If inside editor preview and mobile mode is selected
  if (effectiveViewport === 'mobile') {
    return {
      className: 'grid grid-cols-1 gap-4 w-full',
      style: { gridTemplateColumns: '1fr' },
    };
  }

  // If inside editor preview and tablet mode is selected
  if (effectiveViewport === 'tablet') {
    const cols = Math.min(2, Math.max(1, itemCount));
    return {
      className: `grid grid-cols-1 ${cols >= 2 ? 'sm:grid-cols-2' : ''} gap-4 w-full`,
      style: { gridTemplateColumns: cols >= 2 ? 'repeat(2, 1fr)' : '1fr' },
    };
  }

  // If inside editor preview and desktop mode is selected
  if (effectiveViewport === 'desktop') {
    const cols = Math.min(desiredCols, Math.max(1, itemCount));
    return {
      className: `grid grid-cols-1 ${
        cols === 1
          ? 'grid-cols-1'
          : cols === 2
          ? 'grid-cols-1 sm:grid-cols-2'
          : cols === 3
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
      } gap-4 w-full`,
      style: { gridTemplateColumns: `repeat(${cols}, 1fr)` },
    };
  }

  // Public site / Auto-responsive default:
  // repeat(auto-fit, minmax(min(100%, minColWidth), 1fr))
  return {
    className: 'grid gap-4 w-full',
    style: {
      gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${minColWidth}px), 1fr))`,
    },
  };
}
