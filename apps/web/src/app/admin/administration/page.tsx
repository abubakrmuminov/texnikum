'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import {
  CheckCircle2,
  Clock,
  Edit,
  MapPin,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Users,
} from 'lucide-react';
import type { AdministratorMember, AdministratorCategory } from '@college/shared';
import { apiClient } from '@/lib/api-client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ImageUploadField } from '@/components/admin/image-upload-field';
import { useAppLocale } from '@/components/i18n/locale-provider';

function slugify(text: string): string {
  const ru: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh',
    з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o',
    п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts',
    ч: 'ch', ш: 'sh', щ: 'shch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
    ў: 'o', ғ: 'g', ҳ: 'h', қ: 'q',
  };
  return text
    .toLowerCase()
    .split('')
    .map((char) => ru[char] || char)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export default function AdminAdministrationPage(): JSX.Element {
  const { locale } = useAppLocale();
  const isUz = locale === 'uz';

  const [administrators, setAdministrators] = useState<AdministratorMember[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Модальное окно создания / редактирования
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<AdministratorMember | null>(null);

  // Поля формы
  const [fullName, setFullName] = useState<string>('');
  const [position, setPosition] = useState<string>('');
  const [category, setCategory] = useState<AdministratorCategory>('leadership');
  const [receptionHours, setReceptionHours] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [roomNumber, setRoomNumber] = useState<string>('');
  const [duties, setDuties] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [orderIndex, setOrderIndex] = useState<number>(10);
  const [isActive, setIsActive] = useState<boolean>(true);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Загрузка данных
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const res = await apiClient.getAdministrators({ limit: 100 });
        setAdministrators(res.items || []);
      } catch {
        // fallback
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setFullName('');
    setPosition('');
    setCategory('leadership');
    setReceptionHours(isUz ? 'Dushanba, Payshanba: 14:00 – 17:00' : 'Понедельник, Четверг: 14:00 – 17:00');
    setPhone('+998 (73) 244-00-01');
    setEmail('direktor@texnikum2.uz');
    setRoomNumber(isUz ? 'Bosh bino, 201-xona' : 'Главный корпус, каб. 201');
    setDuties('');
    setBio('');
    setPhotoUrl('');
    setOrderIndex(administrators.length + 1);
    setIsActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (admin: AdministratorMember) => {
    setEditingItem(admin);
    setFullName(admin.fullName);
    setPosition(admin.position);
    setCategory(admin.category);
    setReceptionHours(admin.receptionHours || '');
    setPhone(admin.phone || '');
    setEmail(admin.email || '');
    setRoomNumber(admin.roomNumber || '');
    setDuties(admin.duties || '');
    setBio(admin.bio || '');
    setPhotoUrl(admin.photoUrl || '');
    setOrderIndex(admin.orderIndex);
    setIsActive(admin.isActive);
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!fullName.trim()) {
      setFormError(isUz ? 'Ism-familiyani toʻliq kiriting' : 'Укажите ФИО сотрудника');
      return;
    }
    if (!position.trim()) {
      setFormError(isUz ? 'Lavozimni kiriting' : 'Укажите должность');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Partial<AdministratorMember> = {
        fullName: fullName.trim(),
        slug: slugify(fullName.trim()),
        position: position.trim(),
        category,
        receptionHours: receptionHours.trim(),
        phone: phone.trim(),
        email: email.trim(),
        roomNumber: roomNumber.trim(),
        duties: duties.trim(),
        bio: bio.trim(),
        photoUrl: photoUrl.trim() || null,
        orderIndex: Number(orderIndex) || 10,
        isActive,
      };

      if (editingItem) {
        const updated = await apiClient.updateAdministrator(editingItem.id, payload);
        setAdministrators((prev) =>
          prev.map((a) => (a.id === editingItem.id ? { ...a, ...updated } : a)),
        );
        setFeedbackMessage(
          isUz
            ? 'Rahbar maʼlumotlari muvaffaqiyatli yangilandi'
            : 'Данные руководителя успешно обновлены',
        );
      } else {
        const created = await apiClient.createAdministrator(payload);
        setAdministrators((prev) => [created, ...prev]);
        setFeedbackMessage(
          isUz
            ? 'Yangi rahbar muvaffaqiyatli qoʻshildi'
            : 'Новый руководитель успешно добавлен',
        );
      }

      closeModal();
      setTimeout(() => setFeedbackMessage(null), 3500);
    } catch (err: unknown) {
      setFormError(
        err instanceof Error
          ? err.message
          : (isUz ? 'Saqlashda xatolik yuz berdi' : 'Ошибка сохранения'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmText = isUz
      ? `Haqiqatan ham «${name}»ni roʻyxatdan oʻchirmoqchimisiz?`
      : `Вы действительно хотите удалить из списка «${name}»?`;
    if (!window.confirm(confirmText)) return;

    try {
      await apiClient.deleteAdministrator(id);
      setAdministrators((prev) => prev.filter((a) => a.id !== id));
      setFeedbackMessage(
        isUz ? 'Xodim roʻyxatdan oʻchirildi' : 'Сотрудник удален из списка',
      );
      setTimeout(() => setFeedbackMessage(null), 3000);
    } catch {
      alert(isUz ? 'Oʻchirishda xatolik yuz berdi' : 'Ошибка при удалении');
    }
  };

  const filteredAdministrators = useMemo(() => {
    return administrators.filter((item) => {
      const matchCat = categoryFilter === 'all' || item.category === categoryFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        item.fullName.toLowerCase().includes(q) ||
        item.position.toLowerCase().includes(q) ||
        (item.roomNumber && item.roomNumber.toLowerCase().includes(q));
      return matchCat && matchQuery;
    });
  }, [administrators, categoryFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Шапка раздела */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            {isUz ? 'Texnikum rahbariyati va maʼmuriyati' : 'Руководство и администрация техникума'}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {isUz
              ? 'Texnikum rahbariyati, boʻlim boshliqlari, qabul vaqtlari va masʼul xodimlarni boshqarish'
              : 'Управление составом дирекции, начальников отделов, часами приема и контактами'}
          </p>
        </div>

        <Button onClick={openCreateModal} className="h-9 text-xs gap-1.5 shrink-0">
          <Plus className="h-4 w-4" />
          {isUz ? 'Yangi rahbar qoʻshish' : 'Добавить руководителя'}
        </Button>
      </div>

      {/* Уведомление об успешном действии */}
      {feedbackMessage && (
        <div className="flex items-center gap-2 p-3 text-xs sm:text-sm text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Панель фильтров и поиска */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Поиск */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isUz
                ? 'Ism, lavozim yoki xona boʻyicha qidirish...'
                : 'Поиск по ФИО, должности или кабинету...'
            }
            className="pl-9 h-9 text-xs"
          />
        </div>

        {/* Категории */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: isUz ? 'Barchasi' : 'Все' },
            { id: 'leadership', label: isUz ? 'Rahbariyat' : 'Руководство' },
            { id: 'department_head', label: isUz ? 'Boʻlim boshliqlari' : 'Начальники отделов' },
            { id: 'administrative', label: isUz ? 'Maʼmuriy-xoʻjalik' : 'Адм.-хозяйственные' },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={categoryFilter === tab.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCategoryFilter(tab.id)}
              className="text-xs h-8"
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Таблица администраторов */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-muted-foreground">
            {isUz ? 'Yuklanmoqda...' : 'Загрузка данных...'}
          </div>
        ) : filteredAdministrators.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground space-y-2">
            <Users className="h-8 w-8 mx-auto text-muted-foreground/40" />
            <p className="text-sm font-medium">
              {isUz ? 'Rahbarlar topilmadi' : 'Руководители не найдены'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">{isUz ? 'Xodim va lavozimi' : 'Сотрудник и должность'}</th>
                  <th className="py-3 px-4">{isUz ? 'Boʻlim / Toifa' : 'Категория'}</th>
                  <th className="py-3 px-4">{isUz ? 'Qabul vaqti' : 'Часы приема'}</th>
                  <th className="py-3 px-4">{isUz ? 'Kontaktlar va xona' : 'Контакты и кабинет'}</th>
                  <th className="py-3 px-4 text-center">{isUz ? 'Holat' : 'Статус'}</th>
                  <th className="py-3 px-4 text-right w-24">{isUz ? 'Amallar' : 'Действия'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredAdministrators.map((admin, idx) => (
                  <tr
                    key={admin.id}
                    className="hover:bg-muted/20 transition-colors group"
                  >
                    <td className="py-3 px-4 text-center text-muted-foreground font-mono">
                      {admin.orderIndex || idx + 1}
                    </td>

                    {/* ФИО + фото + должность */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative size-10 rounded-lg overflow-hidden bg-muted border shrink-0">
                          {admin.photoUrl ? (
                            <Image
                              src={admin.photoUrl}
                              alt={admin.fullName}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-xs bg-primary/10 text-primary">
                              {admin.fullName
                                .split(' ')
                                .map((w) => w[0])
                                .slice(0, 2)
                                .join('')}
                            </div>
                          )}
                        </div>
                        <div className="space-y-0.5">
                          <p className="font-bold text-foreground text-sm leading-snug">
                            {admin.fullName}
                          </p>
                          <p className="text-muted-foreground text-xs line-clamp-1">
                            {admin.position}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Категория */}
                    <td className="py-3 px-4">
                      <Badge
                        variant={admin.category === 'leadership' ? 'default' : 'secondary'}
                        className="text-[10px] font-semibold"
                      >
                        {admin.category === 'leadership'
                          ? (isUz ? 'Rahbariyat' : 'Руководство')
                          : admin.category === 'department_head'
                          ? (isUz ? 'Boʻlim boshligʻi' : 'Начальник отдела')
                          : (isUz ? 'Maʼmuriy xizmat' : 'Адм. служба')}
                      </Badge>
                    </td>

                    {/* Часы приема */}
                    <td className="py-3 px-4 text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="font-medium text-foreground">{admin.receptionHours || '—'}</span>
                      </div>
                    </td>

                    {/* Контакты */}
                    <td className="py-3 px-4 space-y-1 text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 text-primary shrink-0" />
                        <span>{admin.roomNumber || '—'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3 text-primary shrink-0" />
                        <span>{admin.phone}</span>
                      </div>
                    </td>

                    {/* Статус */}
                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          admin.isActive
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {admin.isActive
                          ? (isUz ? 'Faol' : 'Активен')
                          : (isUz ? 'Nofaol' : 'Отключен')}
                      </Badge>
                    </td>

                    {/* Кнопки действий */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(admin)}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          title={isUz ? 'Tahrirlash' : 'Редактировать'}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(admin.id, admin.fullName)}
                          className="h-8 w-8 text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                          title={isUz ? 'Oʻchirish' : 'Удалить'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Модальное окно создания / редактирования */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border bg-muted/20">
              <h3 className="font-bold text-base sm:text-lg text-foreground flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                {editingItem
                  ? (isUz ? 'Rahbar maʼlumotlarini tahrirlash' : 'Редактирование руководителя')
                  : (isUz ? 'Yangi rahbar qoʻshish' : 'Добавить руководителя')}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {formError && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* ФИО */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-foreground">
                    {isUz ? 'Toʻliq ismi-sharifi (F.I.O.)' : 'ФИО руководителя'}{' '}
                    <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={
                      isUz
                        ? 'Masalan: Karimov Jasur Alisherovich'
                        : 'Например: Каримов Жасур Алишерович'
                    }
                    className="text-xs h-9"
                    required
                  />
                </div>

                {/* Должность */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-foreground">
                    {isUz ? 'Lavozimi' : 'Должность'}{' '}
                    <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder={
                      isUz
                        ? 'Masalan: Texnikum direktori, dotsent'
                        : 'Например: Директор техникума, доцент'
                    }
                    className="text-xs h-9"
                    required
                  />
                </div>

                {/* Категория */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    {isUz ? 'Tashkiliy toifasi' : 'Категория должности'}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as AdministratorCategory)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="leadership">
                      {isUz ? 'Texnikum rahbariyati (Direksiya)' : 'Руководство (Дирекция)'}
                    </option>
                    <option value="department_head">
                      {isUz ? 'Boʻlim boshligʻi' : 'Начальник отдела'}
                    </option>
                    <option value="administrative">
                      {isUz ? 'Maʼmuriy-xoʻjalik xizmati' : 'Административная служба'}
                    </option>
                  </select>
                </div>

                {/* Порядковый номер */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    {isUz ? 'Koʻrsatish tartib raqami' : 'Порядковый номер'}
                  </label>
                  <Input
                    type="number"
                    value={orderIndex}
                    onChange={(e) => setOrderIndex(Number(e.target.value))}
                    min={1}
                    className="text-xs h-9"
                  />
                </div>

                {/* Часы приема */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    {isUz ? 'Qabul kunlari va vaqti' : 'Дни и часы приема'}
                  </label>
                  <Input
                    value={receptionHours}
                    onChange={(e) => setReceptionHours(e.target.value)}
                    placeholder={
                      isUz
                        ? 'Dushanba, Payshanba: 14:00 – 17:00'
                        : 'Понедельник, Четверг: 14:00 – 17:00'
                    }
                    className="text-xs h-9"
                  />
                </div>

                {/* Кабинет / Xona */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    {isUz ? 'Xona / Bino' : 'Кабинет / Корпус'}
                  </label>
                  <Input
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder={
                      isUz ? 'Bosh bino, 201-xona' : 'Главный корпус, каб. 201'
                    }
                    className="text-xs h-9"
                  />
                </div>

                {/* Телефон */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    {isUz ? 'Telefon raqami' : 'Рабочий телефон'}
                  </label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+998 (73) 244-00-01"
                    className="text-xs h-9 font-mono"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    {isUz ? 'Elektron pochta' : 'Электронная почта'}
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="direktor@texnikum2.uz"
                    className="text-xs h-9"
                  />
                </div>
              </div>

              {/* Фото сотрудника через ImageUploadField */}
              <div className="space-y-1.5 pt-2">
                <ImageUploadField
                  value={photoUrl}
                  onChange={setPhotoUrl}
                  label={isUz ? 'Rahbar fotosurati' : 'Фотография руководителя'}
                  description={
                    isUz
                      ? 'Rasmiy portret formati (3:4 yoki kvadrat tavsiya etiladi)'
                      : 'Официальный портретный формат (3:4 или 1:1)'
                  }
                  bucket="news-media"
                  aspectRatio="portrait"
                />
              </div>

              {/* Должностные обязанности */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  {isUz ? 'Asosiy vazifalari va vakolatlari' : 'Основные обязанности и полномочия'}
                </label>
                <Textarea
                  value={duties}
                  onChange={(e) => setDuties(e.target.value)}
                  placeholder={
                    isUz
                      ? 'Texnikum ustavi boʻyicha biriktirilgan asosiy faoliyat yoʻnalishlari...'
                      : 'Ключевые направления деятельности и полномочия согласно уставу...'
                  }
                  rows={3}
                  className="text-xs"
                />
              </div>

              {/* Биография */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  {isUz ? 'Qisqacha tarjimai holi' : 'Краткая биография'}
                </label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={
                    isUz
                      ? 'Maʼlumoti, ilmiy darajasi va kasbiy yutuqlari...'
                      : 'Образование, ученая степень и профессиональные достижения...'
                  }
                  rows={2}
                  className="text-xs"
                />
              </div>

              {/* Активность */}
              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                  />
                  <span>
                    {isUz ? 'Saytda koʻrsatilsin (Faol)' : 'Отображать на сайте (Активен)'}
                  </span>
                </label>
              </div>

              {/* Кнопки модального окна */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="text-xs h-9"
                >
                  {isUz ? 'Bekor qilish' : 'Отмена'}
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="text-xs h-9"
                >
                  {isSubmitting
                    ? (isUz ? 'Saqlanmoqda...' : 'Сохранение...')
                    : (isUz ? 'Saqlash' : 'Сохранить')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
