'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  Landmark,
  Palette,
  Phone,
  Save,
  ShieldAlert,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import { UserRole, InstitutionFullSettings } from '@college/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAdminAuth } from '@/components/admin/admin-auth-context';
import { useAppLocale } from '@/components/i18n/locale-provider';
import { apiClient } from '@/lib/api-client';
import { checkBrandColorContrast } from '@/lib/brand-color';

export default function AdminInstitutionSettingsPage(): JSX.Element {
  const { token, hasRole, isLoading: authLoading } = useAdminAuth();
  const { locale } = useAppLocale();
  const isUz = locale === 'uz';

  const [settings, setSettings] = React.useState<InstitutionFullSettings | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [uploadingField, setUploadingField] = React.useState<string | null>(null);

  const logoInputRef = React.useRef<HTMLInputElement>(null);
  const faviconInputRef = React.useRef<HTMLInputElement>(null);
  const coatOfArmsInputRef = React.useRef<HTMLInputElement>(null);

  const loadSettings = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.getAdminInstitution();
      if (data) {
        setSettings(data);
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : isUz
          ? 'Sozlamalarni yuklab boʻlmadi'
          : 'Не удалось загрузить настройки',
      );
    } finally {
      setIsLoading(false);
    }
  }, [isUz]);

  React.useEffect(() => {
    if (!authLoading && hasRole(UserRole.ADMIN)) {
      loadSettings();
    }
  }, [authLoading, hasRole, loadSettings]);

  const handleFieldChange = (field: keyof InstitutionFullSettings, value: unknown) => {
    if (!settings) return;
    setSettings({
      ...settings,
      [field]: value,
    });
  };

  const handlePrivateFieldChange = (field: string, value: unknown) => {
    if (!settings) return;
    setSettings({
      ...settings,
      privateSettings: {
        ...(settings.privateSettings || {}),
        [field]: value,
      } as InstitutionFullSettings['privateSettings'],
    });
  };

  const handleAssetUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'logo' | 'favicon' | 'coat_of_arms',
    field: 'logoUrl' | 'faviconUrl' | 'coatOfArmsUrl',
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError(
        isUz
          ? 'Fayl hajmi 5 MB dan oshmasligi kerak'
          : 'Размер файла не должен превышать 5 МБ',
      );
      return;
    }

    setUploadingField(field);
    setError(null);
    try {
      const res = await apiClient.uploadInstitutionAsset(file, type, token || undefined);
      if (res?.url) {
        handleFieldChange(field, res.url);
        setSuccess(
          isUz ? 'Fayl muvaffaqiyatli yuklandi' : 'Файл успешно загружен',
        );
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : isUz
          ? 'Faylni yuklashda xatolik yuz berdi'
          : 'Ошибка при загрузке файла',
      );
    } finally {
      setUploadingField(null);
      e.target.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payload: Partial<InstitutionFullSettings> = {
        nameUz: settings.nameUz,
        nameRu: settings.nameRu,
        shortNameUz: settings.shortNameUz,
        shortNameRu: settings.shortNameRu,
        institutionType: settings.institutionType,
        legalAddressUz: settings.legalAddressUz,
        legalAddressRu: settings.legalAddressRu,
        mainPhone: settings.mainPhone,
        admissionPhone: settings.admissionPhone,
        trustPhone: settings.trustPhone,
        contactEmail: settings.contactEmail,
        admissionEmail: settings.admissionEmail,
        websiteDomain: settings.websiteDomain,
        geoLatitude: Number(settings.geoLatitude) || 0,
        geoLongitude: Number(settings.geoLongitude) || 0,
        logoUrl: settings.logoUrl,
        faviconUrl: settings.faviconUrl,
        coatOfArmsUrl: settings.coatOfArmsUrl,
        brandPrimaryColor: settings.brandPrimaryColor,
        socialTelegram: settings.socialTelegram,
        socialInstagram: settings.socialInstagram,
        socialFacebook: settings.socialFacebook,
        socialYoutube: settings.socialYoutube,
        stirInn: settings.stirInn,
        workHoursUz: settings.workHoursUz,
        workHoursRu: settings.workHoursRu,
        ...(settings.privateSettings
          ? {
              bankName: settings.privateSettings.bankName,
              bankAccount: settings.privateSettings.bankAccount,
              mfoCode: settings.privateSettings.mfoCode,
              jshshirPinfl: settings.privateSettings.jshshirPinfl,
              treasuryAccount: settings.privateSettings.treasuryAccount,
              okedCode: settings.privateSettings.okedCode,
              directorNameUz: settings.privateSettings.directorNameUz,
              directorNameRu: settings.privateSettings.directorNameRu,
              directorPhone: settings.privateSettings.directorPhone,
            }
          : {}),
      };

      const updated = await apiClient.updateAdminInstitution(payload);
      if (updated) {
        setSettings(updated);
      }
      setSuccess(
        isUz
          ? 'Muassasa sozlamalari muvaffaqiyatli saqlandi va saytda yangilandi'
          : 'Настройки заведения успешно сохранены и обновлены на сайте',
      );
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : isUz
          ? 'Sozlamalarni saqlashda xatolik yuz berdi'
          : 'Ошибка при сохранении настроек',
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Auth checking
  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[350px]">
        <div className="text-center space-y-2">
          <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">
            {isUz ? 'Sozlamalar yuklanmoqda...' : 'Загрузка настроек заведения...'}
          </p>
        </div>
      </div>
    );
  }

  if (!hasRole(UserRole.ADMIN)) {
    return (
      <div className="p-8 text-center max-w-md mx-auto space-y-4">
        <ShieldAlert className="size-12 text-destructive mx-auto" />
        <h2 className="text-lg font-bold text-foreground">
          {isUz ? 'Ruxsat berilmagan' : 'Доступ ограничен'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isUz
            ? 'Muassasa sozlamalarini faqat Administrator tahrirlashi mumkin.'
            : 'Раздел настроек заведения доступен только Администратору.'}
        </p>
        <Link href="/admin">
          <Button variant="outline" size="sm">
            {isUz ? 'Boshqaruv paneliga qaytish' : 'Вернуться в панель'}
          </Button>
        </Link>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-6 text-center space-y-4">
        <AlertCircle className="size-10 text-destructive mx-auto" />
        <p className="text-sm text-destructive">
          {isUz ? 'Sozlamalarni yuklab boʻlmadi.' : 'Не удалось получить настройки заведения.'}
        </p>
        <Button onClick={loadSettings} variant="outline" size="sm">
          {isUz ? 'Qayta urinish' : 'Повторить попытку'}
        </Button>
      </div>
    );
  }

  // Live WCAG AA Contrast Evaluation
  const brandColorHex = settings.brandPrimaryColor || '#1e3a8a';
  const contrastInfo = checkBrandColorContrast(brandColorHex);

  return (
    <form onSubmit={handleSave} className="space-y-8 pb-12">
      {/* Шапка страницы */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Building2 className="size-6 text-primary" />
              {isUz ? 'Muassasa sozlamalari' : 'Настройки заведения'}
            </h1>
            <Badge variant="outline" className="text-xs font-semibold bg-primary/5 text-primary border-primary/20">
              White-label
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {isUz
              ? 'Texnikum nomi, brend rangi, logotip, aloqa va yuridik maʼlumotlarini boshqarish'
              : 'Управление реквизитами техникума, фирменным стилем, логотипом, контактами и юридическими данными'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Кнопка справки (?) для онбординг-тура страницы */}
          <button
            type="button"
            data-tour="header.page-help-btn"
            onClick={() => {
              if (typeof window !== 'undefined') {
                const restartBtn = document.querySelector<HTMLButtonElement>(
                  '[data-tour="sidebar.tour-restart"]',
                );
                restartBtn?.click();
              }
            }}
            className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title={isUz ? 'Sahifa boʻyicha yoʻriqnoma' : 'Инструкция по этой странице'}
            aria-label={isUz ? 'Sahifa boʻyicha yordam' : 'Справка по странице'}
          >
            <HelpCircle className="size-4" />
          </button>

          <Link href="/" target="_blank">
            <Button type="button" variant="outline" size="sm" className="gap-1.5 text-xs">
              <span>{isUz ? 'Saytni koʻrish' : 'На сайт'}</span>
              <ExternalLink className="size-3.5" />
            </Button>
          </Link>

          <Button
            type="submit"
            data-tour="institution.save-btn"
            disabled={isSaving}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-xs"
          >
            <Save className="size-4" />
            {isSaving
              ? isUz
                ? 'Saqlanmoqda...'
                : 'Сохранение...'
              : isUz
              ? 'Oʻzgarishlarni saqlash'
              : 'Сохранить изменения'}
          </Button>
        </div>
      </div>

      {/* Оповещения */}
      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 text-sm text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* 1. Асосий маълумотлар / Общие сведения */}
      <Card data-tour="institution.general-section" className="border shadow-xs">
        <CardHeader className="pb-3 border-b bg-muted/20">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Building2 className="size-4 text-primary" />
            <span>{isUz ? '1. Asosiy identifikatsiya maʼlumotlari' : '1. Общие сведения и названия'}</span>
          </CardTitle>
          <CardDescription className="text-xs">
            {isUz
              ? 'Muassasaning rasmiy toʻliq va qisqartirilgan nomlari (barcha sahifalar va hujjatlarda aks etadi)'
              : 'Официальные полные и сокращенные наименования учреждения (используются в заголовках, футере и мета-тегах)'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {isUz ? 'Toʻliq nomi (Oʻzbekcha) *' : 'Полное название (Узбекский) *'}
              </label>
              <Input
                value={settings.nameUz || ''}
                onChange={(e) => handleFieldChange('nameUz', e.target.value)}
                placeholder="Kasb-hunar taʼlimi texnikumi"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {isUz ? 'Toʻliq nomi (Ruscha) *' : 'Полное название (Русский) *'}
              </label>
              <Input
                value={settings.nameRu || ''}
                onChange={(e) => handleFieldChange('nameRu', e.target.value)}
                placeholder="Техникум профессионального образования"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {isUz ? 'Qisqa nomi (Oʻzbekcha) *' : 'Краткое название (Узбекский) *'}
              </label>
              <Input
                value={settings.shortNameUz || ''}
                onChange={(e) => handleFieldChange('shortNameUz', e.target.value)}
                placeholder="Kasb-hunar texnikumi"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {isUz ? 'Qisqa nomi (Ruscha) *' : 'Краткое название (Русский) *'}
              </label>
              <Input
                value={settings.shortNameRu || ''}
                onChange={(e) => handleFieldChange('shortNameRu', e.target.value)}
                placeholder="Профессиональный техникум"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {isUz ? 'Muassasa turi *' : 'Тип учреждения *'}
              </label>
              <Input
                value={settings.institutionType || ''}
                onChange={(e) => handleFieldChange('institutionType', e.target.value)}
                placeholder="texnikum / kollej / litsey"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {isUz ? 'Rasmiy veb-sayt domeni' : 'Официальный домен сайта'}
              </label>
              <Input
                value={settings.websiteDomain || ''}
                onChange={(e) => handleFieldChange('websiteDomain', e.target.value)}
                placeholder="texnikum.uz"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Брендинг ва рамзлар / Фирменный стиль и символика */}
      <Card data-tour="institution.branding-section" className="border shadow-xs">
        <CardHeader className="pb-3 border-b bg-muted/20">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Palette className="size-4 text-primary" />
            <span>{isUz ? '2. Brending va tashqi koʻrinish' : '2. Фирменный стиль и символика'}</span>
          </CardTitle>
          <CardDescription className="text-xs">
            {isUz
              ? 'Asosiy brend rangi, logotip, gerb va veb-sayt faviconi (WCAG AA kontrast nazorati bilan)'
              : 'Фирменный цвет с автоматической проверкой контраста WCAG AA, логотип, герб и иконка сайта'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-6">
          {/* Контроль фирменного цвета и проверка контраста */}
          <div className="space-y-3 p-4 rounded-xl border bg-muted/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="text-xs font-bold text-foreground block">
                  {isUz ? 'Asosiy brend rangi (HEX)' : 'Основной фирменный цвет (HEX)'}
                </label>
                <span className="text-[11px] text-muted-foreground">
                  {isUz
                    ? 'Saytning barcha asosiy tugmalari, havolalari va sarlavhalarida qoʻllaniladi'
                    : 'Используется в кнопках, ссылках, акцентах и интерактивных элементах портала'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={brandColorHex}
                  onChange={(e) => handleFieldChange('brandPrimaryColor', e.target.value)}
                  className="size-9 rounded-lg border cursor-pointer bg-background p-0.5"
                />
                <Input
                  value={settings.brandPrimaryColor || ''}
                  onChange={(e) => handleFieldChange('brandPrimaryColor', e.target.value)}
                  className="w-28 font-mono text-xs uppercase"
                  placeholder="#1e3a8a"
                />
              </div>
            </div>

            {/* Карточка проверки доступности WCAG AA и живое превью */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-lg border bg-card space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">
                    {isUz ? 'Kontrast nisbati (Oq fonga nisbatan):' : 'Контраст к белому:'}
                  </span>
                  <Badge
                    variant={contrastInfo.passesAA ? 'default' : 'destructive'}
                    className="text-[10px]"
                  >
                    {contrastInfo.ratioAgainstWhite}:1 {contrastInfo.passesAA ? 'WCAG AA ✓' : 'Past kontrast ⚠'}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {isUz
                    ? `Tugma matni avtomatik ravishda «${contrastInfo.recommendedTextColor}» qilib tanlanadi.`
                    : `Для кнопок с этим фоном автоматически выбран цвет текста «${contrastInfo.recommendedTextColor}».`}
                </p>
              </div>

              {/* Живое превью кнопки */}
              <div
                className="p-3 rounded-lg border flex items-center justify-between gap-2"
                style={{ backgroundColor: brandColorHex, color: contrastInfo.recommendedTextColor }}
              >
                <span className="text-xs font-bold truncate">
                  {settings.shortNameUz || (isUz ? 'Namuna tugmasi' : 'Образец стиля')}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded border border-current/30 font-semibold shrink-0">
                  {isUz ? 'Faol element' : 'Кнопка'}
                </span>
              </div>
            </div>
          </div>

          {/* Загрузка ассетов: Логотип, Фавикон, Герб */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Логотип */}
            <div className="p-4 rounded-xl border space-y-3 flex flex-col justify-between">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">
                  {isUz ? 'Muassasa logotipi' : 'Логотип заведения'}
                </label>
                <p className="text-[11px] text-muted-foreground">
                  PNG, JPG, WEBP (maks. 5 MB)
                </p>
              </div>

              <div className="size-20 rounded-lg border bg-muted/20 flex items-center justify-center overflow-hidden mx-auto">
                {settings.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={settings.logoUrl}
                    alt="Logo preview"
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <Building2 className="size-8 text-muted-foreground/50" />
                )}
              </div>

              <div className="space-y-1.5">
                <Input
                  value={settings.logoUrl || ''}
                  onChange={(e) => handleFieldChange('logoUrl', e.target.value)}
                  placeholder="/images/logo.webp"
                  className="text-xs font-mono"
                />
                <input
                  type="file"
                  ref={logoInputRef}
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => handleAssetUpload(e, 'logo', 'logoUrl')}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploadingField === 'logoUrl'}
                  onClick={() => logoInputRef.current?.click()}
                  className="w-full text-xs gap-1.5"
                >
                  <Upload className="size-3.5" />
                  <span>
                    {uploadingField === 'logoUrl'
                      ? isUz ? 'Yuklanmoqda...' : 'Загрузка...'
                      : isUz ? 'Faylni yuklash' : 'Загрузить файл'}
                  </span>
                </Button>
              </div>
            </div>

            {/* Фавикон */}
            <div className="p-4 rounded-xl border space-y-3 flex flex-col justify-between">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">
                  {isUz ? 'Veb-sayt faviconi' : 'Фавикон (Favicon)'}
                </label>
                <p className="text-[11px] text-muted-foreground">
                  ICO, PNG (maks. 2 MB)
                </p>
              </div>

              <div className="size-20 rounded-lg border bg-muted/20 flex items-center justify-center overflow-hidden mx-auto">
                {settings.faviconUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={settings.faviconUrl}
                    alt="Favicon preview"
                    className="size-8 object-contain"
                  />
                ) : (
                  <Palette className="size-8 text-muted-foreground/50" />
                )}
              </div>

              <div className="space-y-1.5">
                <Input
                  value={settings.faviconUrl || ''}
                  onChange={(e) => handleFieldChange('faviconUrl', e.target.value)}
                  placeholder="/favicon.ico"
                  className="text-xs font-mono"
                />
                <input
                  type="file"
                  ref={faviconInputRef}
                  accept="image/x-icon,image/png,image/vnd.microsoft.icon"
                  onChange={(e) => handleAssetUpload(e, 'favicon', 'faviconUrl')}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploadingField === 'faviconUrl'}
                  onClick={() => faviconInputRef.current?.click()}
                  className="w-full text-xs gap-1.5"
                >
                  <Upload className="size-3.5" />
                  <span>
                    {uploadingField === 'faviconUrl'
                      ? isUz ? 'Yuklanmoqda...' : 'Загрузка...'
                      : isUz ? 'Faylni yuklash' : 'Загрузить файл'}
                  </span>
                </Button>
              </div>
            </div>

            {/* Герб */}
            <div className="p-4 rounded-xl border space-y-3 flex flex-col justify-between">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">
                  {isUz ? 'Davlat gerbi / Emblema' : 'Герб / Символика'}
                </label>
                <p className="text-[11px] text-muted-foreground">
                  PNG, JPG, WEBP (maks. 5 MB)
                </p>
              </div>

              <div className="size-20 rounded-lg border bg-muted/20 flex items-center justify-center overflow-hidden mx-auto">
                {settings.coatOfArmsUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={settings.coatOfArmsUrl}
                    alt="Coat of arms preview"
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <ShieldCheck className="size-8 text-muted-foreground/50" />
                )}
              </div>

              <div className="space-y-1.5">
                <Input
                  value={settings.coatOfArmsUrl || ''}
                  onChange={(e) => handleFieldChange('coatOfArmsUrl', e.target.value)}
                  placeholder="/images/gerb.webp"
                  className="text-xs font-mono"
                />
                <input
                  type="file"
                  ref={coatOfArmsInputRef}
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => handleAssetUpload(e, 'coat_of_arms', 'coatOfArmsUrl')}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploadingField === 'coatOfArmsUrl'}
                  onClick={() => coatOfArmsInputRef.current?.click()}
                  className="w-full text-xs gap-1.5"
                >
                  <Upload className="size-3.5" />
                  <span>
                    {uploadingField === 'coatOfArmsUrl'
                      ? isUz ? 'Yuklanmoqda...' : 'Загрузка...'
                      : isUz ? 'Faylni yuklash' : 'Загрузить файл'}
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Алоқа ва координаталар / Контакты и геолокация */}
      <Card data-tour="institution.contacts-section" className="border shadow-xs">
        <CardHeader className="pb-3 border-b bg-muted/20">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Phone className="size-4 text-primary" />
            <span>{isUz ? '3. Aloqa, manzil va ish tartibi' : '3. Контакты, адрес и график работы'}</span>
          </CardTitle>
          <CardDescription className="text-xs">
            {isUz
              ? 'Bosh bino yuridik manzili, telefonlar, elektron pochtalar va OpenStreetMap xarita koordinatalari'
              : 'Юридический адрес главного корпуса, контактные телефоны, email и GPS-координаты для карты'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {isUz ? 'Yuridik manzil (Oʻzbekcha) *' : 'Юридический адрес (Узбекский) *'}
              </label>
              <Input
                value={settings.legalAddressUz || ''}
                onChange={(e) => handleFieldChange('legalAddressUz', e.target.value)}
                placeholder="Toshkent sh., Bunyodkor shoh koʻchasi, 1-uy"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {isUz ? 'Yuridik manzil (Ruscha) *' : 'Юридический адрес (Русский) *'}
              </label>
              <Input
                value={settings.legalAddressRu || ''}
                onChange={(e) => handleFieldChange('legalAddressRu', e.target.value)}
                placeholder="г. Ташкент, пр. Мустакиллик, дом 1"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {isUz ? 'Asosiy qabulxona telefoni *' : 'Основной телефон канцелярии *'}
              </label>
              <Input
                value={settings.mainPhone || ''}
                onChange={(e) => handleFieldChange('mainPhone', e.target.value)}
                placeholder="+998 (71) 200-00-00"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {isUz ? 'Qabul komissiyasi telefoni *' : 'Телефон приемной комиссии *'}
              </label>
              <Input
                value={settings.admissionPhone || ''}
                onChange={(e) => handleFieldChange('admissionPhone', e.target.value)}
                placeholder="+998 (71) 200-00-01"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {isUz ? 'Ishonch telefoni' : 'Телефон доверия'}
              </label>
              <Input
                value={settings.trustPhone || ''}
                onChange={(e) => handleFieldChange('trustPhone', e.target.value)}
                placeholder="1006 / +998 (71) 200-00-02"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {isUz ? 'Umumiy aloqa pochtasi *' : 'Email для обращений *'}
              </label>
              <Input
                type="email"
                value={settings.contactEmail || ''}
                onChange={(e) => handleFieldChange('contactEmail', e.target.value)}
                placeholder="info@texnikum.uz"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {isUz ? 'Qabul komissiyasi pochtasi' : 'Email приемной комиссии'}
              </label>
              <Input
                type="email"
                value={settings.admissionEmail || ''}
                onChange={(e) => handleFieldChange('admissionEmail', e.target.value)}
                placeholder="qabul@texnikum.uz"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {isUz ? 'Ish tartibi (Oʻzbekcha) *' : 'График работы (Узбекский) *'}
              </label>
              <Input
                value={settings.workHoursUz || ''}
                onChange={(e) => handleFieldChange('workHoursUz', e.target.value)}
                placeholder="Dushanba – Shanba: 08:30 – 17:30"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {isUz ? 'Ish tartibi (Ruscha) *' : 'График работы (Русский) *'}
              </label>
              <Input
                value={settings.workHoursRu || ''}
                onChange={(e) => handleFieldChange('workHoursRu', e.target.value)}
                placeholder="Понедельник – Суббота: 08:30 – 17:30"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  {isUz ? 'Kenglik (Latitude) *' : 'Широта (Latitude) *'}
                </label>
                <Input
                  type="number"
                  step="any"
                  value={settings.geoLatitude ?? ''}
                  onChange={(e) => handleFieldChange('geoLatitude', parseFloat(e.target.value))}
                  placeholder="41.311100"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  {isUz ? 'Uzunlik (Longitude) *' : 'Долгота (Longitude) *'}
                </label>
                <Input
                  type="number"
                  step="any"
                  value={settings.geoLongitude ?? ''}
                  onChange={(e) => handleFieldChange('geoLongitude', parseFloat(e.target.value))}
                  placeholder="69.279700"
                  required
                />
              </div>
            </div>
          </div>

          {/* Социальные сети */}
          <div className="pt-3 border-t">
            <h3 className="text-xs font-bold text-foreground mb-3">
              {isUz ? 'Ijtimoiy tarmoqlar havolalari' : 'Ссылки на социальные сети'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Telegram</label>
                <Input
                  value={settings.socialTelegram || ''}
                  onChange={(e) => handleFieldChange('socialTelegram', e.target.value)}
                  placeholder="https://t.me/kanal"
                  className="text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Instagram</label>
                <Input
                  value={settings.socialInstagram || ''}
                  onChange={(e) => handleFieldChange('socialInstagram', e.target.value)}
                  placeholder="https://instagram.com/sahifa"
                  className="text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Facebook</label>
                <Input
                  value={settings.socialFacebook || ''}
                  onChange={(e) => handleFieldChange('socialFacebook', e.target.value)}
                  placeholder="https://facebook.com/sahifa"
                  className="text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">YouTube</label>
                <Input
                  value={settings.socialYoutube || ''}
                  onChange={(e) => handleFieldChange('socialYoutube', e.target.value)}
                  placeholder="https://youtube.com/@kanal"
                  className="text-xs"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Юридик ва молиявий реквизитлар (Алоҳида блок) */}
      <Card data-tour="institution.legal-section" className="border shadow-xs border-amber-500/20 bg-amber-500/5">
        <CardHeader className="pb-3 border-b border-amber-500/10 bg-amber-500/10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <Landmark className="size-4 text-amber-600 dark:text-amber-400" />
              <span>{isUz ? '4. Yuridik va bank rekvizitlari' : '4. Юридические и банковские реквизиты'}</span>
            </CardTitle>
            <Badge variant="outline" className="text-[10px] bg-background text-amber-700 dark:text-amber-300 border-amber-500/30">
              {isUz ? 'Faqat admin uchun' : 'Приватно (Admin only)'}
            </Badge>
          </div>
          <CardDescription className="text-xs">
            {isUz
              ? 'STIR, PINFL, xizmat koʻrsatuvchi bank va hisob raqamlari (maxfiy saqlanadi va faqat administratorga koʻrinadi)'
              : 'ИНН/СТИР, ПИНФЛ, казначейский счет, МФО и данные директора (защищены RLS, доступны только администраторам)'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {isUz ? 'STIR / INN (9 ta raqam) *' : 'СТИР / ИНН (9 цифр) *'}
              </label>
              <Input
                value={settings.stirInn || ''}
                onChange={(e) => handleFieldChange('stirInn', e.target.value)}
                placeholder="302987654"
                maxLength={9}
                className="font-mono text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {isUz ? 'JSHSHIR / PINFL (14 ta raqam)' : 'ЖШШИР / ПИНФЛ (14 цифр)'}
              </label>
              <Input
                value={settings.privateSettings?.jshshirPinfl || ''}
                onChange={(e) => handlePrivateFieldChange('jshshirPinfl', e.target.value)}
                placeholder="12345678901234"
                maxLength={14}
                className="font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {isUz ? 'OKED kodi (5 ta raqam)' : 'Код ОКЭД (5 цифр)'}
              </label>
              <Input
                value={settings.privateSettings?.okedCode || ''}
                onChange={(e) => handlePrivateFieldChange('okedCode', e.target.value)}
                placeholder="85320"
                maxLength={5}
                className="font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {isUz ? 'Xizmat koʻrsatuvchi bank' : 'Обслуживающий банк'}
              </label>
              <Input
                value={settings.privateSettings?.bankName || ''}
                onChange={(e) => handlePrivateFieldChange('bankName', e.target.value)}
                placeholder="AT «Aloqabank» Bosh amaliyotlar boshqarmasi"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {isUz ? 'Bank hisob raqami' : 'Расчетный счет'}
              </label>
              <Input
                value={settings.privateSettings?.bankAccount || ''}
                onChange={(e) => handlePrivateFieldChange('bankAccount', e.target.value)}
                placeholder="20210000..."
                className="font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {isUz ? 'MFO kodi (5 ta raqam)' : 'МФО банка (5 цифр)'}
              </label>
              <Input
                value={settings.privateSettings?.mfoCode || ''}
                onChange={(e) => handlePrivateFieldChange('mfoCode', e.target.value)}
                placeholder="00401"
                maxLength={5}
                className="font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {isUz ? 'Gʻaznachilik hisob raqami' : 'Казначейский лицевой счет'}
              </label>
              <Input
                value={settings.privateSettings?.treasuryAccount || ''}
                onChange={(e) => handlePrivateFieldChange('treasuryAccount', e.target.value)}
                placeholder="400110860..."
                className="font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {isUz ? 'Direktor F.I.O. (Oʻzbekcha)' : 'ФИО директора (Узбекский)'}
              </label>
              <Input
                value={settings.privateSettings?.directorNameUz || ''}
                onChange={(e) => handlePrivateFieldChange('directorNameUz', e.target.value)}
                placeholder="Karimov Anvar Rustamovich"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {isUz ? 'Direktor telefoni' : 'Рабочий телефон директора'}
              </label>
              <Input
                value={settings.privateSettings?.directorPhone || ''}
                onChange={(e) => handlePrivateFieldChange('directorPhone', e.target.value)}
                placeholder="+998 (71) 200-00-01"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Нижняя панель сохранения */}
      <div className="flex items-center justify-between pt-4 border-t">
        <span className="text-xs text-muted-foreground">
          {isUz
            ? 'Barcha oʻzgarishlar audit jurnalida qayd etiladi va sayt keshini yangilaydi.'
            : 'Все изменения фиксируются в журнале аудита и немедленно инвалидируют кэш сайта.'}
        </span>

        <Button
          type="submit"
          disabled={isSaving}
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-xs"
        >
          <Save className="size-4" />
          {isSaving
            ? isUz
              ? 'Saqlanmoqda...'
              : 'Сохранение...'
            : isUz
            ? 'Oʻzgarishlarni saqlash'
            : 'Сохранить изменения'}
        </Button>
      </div>
    </form>
  );
}
