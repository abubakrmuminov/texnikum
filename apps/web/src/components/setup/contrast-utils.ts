export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
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

export function getRelativeLuminance(rgb: { r: number; g: number; b: number }): number {
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

export interface ContrastResult {
  ratioWithWhite: number;
  ratioWithBlack: number;
  passesAAWithWhite: boolean;
  recommendedTextColor: '#FFFFFF' | '#0F172A';
  readableRating: string;
}

export function evaluateColorContrast(hex: string): ContrastResult {
  const rgb = hexToRgb(hex);
  if (!rgb) {
    return {
      ratioWithWhite: 1,
      ratioWithBlack: 1,
      passesAAWithWhite: false,
      recommendedTextColor: '#FFFFFF',
      readableRating: 'Invalid hex',
    };
  }

  const lum = getRelativeLuminance(rgb);
  const lumWhite = 1.0;
  const lumBlack = 0.0;

  const ratioWithWhite = getContrastRatio(lum, lumWhite);
  const ratioWithBlack = getContrastRatio(lum, lumBlack);

  const passesAAWithWhite = ratioWithWhite >= 4.5;
  const recommendedTextColor = passesAAWithWhite ? '#FFFFFF' : '#0F172A';

  return {
    ratioWithWhite: Number(ratioWithWhite.toFixed(2)),
    ratioWithBlack: Number(ratioWithBlack.toFixed(2)),
    passesAAWithWhite,
    recommendedTextColor,
    readableRating: passesAAWithWhite ? 'Pass (WCAG AA)' : 'Fail with white text',
  };
}
