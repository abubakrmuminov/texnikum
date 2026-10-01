'use client';

import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useAccessibility } from './accessibility-provider';
import { useAppLocale } from '@/components/i18n/locale-provider';
import { Button } from '@/components/ui/button';

interface TtsButtonProps {
  textToSpeak: string;
  className?: string;
}

export function TtsButton({ textToSpeak, className }: TtsButtonProps): JSX.Element {
  const { locale } = useAppLocale();
  const { speakText, stopSpeech, isSpeaking } = useAccessibility();

  const handleToggle = () => {
    if (isSpeaking) {
      stopSpeech();
    } else {
      speakText(textToSpeak);
    }
  };

  const buttonLabel = isSpeaking
    ? (locale === 'uz' ? 'Toʻxtatish' : 'Остановить')
    : (locale === 'uz' ? 'Tinglash' : 'Слушать');

  const ariaLabel = isSpeaking
    ? (locale === 'uz' ? 'Ovozli oʻqishni toʻxtatish' : 'Остановить голосовое чтение')
    : (locale === 'uz' ? 'Maqolani ovozli eshitish' : 'Прослушать материал вслух');

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleToggle}
      className={`text-xs gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className || ''}`}
      aria-label={ariaLabel}
    >
      {isSpeaking ? (
        <>
          <VolumeX className="size-3.5 text-destructive animate-pulse" aria-hidden="true" />
          <span>{buttonLabel}</span>
        </>
      ) : (
        <>
          <Volume2 className="size-3.5 text-primary" aria-hidden="true" />
          <span>{buttonLabel}</span>
        </>
      )}
    </Button>
  );
}
