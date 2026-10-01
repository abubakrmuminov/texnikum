'use client';

import React, { useMemo, useState } from 'react';
import {
  Bell,
  MapPin,
} from 'lucide-react';
import { Parity, ScheduleItem, Teacher } from '@college/shared';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ScheduleViewerProps {
  initialSchedule: ScheduleItem[];
  groups: string[];
  teachers: Teacher[];
}

const DAYS_OF_WEEK = [
  { day: 1, name: 'Dushanba', short: 'Dush' },
  { day: 2, name: 'Seshanba', short: 'Sesh' },
  { day: 3, name: 'Chorshanba', short: 'Chor' },
  { day: 4, name: 'Payshanba', short: 'Pay' },
  { day: 5, name: 'Juma', short: 'Juma' },
  { day: 6, name: 'Shanba', short: 'Shan' },
];

const CALL_SCHEDULE = [
  { pair: 1, time: '08:30 – 10:00', break: '10 daqiqa tanaffus' },
  { pair: 2, time: '10:10 – 11:40', break: '30 daqiqa tushlik tanaffusi' },
  { pair: 3, time: '12:10 – 13:40', break: '10 daqiqa tanaffus' },
  { pair: 4, time: '13:50 – 15:20', break: '10 daqiqa tanaffus' },
  { pair: 5, time: '15:30 – 17:00', break: 'Darslarning yakunlanishi' },
];

