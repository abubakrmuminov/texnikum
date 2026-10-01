'use client';

import * as React from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Mail,
  Briefcase,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Modal } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import { Teacher } from '@college/shared';
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

export default function AdminTeachersPage() {
  const { locale } = useAppLocale();
  const isUz = locale === 'uz';

  const [teachers, setTeachers] = React.useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingTeacher, setEditingTeacher] = React.useState<Teacher | null>(null);

  // Form fields
  const [fullName, setFullName] = React.useState('');
  const [position, setPosition] = React.useState('');
  const [qualification, setQualification] = React.useState('');
  const [subjectsStr, setSubjectsStr] = React.useState('');
  const [experienceYears, setExperienceYears] = React.useState<number>(5);
  const [teachingExpYears, setTeachingExpYears] = React.useState<number>(5);
  const [email, setEmail] = React.useState('');
  const [photoUrl, setPhotoUrl] = React.useState('');
  const [education, setEducation] = React.useState('');
  const [bio, setBio] = React.useState('');
  const [isActive, setIsActive] = React.useState(true);
  const [formError, setFormError] = React.useState<string | null>(null);

  const loadTeachers = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getTeachers();
      setTeachers(data.items);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : (isUz ? 'Oʻqituvchilar roʻyxatini yuklab boʻlmadi' : 'Не удалось загрузить преподавателей')
      );
    } finally {
      setIsLoading(false);
    }
  }, [isUz]);

  React.useEffect(() => {
    loadTeachers();
  }, [loadTeachers]);

  const openCreateModal = () => {
    setEditingTeacher(null);
    setFullName('');
    setPosition(isUz ? 'Maxsus fanlar oʻqituvchisi' : 'Преподаватель спецдисциплин');
    setQualification(isUz ? 'Oliy toifali oʻqituvchi' : 'Высшая квалификационная категория');
    setSubjectsStr('');
    setExperienceYears(10);
    setTeachingExpYears(8);
    setEmail('');
    setPhotoUrl('');
    setEducation(isUz ? 'Oliy pedagogik / texnik maʼlumot' : 'Высшее педагогическое / техническое');
    setBio('');
    setIsActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (t: Teacher) => {
    setEditingTeacher(t);
    setFullName(t.fullName);
    setPosition(t.position);
    setQualification(t.qualification);
    setSubjectsStr(t.subjects.join(', '));
    setExperienceYears(t.experienceYears);
    setTeachingExpYears(t.teachingExperienceYears);
    setEmail(t.email || '');
    setPhotoUrl(t.photoUrl || '');
    setEducation(t.education || '');
    setBio(t.bio || '');
    setIsActive(t.isActive);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!fullName.trim()) {
      setFormError(isUz ? 'Oʻqituvchining F.I.O. sini kiriting' : 'Укажите ФИО преподавателя');
      return;
    }
    if (!position.trim()) {
      setFormError(isUz ? 'Lavozimni kiriting' : 'Укажите должность');
      return;
    }

    const subjects = subjectsStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload: Partial<Teacher> = {
      fullName: fullName.trim(),
      slug: slugify(fullName),
      position: position.trim(),
      qualification: qualification.trim(),
      subjects,
      experienceYears: Number(experienceYears) || 0,
      teachingExperienceYears: Number(teachingExpYears) || 0,
      email: email.trim() || null,
      photoUrl: photoUrl.trim() || null,
      education: education.trim() || null,
      bio: bio.trim() || null,
      isActive,
      orderIndex: editingTeacher?.orderIndex ?? teachers.length + 1,
    };

    try {
      if (editingTeacher) {
        await apiClient.updateTeacher(editingTeacher.id, payload);
        setTeachers((prev) =>
          prev.map((t) => (t.id === editingTeacher.id ? ({ ...t, ...payload } as Teacher) : t))
        );
        setSuccess(
          isUz
            ? 'Oʻqituvchi maʼlumotlari muvaffaqiyatli yangilandi'
            : 'Данные преподавателя успешно обновлены'
        );
      } else {
        const created = await apiClient.createTeacher(payload);
        setTeachers((prev) => [created, ...prev]);
        setSuccess(
          isUz
            ? 'Oʻqituvchi roʻyxatga muvaffaqiyatli qoʻshildi'
            : 'Преподаватель успешно добавлен в реестр'
        );
      }
      setIsModalOpen(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      setFormError(
        err instanceof Error
          ? err.message
          : (isUz ? 'Oʻqituvchini saqlashda xatolik yuz berdi' : 'Ошибка при сохранении преподавателя')
      );
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmMsg = isUz
      ? `Haqiqatan ham «${name}» oʻqituvchisini oʻchirmoqchimisiz?`
      : `Вы уверены, что хотите удалить преподавателя «${name}»?`;
    if (!window.confirm(confirmMsg)) {
      return;
    }

    try {
      await apiClient.deleteTeacher(id);
      setTeachers((prev) => prev.filter((t) => t.id !== id));
      setSuccess(
        isUz ? `«${name}» oʻqituvchisi oʻchirildi` : `Преподаватель «${name}» удален`
      );
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      alert(isUz ? 'Oʻqituvchini oʻchirib boʻlmadi' : 'Не удалось удалить преподавателя');
    }
  };

  const filteredTeachers = React.useMemo(() => {
    return teachers.filter((t) =>
      t.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subjects.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [teachers, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {isUz ? 'Pedagogik tarkib' : 'Педагогический состав'}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isUz
              ? 'Oʻqituvchilar, ularning malakasi, oʻqitadigan fanlari va stajini boshqarish'
              : 'Управление преподавателями, квалификацией, дисциплинами и стажем'}
          </p>
        </div>

        <Button
          onClick={openCreateModal}
          data-tour="teachers.create-btn"
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-xs"
        >
          <Plus className="h-4 w-4" />
          {isUz ? 'Oʻqituvchi qoʻshish' : 'Добавить преподавателя'}
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

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          data-tour="teachers.search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={
            isUz
              ? 'F.I.O., lavozim yoki fan boʻyicha qidiruv...'
              : 'Поиск по ФИО, должности или дисциплине...'
          }
          className="pl-9 h-10"
        />
      </div>

      {/* Teachers Table */}
      <div data-tour="teachers.table" className="rounded-xl border bg-card shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            {isUz ? 'Oʻqituvchilar yuklanmoqda...' : 'Загрузка преподавателей...'}
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              {isUz ? 'Oʻqituvchilar topilmadi' : 'Преподаватели не найдены'}
            </p>
            <Button variant="outline" size="sm" onClick={openCreateModal}>
              {isUz ? 'Oʻqituvchi qoʻshish' : 'Добавить преподавателя'}
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs font-semibold text-muted-foreground uppercase border-b">
                <tr>
                  <th className="py-3 px-4">{isUz ? 'Rasm' : 'Фото'}</th>
                  <th className="py-3 px-4">{isUz ? 'F.I.O. / Lavozim' : 'ФИО / Должность'}</th>
                  <th className="py-3 px-4">{isUz ? 'Fanlar' : 'Дисциплины'}</th>
                  <th className="py-3 px-4">{isUz ? 'Staj (umum./ped.)' : 'Стаж (общ./пед.)'}</th>
                  <th className="py-3 px-4">{isUz ? 'Holat' : 'Статус'}</th>
                  <th className="py-3 px-4 text-right">{isUz ? 'Amallar' : 'Действия'}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredTeachers.map((t, index) => (
                  <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 w-16">
                      <div className="h-10 w-10 rounded-full bg-muted overflow-hidden border shrink-0">
                        {t.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={t.photoUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center font-bold text-xs text-muted-foreground">
                            {t.fullName.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground">{t.fullName}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <Briefcase className="h-3 w-3" />
                        {t.position}
                      </div>
                      {t.email && (
                        <div className="text-xs text-primary/80 flex items-center gap-1 mt-0.5">
                          <Mail className="h-3 w-3" />
                          {t.email}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {t.subjects.slice(0, 3).map((sub, i) => (
                          <Badge key={i} variant="outline" className="text-[11px] py-0">
                            {sub}
                          </Badge>
                        ))}
                        {t.subjects.length > 3 && (
                          <span className="text-[11px] text-muted-foreground">
                            +{t.subjects.length - 3}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">
                      <div>
                        {isUz ? 'Umumiy' : 'Общий'}: {t.experienceYears} {isUz ? 'yil' : 'лет'}
                      </div>
                      <div>
                        {isUz ? 'Ped' : 'Пед'}: {t.teachingExperienceYears} {isUz ? 'yil' : 'лет'}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {t.isActive ? (
                        <Badge
                          variant="outline"
                          className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs"
                        >
                          {isUz ? 'Faol' : 'Активен'}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-muted text-muted-foreground text-xs">
                          {isUz ? 'Arxivda' : 'В архиве'}
                        </Badge>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div
                        data-tour={index === 0 ? 'teachers.row-actions' : undefined}
                        className="flex items-center justify-end gap-1"
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(t)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                          title={isUz ? 'Tahrirlash' : 'Редактировать'}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(t.id, t.fullName)}
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
          editingTeacher
            ? (isUz ? 'Oʻqituvchi maʼlumotlarini tahrirlash' : 'Редактирование преподавателя')
            : (isUz ? 'Yangi oʻqituvchi qoʻshish' : 'Добавление преподавателя')
        }
        description={
          isUz
            ? '«Taʼlim toʻgʻrisida»gi Qonunning 37-moddasi talablariga muvofiq oʻqituvchi anketasini toʻldiring'
            : 'Заполните анкетные данные преподавателя в соответствии со статьей 37 Закона РУз «Об образовании»'
        }
        maxWidth="xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <div className="p-3 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-foreground">
                {isUz ? 'Oʻqituvchining F.I.O.' : 'ФИО преподавателя'}{' '}
                <span className="text-destructive">*</span>
              </label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Qodirov Alisher Rustamovich"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {isUz ? 'Lavozimi' : 'Должность'} <span className="text-destructive">*</span>
              </label>
              <Input
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder={isUz ? 'Maxsus fanlar oʻqituvchisi' : 'Преподаватель спецдисциплин'}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {isUz ? 'Malaka toifasi' : 'Квалификационная категория'}
              </label>
              <Input
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                placeholder={
                  isUz ? 'Oliy toifali oʻqituvchi' : 'Высшая квалификационная категория'
                }
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground">
                {isUz
                  ? 'Oʻqitadigan fanlari (vergul bilan ajrating)'
                  : 'Преподаваемые дисциплины (через запятую)'}
              </label>
              <Input
                value={subjectsStr}
                onChange={(e) => setSubjectsStr(e.target.value)}
                placeholder={
                  isUz
                    ? 'Informatika, Maʼlumotlar bazasi, Web-dasturlash'
                    : 'Информатика, Базы данных, Веб-разработка'
                }
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {isUz ? 'Umumiy ish staji (yil)' : 'Общий стаж работы (лет)'}
              </label>
              <Input
                type="number"
                min="0"
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {isUz
                  ? 'Pedagogik / mutaxassislik staji (yil)'
                  : 'Стаж работы по специальности / пед. (лет)'}
              </label>
              <Input
                type="number"
                min="0"
                value={teachingExpYears}
                onChange={(e) => setTeachingExpYears(Number(e.target.value))}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {isUz ? 'Elektron pochta' : 'Электронная почта'}
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teacher@texnikum.uz"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <ImageUploadField
                value={photoUrl}
                onChange={setPhotoUrl}
                label={isUz ? 'Oʻqituvchi fotosurati' : 'Фотография преподавателя'}
                description={
                  isUz
                    ? 'Rasmiy portret fotosurati (JPG, PNG, WEBP, 10 MB gacha)'
                    : 'Официальная портретная фотография (JPG, PNG, WEBP, до 10 МБ)'
                }
                bucket="news-media"
                aspectRatio="portrait"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground">
                {isUz
                  ? 'Maʼlumot darajasi / Mutaxassislik yoʻnalishi'
                  : 'Уровень образования / Наименование направления подготовки'}
              </label>
              <Input
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                placeholder={
                  isUz
                    ? 'Oliy maʼlumot, Axborot tizimlari va texnologiyalari'
                    : 'Высшее образование, Информационные системы и технологии'
                }
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground">
                {isUz ? 'Qisqa tarjimai hol va yutuqlar' : 'Краткая биография и достижения'}
              </label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder={
                  isUz
                    ? 'Oʻrta maxsus taʼlim aʼlochisi, koʻplab uslubiy qoʻllanmalar muallifi...'
                    : 'Почетный работник СПО, автор методических разработок...'
                }
              />
            </div>

            <div className="sm:col-span-2 pt-2">
              <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                />
                <span>
                  {isUz
                    ? 'Faol oʻqituvchi (saytda koʻrsatish)'
                    : 'Активный преподаватель (отображать на сайте)'}
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
              {editingTeacher
                ? (isUz ? 'Oʻzgarishlarni saqlash' : 'Сохранить изменения')
                : (isUz ? 'Qoʻshish' : 'Добавить')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
