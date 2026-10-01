'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Award, BookOpen, Clock, Mail, Search, User, X } from 'lucide-react';
import { Department, Teacher } from '@college/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface TeacherFeedProps {
  initialTeachers: Teacher[];
  departments: Department[];
}

export function TeacherFeed({
  initialTeachers,
  departments,
}: TeacherFeedProps): JSX.Element {
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const departmentMap = useMemo(() => {
    const map = new Map<string, Department>();
    for (const d of departments) {
      map.set(d.id, d);
    }
    return map;
  }, [departments]);

  const filteredTeachers = useMemo(() => {
    return initialTeachers.filter((t) => {
      const matchesDept =
        selectedDeptId === null || t.departmentId === selectedDeptId;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        t.fullName.toLowerCase().includes(q) ||
        (t.subjects && t.subjects.some((s) => s.toLowerCase().includes(q))) ||
        (t.qualification && t.qualification.toLowerCase().includes(q));
      return matchesDept && matchesSearch;
    });
  }, [initialTeachers, selectedDeptId, searchQuery]);

  const getInitials = (name: string) => {
    const parts = name.split(' ').filter(Boolean);
    const p0 = parts[0];
    const p1 = parts[1];
    if (p0 && p1) {
      return `${p0[0] || ''}${p1[0] || ''}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-8">
      {/* Фильтры и поиск */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card shadow-sm">
        {/* Фильтр по отделениям */}
        <div
          role="tablist"
          aria-label="Oʻqituvchilarni boʻlimlar boʻyicha saralash"
          className="flex flex-wrap items-center gap-2"
        >
          <button
            type="button"
            role="tab"
            aria-selected={selectedDeptId === null}
            onClick={() => setSelectedDeptId(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              selectedDeptId === null
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            }`}
          >
            Barcha boʻlimlar
          </button>
          {departments.map((dept) => (
            <button
              key={dept.id}
              type="button"
              role="tab"
              aria-selected={selectedDeptId === dept.id}
              onClick={() => setSelectedDeptId(dept.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                selectedDeptId === dept.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
              }`}
            >
              {dept.name}
            </button>
          ))}
        </div>

        {/* Поиск по имени или предмету */}
        <div className="relative w-full md:w-80">
          <label htmlFor="teacher-search" className="sr-only">
            Oʻqituvchi yoki fan boʻyicha qidiruv
          </label>
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="teacher-search"
            type="search"
            placeholder="F.I.O. yoki fan nomi boʻyicha qidiruv..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-8 h-9 text-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Qidiruvni tozalash"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Индикатор результатов */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Topilgan pedagoglar soni: <strong className="text-foreground font-semibold">{filteredTeachers.length}</strong>
        </span>
        {(selectedDeptId !== null || searchQuery !== '') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedDeptId(null);
              setSearchQuery('');
            }}
            className="text-xs h-7 text-primary hover:text-primary"
          >
            Filtrlarni tozalash
          </Button>
        )}
      </div>

      {/* Сетка преподавателей */}
      {filteredTeachers.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-xl border border-dashed border-border bg-card">
          <User className="size-10 mx-auto text-muted-foreground mb-3 opacity-60" aria-hidden="true" />
          <p className="text-base font-semibold text-foreground">
            Belgilangan mezonlar boʻyicha oʻqituvchilar topilmadi
          </p>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Familiya yoki fan nomi toʻgʻri yozilganligini tekshiring yoki filtrlarni tozalang.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedDeptId(null);
              setSearchQuery('');
            }}
            className="mt-4"
          >
            Barcha oʻqituvchilarni koʻrsatish
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.map((t) => {
            const dept = t.departmentId ? departmentMap.get(t.departmentId) : undefined;
            return (
              <Card
                key={t.id}
                className="flex flex-col justify-between hover:shadow-md transition-all group"
              >
                <CardContent className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Аватар + Основные регалии */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="size-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-extrabold text-base tracking-wider shrink-0 border border-primary/20 shadow-inner">
                        {getInitials(t.fullName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base text-foreground leading-snug group-hover:text-primary transition-colors">
                          <Link href={`/teachers/${t.slug}`} className="focus:outline-none focus:underline">
                            {t.fullName}
                          </Link>
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {t.position}
                        </p>
                        {dept && (
                          <span className="inline-block mt-1 text-[11px] text-primary/80 font-medium line-clamp-1">
                            {dept.name}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Квалификация и категория */}
                    {t.qualification && (
                      <div className="flex items-start gap-1.5 text-xs text-muted-foreground mb-3">
                        <Award className="size-3.5 text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
                        <span className="line-clamp-2">{t.qualification}</span>
                      </div>
                    )}

                    {/* Стаж */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4 py-2 px-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-1">
                        <Clock className="size-3 text-muted-foreground" aria-hidden="true" />
                        <span>Umumiy: {t.experienceYears} yil</span>
                      </div>
                      <span>•</span>
                      <div>
                        <span>Pedagogik: {t.teachingExperienceYears} yil</span>
                      </div>
                    </div>

                    {/* Преподаваемые дисциплины */}
                    {t.subjects && t.subjects.length > 0 && (
                      <div className="space-y-1.5 mb-4">
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                          <BookOpen className="size-3" aria-hidden="true" />
                          <span>Fanlar:</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {t.subjects.slice(0, 3).map((sub, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="text-[11px] font-normal py-0 px-2 bg-background"
                            >
                              {sub}
                            </Badge>
                          ))}
                          {t.subjects.length > 3 && (
                            <span className="text-[11px] text-muted-foreground self-center">
                              +{t.subjects.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Нижняя плашка карточки */}
                  <div className="pt-4 border-t border-border flex items-center justify-between text-xs">
                    {t.email ? (
                      <a
                        href={`mailto:${t.email}`}
                        className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                        aria-label={`Elektron pochtaga yozish: ${t.email}`}
                      >
                        <Mail className="size-3.5" aria-hidden="true" />
                        <span className="truncate max-w-[130px]">{t.email}</span>
                      </a>
                    ) : (
                      <span className="text-muted-foreground">Boʻlim</span>
                    )}

                    <Link href={`/teachers/${t.slug}`}>
                      <Button variant="ghost" size="sm" className="text-xs h-7 text-primary hover:text-primary p-0">
                        Profil →
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
