'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Navigation,
  Phone,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import { CampusItem, ContactsData, PhoneDirectoryItem } from '@college/shared';
import { useAppLocale } from '@/components/i18n/locale-provider';

export default function AdminContactsPage() {
  const { locale } = useAppLocale();
  const isUz = locale === 'uz';
  const [data, setData] = React.useState<ContactsData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const loadContacts = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.getContacts();
      setData(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить контакты');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  // Handler for Campus changes
  const handleCampusChange = (index: number, field: keyof CampusItem, val: string) => {
    if (!data) return;
    const newCampuses = [...data.campuses];
    newCampuses[index] = { ...newCampuses[index]!, [field]: val };
    setData({ ...data, campuses: newCampuses });
  };

  const addCampus = () => {
    if (!data) return;
    const newCampus: CampusItem = {
      id: `campus-${Date.now()}`,
      name: 'Yangi bino / Новый корпус',
      address: 'Toshkent shahri',
      departments: 'Oʻquv xonalari',
      phone: '+998 (71) 200-00-00',
      email: 'info@texnikum.uz',
      workHours: 'Dush–Shanba: 08:30 – 17:30',
      transport: 'Jamoat transporti',
      orderIndex: data.campuses.length + 1,
    };
    setData({ ...data, campuses: [...data.campuses, newCampus] });
  };

  const removeCampus = (index: number) => {
    if (!data) return;
    if (data.campuses.length <= 1) {
      alert(
        isUz ? 'Kamida bitta bino qolishi shart' : 'Должен остаться хотя бы один корпус'
      );
      return;
    }
    const newCampuses = data.campuses.filter((_, i) => i !== index);
    setData({ ...data, campuses: newCampuses });
  };

  // Handler for Phone Directory changes
  const handlePhoneChange = (index: number, field: keyof PhoneDirectoryItem, val: string) => {
    if (!data) return;
    const newPhones = [...data.phones];
    newPhones[index] = { ...newPhones[index]!, [field]: val };
    setData({ ...data, phones: newPhones });
  };

  const addPhone = () => {
    if (!data) return;
    const newPhone: PhoneDirectoryItem = {
      id: `phone-${Date.now()}`,
      title: isUz ? 'Boʻlim nomi' : 'Название отдела',
      phone: '+998 (71) 200-00-00',
      note: isUz ? 'Boʻlim vazifasi' : 'Назначение',
      orderIndex: data.phones.length + 1,
    };
    setData({ ...data, phones: [...data.phones, newPhone] });
  };

  const removePhone = (index: number) => {
    if (!data) return;
    if (data.phones.length <= 1) {
      alert(
        isUz
          ? 'Kamida bitta telefon raqami qolishi shart'
          : 'Должен остаться хотя бы один номер телефона'
      );
      return;
    }
    const newPhones = data.phones.filter((_, i) => i !== index);
    setData({ ...data, phones: newPhones });
  };

  // Save all contacts
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    setIsSaving(true);
    setError(null);
    try {
      await apiClient.updateContacts(data);
      setSuccess(
        isUz
          ? 'Aloqa maʼlumotlari muvaffaqiyatli saqlandi va saytda yangilandi!'
          : 'Контактные данные успешно сохранены и обновлены на сайте!'
      );
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : (isUz ? 'Saqlashda xatolik yuz berdi' : 'Произошла ошибка при сохранении')
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-sm text-muted-foreground">
        {isUz ? 'Aloqa maʼlumotlari yuklanmoqda...' : 'Загрузка контактных данных...'}
      </div>
    );
  }

  if (!data) return null;

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            {isUz ? 'Bogʻlanish va aloqa maʼlumotlari (Aloqa)' : 'Контакты и реквизиты (Aloqa)'}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isUz
              ? 'Texnikum binolari, telefon maʼlumotnomasi, ish tartibi va marshrutlarni boshqarish'
              : 'Управление корпусами техникума, телефонным справочником, графиком работы и схемой проезда'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/contacts" target="_blank">
            <Button type="button" variant="outline" size="sm" className="gap-1.5 text-xs">
              <span>{isUz ? 'Sahifani ochish' : 'Открыть страницу'}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </Link>
          <Button
            type="submit"
            data-tour="contacts.save-btn"
            disabled={isSaving}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-xs"
          >
            <Save className="h-4 w-4" />
            {isSaving
              ? (isUz ? 'Saqlanmoqda...' : 'Сохранение...')
              : (isUz ? 'Oʻzgarishlarni saqlash' : 'Сохранить изменения')}
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 text-sm text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* 1. Корпуса техникума */}
      <div data-tour="contacts.campuses" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            {isUz
              ? `Texnikum binolari va boʻlinmalari (${data.campuses.length})`
              : `Здания и корпуса техникума (${data.campuses.length})`}
          </h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addCampus}
            className="text-xs gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            {isUz ? 'Yangi bino qoʻshish' : 'Добавить корпус'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.campuses.map((camp, idx) => (
            <Card key={camp.id || idx} className="border shadow-xs flex flex-col justify-between">
              <CardHeader className="pb-3 border-b bg-muted/20 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold text-foreground">
                  {isUz ? `${idx + 1}-bino` : `Корпус #${idx + 1}`}
                </CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCampus(idx)}
                  className="h-7 w-7 p-0 text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                  title={isUz ? 'Binoni oʻchirish' : 'Удалить корпус'}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </CardHeader>

              <CardContent className="p-4 space-y-3 text-xs flex-1">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">
                    {isUz ? 'Bino nomi' : 'Название корпуса'}
                  </label>
                  <Input
                    value={camp.name}
                    onChange={(e) => handleCampusChange(idx, 'name', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">
                    {isUz ? 'Pochta manzili' : 'Почтовый адрес'}
                  </label>
                  <Input
                    value={camp.address}
                    onChange={(e) => handleCampusChange(idx, 'address', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-muted-foreground">
                    {isUz ? 'Boʻlimlar va auditoriyalar' : 'Отделы и кабинеты'}
                  </label>
                  <Textarea
                    value={camp.departments}
                    onChange={(e) => handleCampusChange(idx, 'departments', e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-medium text-muted-foreground">
                      {isUz ? 'Telefon' : 'Телефон'}
                    </label>
                    <Input
                      value={camp.phone}
                      onChange={(e) => handleCampusChange(idx, 'phone', e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-medium text-muted-foreground">Email</label>
                    <Input
                      value={camp.email}
                      onChange={(e) => handleCampusChange(idx, 'email', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-muted-foreground">
                    {isUz ? 'Ish tartibi' : 'График работы'}
                  </label>
                  <Input
                    value={camp.workHours}
                    onChange={(e) => handleCampusChange(idx, 'workHours', e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-muted-foreground">
                    {isUz ? 'Jamoat transporti bekati' : 'Остановка транспорта'}
                  </label>
                  <Input
                    value={camp.transport}
                    onChange={(e) => handleCampusChange(idx, 'transport', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 2. Telefon maʼlumotnomasi */}
      <div data-tour="contacts.phones" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            {isUz
              ? `Boʻlimlar telefon maʼlumotnomasi (${data.phones.length})`
              : `Телефонный справочник отделов (${data.phones.length})`}
          </h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addPhone}
            className="text-xs gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            {isUz ? 'Yangi telefon qoʻshish' : 'Добавить телефон'}
          </Button>
        </div>

        <div className="rounded-xl border bg-card overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-muted/50 border-b text-[11px] font-semibold text-muted-foreground uppercase">
              <tr>
                <th className="p-3">{isUz ? 'Boʻlim / Xizmat' : 'Отдел / Служба'}</th>
                <th className="p-3 w-56">{isUz ? 'Telefon raqami' : 'Номер телефона'}</th>
                <th className="p-3">{isUz ? 'Vazifasi / Izoh' : 'Назначение / Описание'}</th>
                <th className="p-3 text-right w-16">{isUz ? 'Oʻchirish' : 'Удалить'}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.phones.map((phone, idx) => (
                <tr key={phone.id || idx} className="hover:bg-muted/20">
                  <td className="p-2.5">
                    <Input
                      value={phone.title}
                      onChange={(e) => handlePhoneChange(idx, 'title', e.target.value)}
                      className="h-8 text-xs"
                      required
                    />
                  </td>
                  <td className="p-2.5">
                    <Input
                      value={phone.phone}
                      onChange={(e) => handlePhoneChange(idx, 'phone', e.target.value)}
                      className="h-8 text-xs font-mono font-bold"
                      required
                    />
                  </td>
                  <td className="p-2.5">
                    <Input
                      value={phone.note}
                      onChange={(e) => handlePhoneChange(idx, 'note', e.target.value)}
                      className="h-8 text-xs text-muted-foreground"
                    />
                  </td>
                  <td className="p-2.5 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePhone(idx)}
                      className="h-7 w-7 p-0 text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                      title={isUz ? 'Oʻchirish' : 'Удалить'}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Схема проезда и ориентиры */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Navigation className="h-5 w-5 text-primary" />
          {isUz
            ? 'Qatnov marshruti va xarita uchun GPS-koordinatalar'
            : 'Схема проезда и GPS-координаты для карты'}
        </h2>

        <Card className="border shadow-xs">
          <CardContent className="p-4 space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-foreground">
                {isUz ? 'Jamoat transporti yoʻnalishlari' : 'Маршруты общественного транспорта'}
              </label>
              <Textarea
                value={data.directions.bus}
                onChange={(e) =>
                  setData({
                    ...data,
                    directions: { ...data.directions, bus: e.target.value },
                  })
                }
                rows={2}
                placeholder="Shahar boʻylab jamoat transporti orqali..."
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">
                {isUz ? 'Texnikum yaqinidagi moʻljallar' : 'Ориентиры рядом с техникумом'}
              </label>
              <Input
                value={data.directions.landmark}
                onChange={(e) =>
                  setData({
                    ...data,
                    directions: { ...data.directions, landmark: e.target.value },
                  })
                }
                placeholder="Markaziy maydon roʻparasida..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t">
              <div className="space-y-1">
                <label className="font-medium text-muted-foreground">
                  {isUz ? 'Kenglik (Latitude)' : 'Широта (Latitude)'}
                </label>
                <Input
                  type="number"
                  step="0.0001"
                  value={data.mapCoordinates.lat}
                  onChange={(e) =>
                    setData({
                      ...data,
                      mapCoordinates: {
                        ...data.mapCoordinates,
                        lat: parseFloat(e.target.value) || 40.3864,
                      },
                    })
                  }
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-muted-foreground">
                  {isUz ? 'Uzunlik (Longitude)' : 'Долгота (Longitude)'}
                </label>
                <Input
                  type="number"
                  step="0.0001"
                  value={data.mapCoordinates.lng}
                  onChange={(e) =>
                    setData({
                      ...data,
                      mapCoordinates: {
                        ...data.mapCoordinates,
                        lng: parseFloat(e.target.value) || 71.7864,
                      },
                    })
                  }
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-muted-foreground">
                  {isUz ? 'Masshtab (Zoom)' : 'Масштаб (Zoom)'}
                </label>
                <Input
                  type="number"
                  value={data.mapCoordinates.zoom}
                  onChange={(e) =>
                    setData({
                      ...data,
                      mapCoordinates: {
                        ...data.mapCoordinates,
                        zoom: parseInt(e.target.value) || 16,
                      },
                    })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button Bar */}
      <div className="pt-4 border-t flex justify-end">
        <Button
          type="submit"
          disabled={isSaving}
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 h-10 px-6 font-semibold shadow"
        >
          <Save className="h-4 w-4" />
          {isSaving
            ? (isUz ? 'Saqlanmoqda...' : 'Сохранение...')
            : (isUz ? 'Barcha oʻzgarishlarni saqlash' : 'Сохранить все изменения')}
        </Button>
      </div>
    </form>
  );
}