export function ScheduleViewer({
  initialSchedule,
  groups,
  teachers,
}: ScheduleViewerProps): JSX.Element {
  const [selectedGroup, setSelectedGroup] = useState<string>(groups[0] || 'DASTUR-21');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [selectedParity, setSelectedParity] = useState<'all' | Parity>('all');

  const teacherMap = useMemo(() => {
    const map = new Map<string, Teacher>();
    for (const t of teachers) {
      map.set(t.id, t);
    }
    return map;
  }, [teachers]);

  // Фильтрация расписания
  const daySchedule = useMemo(() => {
    return initialSchedule
      .filter((item) => {
        // Фильтр по группе или преподавателю
        const matchesGroup = selectedTeacherId ? true : item.groupName === selectedGroup;
        const matchesTeacher = selectedTeacherId ? item.teacherId === selectedTeacherId : true;
        const matchesDay = item.dayOfWeek === selectedDay;
        const matchesParity =
          selectedParity === 'all' || item.parity === 'both' || item.parity === selectedParity;

        return matchesGroup && matchesTeacher && matchesDay && matchesParity;
      })
      .sort((a, b) => a.lessonNumber - b.lessonNumber);
  }, [initialSchedule, selectedGroup, selectedTeacherId, selectedDay, selectedParity]);

  const activeDayName = DAYS_OF_WEEK.find((d) => d.day === selectedDay)?.name || 'Dushanba';

  return (
    <div className="space-y-8">
      {/* 1. Панель фильтров расписания */}
      <div className="p-5 rounded-xl border border-border bg-card shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Выбор группы */}
          <div>
            <label htmlFor="group-select" className="block text-xs font-semibold text-foreground mb-1.5">
              Oʻquv guruhi:
            </label>
            <select
              id="group-select"
              value={selectedTeacherId ? '' : selectedGroup}
              disabled={Boolean(selectedTeacherId)}
              onChange={(e) => {
                setSelectedGroup(e.target.value);
                setSelectedTeacherId('');
              }}
              className="w-full h-10 px-3 py-2 text-xs font-medium rounded-lg border border-input bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            >
              {groups.map((group) => (
                <option key={group} value={group}>
                  {group} guruhi
                </option>
              ))}
            </select>
          </div>

          {/* Фильтр по преподавателю */}
          <div>
            <label htmlFor="teacher-select" className="block text-xs font-semibold text-foreground mb-1.5">
              Yoki oʻqituvchi boʻyicha:
            </label>
            <select
              id="teacher-select"
              value={selectedTeacherId}
              onChange={(e) => {
                setSelectedTeacherId(e.target.value);
              }}
              className="w-full h-10 px-3 py-2 text-xs font-medium rounded-lg border border-input bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Barcha oʻqituvchilar (guruh boʻyicha)</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName}
                </option>
              ))}
            </select>
          </div>

          {/* Четность недели */}
          <div>
            <span className="block text-xs font-semibold text-foreground mb-1.5">
              Hafta tartibi:
            </span>
            <div
              role="radiogroup"
              aria-label="Hafta tartibini tanlash"
              className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-muted text-xs font-medium text-center"
            >
              <button
                type="button"
                role="radio"
                aria-checked={selectedParity === 'all'}
                onClick={() => setSelectedParity('all')}
                className={`py-1.5 rounded-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  selectedParity === 'all'
                    ? 'bg-background text-foreground shadow-sm font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Barchasi
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={selectedParity === 'odd'}
                onClick={() => setSelectedParity('odd')}
                className={`py-1.5 rounded-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  selectedParity === 'odd'
                    ? 'bg-background text-foreground shadow-sm font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Toq hafta
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={selectedParity === 'even'}
                onClick={() => setSelectedParity('even')}
                className={`py-1.5 rounded-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  selectedParity === 'even'
                    ? 'bg-background text-foreground shadow-sm font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Juft hafta
              </button>
            </div>
          </div>
        </div>

        {/* Дни недели */}
        <div
          role="tablist"
          aria-label="Hafta kunlari"
          className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border"
        >
          {DAYS_OF_WEEK.map((d) => (
            <button
              key={d.day}
              type="button"
              role="tab"
              aria-selected={selectedDay === d.day}
              onClick={() => setSelectedDay(d.day)}
              className={`flex-1 min-w-[70px] py-2 px-3 rounded-lg text-xs font-semibold transition-all text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                selectedDay === d.day
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <span className="hidden sm:inline">{d.name}</span>
              <span className="sm:hidden">{d.short}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Доступная таблица расписания (WCAG 2.1 AA / OʻRQ-641) */}
      <section aria-labelledby="schedule-table-title">
        <h2 id="schedule-table-title" className="sr-only">
          {activeDayName} dars jadvali
        </h2>

        <div
          className="table-scroll-container rounded-xl border border-border bg-card overflow-x-auto shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
          tabIndex={0}
          role="region"
          aria-label={`${activeDayName} dars jadvali, jadvalni gorizontal siljitish uchun yoʻnalish tugmalaridan foydalaning`}
        >
          <table className="w-full text-left text-xs border-collapse">
            <caption className="p-4 text-sm font-bold text-foreground text-left bg-muted/40 border-b border-border">
              {selectedTeacherId
                ? `Oʻqituvchi dars jadvali: ${teacherMap.get(selectedTeacherId)?.fullName || 'Oʻqituvchi'} (${activeDayName})`
                : `Oʻquv jadvali: ${selectedGroup} guruhi (${activeDayName})`}
            </caption>
            <thead>
              <tr className="border-b border-border bg-muted/60 text-muted-foreground uppercase text-[11px] font-semibold">
                <th scope="col" className="p-3.5 w-16 text-center">
                  Para
                </th>
                <th scope="col" className="p-3.5 w-28">
                  Vaqt
                </th>
                <th scope="col" className="p-3.5">
                  Fan nomi
                </th>
                <th scope="col" className="p-3.5 w-48">
                  Oʻqituvchi
                </th>
                <th scope="col" className="p-3.5 w-32">
                  Auditoriya
                </th>
                <th scope="col" className="p-3.5 w-28 text-center">
                  Tartibi
                </th>
              </tr>
            </thead>
            <tbody>
              {daySchedule.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    {activeDayName.toLowerCase()} kuniga dars mashgʻulotlari rejalashtirilmagan (dam olish kuni yoki mustaqil taʼlim).
                  </td>
                </tr>
              ) : (
                daySchedule.map((item) => {
                  const teacher = item.teacherId ? teacherMap.get(item.teacherId) : undefined;

                  return (
                    <tr
                      key={item.id}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <th
                        scope="row"
                        className="p-3.5 text-center font-bold text-foreground bg-muted/20"
                      >
                        {item.lessonNumber}
                      </th>
                      <td className="p-3.5 text-muted-foreground font-mono">
                        {item.timeStart} – {item.timeEnd}
                      </td>
                      <td className="p-3.5 font-semibold text-foreground text-sm">
                        {item.subject}
                      </td>
                      <td className="p-3.5 text-muted-foreground">
                        {teacher ? (
                          <span className="font-medium text-foreground">
                            {teacher.fullName}
                          </span>
                        ) : (
                          <span>Kafedra</span>
                        )}
                      </td>
                      <td className="p-3.5 font-medium text-foreground">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3 text-primary" aria-hidden="true" />
                          <span>{item.classroom}</span>
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <Badge
                          variant="secondary"
                          className="text-[10px] font-normal"
                        >
                          {item.parity === 'both'
                            ? 'Har hafta'
                            : item.parity === 'odd'
                            ? 'Toq hafta'
                            : 'Juft hafta'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. Расписание звонков (Справочный блок) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Bell className="size-4 text-primary" aria-hidden="true" />
            <span>Oʻquv kuni qoʻngʻiroqlar jadvali</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {CALL_SCHEDULE.map((c) => (
              <div
                key={c.pair}
                className="p-3 rounded-lg border border-border bg-muted/30 text-xs text-center"
              >
                <div className="font-bold text-primary mb-1">
                  {c.pair}-para
                </div>
                <div className="font-mono font-semibold text-foreground">
                  {c.time}
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">
                  {c.break}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
