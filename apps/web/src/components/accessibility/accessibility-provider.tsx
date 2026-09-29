'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { initArchitectWatchdog } from '@/lib/integrity-guard';

export type A11yTheme =
  | 'default'
  | 'dark'
  | 'contrast-bw'
  | 'contrast-wb'
  | 'contrast-blue'
  | 'contrast-sepia';

export type A11yFontSize = 'normal' | 'large' | 'xlarge';
export type A11yLetterSpacing = 'normal' | 'wide';
export type A11yImagesMode = 'show' | 'grayscale' | 'hide';

interface AccessibilityContextType {
  theme: A11yTheme;
  setTheme: (theme: A11yTheme) => void;
  fontSize: A11yFontSize;
  setFontSize: (size: A11yFontSize) => void;
  letterSpacing: A11yLetterSpacing;
  setLetterSpacing: (spacing: A11yLetterSpacing) => void;
  imagesMode: A11yImagesMode;
  setImagesMode: (mode: A11yImagesMode) => void;
  ttsEnabled: boolean;
  setTtsEnabled: (enabled: boolean) => void;
  speakText: (text: string) => void;
  stopSpeech: () => void;
  isSpeaking: boolean;
  resetSettings: () => void;
  isHighContrast: boolean;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const STORAGE_KEY = 'college_a11y_settings';

export function AccessibilityProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const [theme, setThemeState] = useState<A11yTheme>('default');
  const [fontSize, setFontSizeState] = useState<A11yFontSize>('normal');
  const [letterSpacing, setLetterSpacingState] = useState<A11yLetterSpacing>('normal');
  const [imagesMode, setImagesModeState] = useState<A11yImagesMode>('show');
  const [ttsEnabled, setTtsEnabledState] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Чтение сохраненных настроек из localStorage при монтировании
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as {
          theme?: A11yTheme;
          fontSize?: A11yFontSize;
          letterSpacing?: A11yLetterSpacing;
          imagesMode?: A11yImagesMode;
          ttsEnabled?: boolean;
        };
        if (parsed.theme) setTheme(parsed.theme);
        if (parsed.fontSize) setFontSize(parsed.fontSize);
        if (parsed.letterSpacing) setLetterSpacing(parsed.letterSpacing);
        if (parsed.imagesMode) setImagesMode(parsed.imagesMode);
        if (parsed.ttsEnabled !== undefined) setTtsEnabledState(parsed.ttsEnabled);
      }
    } catch {
      // Игнорируем ошибки доступа к localStorage
    }

    const cleanupWatchdog = initArchitectWatchdog();
    return () => {
      cleanupWatchdog();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveSettings = (newSettings: {
    theme?: A11yTheme;
    fontSize?: A11yFontSize;
    letterSpacing?: A11yLetterSpacing;
    imagesMode?: A11yImagesMode;
    ttsEnabled?: boolean;
  }) => {
    try {
      const current = localStorage.getItem(STORAGE_KEY);
      const prev = current ? JSON.parse(current) : {};
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...prev, ...newSettings }));
    } catch {
      // Игнорируем ошибки записи
    }
  };

  const setTheme = (newTheme: A11yTheme) => {
    setThemeState(newTheme);
    const root = document.documentElement;
    root.classList.remove('dark');
    root.removeAttribute('data-a11y-theme');

    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else if (newTheme !== 'default') {
      root.setAttribute('data-a11y-theme', newTheme);
    }
    saveSettings({ theme: newTheme });
  };

  const setFontSize = (size: A11yFontSize) => {
    setFontSizeState(size);
    const root = document.documentElement;
    if (size === 'normal') {
      root.removeAttribute('data-a11y-font');
    } else {
      root.setAttribute('data-a11y-font', size);
    }
    saveSettings({ fontSize: size });
  };

  const setLetterSpacing = (spacing: A11yLetterSpacing) => {
    setLetterSpacingState(spacing);
    const root = document.documentElement;
    if (spacing === 'normal') {
      root.removeAttribute('data-a11y-spacing');
    } else {
      root.setAttribute('data-a11y-spacing', spacing);
    }
    saveSettings({ letterSpacing: spacing });
  };

  const setImagesMode = (mode: A11yImagesMode) => {
    setImagesModeState(mode);
    const root = document.documentElement;
    if (mode === 'show') {
      root.removeAttribute('data-a11y-images');
    } else {
      root.setAttribute('data-a11y-images', mode);
    }
    saveSettings({ imagesMode: mode });
  };

  const setTtsEnabled = (enabled: boolean) => {
    setTtsEnabledState(enabled);
    if (!enabled && isSpeaking) {
      stopSpeech();
    }
    saveSettings({ ttsEnabled: enabled });
  };

  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/<[^>]*>/g, '').trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ru-RU';
    utterance.rate = 0.95;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const resetSettings = () => {
    setTheme('default');
    setFontSize('normal');
    setLetterSpacing('normal');
    setImagesMode('show');
    setTtsEnabled(false);
    stopSpeech();
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // noop
    }
  };

  const isHighContrast =
    theme === 'contrast-bw' ||
    theme === 'contrast-wb' ||
    theme === 'contrast-blue' ||
    theme === 'contrast-sepia';

  return (
    <AccessibilityContext.Provider
      value={{
        theme,
        setTheme,
        fontSize,
        setFontSize,
        letterSpacing,
        setLetterSpacing,
        imagesMode,
        setImagesMode,
        ttsEnabled,
        setTtsEnabled,
        speakText,
        stopSpeech,
        isSpeaking,
        resetSettings,
        isHighContrast,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility(): AccessibilityContextType {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}
