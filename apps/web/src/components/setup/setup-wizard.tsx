'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLocale } from 'next-intl';
import {
  Building2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Loader2,
  Lock,
  Globe2,
  Check,
  X,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { apiClient } from '@/lib/api-client';
import { SetupStepper, STEP_ITEMS } from './setup-stepper';
import { evaluateColorContrast } from './contrast-utils';
import { UserRole, type UserProfile } from '@college/shared';

export interface SetupFormData {
  // Step 0
  setupToken: string;
  // Step 1
  nameUz: string;
  nameRu: string;
  shortNameUz: string;
  shortNameRu: string;
  institutionType: string;
  // Step 2
  logoUrl: string | null;
  faviconUrl: string | null;
  coatOfArmsUrl: string | null;
  brandPrimaryColor: string;
  // Step 3
  legalAddressUz: string;
  legalAddressRu: string;
  mainPhone: string;
  admissionPhone: string;
  trustPhone: string;
  contactEmail: string;
  admissionEmail: string;
  websiteDomain: string;
  workHoursUz: string;
  workHoursRu: string;
  geoLatitude: number;
  geoLongitude: number;
  socialTelegram: string;
  socialInstagram: string;
  socialFacebook: string;
  socialYoutube: string;
  // Step 4
  stirInn: string;
  bankName: string;
  bankAccount: string;
  mfoCode: string;
  jshshirPinfl: string;
  treasuryAccount: string;
  okedCode: string;
  directorNameUz: string;
  directorNameRu: string;
  directorPhone: string;
  // Step 5
  adminFullName: string;
  adminEmail: string;
  adminPassword: string;
  adminPasswordConfirm: string;
}

const INITIAL_DATA: SetupFormData = {
  setupToken: '',
  nameUz: '',
  nameRu: '',
  shortNameUz: '',
  shortNameRu: '',
  institutionType: 'texnikum',
  logoUrl: '/images/gerb.webp',
  faviconUrl: '/favicon.ico',
  coatOfArmsUrl: '/images/gerb.webp',
  brandPrimaryColor: '#1e3a8a',
  legalAddressUz: '',
  legalAddressRu: '',
  mainPhone: '+998 ',
  admissionPhone: '+998 ',
  trustPhone: '1006',
  contactEmail: '',
  admissionEmail: '',
  websiteDomain: '',
  workHoursUz: 'Dushanba – Shanba: 08:30 – 17:30',
  workHoursRu: 'Понедельник – Суббота: 08:30 – 17:30',
  geoLatitude: 41.3111,
  geoLongitude: 69.2797,
  socialTelegram: '',
  socialInstagram: '',
  socialFacebook: '',
  socialYoutube: '',
  stirInn: '',
  bankName: '',
  bankAccount: '',
  mfoCode: '',
  jshshirPinfl: '',
  treasuryAccount: '',
  okedCode: '85320',
  directorNameUz: '',
  directorNameRu: '',
  directorPhone: '',
  adminFullName: '',
  adminEmail: '',
  adminPassword: '',
  adminPasswordConfirm: '',
};

export function SetupWizard(): JSX.Element {
  const locale = useLocale();
  const isUz = locale === 'uz';

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [maxAccessibleStep, setMaxAccessibleStep] = useState<number>(0);
  const [formData, setFormData] = useState<SetupFormData>(INITIAL_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showToken, setShowToken] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isCheckingToken, setIsCheckingToken] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const headingRef = useRef<HTMLHeadingElement>(null);

  // Перемещение фокуса на заголовок при смене шага (a11y)
  useEffect(() => {
    headingRef.current?.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const updateField = <K extends keyof SetupFormData>(field: K, value: SetupFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Валидация текущего шага
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (!formData.setupToken.trim()) {
        newErrors.setupToken = isUz
          ? 'Oʻrnatish kodi (SETUP_TOKEN) kiritilishi shart'
          : 'Код установки (SETUP_TOKEN) обязателен';
      } else if (formData.setupToken.trim().length < 8) {
        newErrors.setupToken = isUz
          ? 'Oʻrnatish kodi juda qisqa (kamida 8 ta belgi)'
          : 'Слишком короткий код установки (минимум 8 знаков)';
      }
    }

    if (step === 1) {
      if (!formData.nameUz.trim() || formData.nameUz.trim().length < 3) {
        newErrors.nameUz = isUz
          ? 'Muassasa toʻliq nomini kiriting (kamida 3 ta belgi)'
          : 'Введите полное наименование (минимум 3 символа)';
      }
      if (!formData.nameRu.trim() || formData.nameRu.trim().length < 3) {
        newErrors.nameRu = isUz
          ? 'Muassasa nomini ruscha kiriting'
          : 'Введите наименование на русском языке';
      }
      if (!formData.shortNameUz.trim()) {
        newErrors.shortNameUz = isUz
          ? 'Qisqa nomni kiriting (masalan: Kasb-hunar texnikumi)'
          : 'Введите краткое наименование';
      }
      if (!formData.shortNameRu.trim()) {
        newErrors.shortNameRu = isUz
          ? 'Qisqa nomni ruscha kiriting'
          : 'Введите краткое наименование на русском';
      }
    }

    if (step === 2) {
      if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(formData.brandPrimaryColor)) {
        newErrors.brandPrimaryColor = isUz
          ? 'Rang kodi #RGB yoki #RRGGBB formatida boʻlishi kerak'
          : 'Код цвета должен быть в формате #RGB или #RRGGBB';
      }
    }

    if (step === 3) {
      if (!formData.legalAddressUz.trim()) {
        newErrors.legalAddressUz = isUz
          ? 'Yuridik manzilni kiriting'
          : 'Введите юридический адрес';
      }
      if (!formData.legalAddressRu.trim()) {
        newErrors.legalAddressRu = isUz
          ? 'Yuridik manzilni ruscha kiriting'
          : 'Введите адрес на русском';
      }
      if (!/^\+998\s?\(?\d{2}\)?\s?\d{3}[-\s]?\d{2}[-\s]?\d{2}$/.test(formData.mainPhone.trim())) {
        newErrors.mainPhone = isUz
          ? 'Telefon raqamini +998 (XX) XXX-XX-XX formatida kiriting'
          : 'Номер телефона должен быть в формате +998 (XX) XXX-XX-XX';
      }
      if (
        formData.admissionPhone.trim() &&
        formData.admissionPhone.trim() !== '+998' &&
        !/^\+998\s?\(?\d{2}\)?\s?\d{3}[-\s]?\d{2}[-\s]?\d{2}$/.test(formData.admissionPhone.trim())
      ) {
        newErrors.admissionPhone = isUz
          ? 'Qabul raqami +998 (XX) XXX-XX-XX formatida boʻlishi kerak'
          : 'Номер приемной должен быть в формате +998';
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail.trim())) {
        newErrors.contactEmail = isUz
          ? 'Toʻgʻri elektron pochta manzilini kiriting'
          : 'Введите корректный email адрес';
      }
    }

    if (step === 4) {
      if (!/^\d{9}$/.test(formData.stirInn.trim())) {
        newErrors.stirInn = isUz
          ? 'STIR / INN 9 ta raqamdan iborat boʻlishi kerak'
          : 'СТИР / ИНН должен состоять из 9 цифр';
      }
      if (formData.jshshirPinfl.trim() && !/^\d{14}$/.test(formData.jshshirPinfl.trim())) {
        newErrors.jshshirPinfl = isUz
          ? 'JSHSHIR / PINFL 14 ta raqamdan iborat boʻlishi kerak'
          : 'ПИНФЛ должен состоять из 14 цифр';
      }
    }

    if (step === 5) {
      if (!formData.adminFullName.trim() || formData.adminFullName.trim().length < 3) {
        newErrors.adminFullName = isUz
          ? 'Administrator F.I.O. ni kiriting'
          : 'Введите полное ФИО администратора';
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail.trim())) {
        newErrors.adminEmail = isUz
          ? 'Toʻgʻri email manzilini kiriting'
          : 'Введите корректный email';
      }
      const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=]).{8,}$/;
      if (!strongPasswordRegex.test(formData.adminPassword)) {
        newErrors.adminPassword = isUz
          ? 'Parol talablarga javob bermaydi (kamida 8 belgi, bosh/kichik harf, raqam va maxsus belgi)'
          : 'Пароль не удовлетворяет требованиям безопасности';
      }
      if (formData.adminPassword !== formData.adminPasswordConfirm) {
        newErrors.adminPasswordConfirm = isUz
          ? 'Kiritilgan parollar bir-biriga mos kelmadi'
          : 'Пароли не совпадают';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep(currentStep)) return;

    if (currentStep === 0) {
      setIsCheckingToken(true);
      setErrors((prev) => {
        const next = { ...prev };
        delete next.setupToken;
        return next;
      });
      try {
        await apiClient.verifySetupToken(formData.setupToken.trim());
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : isUz
            ? 'Notoʻgʻri oʻrnatish kodi (SETUP_TOKEN)'
            : 'Неверный код установки (SETUP_TOKEN)';
        setErrors((prev) => ({
          ...prev,
          setupToken: message,
        }));
        setIsCheckingToken(false);
        return;
      }
      setIsCheckingToken(false);
    }

    const next = currentStep + 1;
    setCurrentStep(next);
    setMaxAccessibleStep((prev) => Math.max(prev, next));
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Завершение мастера настройки
  const handleFinish = async () => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const payload: Record<string, unknown> = {
        setupToken: formData.setupToken.trim(),
        adminEmail: formData.adminEmail.trim(),
        adminPassword: formData.adminPassword,
        adminFullName: formData.adminFullName.trim(),
        nameUz: formData.nameUz.trim(),
        nameRu: formData.nameRu.trim(),
        shortNameUz: formData.shortNameUz.trim(),
        shortNameRu: formData.shortNameRu.trim(),
        institutionType: formData.institutionType,
        legalAddressUz: formData.legalAddressUz.trim(),
        legalAddressRu: formData.legalAddressRu.trim(),
        mainPhone: formData.mainPhone.trim(),
        admissionPhone: formData.admissionPhone.trim() || undefined,
        trustPhone: formData.trustPhone.trim() || undefined,
        contactEmail: formData.contactEmail.trim(),
        admissionEmail: formData.admissionEmail.trim() || undefined,
        websiteDomain: formData.websiteDomain.trim() || undefined,
        geoLatitude: Number(formData.geoLatitude) || 41.3111,
        geoLongitude: Number(formData.geoLongitude) || 69.2797,
        logoUrl: formData.logoUrl || null,
        faviconUrl: formData.faviconUrl || null,
        coatOfArmsUrl: formData.coatOfArmsUrl || null,
        brandPrimaryColor: formData.brandPrimaryColor || '#1e3a8a',
        socialTelegram: formData.socialTelegram.trim() || null,
        socialInstagram: formData.socialInstagram.trim() || null,
        socialFacebook: formData.socialFacebook.trim() || null,
        socialYoutube: formData.socialYoutube.trim() || null,
        stirInn: formData.stirInn.trim(),
        workHoursUz: formData.workHoursUz.trim(),
        workHoursRu: formData.workHoursRu.trim(),
        bankName: formData.bankName.trim() || null,
        bankAccount: formData.bankAccount.trim() || null,
        mfoCode: formData.mfoCode.trim() || null,
        jshshirPinfl: formData.jshshirPinfl.trim() || null,
        treasuryAccount: formData.treasuryAccount.trim() || null,
        okedCode: formData.okedCode.trim() || null,
        directorNameUz: formData.directorNameUz.trim() || null,
        directorNameRu: formData.directorNameRu.trim() || null,
        directorPhone: formData.directorPhone.trim() || null,
      };

      await apiClient.completeSetup(payload);

      // Автоматический вход нового администратора
      const newAdminUser: UserProfile = {
        id: 'a0000000-0000-0000-0000-000000000001',
        email: formData.adminEmail.trim(),
        fullName: formData.adminFullName.trim(),
        role: UserRole.ADMIN,
        avatarUrl: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        onboarding: {}, // Чистый онбординг для автоматического запуска тура
      };
      const sessionToken = `session-admin-${Date.now()}`;

      try {
        localStorage.setItem(
          'college_admin_session',
          JSON.stringify({ user: newAdminUser, token: sessionToken }),
        );
      } catch {
        // ignore
      }

      // Ревалидируем кэш на фронтенде
      await fetch('/api/revalidate-institution', { method: 'POST' }).catch(() => {});

      // Полный переход в панель управления с обновлением состояния
      window.location.href = '/admin';
    } catch (err) {
      setServerError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Оценка контрастности цвета
  const contrast = evaluateColorContrast(formData.brandPrimaryColor);

  // Правила пароля для индикатора
  const passRules = [
    { label: isUz ? 'Kamida 8 ta belgi' : 'Минимум 8 символов', valid: formData.adminPassword.length >= 8 },
    { label: isUz ? 'Katta harf (A-Z)' : 'Заглавная буква (A-Z)', valid: /[A-Z]/.test(formData.adminPassword) },
    { label: isUz ? 'Kichik harf (a-z)' : 'Строчная буква (a-z)', valid: /[a-z]/.test(formData.adminPassword) },
    { label: isUz ? 'Raqam (0-9)' : 'Цифра (0-9)', valid: /\d/.test(formData.adminPassword) },
    {
      label: isUz ? 'Maxsus belgi (@$!%*?&#^()_-+=)' : 'Специальный символ',
      valid: /[@$!%*?&#^()_\-+=]/.test(formData.adminPassword),
    },
    {
      label: isUz ? 'Parollar mos' : 'Пароли совпадают',
      valid: Boolean(formData.adminPassword && formData.adminPassword === formData.adminPasswordConfirm),
    },
  ];

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'logoUrl' | 'faviconUrl' | 'coatOfArmsUrl',
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.includes('svg')) {
      alert(
        isUz
          ? 'Xavfsizlik talablariga koʻra SVG formatidagi fayllar qabul qilinmaydi. Faqat PNG, JPG yoki WEBP tanlang.'
          : 'По соображениям безопасности SVG запрещен. Выберите PNG, JPG или WEBP.',
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        updateField(field, result);
      }
    };
    reader.readAsDataURL(file);
  };

  const stepTitlesMap: Record<string, string> = {
    step0: isUz ? 'Xavfsizlik' : 'Доступ',
    step1: isUz ? 'Muassasa' : 'Учреждение',
    step2: isUz ? 'Brending' : 'Брендинг',
    step3: isUz ? 'Aloqa' : 'Контакты',
    step4: isUz ? 'Rekvizitlar' : 'Реквизиты',
    step5: isUz ? 'Administrator' : 'Администратор',
    step6: isUz ? 'Tasdiqlash' : 'Запуск',
  };

  return (
    <div className="min-h-screen bg-muted/40 py-8 px-4 flex flex-col justify-between">
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Верхняя шапка мастера с переключателем языка */}
        <header className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow">
              <Building2 className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs font-semibold">
                  {isUz ? 'Birlamchi sozlash' : 'Первичный запуск'}
                </Badge>
                <span className="text-xs text-muted-foreground">White-label CMS</span>
              </div>
              <h1 className="text-lg font-bold tracking-tight text-foreground">
                {isUz ? 'Taʼlim muassasasi sozlash ustasi' : 'Мастер настройки образовательного учреждения'}
              </h1>
            </div>
          </div>

          <LanguageSwitcher />
        </header>

        {/* Индикатор прогресса (Stepper) */}
        <SetupStepper
          currentStep={currentStep}
          onStepClick={(step) => {
            if (validateStep(currentStep)) setCurrentStep(step);
          }}
          maxAccessibleStep={maxAccessibleStep}
          stepTitles={stepTitlesMap}
        />

        {/* Серверная ошибка (если возникла) */}
        {serverError && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <div className="flex-1">
              <AlertTitle>{isUz ? 'Xatolik' : 'Ошибка'}</AlertTitle>
              <AlertDescription>{serverError}</AlertDescription>
              {(serverError.toLowerCase().includes('allaqachon') ||
                serverError.toLowerCase().includes('уже') ||
                serverError.includes('404')) && (
                <div className="mt-3 flex items-center gap-3 flex-wrap">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="bg-background text-foreground hover:bg-muted"
                    onClick={() => {
                      window.location.href = '/admin/login';
                    }}
                  >
                    {isUz ? 'Boshqaruv paneliga kirish' : 'Войти в панель управления'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="bg-background text-foreground hover:bg-muted"
                    onClick={() => {
                      window.location.href = '/';
                    }}
                  >
                    {isUz ? 'Bosh sahifaga oʻtish' : 'Перейти на главную'}
                  </Button>
                </div>
              )}
            </div>
          </Alert>
        )}

        {/* Тело активного шага */}
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                {isUz ? `${currentStep + 1}-bosqich (jami 7)` : `Шаг ${currentStep + 1} из 7`}
              </span>
            </div>
            <CardTitle
              ref={headingRef}
              tabIndex={-1}
              className="text-xl font-bold tracking-tight focus:outline-none"
            >
              {currentStep === 0 && (isUz ? 'Tizimni oʻrnatish xavfsizlik kodi' : 'Код доступа к установке')}
              {currentStep === 1 && (isUz ? 'Muassasa identifikatsiyasi va nomi' : 'Идентификация учреждения')}
              {currentStep === 2 && (isUz ? 'Brending va ranglar palitrasi' : 'Брендинг и цветовая палитра')}
              {currentStep === 3 && (isUz ? 'Aloqa vositalari va manzil' : 'Контакты и геолокация')}
              {currentStep === 4 && (isUz ? 'Yuridik va moliyaviy rekvizitlar' : 'Юридические реквизиты')}
              {currentStep === 5 && (isUz ? 'Bosh administrator hisobini ochish' : 'Учетная запись администратора')}
              {currentStep === 6 && (isUz ? 'Maʼlumotlarni tekshirish va ishga tushirish' : 'Проверка и запуск')}
            </CardTitle>
            <CardDescription>
              {currentStep === 0 &&
                (isUz
                  ? 'Server administratoridan olingan maxsus SETUP_TOKEN kodini kiriting.'
                  : 'Введите секретный ключ SETUP_TOKEN из переменной окружения сервера.')}
              {currentStep === 1 &&
                (isUz
                  ? 'Muassasangizning davlat roʻyxatidagi rasmiy nomini oʻzbek va rus tillarida kiriting.'
                  : 'Укажите официальное зарегистрированное наименование учреждения на двух языках.')}
              {currentStep === 2 &&
                (isUz
                  ? 'Portalning logotipi, gerbi va brend rangini sozlang. Kontrast avtomatik tekshiriladi.'
                  : 'Настройте логотипы и фирменный цвет с автоматической проверкой контрастности WCAG.')}
              {currentStep === 3 &&
                (isUz
                  ? 'Rasmiy telefonlar, elektron pochta va OpenStreetMap koordinatalari.'
                  : 'Официальные телефоны, электронная почта и координаты на карте OpenStreetMap.')}
              {currentStep === 4 &&
                (isUz
                  ? '37-modda boʻyicha ochiq eʼlon qilinadigan rekvizitlar (barchasi ixtiyoriy).'
                  : 'Официальные реквизиты для уставных разделов (заполняются по желанию).')}
              {currentStep === 5 &&
                (isUz
                  ? 'Tizimni boshqarish uchun birinchi bosh administrator (Super Admin) maʼlumotlari.'
                  : 'Данные первой учетной записи суперадминистратора для входа в панель.')}
              {currentStep === 6 &&
                (isUz
                  ? 'Kiritilgan maʼlumotlarni tasdiqlang va taʼlim portalini ishga tushiring.'
                  : 'Подтвердите параметры и запустите работу образовательного портала.')}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* ШАГ 0: SETUP_TOKEN */}
            {currentStep === 0 && (
              <div className="space-y-4 max-w-lg">
                <Alert className="bg-primary/5 border-primary/20">
                  <Lock className="size-4 text-primary" />
                  <AlertTitle className="text-sm font-semibold text-primary">
                    {isUz ? 'Xavfsiz oʻrnatish' : 'Безопасная установка'}
                  </AlertTitle>
                  <AlertDescription className="text-xs text-muted-foreground mt-1">
                    {isUz
                      ? 'Ushbu kod loyiha ildizidagi .env faylida (SETUP_TOKEN) saqlanadi va begona shaxslar saytni oʻzlashtirib olishidan himoya qiladi.'
                      : 'Этот ключ задан в файле .env сервера (переменная SETUP_TOKEN) и защищает систему от перехвата сторонними лицами.'}
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="setupToken" className="text-sm font-medium">
                    {isUz ? 'Oʻrnatish kodi (SETUP_TOKEN)' : 'Код установки (SETUP_TOKEN)'} *
                  </Label>
                  <div className="relative">
                    <Input
                      id="setupToken"
                      type={showToken ? 'text' : 'password'}
                      value={formData.setupToken}
                      onChange={(e) => {
                        updateField('setupToken', e.target.value);
                        if (errors.setupToken) {
                          setErrors((prev) => {
                            const next = { ...prev };
                            delete next.setupToken;
                            return next;
                          });
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          void handleNext();
                        }
                      }}
                      placeholder={isUz ? 'Masalan: college-setup-secret-token...' : 'Например: college-setup-secret-token...'}
                      aria-invalid={Boolean(errors.setupToken)}
                      aria-describedby={errors.setupToken ? 'setupToken-error' : undefined}
                      className={errors.setupToken ? 'pr-10 border-destructive focus-visible:ring-destructive' : 'pr-10'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground focus:outline-none"
                      aria-label={showToken ? 'Kodni yashirish' : 'Kodni koʻrsatish'}
                    >
                      {showToken ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {errors.setupToken && (
                    <div
                      id="setupToken-error"
                      role="alert"
                      className="p-3.5 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive text-sm font-medium flex items-start gap-2.5 shadow-sm mt-2 animate-in fade-in slide-in-from-top-1"
                    >
                      <AlertCircle className="size-4 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold text-destructive">
                          {isUz ? 'Oʻrnatish kodi notoʻgʻri yoki yaroqsiz!' : 'Неверный код установки!'}
                        </p>
                        <p className="text-xs mt-1 text-destructive/90 leading-relaxed">{errors.setupToken}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ШАГ 1: ИДЕНТИФИКАЦИЯ УЧРЕЖДЕНИЯ */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nameUz">
                      {isUz ? 'Toʻliq nomi (Oʻzbekcha)' : 'Полное наименование (на узбекском)'} *
                    </Label>
                    <Input
                      id="nameUz"
                      value={formData.nameUz}
                      onChange={(e) => updateField('nameUz', e.target.value)}
                      placeholder={isUz ? 'Kasb-hunar taʼlimi texnikumi' : 'Техникум профессионального образования'}
                      aria-invalid={Boolean(errors.nameUz)}
                      aria-describedby={errors.nameUz ? 'nameUz-error' : undefined}
                    />
                    {errors.nameUz && (
                      <p id="nameUz-error" className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="size-3.5" />
                        {errors.nameUz}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nameRu">
                      {isUz ? 'Toʻliq nomi (Ruscha)' : 'Полное наименование (на русском)'} *
                    </Label>
                    <Input
                      id="nameRu"
                      value={formData.nameRu}
                      onChange={(e) => updateField('nameRu', e.target.value)}
                      placeholder="Техникум профессионального образования"
                      aria-invalid={Boolean(errors.nameRu)}
                      aria-describedby={errors.nameRu ? 'nameRu-error' : undefined}
                    />
                    {errors.nameRu && (
                      <p id="nameRu-error" className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="size-3.5" />
                        {errors.nameRu}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="shortNameUz">
                      {isUz ? 'Qisqa nomi (Oʻzbekcha)' : 'Краткое наименование (на узбекском)'} *
                    </Label>
                    <Input
                      id="shortNameUz"
                      value={formData.shortNameUz}
                      onChange={(e) => updateField('shortNameUz', e.target.value)}
                      placeholder="Kasb-hunar texnikumi"
                      aria-invalid={Boolean(errors.shortNameUz)}
                      aria-describedby={errors.shortNameUz ? 'shortNameUz-error' : undefined}
                    />
                    {errors.shortNameUz && (
                      <p id="shortNameUz-error" className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="size-3.5" />
                        {errors.shortNameUz}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shortNameRu">
                      {isUz ? 'Qisqa nomi (Ruscha)' : 'Краткое наименование (на русском)'} *
                    </Label>
                    <Input
                      id="shortNameRu"
                      value={formData.shortNameRu}
                      onChange={(e) => updateField('shortNameRu', e.target.value)}
                      placeholder="Профессиональный техникум"
                      aria-invalid={Boolean(errors.shortNameRu)}
                      aria-describedby={errors.shortNameRu ? 'shortNameRu-error' : undefined}
                    />
                    {errors.shortNameRu && (
                      <p id="shortNameRu-error" className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="size-3.5" />
                        {errors.shortNameRu}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{isUz ? 'Muassasa turi' : 'Тип образовательного учреждения'} *</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { value: 'texnikum', label: isUz ? 'Texnikum' : 'Техникум' },
                      { value: 'kollej', label: isUz ? 'Kollej' : 'Колледж' },
                      { value: 'litsey', label: isUz ? 'Akademik litsey' : 'Академический лицей' },
                      { value: 'kasb-hunar maktabi', label: isUz ? 'Kasb maktabi' : 'Профшкола' },
                    ].map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => updateField('institutionType', type.value)}
                        className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
                          formData.institutionType === type.value
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                            : 'bg-card text-foreground hover:bg-muted border-input'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ШАГ 2: БРЕНДИНГ И ЦВЕТА С ПРОВЕРКОЙ WCAG AA */}
            {currentStep === 2 && (
              <div className="space-y-6">
                {/* Выбор цвета и WCAG AA проверка */}
                <div className="space-y-3 p-4 rounded-xl border bg-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="brandPrimaryColor" className="text-sm font-semibold">
                        {isUz ? 'Asosiy brend rangi (HEX)' : 'Основной фирменный цвет (HEX)'} *
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {isUz
                          ? 'Tugmalar, havola va asosiy sarlavhalar ushbu rangda aks etadi.'
                          : 'Кнопки, шапка и активные элементы будут оформлены в этом цвете.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        id="brandPrimaryColorPicker"
                        value={formData.brandPrimaryColor}
                        onChange={(e) => updateField('brandPrimaryColor', e.target.value)}
                        className="size-9 rounded-md border cursor-pointer bg-transparent"
                        aria-label={isUz ? 'Rang tanlash' : 'Выбор цвета'}
                      />
                      <Input
                        id="brandPrimaryColor"
                        value={formData.brandPrimaryColor}
                        onChange={(e) => updateField('brandPrimaryColor', e.target.value)}
                        className="w-28 font-mono text-xs uppercase"
                        aria-invalid={Boolean(errors.brandPrimaryColor)}
                      />
                    </div>
                  </div>

                  {errors.brandPrimaryColor && (
                    <p className="text-xs text-destructive">{errors.brandPrimaryColor}</p>
                  )}

                  {/* Оценка доступности (Accessibility Badge) */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-muted-foreground">WCAG 2.1 AA:</span>
                      {contrast.passesAAWithWhite ? (
                        <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 text-[11px]">
                          <Check className="size-3" />
                          {isUz ? 'Mos keladi (kontrast 4.5+:1)' : 'Соответствует (контраст 4.5+:1)'}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-700 border-amber-400 gap-1 text-[11px]">
                          <AlertCircle className="size-3 text-amber-600" />
                          {isUz
                            ? `Ogohlantirish: oq matn bilan kontrast ${contrast.ratioWithWhite}:1 < 4.5:1`
                            : `Предупреждение: контраст с белым ${contrast.ratioWithWhite}:1 < 4.5:1`}
                        </Badge>
                      )}
                    </div>

                    <div className="text-muted-foreground">
                      {isUz ? 'Tavsiya etiladigan matn rangi:' : 'Рекомендуемый цвет текста:'}{' '}
                      <span className="font-mono font-bold text-foreground">
                        {contrast.recommendedTextColor === '#FFFFFF'
                          ? isUz
                            ? 'Oq (#FFFFFF)'
                            : 'Белый (#FFFFFF)'
                          : isUz
                            ? 'Toʻq qora (#0F172A)'
                            : 'Темный (#0F172A)'}
                      </span>
                    </div>
                  </div>

                  {/* Живой образец карты в выбранном цвете */}
                  <div className="pt-2">
                    <div
                      className="p-4 rounded-lg shadow-sm transition-all"
                      style={{
                        backgroundColor: formData.brandPrimaryColor,
                        color: contrast.recommendedTextColor,
                      }}
                    >
                      <h4 className="font-bold text-sm tracking-tight">
                        {isUz
                          ? `${formData.shortNameUz.trim() || 'Kasb-hunar texnikumi'} — Jonli koʻrinish`
                          : `${formData.shortNameRu.trim() || 'Профессиональный техникум'} — Предпросмотр стиля`}
                      </h4>
                      <p className="text-xs opacity-90 mt-1">
                        {isUz
                          ? 'Saytning asosiy elementlari ushbu rangda va maksimal oʻqilishi qulay matn bilan chiqadi.'
                          : 'Все ключевые кнопки и заголовки будут оформлены в этом цвете с комфортным контрастом.'}
                      </p>
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          className="px-3 py-1 text-xs font-semibold rounded shadow-sm opacity-90 hover:opacity-100 border border-current"
                        >
                          {isUz ? 'Namunaviy tugma' : 'Образец кнопки'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Логотип, герб, фавикон */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Логотип */}
                  <div className="space-y-2 p-3 rounded-lg border bg-card">
                    <Label className="text-xs font-semibold">{isUz ? 'Logotip' : 'Логотип'}</Label>
                    <div className="size-16 mx-auto rounded border bg-muted flex items-center justify-center overflow-hidden">
                      {formData.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={formData.logoUrl} alt="Logo" className="max-h-full object-contain" />
                      ) : (
                        <Building2 className="size-6 text-muted-foreground" />
                      )}
                    </div>
                    <label className="flex items-center justify-center gap-1.5 w-full py-1.5 px-2 rounded-md border border-input text-xs font-medium bg-background hover:bg-muted cursor-pointer transition">
                      <Upload className="size-3" />
                      <span>{isUz ? 'Faylni tanlash' : 'Выбрать файл'}</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(e) => handleFileUpload(e, 'logoUrl')}
                        className="sr-only"
                      />
                    </label>
                  </div>

                  {/* Фавикон */}
                  <div className="space-y-2 p-3 rounded-lg border bg-card">
                    <Label className="text-xs font-semibold">{isUz ? 'Favicon (Belgi)' : 'Иконка (Favicon)'}</Label>
                    <div className="size-16 mx-auto rounded border bg-muted flex items-center justify-center overflow-hidden">
                      {formData.faviconUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={formData.faviconUrl} alt="Favicon" className="size-8 object-contain" />
                      ) : (
                        <Globe2 className="size-6 text-muted-foreground" />
                      )}
                    </div>
                    <label className="flex items-center justify-center gap-1.5 w-full py-1.5 px-2 rounded-md border border-input text-xs font-medium bg-background hover:bg-muted cursor-pointer transition">
                      <Upload className="size-3" />
                      <span>{isUz ? 'Faylni tanlash' : 'Выбрать файл'}</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/x-icon"
                        onChange={(e) => handleFileUpload(e, 'faviconUrl')}
                        className="sr-only"
                      />
                    </label>
                  </div>

                  {/* Герб / Эмблема */}
                  <div className="space-y-2 p-3 rounded-lg border bg-card">
                    <Label className="text-xs font-semibold">{isUz ? 'Davlat gerbi / Emblema' : 'Герб / Эмблема'}</Label>
                    <div className="size-16 mx-auto rounded border bg-muted flex items-center justify-center overflow-hidden">
                      {formData.coatOfArmsUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={formData.coatOfArmsUrl} alt="Coat of arms" className="max-h-full object-contain" />
                      ) : (
                        <Building2 className="size-6 text-muted-foreground" />
                      )}
                    </div>
                    <label className="flex items-center justify-center gap-1.5 w-full py-1.5 px-2 rounded-md border border-input text-xs font-medium bg-background hover:bg-muted cursor-pointer transition">
                      <Upload className="size-3" />
                      <span>{isUz ? 'Faylni tanlash' : 'Выбрать файл'}</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(e) => handleFileUpload(e, 'coatOfArmsUrl')}
                        className="sr-only"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* ШАГ 3: КОНТАКТЫ И ГЕОЛОКАЦИЯ */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="legalAddressUz">
                      {isUz ? 'Yuridik manzil (Oʻzbekcha)' : 'Юридический адрес (на узбекском)'} *
                    </Label>
                    <Input
                      id="legalAddressUz"
                      value={formData.legalAddressUz}
                      onChange={(e) => updateField('legalAddressUz', e.target.value)}
                      placeholder={isUz ? 'Toshkent shahri, Mustaqillik shoh koʻchasi, 1-uy' : 'г. Ташкент, пр. Мустакиллик, д. 1'}
                      aria-invalid={Boolean(errors.legalAddressUz)}
                    />
                    {errors.legalAddressUz && (
                      <p className="text-xs text-destructive">{errors.legalAddressUz}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="legalAddressRu">
                      {isUz ? 'Yuridik manzil (Ruscha)' : 'Юридический адрес (на русском)'} *
                    </Label>
                    <Input
                      id="legalAddressRu"
                      value={formData.legalAddressRu}
                      onChange={(e) => updateField('legalAddressRu', e.target.value)}
                      placeholder="100000, г. Ташкент, пр. Мустакиллик, д. 1"
                      aria-invalid={Boolean(errors.legalAddressRu)}
                    />
                    {errors.legalAddressRu && (
                      <p className="text-xs text-destructive">{errors.legalAddressRu}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mainPhone">
                      {isUz ? 'Asosiy telefon (+998)' : 'Основной телефон (+998)'} *
                    </Label>
                    <Input
                      id="mainPhone"
                      value={formData.mainPhone}
                      onChange={(e) => updateField('mainPhone', e.target.value)}
                      placeholder="+998 (71) 200-00-00"
                      aria-invalid={Boolean(errors.mainPhone)}
                    />
                    {errors.mainPhone && (
                      <p className="text-xs text-destructive">{errors.mainPhone}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admissionPhone">
                      {isUz ? 'Qabul komissiyasi telefoni' : 'Телефон приемной комиссии'}
                    </Label>
                    <Input
                      id="admissionPhone"
                      value={formData.admissionPhone}
                      onChange={(e) => updateField('admissionPhone', e.target.value)}
                      placeholder="+998 (71) 200-00-01"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="trustPhone">
                      {isUz ? 'Ishonch telefoni' : 'Телефон доверия'}
                    </Label>
                    <Input
                      id="trustPhone"
                      value={formData.trustPhone}
                      onChange={(e) => updateField('trustPhone', e.target.value)}
                      placeholder="1006"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">
                      {isUz ? 'Rasmiy elektron pochta' : 'Официальный Email'} *
                    </Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => updateField('contactEmail', e.target.value)}
                      placeholder="info@texnikum.uz"
                      aria-invalid={Boolean(errors.contactEmail)}
                    />
                    {errors.contactEmail && (
                      <p className="text-xs text-destructive">{errors.contactEmail}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="websiteDomain">
                      {isUz ? 'Rasmiy veb-sayt domeni' : 'Официальный домен'}
                    </Label>
                    <Input
                      id="websiteDomain"
                      value={formData.websiteDomain}
                      onChange={(e) => updateField('websiteDomain', e.target.value)}
                      placeholder="texnikum.uz"
                    />
                  </div>
                </div>

                {/* Координаты и интерактивная карта OpenStreetMap */}
                <div className="space-y-2 p-3 rounded-lg border bg-card">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">
                      {isUz ? 'Karta koordinatalari (OpenStreetMap)' : 'Координаты на карте (OpenStreetMap)'}
                    </Label>
                    <div className="flex gap-1 text-[11px]">
                      <button
                        type="button"
                        onClick={() => {
                          updateField('geoLatitude', 40.3864);
                          updateField('geoLongitude', 71.7864);
                        }}
                        className="px-2 py-0.5 rounded bg-muted hover:bg-muted/80"
                      >
                        {isUz ? 'Fargʻona' : 'Фергана'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateField('geoLatitude', 41.3111);
                          updateField('geoLongitude', 69.2797);
                        }}
                        className="px-2 py-0.5 rounded bg-muted hover:bg-muted/80"
                      >
                        {isUz ? 'Toshkent' : 'Ташкент'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateField('geoLatitude', 39.6542);
                          updateField('geoLongitude', 66.9597);
                        }}
                        className="px-2 py-0.5 rounded bg-muted hover:bg-muted/80"
                      >
                        {isUz ? 'Samarqand' : 'Самарканд'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="geoLatitude" className="text-[11px] text-muted-foreground">
                        {isUz ? 'Kenglik (Lat)' : 'Широта (Lat)'}
                      </Label>
                      <Input
                        id="geoLatitude"
                        type="number"
                        step="0.0001"
                        value={formData.geoLatitude}
                        onChange={(e) => updateField('geoLatitude', parseFloat(e.target.value) || 0)}
                        className="text-xs"
                      />
                    </div>
                    <div>
                      <Label htmlFor="geoLongitude" className="text-[11px] text-muted-foreground">
                        {isUz ? 'Uzunlik (Lng)' : 'Долгота (Lng)'}
                      </Label>
                      <Input
                        id="geoLongitude"
                        type="number"
                        step="0.0001"
                        value={formData.geoLongitude}
                        onChange={(e) => updateField('geoLongitude', parseFloat(e.target.value) || 0)}
                        className="text-xs"
                      />
                    </div>
                  </div>

                  {/* Интерактивное окно OpenStreetMap */}
                  <div className="h-40 w-full rounded-md overflow-hidden border mt-2">
                    <iframe
                      title="OpenStreetMap campus preview"
                      width="100%"
                      height="100%"
                      loading="lazy"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${formData.geoLongitude - 0.015}%2C${formData.geoLatitude - 0.01}%2C${formData.geoLongitude + 0.015}%2C${formData.geoLatitude + 0.01}&layer=mapnik&marker=${formData.geoLatitude}%2C${formData.geoLongitude}`}
                      className="border-0 w-full h-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ШАГ 4: ЮРИДИЧЕСКИЕ И ФИНАНСОВЫЕ РЕКВИЗИТЫ */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="stirInn">
                    {isUz ? 'STIR / INN (9 ta raqam)' : 'СТИР / ИНН (9 цифр)'} *
                  </Label>
                  <Input
                    id="stirInn"
                    maxLength={9}
                    value={formData.stirInn}
                    onChange={(e) => updateField('stirInn', e.target.value.replace(/\D/g, ''))}
                    placeholder="302987654"
                    aria-invalid={Boolean(errors.stirInn)}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    {isUz
                      ? 'Oʻzbekiston Respublikasi «Taʼlim toʻgʻrisida»gi Qonuni 37-moddasiga asosan majburiy.'
                      : 'Обязательно в соответствии со статьей 37 Закона РУз «Об образовании».'}
                  </p>
                  {errors.stirInn && (
                    <p className="text-xs text-destructive">{errors.stirInn}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankName">
                      {isUz ? 'Xizmat koʻrsatuvchi bank' : 'Обслуживающий банк'}
                    </Label>
                    <Input
                      id="bankName"
                      value={formData.bankName}
                      onChange={(e) => updateField('bankName', e.target.value)}
                      placeholder={isUz ? 'AT «Aloqabank»' : 'Например: АКБ «Алокабанк»'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bankAccount">
                      {isUz ? 'Hisobraqam (20 ta raqam)' : 'Расчетный счет (20 цифр)'}
                    </Label>
                    <Input
                      id="bankAccount"
                      maxLength={20}
                      value={formData.bankAccount}
                      onChange={(e) => updateField('bankAccount', e.target.value.replace(/\D/g, ''))}
                      placeholder="23402000300100001010"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mfoCode">
                      {isUz ? 'Bank MFO kodi (5 ta raqam)' : 'МФО банка (5 цифр)'}
                    </Label>
                    <Input
                      id="mfoCode"
                      maxLength={5}
                      value={formData.mfoCode}
                      onChange={(e) => updateField('mfoCode', e.target.value.replace(/\D/g, ''))}
                      placeholder="00014"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jshshirPinfl">
                      {isUz ? 'JSHSHIR / PINFL (14 ta raqam)' : 'ЖШШИР / ПИНФЛ (14 цифр)'}
                    </Label>
                    <Input
                      id="jshshirPinfl"
                      maxLength={14}
                      value={formData.jshshirPinfl}
                      onChange={(e) => updateField('jshshirPinfl', e.target.value.replace(/\D/g, ''))}
                      placeholder="31205851234567"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="directorNameUz">
                      {isUz ? 'Direktor F.I.O. (Oʻzbekcha)' : 'ФИО директора (на узбекском)'}
                    </Label>
                    <Input
                      id="directorNameUz"
                      value={formData.directorNameUz}
                      onChange={(e) => updateField('directorNameUz', e.target.value)}
                      placeholder="Karimov Jasur Alisherovich"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="directorPhone">
                      {isUz ? 'Direktor xizmat telefoni' : 'Служебный телефон директора'}
                    </Label>
                    <Input
                      id="directorPhone"
                      value={formData.directorPhone}
                      onChange={(e) => updateField('directorPhone', e.target.value)}
                      placeholder="+998 (71) 200-00-01"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ШАГ 5: СОЗДАНИЕ ПЕРВОГО АДМИНИСТРАТОРА */}
            {currentStep === 5 && (
              <div className="space-y-4 max-w-lg">
                <div className="space-y-2">
                  <Label htmlFor="adminFullName">
                    {isUz ? 'Administrator toʻliq F.I.O.' : 'Полное ФИО администратора'} *
                  </Label>
                  <Input
                    id="adminFullName"
                    value={formData.adminFullName}
                    onChange={(e) => updateField('adminFullName', e.target.value)}
                    placeholder={isUz ? 'Qosimov Anvar Rustamovich' : 'Касымов Анвар Рустамович'}
                    aria-invalid={Boolean(errors.adminFullName)}
                  />
                  {errors.adminFullName && (
                    <p className="text-xs text-destructive">{errors.adminFullName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminEmail">
                    {isUz ? 'Administrator elektron pochtasi' : 'Электронная почта администратора'} *
                  </Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={formData.adminEmail}
                    onChange={(e) => updateField('adminEmail', e.target.value)}
                    placeholder="admin@texnikum.uz"
                    aria-invalid={Boolean(errors.adminEmail)}
                  />
                  {errors.adminEmail && (
                    <p className="text-xs text-destructive">{errors.adminEmail}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminPassword">
                    {isUz ? 'Xavfsiz parol' : 'Надежный пароль'} *
                  </Label>
                  <div className="relative">
                    <Input
                      id="adminPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.adminPassword}
                      onChange={(e) => updateField('adminPassword', e.target.value)}
                      placeholder="••••••••••••"
                      aria-invalid={Boolean(errors.adminPassword)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground focus:outline-none"
                      aria-label={showPassword ? 'Parolni yashirish' : 'Parolni koʻrsatish'}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {errors.adminPassword && (
                    <p className="text-xs text-destructive">{errors.adminPassword}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminPasswordConfirm">
                    {isUz ? 'Parolni qayta kiriting' : 'Подтверждение пароля'} *
                  </Label>
                  <Input
                    id="adminPasswordConfirm"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.adminPasswordConfirm}
                    onChange={(e) => updateField('adminPasswordConfirm', e.target.value)}
                    placeholder="••••••••••••"
                    aria-invalid={Boolean(errors.adminPasswordConfirm)}
                  />
                  {errors.adminPasswordConfirm && (
                    <p className="text-xs text-destructive">{errors.adminPasswordConfirm}</p>
                  )}
                </div>

                {/* Интерактивный чеклист надежности пароля */}
                <div className="p-3 rounded-lg border bg-muted/30 space-y-1.5 text-xs">
                  <span className="font-semibold text-foreground">
                    {isUz ? 'Parol xavfsizligi talablari:' : 'Требования к надежности пароля:'}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                    {passRules.map((rule, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-1.5 ${
                          rule.valid ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-muted-foreground'
                        }`}
                      >
                        {rule.valid ? (
                          <Check className="size-3.5 stroke-[3]" />
                        ) : (
                          <X className="size-3.5 opacity-50" />
                        )}
                        <span>{rule.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ШАГ 6: ПРОВЕРКА И ЗАПУСК СИСТЕМЫ */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <Alert className="bg-emerald-50/50 border-emerald-500/30 text-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-200">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  <AlertTitle className="font-semibold">
                    {isUz ? 'Tizim ishga tushirishga toʻliq tayyor!' : 'Все данные проверены и готовы к запуску!'}
                  </AlertTitle>
                  <AlertDescription className="text-xs mt-1">
                    {isUz
                      ? '«Tizimni ishga tushirish» tugmasini bosganingizdan soʻng maʼlumotlar bazaga yoziladi, boshqaruv oʻrnatiladi va siz avtomatik ravishda boshqaruv paneliga yoʻnaltirilasiz.'
                      : 'После подтверждения настройки будут сохранены, первый администратор активирован, а мастер установки опечатан.'}
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 rounded-lg border bg-card space-y-1">
                    <span className="font-semibold text-muted-foreground uppercase text-[10px]">
                      {isUz ? 'Muassasa' : 'Учреждение'}
                    </span>
                    <p className="font-bold text-sm text-foreground">{formData.nameUz}</p>
                    <p className="text-muted-foreground">{formData.nameRu}</p>
                    <Badge variant="outline" className="mt-1">
                      {formData.institutionType}
                    </Badge>
                  </div>

                  <div className="p-3 rounded-lg border bg-card space-y-1">
                    <span className="font-semibold text-muted-foreground uppercase text-[10px]">
                      {isUz ? 'Bosh administrator' : 'Суперадминистратор'}
                    </span>
                    <p className="font-bold text-sm text-foreground">{formData.adminFullName}</p>
                    <p className="text-muted-foreground">{formData.adminEmail}</p>
                    <Badge className="mt-1 bg-primary text-primary-foreground">Super Admin</Badge>
                  </div>

                  <div className="p-3 rounded-lg border bg-card space-y-1">
                    <span className="font-semibold text-muted-foreground uppercase text-[10px]">
                      {isUz ? 'Aloqa' : 'Контакты'}
                    </span>
                    <p className="text-foreground">
                      <strong>Tel:</strong> {formData.mainPhone}
                    </p>
                    <p className="text-foreground">
                      <strong>Email:</strong> {formData.contactEmail}
                    </p>
                    <p className="text-muted-foreground truncate">{formData.legalAddressUz}</p>
                  </div>

                  <div className="p-3 rounded-lg border bg-card space-y-1">
                    <span className="font-semibold text-muted-foreground uppercase text-[10px]">
                      {isUz ? 'Brend uslubi' : 'Стиль'}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <div
                        className="size-5 rounded border"
                        style={{ backgroundColor: formData.brandPrimaryColor }}
                      />
                      <span className="font-mono font-bold">{formData.brandPrimaryColor}</span>
                      <Badge variant="outline" className="text-[10px]">
                        WCAG AA: {contrast.ratioWithWhite}:1
                      </Badge>
                    </div>
                  </div>
                </div>

                {serverError && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="size-4" />
                    <div className="flex-1">
                      <AlertTitle>{isUz ? 'Xatolik' : 'Ошибка'}</AlertTitle>
                      <AlertDescription>{serverError}</AlertDescription>
                      {(serverError.toLowerCase().includes('allaqachon') ||
                        serverError.toLowerCase().includes('уже') ||
                        serverError.includes('404')) && (
                        <div className="mt-3 flex items-center gap-3 flex-wrap">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="bg-background text-foreground hover:bg-muted"
                            onClick={() => {
                              window.location.href = '/admin/login';
                            }}
                          >
                            {isUz ? 'Boshqaruv paneliga kirish' : 'Войти в панель управления'}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="bg-background text-foreground hover:bg-muted"
                            onClick={() => {
                              window.location.href = '/';
                            }}
                          >
                            {isUz ? 'Bosh sahifaga oʻtish' : 'Перейти на главную'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>

          <Separator />

          <CardFooter className="flex items-center justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0 || isSubmitting || isCheckingToken}
              className="gap-2"
            >
              <ArrowLeft className="size-4" />
              <span>{isUz ? 'Ortga' : 'Назад'}</span>
            </Button>

            {currentStep < STEP_ITEMS.length - 1 ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={isCheckingToken || isSubmitting}
                className="gap-2"
              >
                {isCheckingToken ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>{isUz ? 'Tekshirilmoqda...' : 'Проверка ключа...'}</span>
                  </>
                ) : (
                  <>
                    <span>{isUz ? 'Keyingisi' : 'Далее'}</span>
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleFinish}
                disabled={isSubmitting}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>{isUz ? 'Ishga tushirilmoqda...' : 'Инициализация...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" />
                    <span>{isUz ? 'Tizimni ishga tushirish' : 'Запустить систему'}</span>
                  </>
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      <footer className="text-center text-xs text-muted-foreground py-4">
        <span>© {new Date().getFullYear()} White-label Education Portal CMS.</span>
      </footer>
    </div>
  );
}
