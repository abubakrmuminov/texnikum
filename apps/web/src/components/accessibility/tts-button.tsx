'use client';

import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useAccessibility } from './accessibility-provider';
import { Button } from '@/components/ui/button';

interface TtsButtonProps {
  textToSpeak: string;
  className?: string;
}

export function TtsButton({ textToSpeak, className }: TtsButtonProps): JSX.Element {
  const { speakText, stopSpeech, isSpeaking } = useAccessibility();

  const handleToggle = () => {
    if (isSpeaking) {
      stopSpeech();
    } else {
      speakText(textToSpeak);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleToggle}
      className={`text-xs gap-1.5 focus:outline-none focus:ring-2 focus:ring-ring ${className || ''}`}
      aria-label={isSpeaking ? 'Остановить голосовое чтение' : 'Прослушать материал вслух'}
    >
      {isSpeaking ? (
        <>
          <VolumeX className="size-3.5 text-destructive animate-pulse" aria-hidden="true" />
          <span>Остановить чтение</span>
        </>
      ) : (
        <>
          <Volume2 className="size-3.5 text-primary" aria-hidden="true" />
          <span>Прослушать статью</span>
        </>
      )}
    </Button>
  );
}
