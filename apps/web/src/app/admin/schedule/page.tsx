'use client';

import * as React from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import { ScheduleItem, Teacher, Parity } from '@college/shared';
import { useAppLocale } from '@/components/i18n/locale-provider';

const DAYS_RU = [
  { id: 1, name: 'Понедельник' },
  { id: 2, name: 'Вторник' },
  { id: 3, name: 'Среда' },
  { id: 4, name: 'Четверг' },
  { id: 5, name: 'Пятница' },
  { id: 6, name: 'Суббота' },
];

const DAYS_UZ = [
  { id: 1, name: 'Dushanba' },
  { id: 2, name: 'Seshanba' },
  { id: 3, name: 'Chorshanba' },
  { id: 4, name: 'Payshanba' },
  { id: 5, name: 'Juma' },
  { id: 6, name: 'Shanba' },
];

const LESSON_TIMES: Record<number, { start: string; end: string }> = {
  1: { start: '08:30', end: '10:00' },
  2: { start: '10:15', end: '11:45' },
  3: { start: '12:15', end: '13:45' },
  4: { start: '14:00', end: '15:30' },
  5: { start: '15:45', end: '17:15' },
  6: { start: '17:30', end: '19:00' },
};

export default function AdminSchedulePage() {
  const { locale } = useAppLocale();
  const isUz = locale === 'uz';
  const days = isUz ? DAYS_UZ : DAYS_RU;

  const [schedule, setSchedule] = React.useState<ScheduleItem[]>([]);
  const [teachers, setTeachers] = React.useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  // Filters
  const [selectedGroup, setSelectedGroup] = React.useState<string>('all');
  const [selectedDay, setSelectedDay] = React.useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = React.useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<ScheduleItem | null>(null);

  // Form State
  const [groupName, setGroupName] = React.useState('IS-21');
  const [dayOfWeek, setDayOfWeek] = React.useState<number>(1);
  const [lessonNumber, setLessonNumber] = React.useState<number>(1);
  const [timeStart, setTimeStart] = React.useState('08:30');
  const [timeEnd, setTimeEnd] = React.useState('10:00');
  const [subject, setSubject] = React.useState('');
  const [teacherId, setTeacherId] = React.useState<string>('');
  const [classroom, setClassroom] = React.useState('302');
  const [parity, setParity] = React.useState<Parity>('both');
  const [isActive, setIsActive] = React.useState(true);
  const [formError, setFormError] = React.useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [schedData, teachData] = await Promise.all([
        apiClient.getSchedule(),
        apiClient.getTeachers(),
      ]);
      setSchedule(schedData);
      setTeachers(teachData.items);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : (isUz ? 'Dars jadvalini yuklab boʻlmadi' : 'Не удалось загрузить расписание')
      );
    } finally {
      setIsLoading(false);
    }
  }, [isUz]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Unique groups list
  const groupsList = React.useMemo(() => {
    const set = new Set<string>();
    schedule.forEach((s) => set.add(s.groupName));
    return Array.from(set).sort();
  }, [schedule]);

  const handleLessonNumberChange = (num: number) => {
    setLessonNumber(num);
    const times = LESSON_TIMES[num];
    if (times) {
      setTimeStart(times.start);
      setTimeEnd(times.end);
    }
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setGroupName(groupsList[0] || 'IS-21');
    setDayOfWeek(1);
    setLessonNumber(1);
    setTimeStart('08:30');
    setTimeEnd('10:00');
    setSubject('');
    setTeacherId(teachers[0]?.id || '');
    setClassroom('302');
    setParity('both');
    setIsActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: ScheduleItem) => {
    setEditingItem(item);
    setGroupName(item.groupName);
    setDayOfWeek(item.dayOfWeek);
    setLessonNumber(item.lessonNumber);
    setTimeStart(item.timeStart);
    setTimeEnd(item.timeEnd);
    setSubject(item.subject);
    setTeacherId(item.teacherId || '');
    setClassroom(item.classroom);
    setParity(item.parity);
    setIsActive(item.isActive);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!groupName.trim() || !subject.trim() || !classroom.trim()) {
      setFormError(
        isUz
          ? 'Majburiy maydonlarni toʻldiring: guruh, fan, auditoriya'
          : 'Заполните обязательные поля: группа, предмет, аудитория'
      );
      return;
    }

    const payload: Partial<ScheduleItem> = {
      groupName: groupName.trim(),
      dayOfWeek: Number(dayOfWeek),
      lessonNumber: Number(lessonNumber),
      timeStart,
      timeEnd,
      subject: subject.trim(),
      teacherId: teacherId || null,
      classroom: classroom.trim(),
      parity,
      isActive,
    };

    try {
      if (editingItem) {
        await apiClient.updateSchedule(editingItem.id, payload);
        const selectedTeacher = teachers.find((t) => t.id === teacherId);
        setSchedule((prev) =>
          prev.map((s) =>
            s.id === editingItem.id
              ? ({ ...s, ...payload, teacher: selectedTeacher } as ScheduleItem)
              : s
          )
        );
        setSuccess(
          isUz ? 'Mashgʻulot muvaffaqiyatli yangilandi' : 'Занятие успешно обновлено'
        );
      } else {
        const created = await apiClient.createSchedule(payload);
        const selectedTeacher = teachers.find((t) => t.id === teacherId);
        setSchedule((prev) => [{ ...created, teacher: selectedTeacher }, ...prev]);
        setSuccess(
          isUz ? 'Dars jadvalga muvaffaqiyatli qoʻshildi' : 'Пара успешно добавлена в расписание'
        );
      }
      setIsModalOpen(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      setFormError(
        err instanceof Error
          ? err.message
          : (isUz ? 'Darsni saqlashda xatolik yuz berdi' : 'Ошибка при сохранении занятия')
      );
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmMsg = isUz
      ? `Haqiqatan ham «${name}» darsini oʻchirmoqchimisiz?`
      : `Вы уверены, что хотите удалить пару «${name}»?`;
    if (!window.confirm(confirmMsg)) {
      return;
    }
    try {
      await apiClient.deleteSchedule(id);
      setSchedule((prev) => prev.filter((s) => s.id !== id));
      setSuccess(
        isUz ? 'Mashgʻulot jadvaldan oʻchirildi' : 'Занятие удалено из сетки'
      );
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      alert(isUz ? 'Darsni oʻchirib boʻlmadi' : 'Не удалось удалить занятие');
    }
  };

  const filteredSchedule = React.useMemo(() => {
    return schedule
      .filter((s) => {
        const matchesGroup =
          selectedGroup === 'all' || s.groupName === selectedGroup;
        const matchesDay =
          selectedDay === 'all' || s.dayOfWeek === Number(selectedDay);
        const matchesSearch =
          s.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.classroom.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (s.teacher &&
            s.teacher.fullName.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesGroup && matchesDay && matchesSearch;
      })
      .sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.lessonNumber - b.lessonNumber);
  }, [schedule, selectedGroup, selectedDay, searchQuery]);

  const getDayName = (day: number) => {
    return days.find((d) => d.id === day)?.name || (isUz ? `${day}-kun` : `День ${day}`);
  };

  const getParityBadge = (p: Parity) => {
    switch (p) {
      case 'odd':
        return (
          <Badge variant="outline" className="text-purple-600 border-purple-500/20 text-[10px]">
            {isUz ? 'Toq hafta' : 'Нечетная неделя'}
          </Badge>
        );
      case 'even':
        return (
          <Badge variant="outline" className="text-indigo-600 border-indigo-500/20 text-[10px]">
            {isUz ? 'Juft hafta' : 'Четная неделя'}
          </Badge>
        );
      default:
        return (
          <span className="text-xs text-muted-foreground">
            {isUz ? 'Har hafta' : 'Каждая неделя'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {isUz ? 'Dars jadvali' : 'Расписание занятий'}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isUz
              ? 'Oʻquv juftliklari, auditoriyalar, guruhlar va haftalar ketma-ketligini boshqarish'
              : 'Управление учебными парами, аудиторным фондом, группами и четностью недель'}
          </p>
        </div>

        <Button
          onClick={openCreateModal}
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-xs"
        >
          <Plus className="h-4 w-4" />
          {isUz ? 'Juftlik (dars) qoʻshish' : 'Добавить пару'}
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

      {/* Filters toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isUz
                ? 'Fan, auditoriya yoki oʻqituvchi boʻyicha qidiruv...'
                : 'Поиск по предмету, аудитории или преподавателю...'
            }
            className="pl-9 h-10"
          />
        </div>

        {/* Group filter */}
        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 py-1 text-sm"
        >
          <option value="all">
            {isUz ? `Barcha guruhlar (${groupsList.length})` : `Все группы (${groupsList.length})`}
          </option>
          {groupsList.map((g) => (
            <option key={g} value={g}>
              {isUz ? `${g}-guruhi` : `Группа ${g}`}
            </option>
          ))}
        </select>

        {/* Day filter */}
        <select
          value={selectedDay}
          onChange={(e) =>
            setSelectedDay(e.target.value === 'all' ? 'all' : Number(e.target.value))
          }
          className="h-10 rounded-md border border-input bg-background px-3 py-1 text-sm"
        >
          <option value="all">{isUz ? 'Barcha kunlar' : 'Все дни недели'}</option>
          {days.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {/* Schedule Table */}
      <div className="rounded-xl border bg-card shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            {isUz ? 'Dars jadvali yuklanmoqda...' : 'Загрузка расписания занятий...'}
          </div>
        ) : filteredSchedule.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              {isUz ? 'Mashgʻulotlar topilmadi' : 'Занятия не найдены'}
            </p>
            <Button variant="outline" size="sm" onClick={openCreateModal}>
              {isUz ? 'Dars qoʻshish' : 'Добавить пару'}
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs font-semibold text-muted-foreground uppercase border-b">
                <tr>
                  <th className="py-3 px-4">{isUz ? 'Kun / Vaqt' : 'День / Время'}</th>
                  <th className="py-3 px-4">{isUz ? 'Juftlik' : 'Пара'}</th>
                  <th className="py-3 px-4">{isUz ? 'Guruh' : 'Группа'}</th>
                  <th className="py-3 px-4">{isUz ? 'Fan / Xona' : 'Предмет / Аудитория'}</th>
                  <th className="py-3 px-4">{isUz ? 'Oʻqituvchi' : 'Преподаватель'}</th>
                  <th className="py-3 px-4">{isUz ? 'Haftalik' : 'Четность недели'}</th>
                  <th className="py-3 px-4 text-right">{isUz ? 'Amallar' : 'Действия'}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredSchedule.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-foreground">{getDayName(s.dayOfWeek)}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        {s.timeStart} – {s.timeEnd}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="h-6 w-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                        {s.lessonNumber}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono font-medium text-foreground">
                      {s.groupName}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-foreground">{s.subject}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" />
                        {isUz ? 'Xona' : 'Ауд.'} {s.classroom}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-xs text-foreground">
                      {s.teacher ? (
                        <span>{s.teacher.fullName}</span>
                      ) : (
                        <span className="text-muted-foreground/60">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {getParityBadge(s.parity)}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(s)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                          title={isUz ? 'Tahrirlash' : 'Редактировать'}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(s.id, `${s.subject} (${s.groupName})`)}
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
            ? (isUz ? 'Darsni tahrirlash' : 'Редактирование занятия')
            : (isUz ? 'Jadvalga dars qoʻshish' : 'Добавление пары в расписание')
        }
        description={
          isUz
            ? 'Guruh, kun, juftlik raqami, fan va oʻqituvchini tanlang'
            : 'Укажите группу, день, пару, дисциплину и преподавателя'
        }
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <div className="p-3 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {isUz ? 'Oʻquv guruhi' : 'Учебная группа'}{' '}
                <span className="text-destructive">*</span>
              </label>
              <Input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="IS-21"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {isUz ? 'Hafta kuni' : 'День недели'} <span className="text-destructive">*</span>
              </label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(Number(e.target.value))}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {days.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {isUz ? 'Juftlik raqami' : 'Номер пары'}{' '}
                <span className="text-destructive">*</span>
              </label>
              <select
                value={lessonNumber}
                onChange={(e) => handleLessonNumberChange(Number(e.target.value))}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                  <option key={num} value={num}>
                    {isUz ? `${num}-juftlik` : `Пара №${num}`} ({LESSON_TIMES[num]?.start || '—'} – {LESSON_TIMES[num]?.end || '—'})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {isUz ? 'Auditoriya (xona)' : 'Аудитория'}{' '}
                <span className="text-destructive">*</span>
              </label>
              <Input
                value={classroom}
                onChange={(e) => setClassroom(e.target.value)}
                placeholder={isUz ? '302, 4-kompyuter sinfi' : '302, Компьютерный класс 4'}
                required
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-foreground">
                {isUz ? 'Fan nomi' : 'Наименование дисциплины'}{' '}
                <span className="text-destructive">*</span>
              </label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={
                  isUz
                    ? 'Dasturiy injiniring asoslari'
                    : 'Архитектура аппаратных средств'
                }
                required
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground">
                {isUz ? 'Oʻqituvchi' : 'Преподаватель'}
              </label>
              <select
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">
                  {isUz ? 'Oʻqituvchi biriktirilmagan' : 'Без привязки к преподавателю'}
                </option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.fullName} ({t.position})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {isUz ? 'Boshlanish vaqti' : 'Время начала'}
              </label>
              <Input
                value={timeStart}
                onChange={(e) => setTimeStart(e.target.value)}
                placeholder="08:30"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {isUz ? 'Tugash vaqti' : 'Время окончания'}
              </label>
              <Input
                value={timeEnd}
                onChange={(e) => setTimeEnd(e.target.value)}
                placeholder="10:00"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground">
                {isUz ? 'Haftalik turi' : 'Четность недели'}
              </label>
              <select
                value={parity}
                onChange={(e) => setParity(e.target.value as Parity)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="both">
                  {isUz ? 'Har hafta (doimiy)' : 'Каждую неделю (всегда)'}
                </option>
                <option value="odd">
                  {isUz ? 'Faqat toq hafta (surat)' : 'Только нечетная (числитель)'}
                </option>
                <option value="even">
                  {isUz ? 'Faqat juft hafta (maxraj)' : 'Только четная (знаменатель)'}
                </option>
              </select>
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
                : (isUz ? 'Darsni qoʻshish' : 'Добавить пару')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
