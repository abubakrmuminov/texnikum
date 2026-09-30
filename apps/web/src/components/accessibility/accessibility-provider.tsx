'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { initArchitectWatchdog } from '@/lib/integrity-guard';
import { useAppLocale } from '@/components/i18n/locale-provider';
import {
  resolveBestTtsVoice,
  latinToUzbekCyrillic,
  splitTextIntoSentences,
  VoiceResolutionResult,
} from '@/lib/speech-synthesis';

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
  speakText: (text: string, customLang?: 'uz' | 'ru') => void;
  stopSpeech: () => void;
  isSpeaking: boolean;
  activeVoiceInfo: VoiceResolutionResult | null;
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
  const { locale } = useAppLocale();
  const [theme, setThemeState] = useState<A11yTheme>('default');
  const [fontSize, setFontSizeState] = useState<A11yFontSize>('normal');
  const [letterSpacing, setLetterSpacingState] = useState<A11yLetterSpacing>('normal');
  const [imagesMode, setImagesModeState] = useState<A11yImagesMode>('show');
  const [ttsEnabled, setTtsEnabledState] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [activeVoiceInfo, setActiveVoiceInfo] = useState<VoiceResolutionResult | null>(null);
  const speechQueueRef = useRef<{ cancel: () => void } | null>(null);

  // Brauzer ovozlarini (SpeechSynthesis voices) yuklash va kuzatish
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const avail = window.speechSynthesis.getVoices();
      if (avail && avail.length > 0) {
        setVoices(avail);
        const resolved = resolveBestTtsVoice(locale, avail);
        setActiveVoiceInfo(resolved);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, [locale]);

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

  // Ovozli oʻqish rejimi (ttsEnabled) yoqilganida sahifada matn belgilansa, avtomatik oʻqish
  useEffect(() => {
    if (!ttsEnabled || typeof window === 'undefined') return;

    const handleMouseUp = () => {
      const selection = window.getSelection()?.toString().trim();
      if (selection && selection.length > 3 && selection.includes(' ')) {
        speakText(selection);
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ttsEnabled, locale, voices]);

  const stopSpeech = () => {
    if (speechQueueRef.current) {
      speechQueueRef.current.cancel();
      speechQueueRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const speakText = (text: string, customLang?: 'uz' | 'ru') => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    stopSpeech();

    const clean = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!clean) return;

    // Tilni aniqlash (agar sof kirillcha boʻlsa — ruscha, aks holda joriy til yoki oʻzbekcha)
    const hasCyrillic = /[а-яА-ЯёЁўЎқҚғҒҳҲ]/.test(clean);
    const hasLatin = /[a-zA-Z]/.test(clean);
    const targetLang = customLang || (hasCyrillic && !hasLatin ? 'ru' : locale);

    const currentVoices = voices.length > 0 ? voices : window.speechSynthesis.getVoices();
    const resolution = resolveBestTtsVoice(targetLang, currentVoices);
    setActiveVoiceInfo(resolution);

    // Agar oʻzbekcha matn rus ovozi orqali oʻqilsa, kirill alifbosiga oʻgiriladi
    const processedText = resolution.needsTransliteration ? latinToUzbekCyrillic(clean) : clean;

    const sentences = splitTextIntoSentences(processedText);
    if (sentences.length === 0) return;

    let isCancelled = false;
    let currentIndex = 0;
    let heartbeatTimer: NodeJS.Timeout | null = null;

    speechQueueRef.current = {
      cancel: () => {
        isCancelled = true;
        if (heartbeatTimer) clearInterval(heartbeatTimer);
        window.speechSynthesis.cancel();
      },
    };

    setIsSpeaking(true);

    // Chrome TTS timeout bypass
    heartbeatTimer = setInterval(() => {
      if (typeof window !== 'undefined' && window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    }, 5000);

    const speakSentence = (index: number) => {
      if (isCancelled || index >= sentences.length) {
        if (heartbeatTimer) clearInterval(heartbeatTimer);
        setIsSpeaking(false);
        speechQueueRef.current = null;
        return;
      }

      const utterance = new SpeechSynthesisUtterance(sentences[index]!);
      if (resolution.voice) {
        utterance.voice = resolution.voice;
      }
      utterance.lang = resolution.effectiveLang;
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      utterance.onend = () => {
        if (!isCancelled) {
          speakSentence(index + 1);
        }
      };

      utterance.onerror = (e) => {
        if (e.error !== 'canceled' && e.error !== 'interrupted') {
          console.warn('SpeechSynthesis error:', e.error);
        }
        if (heartbeatTimer) clearInterval(heartbeatTimer);
        setIsSpeaking(false);
        speechQueueRef.current = null;
      };

      window.speechSynthesis.speak(utterance);
    };

    speakSentence(currentIndex);
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
        activeVoiceInfo,
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
