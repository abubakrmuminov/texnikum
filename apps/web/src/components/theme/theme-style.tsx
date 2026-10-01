import React from 'react';
import { ThemeSettings, THEME_PRESETS } from '@college/shared';

interface ThemeStyleProps {
  settings?: ThemeSettings | null;
}

export function ThemeStyle({ settings }: ThemeStyleProps): JSX.Element | null {
  const presetId = settings?.preset || 'classic_academic';
  const preset = THEME_PRESETS.find((p) => p.id === presetId) ?? (THEME_PRESETS[0] as (typeof THEME_PRESETS)[number]);

  const radius = settings?.borderRadiusMode || preset.borderRadius || '0.5rem';
  const fontFamily = settings?.fontFamily || preset.fontFamily || 'Inter';

  const css = `
    :root:not([data-a11y-theme]), :root[data-a11y-theme="default"] {
      --radius: ${radius};
      --font-preset: '${fontFamily}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
  `.trim();

  return (
    <style
      id="site-builder-theme-style"
      dangerouslySetInnerHTML={{ __html: css }}
    />
  );
}
