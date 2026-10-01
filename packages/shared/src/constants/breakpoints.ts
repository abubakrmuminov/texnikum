/**
 * Точки останова (Breakpoints) конструктора страниц и портала
 * Единый источник правды для packages/shared, apps/web и apps/api
 * Mobile: < 640px
 * Tablet: 640px – 1023px
 * Desktop: ≥ 1024px
 */

export const BREAKPOINT_WIDTHS = {
  mobileMax: 639,
  tabletMin: 640,
  tabletMax: 1023,
  desktopMin: 1024,
  wideMin: 1280,
  ultraWideMin: 1536,
} as const;

export const BREAKPOINTS = {
  mobile: {
    id: 'mobile' as const,
    minWidth: 0,
    maxWidth: 639,
    labelUz: 'Mobil (< 640px)',
    labelRu: 'Мобильный (< 640px)',
    icon: 'smartphone',
  },
  tablet: {
    id: 'tablet' as const,
    minWidth: 640,
    maxWidth: 1023,
    labelUz: 'Planshet (640–1023px)',
    labelRu: 'Планшет (640–1023px)',
    icon: 'tablet',
  },
  desktop: {
    id: 'desktop' as const,
    minWidth: 1024,
    maxWidth: Infinity,
    labelUz: 'Kompyuter (≥ 1024px)',
    labelRu: 'Компьютер (≥ 1024px)',
    icon: 'monitor',
  },
} as const;

export type BreakpointKey = keyof typeof BREAKPOINTS;

/**
 * Проверка типа устройства по ширине экрана в пикселях
 */
export function getBreakpointFromWidth(width: number): BreakpointKey {
  if (width < BREAKPOINT_WIDTHS.tabletMin) return 'mobile';
  if (width < BREAKPOINT_WIDTHS.desktopMin) return 'tablet';
  return 'desktop';
}
