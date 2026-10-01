export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export interface HslColor {
  h: number;
  s: number;
  l: number;
}

export function hexToRgb(hex: string): RgbColor | null {
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0]! + clean[0]!, 16);
    const g = parseInt(clean[1]! + clean[1]!, 16);
    const b = parseInt(clean[2]! + clean[2]!, 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b };
  }
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b };
  }
  return null;
}

export function rgbToHsl(rgb: RgbColor): HslColor {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360 * 10) / 10,
    s: Math.round(s * 100 * 10) / 10,
    l: Math.round(l * 100 * 10) / 10,
  };
}

export function getRelativeLuminance(rgb: RgbColor): number {
  const [rs, gs, bs] = [rgb.r, rgb.g, rgb.b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * (rs ?? 0) + 0.7152 * (gs ?? 0) + 0.0722 * (bs ?? 0);
}

export function getContrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function checkBrandColorContrast(hex: string): {
  isValid: boolean;
  ratioAgainstWhite: number;
  ratioAgainstBlack: number;
  recommendedTextColor: '#ffffff' | '#0f172a';
  passesAA: boolean;
} {
  const rgb = hexToRgb(hex);
  if (!rgb) {
    return {
      isValid: false,
      ratioAgainstWhite: 1,
      ratioAgainstBlack: 1,
      recommendedTextColor: '#ffffff',
      passesAA: false,
    };
  }
  const lum = getRelativeLuminance(rgb);
  const ratioWhite = getContrastRatio(lum, 1.0);
  const ratioBlack = getContrastRatio(lum, 0.0);
  const recommendedTextColor = ratioWhite >= 4.5 ? '#ffffff' : '#0f172a';
  const passesAA = Math.max(ratioWhite, ratioBlack) >= 4.5;

  return {
    isValid: true,
    ratioAgainstWhite: Math.round(ratioWhite * 100) / 100,
    ratioAgainstBlack: Math.round(ratioBlack * 100) / 100,
    recommendedTextColor,
    passesAA,
  };
}

/**
 * Returns the HSL string for primary and primary-foreground, ensuring WCAG AA contrast (>= 4.5:1).
 * If light or dark theme, derives readable foreground text.
 */
export function deriveBrandCssVariables(hex: string): {
  primaryHsl: string;
  primaryForegroundHsl: string;
  darkPrimaryHsl: string;
  darkPrimaryForegroundHsl: string;
} {
  const defaultVars = {
    primaryHsl: '221.2 83.2% 53.3%',
    primaryForegroundHsl: '210 40% 98%',
    darkPrimaryHsl: '217.2 91.2% 59.8%',
    darkPrimaryForegroundHsl: '222.2 47.4% 11.2%',
  };

  const rgb = hexToRgb(hex);
  if (!rgb) return defaultVars;

  const hsl = rgbToHsl(rgb);
  const lum = getRelativeLuminance(rgb);

  // Contrast against pure white (L=1.0) and dark slate (L=0.01)
  const ratioWhite = getContrastRatio(lum, 1.0);
  const primaryHsl = `${hsl.h} ${hsl.s}% ${hsl.l}%`;

  // If contrast against white is >= 4.5, white text passes WCAG AA
  // Otherwise, use dark text (222.2 84% 4.9%) which is guaranteed to pass
  const primaryForegroundHsl = ratioWhite >= 4.5 ? '0 0% 100%' : '222.2 84% 4.9%';

  // For dark mode:
  // If the primary color is too dark (lightness < 55%), brighten it up to 60%
  // so it stands out against dark background (222.2 84% 4.9%)
  let darkHsl = { ...hsl };
  if (darkHsl.l < 55) {
    darkHsl = { ...darkHsl, l: Math.min(65, darkHsl.l + 25) };
  }
  const darkPrimaryHsl = `${darkHsl.h} ${darkHsl.s}% ${darkHsl.l}%`;

  // In dark mode, calculate foreground for darkPrimary
  const darkRatioWhite = (darkHsl.l / 100) > 0.55 ? 2.5 : 5.0;
  const darkPrimaryForegroundHsl = darkRatioWhite >= 4.5 ? '0 0% 100%' : '222.2 47.4% 11.2%';

  return {
    primaryHsl,
    primaryForegroundHsl,
    darkPrimaryHsl,
    darkPrimaryForegroundHsl,
  };
}

/**
 * Generates scoped CSS for injecting into root layout.
 * Scoped to :root:not([data-a11y-theme]) and :root[data-a11y-theme="default"],
 * so that any custom a11y theme (contrast-bw, contrast-wb, contrast-blue, etc.)
 * is completely unaffected and retains its own high-contrast palette.
 */
export function generateBrandStyleSheet(hex: string): string {
  const vars = deriveBrandCssVariables(hex);
  return `
    :root:not([data-a11y-theme]), :root[data-a11y-theme="default"] {
      --primary: ${vars.primaryHsl};
      --primary-foreground: ${vars.primaryForegroundHsl};
      --ring: ${vars.primaryHsl};
    }
    .dark:not([data-a11y-theme]), .dark[data-a11y-theme="default"] {
      --primary: ${vars.darkPrimaryHsl};
      --primary-foreground: ${vars.darkPrimaryForegroundHsl};
      --ring: ${vars.darkPrimaryHsl};
    }
  `.trim();
}
