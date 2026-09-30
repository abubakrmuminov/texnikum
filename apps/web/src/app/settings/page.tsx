'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Check,
  Image as ImageIcon,
  RotateCcw,
  Sparkles,
  Type,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useAccessibility, A11yTheme } from '@/components/accessibility/accessibility-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage(): JSX.Element {
  const {
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
  } = useAccessibility();

  const [testSpeechStatus, setTestSpeechStatus] = useState<string>('');

  const handleTestSpeech = () => {
    const sampleText =
      'Siz Fargʻona shahri 2-son texnikumi rasmiy taʼlim portalining maxsus imkoniyatlar boʻlimidasiz. Ovozli sintez muvaffaqiyatli ishlamoqda.';
    speakText(sampleText, 'uz');
    setTestSpeechStatus('Ovoz namunasi yangramoqda...');
    setTimeout(() => setTestSpeechStatus(''), 7000);
  };

  const THEMES: { id: A11yTheme; name: string; desc: string; sampleBg: string; sampleText: string; border: string }[] = [
    {
      id: 'default',
      name: 'Standart (Yorugʻ)',
      desc: 'Taʼlim portalining asosiy dizayni',
      sampleBg: 'bg-white',
      sampleText: 'text-slate-900',
      border: 'border-slate-300',
    },
    {
      id: 'dark',
      name: 'Qorongʻi mavzu',
      desc: 'Koʻz toliqishini kamaytirish uchun qora fon',
      sampleBg: 'bg-slate-950',
      sampleText: 'text-slate-100',
      border: 'border-slate-700',
    },
    {
      id: 'contrast-bw',
      name: 'Oq fonda qora',
      desc: 'WCAG 2.1 AA va OʻRQ-641 boʻyicha maksimal kontrast',
      sampleBg: 'bg-white',
      sampleText: 'text-black font-bold',
      border: 'border-black border-2',
    },
    {
      id: 'contrast-wb',
      name: 'Qora fonda oq',
      desc: 'Inversiyalangan yuqori kontrast',
      sampleBg: 'bg-black',
      sampleText: 'text-white font-bold',
      border: 'border-white border-2',
    },
    {
      id: 'contrast-blue',
      name: 'Moviy fonda toʻq koʻk',
      desc: 'Koʻrish toliqishini kamaytiruvchi yumshoq spektral kontrast',
      sampleBg: 'bg-sky-200',
      sampleText: 'text-blue-950 font-bold',
      border: 'border-blue-950 border-2',
    },
    {
      id: 'contrast-sepia',
      name: 'Bej fonda toʻq jigarrang',
      desc: 'Uzoq vaqt qulay oʻqish uchun iliq sepia rangi',
      sampleBg: 'bg-amber-100',
      sampleText: 'text-amber-950 font-bold',
      border: 'border-amber-900 border-2',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
      {/* Навигация назад и Заголовок */}
      <div className="flex flex-col gap-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors w-fit"
        >
          <ArrowLeft className="size-4" />
          <span>Bosh sahifaga qaytish</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Maxsus imkoniyatlar sozlamalari (WCAG 2.1 AA)
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Koʻrish imkoniyati cheklangan va zaif koʻruvchi tashrif buyuruvchilar uchun portal koʻrinishini shaxsiylashtirish.
              Barcha sozlamalar brauzeringizda avtomatik saqlanadi (Oʻzbekiston Respublikasining 641-sonli Qonuni talablariga muvofiq).
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={resetSettings}
            className="gap-1.5 shrink-0 text-xs"
          >
            <RotateCcw className="size-3.5" />
            Sozlamalarni tiklash
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* 1. Выбор цветовой схемы (Контрастность) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              <span>1. Rang sxemasi va kontrastlik</span>
            </CardTitle>
            <CardDescription>
              Idrokingiz uchun eng qulay boʻlgan rang variantini tanlang.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {THEMES.map((t) => {
                const isSelected = theme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id)}
                    className={`flex flex-col text-left p-3.5 rounded-lg border transition-all text-xs focus:outline-none focus:ring-2 focus:ring-ring ${
                      isSelected
                        ? 'border-primary ring-2 ring-primary/40 bg-accent/40 font-semibold'
                        : 'border-border hover:bg-accent/20'
                    }`}
                    aria-pressed={isSelected}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className={`size-6 rounded border ${t.border} ${t.sampleBg} flex items-center justify-center`}
                      >
                        <span className={`text-[10px] ${t.sampleText}`}>Аа</span>
                      </div>
                      {isSelected && <Check className="size-4 text-primary" />}
                    </div>
                    <span className="font-bold text-sm text-foreground">{t.name}</span>
                    <span className="text-muted-foreground text-[11px] mt-0.5">{t.desc}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 2. Размер шрифта */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Type className="size-5 text-primary" />
              <span>2. Matn shrifti oʻlchami</span>
            </CardTitle>
            <CardDescription>
              Sayt strukturasini buzmagan holda matn oʻlchamini kattalashtirish.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setFontSize('normal')}
                className={`p-4 rounded-lg border text-center transition-all focus:outline-none focus:ring-2 focus:ring-ring ${
                  fontSize === 'normal'
                    ? 'border-primary bg-accent/40 ring-2 ring-primary/40 font-bold'
                    : 'border-border hover:bg-accent/20'
                }`}
                aria-pressed={fontSize === 'normal'}
              >
                <span className="text-base block">Standart</span>
                <span className="text-xs text-muted-foreground">100% (16px)</span>
              </button>
              <button
                type="button"
                onClick={() => setFontSize('large')}
                className={`p-4 rounded-lg border text-center transition-all focus:outline-none focus:ring-2 focus:ring-ring ${
                  fontSize === 'large'
                    ? 'border-primary bg-accent/40 ring-2 ring-primary/40 font-bold'
                    : 'border-border hover:bg-accent/20'
                }`}
                aria-pressed={fontSize === 'large'}
              >
                <span className="text-lg block">Katta</span>
                <span className="text-xs text-muted-foreground">120% (19px)</span>
              </button>
              <button
                type="button"
                onClick={() => setFontSize('xlarge')}
                className={`p-4 rounded-lg border text-center transition-all focus:outline-none focus:ring-2 focus:ring-ring ${
                  fontSize === 'xlarge'
                    ? 'border-primary bg-accent/40 ring-2 ring-primary/40 font-bold'
                    : 'border-border hover:bg-accent/20'
                }`}
                aria-pressed={fontSize === 'xlarge'}
              >
                <span className="text-xl block">Juda katta</span>
                <span className="text-xs text-muted-foreground">140% (22px)</span>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* 3. Кернинг и Изображения */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Межбуквенный интервал */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Type className="size-4 text-primary" />
                <span>3. Harflararo oraliq (kerning)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setLetterSpacing('normal')}
                className={`p-3 rounded border text-left text-sm transition-all focus:outline-none focus:ring-2 focus:ring-ring ${
                  letterSpacing === 'normal'
                    ? 'border-primary bg-accent/40 font-bold'
                    : 'border-border hover:bg-accent/20'
                }`}
                aria-pressed={letterSpacing === 'normal'}
              >
                Standart oraliq
              </button>
              <button
                type="button"
                onClick={() => setLetterSpacing('wide')}
                className={`p-3 rounded border text-left text-sm transition-all tracking-wider focus:outline-none focus:ring-2 focus:ring-ring ${
                  letterSpacing === 'wide'
                    ? 'border-primary bg-accent/40 font-bold'
                    : 'border-border hover:bg-accent/20'
                }`}
                aria-pressed={letterSpacing === 'wide'}
              >
                Kengaytirilgan oraliq (+0.12em)
              </button>
            </CardContent>
          </Card>

          {/* Отображение изображений */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ImageIcon className="size-4 text-primary" />
                <span>4. Rasmlarni koʻrsatish</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setImagesMode('show')}
                className={`p-3 rounded border text-left text-sm transition-all focus:outline-none focus:ring-2 focus:ring-ring ${
                  imagesMode === 'show'
                    ? 'border-primary bg-accent/40 font-bold'
                    : 'border-border hover:bg-accent/20'
                }`}
                aria-pressed={imagesMode === 'show'}
              >
                Barcha rasmlarni koʻrsatish
              </button>
              <button
                type="button"
                onClick={() => setImagesMode('grayscale')}
                className={`p-3 rounded border text-left text-sm transition-all focus:outline-none focus:ring-2 focus:ring-ring ${
                  imagesMode === 'grayscale'
                    ? 'border-primary bg-accent/40 font-bold'
                    : 'border-border hover:bg-accent/20'
                }`}
                aria-pressed={imagesMode === 'grayscale'}
              >
                Oq-qora fotosuratlar
              </button>
              <button
                type="button"
                onClick={() => setImagesMode('hide')}
                className={`p-3 rounded border text-left text-sm transition-all focus:outline-none focus:ring-2 focus:ring-ring ${
                  imagesMode === 'hide'
                    ? 'border-primary bg-accent/40 font-bold'
                    : 'border-border hover:bg-accent/20'
                }`}
                aria-pressed={imagesMode === 'hide'}
              >
                Rasmlarni yashirish (faqat matn)
              </button>
            </CardContent>
          </Card>
        </div>

        {/* 5. Синтез речи (Text-to-Speech) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Volume2 className="size-5 text-primary" />
              <span>5. Ovozli sintezator (Matnlarni ovozli oʻqish)</span>
            </CardTitle>
            <CardDescription>
              Matnlarni ovozli oʻqish uchun qurilmangizdagi rechevoy sintezator (Web Speech API) texnologiyasidan foydalaniladi.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-1 max-w-md">
              <span className="font-semibold text-sm">
                Ovoz holati: {ttsEnabled ? 'Yoqilgan' : 'Oʻchirilgan'}
              </span>
              <span className="text-xs text-muted-foreground">
                Yoqilganda sahifada belgilangan har qanday matn va maqolalar avtomatik ovozli oʻqiladi.
              </span>
              {activeVoiceInfo && (
                <div className="text-[11px] text-muted-foreground bg-muted/60 px-2.5 py-1.5 rounded border border-border/50 mt-1">
                  <span className="font-bold text-foreground">Tanlangan ovoz:</span> {activeVoiceInfo.voiceName} • {activeVoiceInfo.description}
                </div>
              )}
              {testSpeechStatus && (
                <span className="text-xs text-primary font-medium mt-1 animate-pulse">
                  {testSpeechStatus}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={ttsEnabled ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTtsEnabled(!ttsEnabled)}
              >
                {ttsEnabled ? 'Ovozni oʻchirish' : 'Ovozni yoqish'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={isSpeaking ? stopSpeech : handleTestSpeech}
                className="gap-1.5"
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="size-4 text-destructive" />
                    <span>Toʻxtatish</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="size-4" />
                    <span>Ovozni tekshirish</span>
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
