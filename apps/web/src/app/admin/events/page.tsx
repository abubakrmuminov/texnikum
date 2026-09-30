'use client';

import * as React from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Calendar,
  MapPin,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Modal } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import { EventItem, EventCategory } from '@college/shared';
import { ImageUploadField } from '@/components/admin/image-upload-field';
import { useAppLocale } from '@/components/i18n/locale-provider';

function slugify(text: string): string {
  const ru: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh',
    з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o',
    п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts',
    ч: 'ch', ш: 'sh', щ: 'shch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
  };
  return text
    .toLowerCase()
    .split('')
    .map((char) => ru[char] || char)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export default function AdminEventsPage() {
  const { locale } = useAppLocale();
  const isUz = locale === 'uz';

  const [events, setEvents] = React.useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState<string>('all');
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  // Modal
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<EventItem | null>(null);

  // Form State
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [eventDate, setEventDate] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [category, setCategory] = React.useState<EventCategory>('open_doors');
  const [organizer, setOrganizer] = React.useState('');
  const [registrationUrl, setRegistrationUrl] = React.useState('');
  const [coverImageUrl, setCoverImageUrl] = React.useState('');
  const [isFeatured, setIsFeatured] = React.useState(false);
  const [isPublished, setIsPublished] = React.useState(true);
  const [formError, setFormError] = React.useState<string | null>(null);

  const loadEvents = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getEvents();
      setEvents(data.items);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : (isUz ? 'Tadbirlarni yuklab boʻlmadi' : 'Не удалось загрузить мероприятия')
      );
    } finally {
      setIsLoading(false);
    }
  }, [isUz]);

  React.useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const openCreateModal = () => {
    setEditingItem(null);
    setTitle('');
    setDescription('');
    setEventDate(new Date(Date.now() + 86400000 * 3).toISOString().substring(0, 16));
    setLocation(isUz ? 'Bosh bino, Faollar zali' : 'Главный корпус, Актовый зал');
    setCategory('open_doors');
    setOrganizer(isUz ? 'Texnikum qabul komissiyasi' : 'Приемная комиссия колледжа');
    setRegistrationUrl('');
    setCoverImageUrl('');
    setIsFeatured(false);
    setIsPublished(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: EventItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setDescription(item.description);
    setEventDate(item.eventDate ? item.eventDate.substring(0, 16) : '');
    setLocation(item.location);
    setCategory(item.category);
    setOrganizer(item.organizer || '');
    setRegistrationUrl(item.registrationUrl || '');
    setCoverImageUrl(item.coverImageUrl || '');
    setIsFeatured(item.isFeatured);
    setIsPublished(item.isPublished);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim() || !description.trim() || !eventDate.trim()) {
      setFormError(
        isUz
          ? 'Majburiy maydonlarni toʻldiring: nomi, tavsifi, sanasi'
          : 'Заполните обязательные поля: название, описание, дату'
      );
      return;
    }

    const payload: Partial<EventItem> = {
      title: title.trim(),
      slug: slugify(title),
      description: description.trim(),
      eventDate: new Date(eventDate).toISOString(),
      location: location.trim(),
      category,
      organizer: organizer.trim() || null,
      registrationUrl: registrationUrl.trim() || null,
      coverImageUrl: coverImageUrl.trim() || null,
      isFeatured,
      isPublished,
    };

    try {
      if (editingItem) {
        await apiClient.updateEvent(editingItem.id, payload);
        setEvents((prev) =>
          prev.map((it) => (it.id === editingItem.id ? ({ ...it, ...payload } as EventItem) : it))
        );
        setSuccess(
          isUz ? 'Tadbir muvaffaqiyatli yangilandi' : 'Мероприятие успешно обновлено'
        );
      } else {
        const created = await apiClient.createEvent(payload);
        setEvents((prev) => [created, ...prev]);
        setSuccess(
          isUz ? 'Tadbir taqvimga qoʻshildi' : 'Мероприятие добавлено в календарь'
        );
      }
      setIsModalOpen(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      setFormError(
        err instanceof Error
          ? err.message
          : (isUz ? 'Tadbirni saqlashda xatolik yuz berdi' : 'Ошибка при сохранении мероприятия')
      );
    }
  };

  const handleTogglePublish = async (item: EventItem) => {
    try {
      const nextStatus = !item.isPublished;
      await apiClient.updateEvent(item.id, { isPublished: nextStatus });
      setEvents((prev) =>
        prev.map((e) => (e.id === item.id ? { ...e, isPublished: nextStatus } : e))
      );
    } catch {
      alert(isUz ? 'Nashr holatini oʻzgartirib boʻlmadi' : 'Не удалось изменить статус публикации');
    }
  };

  const handleDelete = async (id: string, itemName: string) => {
    const confirmMsg = isUz
      ? `Haqiqatan ham «${itemName}» tadbirini oʻchirmoqchimisiz?`
      : `Вы уверены, что хотите удалить мероприятие «${itemName}»?`;
    if (!window.confirm(confirmMsg)) {
      return;
    }
    try {
      await apiClient.deleteEvent(id);
      setEvents((prev) => prev.filter((it) => it.id !== id));
      setSuccess(
        isUz ? `«${itemName}» tadbiri oʻchirildi` : `Мероприятие «${itemName}» удалено`
      );
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      alert(isUz ? 'Tadbirni oʻchirib boʻlmadi' : 'Не удалось удалить мероприятие');
    }
  };

  const filteredEvents = React.useMemo(() => {
    return events.filter((e) => {
      const matchesSearch =
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        categoryFilter === 'all' || e.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [events, searchQuery, categoryFilter]);

  const getCategoryBadge = (cat: EventCategory) => {
    switch (cat) {
      case 'open_doors':
        return (
          <Badge variant="outline" className="text-primary border-primary/20">
            {isUz ? 'Ochiq eshiklar kuni' : 'День открытых дверей'}
          </Badge>
        );
      case 'science':
        return (
          <Badge variant="outline" className="text-emerald-600 border-emerald-500/20">
            {isUz ? 'Fan va olimpiada' : 'Наука'}
          </Badge>
        );
      case 'sports':
        return (
          <Badge variant="outline" className="text-amber-600 border-amber-500/20">
            {isUz ? 'Sport' : 'Спорт'}
          </Badge>
        );
      case 'culture':
        return (
          <Badge variant="outline" className="text-purple-600 border-purple-500/20">
            {isUz ? 'Madaniyat' : 'Культура'}
          </Badge>
        );
      default:
        return <Badge variant="outline">{isUz ? 'Umumiy' : 'Общее'}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {isUz ? 'Tadbirlar taqvimi' : 'Календарь событий и мероприятий'}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isUz
              ? 'Ochiq eshiklar kuni, olimpiadalar, konferensiyalar va talabalar tadbirlarini boshqarish'
              : 'Управление днями открытых дверей, олимпиадами, конференциями и студенческими событиями'}
          </p>
        </div>

        <Button
          onClick={openCreateModal}
          data-tour="events.create-btn"
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-xs"
        >
          <Plus className="h-4 w-4" />
          {isUz ? 'Tadbir qoʻshish' : 'Добавить событие'}
        </Button>
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

      {/* Filter toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            data-tour="events.search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isUz ? 'Nomi yoki joyi boʻyicha qidiruv...' : 'Поиск по названию или месту...'
            }
            className="pl-9 h-10"
          />
        </div>

        <select
          data-tour="events.category-filter"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 py-1 text-sm"
        >
          <option value="all">{isUz ? 'Barcha toifalar' : 'Все категории'}</option>
          <option value="open_doors">
            {isUz ? 'Ochiq eshiklar kuni' : 'День открытых дверей'}
          </option>
          <option value="science">{isUz ? 'Fan va olimpiadalar' : 'Наука'}</option>
          <option value="sports">{isUz ? 'Sport' : 'Спорт'}</option>
          <option value="culture">{isUz ? 'Madaniyat' : 'Культура'}</option>
          <option value="general">{isUz ? 'Umumiy' : 'Общее'}</option>
        </select>
      </div>

      {/* Events Table */}
      <div data-tour="events.table" className="rounded-xl border bg-card shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            {isUz ? 'Tadbirlar yuklanmoqda...' : 'Загрузка событий...'}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              {isUz ? 'Tadbirlar topilmadi' : 'События не найдены'}
            </p>
            <Button variant="outline" size="sm" onClick={openCreateModal}>
              {isUz ? 'Tadbir yaratish' : 'Создать событие'}
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs font-semibold text-muted-foreground uppercase border-b">
                <tr>
                  <th className="py-3 px-4">{isUz ? 'Tadbir' : 'Событие'}</th>
                  <th className="py-3 px-4">{isUz ? 'Toifa' : 'Категория'}</th>
                  <th className="py-3 px-4">{isUz ? 'Sana va vaqt' : 'Дата и время'}</th>
                  <th className="py-3 px-4">{isUz ? 'Oʻtkazilish joyi' : 'Место проведения'}</th>
                  <th className="py-3 px-4">{isUz ? 'Holat' : 'Статус'}</th>
                  <th className="py-3 px-4 text-right">{isUz ? 'Amallar' : 'Действия'}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredEvents.map((e) => (
                  <tr key={e.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground">{e.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {e.description}
                      </div>
                    </td>

                    <td className="py-3 px-4">{getCategoryBadge(e.category)}</td>

                    <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">
                      <div className="flex items-center gap-1 font-medium text-foreground">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        {new Date(e.eventDate).toLocaleDateString(isUz ? 'uz-UZ' : 'ru-RU', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {new Date(e.eventDate).toLocaleTimeString(isUz ? 'uz-UZ' : 'ru-RU', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        {e.location}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {e.isPublished ? (
                        <Badge
                          variant="outline"
                          className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs"
                        >
                          {isUz ? 'Eʼlon qilingan' : 'Опубликовано'}
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs"
                        >
                          {isUz ? 'Yashirin' : 'Скрыто'}
                        </Badge>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTogglePublish(e)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                          title={
                            isUz
                              ? e.isPublished
                                ? 'Tadbirni yashirish'
                                : 'Eʼlon qilish'
                              : e.isPublished
                              ? 'Скрыть событие'
                              : 'Опубликовать'
                          }
                        >
                          {e.isPublished ? (
                            <EyeOff className="h-3.5 w-3.5 text-amber-600" />
                          ) : (
                            <Eye className="h-3.5 w-3.5 text-emerald-600" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(e)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                          title={isUz ? 'Tahrirlash' : 'Редактировать'}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(e.id, e.title)}
                          className="h-8 w-8 p-0 text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                          title={isUz ? 'Oʻchirish' : 'Удалить'}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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

      {/* Modal for Add / Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          editingItem
            ? (isUz ? 'Tadbirni tahrirlash' : 'Редактирование мероприятия')
            : (isUz ? 'Yangi tadbir yaratish' : 'Создание мероприятия')
        }
        description={
          isUz
            ? 'Texnikum tadbiri maʼlumotlari va oʻtkazilish rejasini kiriting'
            : 'Заполните информацию о мероприятии колледжа и расписание'
        }
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <div className="p-3 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              {formError}
            </div>
          )}

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {isUz ? 'Tadbir nomi' : 'Название мероприятия'}{' '}
                <span className="text-destructive">*</span>
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  isUz
                    ? 'Axborot texnologiyalari boʻlimining ochiq eshiklar kuni'
                    : 'День открытых дверей IT-отделения'
                }
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  {isUz ? 'Tadbir toifasi' : 'Категория события'}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as EventCategory)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="open_doors">
                    {isUz ? 'Ochiq eshiklar kuni' : 'День открытых дверей'}
                  </option>
                  <option value="science">
                    {isUz ? 'Fan va olimpiadalar' : 'Наука и олимпиады'}
                  </option>
                  <option value="sports">
                    {isUz ? 'Sport va musobaqalar' : 'Спорт и соревнования'}
                  </option>
                  <option value="culture">
                    {isUz ? 'Madaniyat va festivallar' : 'Культура и фестивали'}
                  </option>
                  <option value="general">
                    {isUz ? 'Umumiy tadbir' : 'Общее мероприятие'}
                  </option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  {isUz ? 'Boshlanish sanasi va vaqti' : 'Дата и время начала'}{' '}
                  <span className="text-destructive">*</span>
                </label>
                <Input
                  type="datetime-local"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {isUz ? 'Oʻtkazilish joyi' : 'Место проведения'}{' '}
                <span className="text-destructive">*</span>
              </label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={
                  isUz
                    ? 'Bosh bino, Faollar zali (Talabalar koʻchasi, 10)'
                    : 'Главный корпус, Актовый зал (ул. Студенческая, 10)'
                }
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  {isUz ? 'Tashkilotchi / Boʻlim' : 'Организатор / Отделение'}
                </label>
                <Input
                  value={organizer}
                  onChange={(e) => setOrganizer(e.target.value)}
                  placeholder={
                    isUz ? 'Texnikum qabul komissiyasi' : 'Приемная комиссия колледжа'
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  {isUz ? 'Roʻyxatdan oʻtish havolasi (mavjud boʻlsa)' : 'Ссылка на регистрацию (если есть)'}
                </label>
                <Input
                  type="url"
                  value={registrationUrl}
                  onChange={(e) => setRegistrationUrl(e.target.value)}
                  placeholder="https://forms.gle/..."
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <ImageUploadField
                value={coverImageUrl}
                onChange={setCoverImageUrl}
                label={isUz ? 'Tadbir muqovasi' : 'Обложка мероприятия'}
                description={
                  isUz
                    ? 'Tadbir banneri (16:9, JPG, PNG, WEBP, 10 MB gacha)'
                    : 'Баннер мероприятия (16:9, JPG, PNG, WEBP, до 10 МБ)'
                }
                bucket="news-media"
                aspectRatio="video"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {isUz ? 'Tadbirning qisqa tavsifi' : 'Краткое описание мероприятия'}{' '}
                <span className="text-destructive">*</span>
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder={
                  isUz
                    ? 'Oʻqituvchilar bilan tanishuv, laboratoriyalar boʻylab ekskursiya...'
                    : 'Знакомство с преподавателями, экскурсия по лабораториям...'
                }
                required
              />
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                />
                <span>
                  {isUz ? 'Umumiy taqvimda eʼlon qilish' : 'Опубликовать в общем календаре'}
                </span>
              </label>
              <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                />
                <span>
                  {isUz
                    ? 'Asosiy kutilayotgan tadbir sifatida mahkamlash'
                    : 'Закрепить как главное предстоящее событие'}
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              {isUz ? 'Bekor qilish' : 'Отмена'}
            </Button>
            <Button type="submit" size="sm" className="bg-primary text-primary-foreground">
              {editingItem
                ? (isUz ? 'Oʻzgarishlarni saqlash' : 'Сохранить изменения')
                : (isUz ? 'Yaratish' : 'Создать')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
