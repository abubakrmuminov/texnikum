import React from 'react';
import { generateBrandStyleSheet } from '@/lib/brand-color';

interface BrandStyleProps {
  hex?: string | null;
}

export function BrandStyle({ hex }: BrandStyleProps): JSX.Element | null {
  if (!hex) return null;
  const css = generateBrandStyleSheet(hex);
  return (
    <style
      id="institution-brand-style"
      dangerouslySetInnerHTML={{ __html: css }}
    />
  );
}
