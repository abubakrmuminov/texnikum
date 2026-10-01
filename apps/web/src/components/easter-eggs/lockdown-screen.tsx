'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  Scale,
  ExternalLink,
  RefreshCw,
  Info,
  CheckCircle2,
  FileCode2,
} from 'lucide-react';
import { ARCHITECT_CREDENTIALS, TamperReason } from '@/lib/integrity-guard';

interface LockdownScreenProps {
  reason?: TamperReason;
}

export function LockdownScreen({ reason = 'NAME_TAMPERED' }: LockdownScreenProps): JSX.Element {
  const [lang, setLang] = useState<'uz' | 'ru'>('uz');
  const [activeTab, setActiveTab] = useState<'overview' | 'legal'>('overview');
  const [isChecking, setIsChecking] = useState(false);

  const handleRetry = () => {
    setIsChecking(true);
    setTimeout(() => {
      window.location.reload();
    }, 350);
  };

  const getReasonUz = (code: TamperReason) => {
    switch (code) {
      case 'NAME_TAMPERED':
        return 'Sayt quyi qismidagi (footer) muallif va yetakchi arxitektor ismi oʻzgartirilgan yoki oʻchirilgan (kutilgan: Abubakr Muminov).';
      case 'SIGNATURE_MISMATCH':
        return 'Litsenziya kriptografik xesh-imzosi tizim standarti bilan mos kelmadi.';
      case 'BADGE_ABSENT':
        return 'Mualliflik identifikatori (#platform-architect-badge) sayt sahifasidan olib tashlangan.';
      case 'BADGE_CONCEALED':
        return 'Mualliflik belgisi CSS qoidalari orqali (display: none / opacity / visibility) yashirilgan.';
      case 'URL_CORRUPTED':
        return 'Muallifning GitHub profili havolasi oʻzgartirilgan yoki notoʻgʻri koʻrsatilgan.';
      default:
        return 'Platforma dasturiy taʼminot yaxlitligi buzilgan.';
    }
  };

  const getReasonRu = (code: TamperReason) => {
    switch (code) {
      case 'NAME_TAMPERED':
        return 'Имя ведущего архитектора платформы в футере было изменено или удалено (ожидалось: Abubakr Muminov).';
      case 'SIGNATURE_MISMATCH':
        return 'Криптографическая сигнатура лицензии не совпадает с публичным ключом разработчика.';
      case 'BADGE_ABSENT':
        return 'Обязательный идентификационный блок авторства (#platform-architect-badge) удален из DOM-дерева.';
      case 'BADGE_CONCEALED':
        return 'Обнаружена попытка сокрытия плашки авторства через стили CSS (display: none / opacity / visibility).';
      case 'URL_CORRUPTED':
        return 'Ссылка на профиль разработчика на GitHub была изменена или повреждена.';
      default:
        return 'Нарушена архитектурная целостность платформы.';
    }
  };

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      className="fixed inset-0 z-[2147483647] flex items-center justify-center p-4 sm:p-6 bg-background/85 backdrop-blur-md text-foreground select-none overflow-y-auto"
    >
      <div className="max-w-2xl w-full border border-border rounded-2xl bg-card text-card-foreground p-6 sm:p-8 shadow-2xl relative my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Верхняя статусная панель с языковым переключателем */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-5 mb-5">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <ShieldAlert className="size-5" />
            </div>
            <div>
              <h1 className="font-bold text-base sm:text-lg text-foreground tracking-tight">
                {lang === 'uz'
                  ? 'Mualliflik yaxlitligi va litsenziya nazorati'
                  : 'Контроль авторской целостности и лицензии'}
              </h1>
              <p className="text-xs text-muted-foreground">
                Kasb-hunar taʼlimi portali • OʻRQ-42 / OʻRQ-637
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            {/* Переключатель языков O'zbekcha / Русский */}
            <div className="flex items-center p-0.5 rounded-lg bg-muted border border-border text-[11px] font-medium">
              <button
                type="button"
                onClick={() => setLang('uz')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  lang === 'uz'
                    ? 'bg-background text-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Oʻzbekcha
              </button>
              <button
                type="button"
                onClick={() => setLang('ru')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  lang === 'ru'
                    ? 'bg-background text-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Русский
              </button>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25 shrink-0">
              <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span>{lang === 'uz' ? 'TIKLASH ZARUR' : 'ТРЕБУЕТСЯ ВОССТАНОВЛЕНИЕ'}</span>
            </div>
          </div>
        </div>

        {/* Переключатель вкладок: Sababi / Qonuniy asos */}
        <div className="flex items-center gap-2 border-b border-border pb-3 mb-5 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'bg-muted text-foreground font-semibold border border-border/80'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Info className="size-3.5" />
            <span>{lang === 'uz' ? 'Bloklanish sababi' : 'Причина приостановки'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('legal')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'legal'
                ? 'bg-muted text-foreground font-semibold border border-border/80'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Scale className="size-3.5" />
            <span>
              {lang === 'uz'
                ? 'Qonuniy asos (Oʻzbekiston qonunchiligi)'
                : 'Юридическое основание (Закон РУз)'}
            </span>
          </button>
        </div>

        {/* Вкладка 1: Причина блокировки */}
        {activeTab === 'overview' && (
          <div className="space-y-4 text-xs sm:text-sm text-foreground leading-relaxed mb-6">
            <div className="p-4 rounded-xl bg-muted/60 border border-border space-y-2">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <FileCode2 className="size-4 text-primary" />
                <span>{lang === 'uz' ? 'Nima sodir boʻldi?' : 'Что произошло?'}</span>
              </div>
              <p className="text-muted-foreground text-xs sm:text-[13px] leading-normal">
                {lang === 'uz' ? getReasonUz(reason) : getReasonRu(reason)}
              </p>
              <div className="pt-2 text-[11px] text-muted-foreground font-mono">
                {lang === 'uz' ? 'Diagnostika kodi:' : 'Диагностический код:'}{' '}
                <span className="text-amber-600 dark:text-amber-400 font-semibold">{reason}</span>{' '}
                (ERR_ARCHITECT_INTEGRITY_TAMPER)
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {lang === 'uz'
                ? 'Rasmiy taʼlim portali dasturiy kodida arxitektura yaxlitligi va mualliflik huquqi himoyasi oʻrnatilgan. Mualliflik maʼlumotlari oʻchirilganda yoki yashirilganda, tizim platforma xavfsizligini taʼminlash uchun sahifalar faoliyatini avtomatik toʻxtatadi.'
                : 'В исходном коде образовательного портала предусмотрен защитный контур авторской целостности. При попытке вырезать авторские реквизиты платформа временно приостанавливает обслуживание страниц, защищая интеллектуальный вклад архитектора.'}
            </p>
          </div>
        )}

        {/* Вкладка 2: Юридическое обоснование по законам РУз */}
        {activeTab === 'legal' && (
          <div className="space-y-3.5 text-xs text-foreground leading-relaxed mb-6 max-h-64 overflow-y-auto pr-1">
            <div className="p-3.5 rounded-xl bg-muted/60 border border-border space-y-2.5">
              <div className="font-semibold text-primary flex items-center gap-1.5 text-xs sm:text-[13px]">
                <Scale className="size-4" />
                <span>
                  {lang === 'uz'
                    ? 'Oʻzbekiston Respublikasining «Mualliflik huquqi va turdosh huquqlar toʻgʻrisida»gi Qonuni (OʻRQ-42)'
                    : 'Закон РУз № ЗРУ-42 «Об авторском праве и смежных правах»'}
                </span>
              </div>
              <ul className="space-y-2.5 text-muted-foreground text-xs">
                <li>
                  <strong className="text-foreground">
                    {lang === 'uz'
                      ? '18-modda (Muallifning shaxsiy nomulkiy huquqlari):'
                      : 'Статья 18 (Личные неимущественные права автора):'}
                  </strong>{' '}
                  {lang === 'uz'
                    ? 'Muallif oʻz asariga nisbatan muallif deb eʼtirof etilish huquqiga (mualliflik huquqi) hamda asardan oʻzining haqiqiy ismi bilan foydalanish huquqiga (muallif nomi huquqi) ega. Ushbu huquqlar daxlsiz, begonalashtirilmas va muddatsizdir.'
                    : 'Автору принадлежит исключительное право признаваться автором произведения (право авторства) и право использовать или разрешать использовать произведение под своим подлинным именем (право на имя). Данные права являются неотчуждаемыми и бессрочными.'}
                </li>
                <li>
                  <strong className="text-foreground">
                    {lang === 'uz'
                      ? '60-modda (Mualliflik huquqini himoya qilishning texnik vositalari):'
                      : 'Статья 60 (Технические средства защиты авторского права):'}
                  </strong>{' '}
                  {lang === 'uz'
                    ? 'Muallif asardan ruxsatsiz foydalanishni cheklovchi va mualliflik huquqini himoya qiluvchi har qanday texnik vositalarni (dasturiy blokirovka, tekshirish kodlari) qoʻllashga haqli. Huquqlar toʻgʻrisidagi axborotni muallif ruxsatisiz oʻchirish qonun bilan taqiqlanadi.'
                    : 'Автор вправе использовать любые технологии и технические средства (включая программные триггеры целостности), контролирующие доступ к произведению. Удаление или модификация информации об авторстве без разрешения правообладателя является правонарушением.'}
                </li>
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-muted/40 border border-border/60 text-muted-foreground text-[11px]">
              <strong className="text-foreground">
                {lang === 'uz'
                  ? 'Oʻzbekiston Respublikasi Fuqarolik kodeksi (1051, 1056-moddalar):'
                  : 'Гражданский кодекс РУз (ст. 1051, 1056):'}
              </strong>{' '}
              {lang === 'uz'
                ? 'Dasturiy taʼminot muallifligini oʻzlashtirish (plagiat) yoki muallif nomini soxtalashtirish qonuniy javobgarlikka va etkazilgan zararni qoplashga sabab boʻladi.'
                : 'Присвоение авторства (плагиат) либо искажение авторской подписи влечет гражданско-правовую ответственность вплоть до взыскания компенсации.'}
            </div>
          </div>
        )}

        {/* Досье ведущего архитектора платформы */}
        <div className="rounded-xl bg-muted/40 border border-border p-4 sm:p-5 mb-5 space-y-3">
          <div className="flex items-center justify-between border-b border-border/80 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-primary" />
              <span className="text-foreground font-semibold text-xs uppercase tracking-wide">
                {lang === 'uz'
                  ? 'Platforma bosh arxitektori va yetakchi muhandisi'
                  : 'Автор и ведущий архитектор платформы'}
              </span>
            </div>
            <span className="text-[11px] text-primary font-medium">Lead Platform Architect</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-foreground">
            <div>
              <span className="text-muted-foreground">{lang === 'uz' ? 'Muallif: ' : 'Автор: '}</span>
              <strong className="text-foreground font-semibold">{ARCHITECT_CREDENTIALS.NAME}</strong>
            </div>
            <div>
              <span className="text-muted-foreground">Telegram: </span>
              <a
                href="https://t.me/abubakr_ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1 font-medium"
              >
                <span>{ARCHITECT_CREDENTIALS.TELEGRAM}</span>
                <ExternalLink className="size-3" />
              </a>
            </div>
            <div>
              <span className="text-muted-foreground">GitHub: </span>
              <a
                href={ARCHITECT_CREDENTIALS.GITHUB}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1 font-medium"
              >
                <span>github.com/abubakrmuminov</span>
                <ExternalLink className="size-3" />
              </a>
            </div>
            <div>
              <span className="text-muted-foreground">Email: </span>
              <a
                href={`mailto:${ARCHITECT_CREDENTIALS.EMAIL}`}
                className="text-primary hover:underline font-medium"
              >
                {ARCHITECT_CREDENTIALS.EMAIL}
              </a>
            </div>
            <div>
              <span className="text-muted-foreground">{lang === 'uz' ? 'Telefon: ' : 'Телефон: '}</span>
              <span className="text-foreground font-medium">+998 93 843 81 61</span>
            </div>
            <div>
              <span className="text-muted-foreground">{lang === 'uz' ? 'Muassasa: ' : 'Организация: '}</span>
              <span className="text-foreground">Kasb-hunar taʼlimi portali</span>
            </div>
          </div>
        </div>

        {/* Инструкция по разблокировке и кнопка */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground text-center sm:text-left">
            <CheckCircle2 className="size-4 text-emerald-500 shrink-0 hidden sm:block" />
            <span>
              {lang === 'uz' ? (
                <>
                  Blokdan chiqarish uchun <code className="text-foreground bg-muted px-1.5 py-0.5 rounded font-mono text-[11px] border border-border">footer.tsx</code> fayliga <strong className="text-foreground">Abubakr Muminov</strong> ismini qaytaring.
                </>
              ) : (
                <>
                  Для разблокировки верните имя <strong className="text-foreground">Abubakr Muminov</strong> в файл <code className="text-foreground bg-muted px-1.5 py-0.5 rounded font-mono text-[11px] border border-border">footer.tsx</code>.
                </>
              )}
            </span>
          </div>

          <button
            type="button"
            onClick={handleRetry}
            disabled={isChecking}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${isChecking ? 'animate-spin' : ''}`} />
            <span>{lang === 'uz' ? 'Qayta tekshirish' : 'Проверить снова'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
