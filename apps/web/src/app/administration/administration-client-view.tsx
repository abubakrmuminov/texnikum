'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import {
  Briefcase,
  ChevronDown,
  ChevronUp,
  Clock,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { AdministratorMember } from '@college/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppLocale } from '@/components/i18n/locale-provider';

interface AdministrationClientViewProps {
  initialAdministrators: AdministratorMember[];
}

export function AdministrationClientView({
  initialAdministrators,
}: AdministrationClientViewProps): JSX.Element {
  const { locale } = useAppLocale();
  const isUz = locale === 'uz';

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedDuties, setExpandedDuties] = useState<Record<string, boolean>>({});

  const toggleDuties = (id: string) => {
    setExpandedDuties((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const categories = [
    {
      id: 'all',
      label: isUz ? 'Barcha rahbarlar' : 'Все руководители',
      count: initialAdministrators.length,
    },
    {
      id: 'leadership',
      label: isUz ? 'Texnikum rahbariyati' : 'Руководство техникума',
      count: initialAdministrators.filter((a) => a.category === 'leadership').length,
    },
    {
      id: 'department_head',
      label: isUz ? 'Boʻlim boshliqlari' : 'Начальники отделов',
      count: initialAdministrators.filter((a) => a.category === 'department_head').length,
    },
    {
      id: 'administrative',
      label: isUz ? 'Maʼmuriy-xoʻjalik' : 'Административно-хозяйственные службы',
      count: initialAdministrators.filter((a) => a.category === 'administrative').length,
    },
  ];

  const filtered = useMemo(() => {
    return initialAdministrators.filter((admin) => {
      const matchCategory =
        activeCategory === 'all' || admin.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        admin.fullName.toLowerCase().includes(q) ||
        admin.position.toLowerCase().includes(q) ||
        (admin.duties && admin.duties.toLowerCase().includes(q)) ||
        (admin.roomNumber && admin.roomNumber.toLowerCase().includes(q));

      return matchCategory && matchSearch;
    });
  }, [initialAdministrators, activeCategory, searchQuery]);

  // Разделение на руководство и остальных при режиме "all"
  const leadershipGroup = useMemo(
    () => filtered.filter((a) => a.category === 'leadership'),
    [filtered],
  );
  const otherGroup = useMemo(
    () => filtered.filter((a) => a.category !== 'leadership'),
    [filtered],
  );

  return (
    <div className="space-y-8">
      {/* Панель фильтрации и поиска */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between pb-4 border-b border-border">
        {/* Вкладки категорий */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-primary ${
                activeCategory === c.id
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>{c.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeCategory === c.id
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'bg-background/80 text-foreground'
                }`}
              >
                {c.count}
              </span>
            </button>
          ))}
        </div>

        {/* Поле поиска */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isUz
                ? 'Ism, lavozim yoki xona boʻyicha qidirish...'
                : 'Поиск по ФИО, должности или кабинету...'
            }
            className="pl-9 text-xs h-9"
          />
        </div>
      </div>

      {/* Список руководителей */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-dashed border-border bg-card text-muted-foreground space-y-3">
          <Users className="h-10 w-10 mx-auto text-muted-foreground/50" />
          <p className="font-semibold text-sm">
            {isUz
              ? 'Qidiruv boʻyicha hech qanday rahbar topilmadi'
              : 'По указанным критериям сотрудники не найдены'}
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setActiveCategory('all');
              setSearchQuery('');
            }}
            className="text-xs"
          >
            {isUz ? 'Barcha filtrlarni tozalash' : 'Сбросить фильтры'}
          </Button>
        </div>
      ) : activeCategory === 'all' && !searchQuery ? (
        <div className="space-y-10">
          {/* Секция: Дирекция и заместители */}
          {leadershipGroup.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">
                  {isUz ? 'Texnikum rahbariyati (Direksiya)' : 'Руководство техникума (Дирекция)'}
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {leadershipGroup.map((admin) => (
                  <LeadershipCard
                    key={admin.id}
                    admin={admin}
                    isUz={isUz}
                    isExpanded={!!expandedDuties[admin.id]}
                    onToggleDuties={() => toggleDuties(admin.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Секция: Начальники отделов и службы */}
          {otherGroup.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <Briefcase className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">
                  {isUz
                    ? 'Boʻlim boshliqlari va maʼmuriy xizmatlar'
                    : 'Начальники отделов и административные службы'}
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {otherGroup.map((admin) => (
                  <StaffCard
                    key={admin.id}
                    admin={admin}
                    isUz={isUz}
                    isExpanded={!!expandedDuties[admin.id]}
                    onToggleDuties={() => toggleDuties(admin.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((admin) =>
            admin.category === 'leadership' ? (
              <LeadershipCard
                key={admin.id}
                admin={admin}
                isUz={isUz}
                isExpanded={!!expandedDuties[admin.id]}
                onToggleDuties={() => toggleDuties(admin.id)}
              />
            ) : (
              <StaffCard
                key={admin.id}
                admin={admin}
                isUz={isUz}
                isExpanded={!!expandedDuties[admin.id]}
                onToggleDuties={() => toggleDuties(admin.id)}
              />
            ),
          )}
        </div>
      )}
    </div>
  );
}

// Карточка высшего руководства (Директор / Замдиректора)
function LeadershipCard({
  admin,
  isUz,
  isExpanded,
  onToggleDuties,
}: {
  admin: AdministratorMember;
  isUz: boolean;
  isExpanded: boolean;
  onToggleDuties: () => void;
}) {
  return (
    <article className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4 relative overflow-hidden">
      <div className="space-y-4">
        {/* Верхняя строка: фото + ФИО + должность */}
        <div className="flex items-start gap-4">
          <div className="relative size-20 sm:size-24 rounded-xl overflow-hidden bg-muted border border-border shrink-0">
            {admin.photoUrl ? (
              <Image
                src={admin.photoUrl}
                alt={admin.fullName}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 80px, 96px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-xl">
                {admin.fullName
                  .split(' ')
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join('')}
              </div>
            )}
          </div>

          <div className="space-y-1.5 min-w-0">
            <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider text-primary border-primary/30 bg-primary/5">
              {isUz ? 'Rahbariyat' : 'Руководство'}
            </Badge>
            <h3 className="font-bold text-base sm:text-lg text-foreground leading-snug">
              {admin.fullName}
            </h3>
            <p className="text-xs sm:text-sm text-primary font-medium">
              {admin.position}
            </p>
          </div>
        </div>

        {/* График приема граждан */}
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/15 space-y-1 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-foreground">
            <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>{isUz ? 'Fuqarolarni qabul qilish vaqti:' : 'Время приема граждан:'}</span>
          </div>
          <p className="text-muted-foreground pl-5 font-medium">
            {admin.receptionHours}
          </p>
        </div>

        {/* Контактные данные */}
        <div className="space-y-2 text-xs text-muted-foreground pt-1">
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="text-foreground font-medium">{admin.roomNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
            <a
              href={`tel:${admin.phone}`}
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              {admin.phone}
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
            <a
              href={`mailto:${admin.email}`}
              className="text-foreground hover:text-primary transition-colors font-medium truncate"
            >
              {admin.email}
            </a>
          </div>
        </div>

        {/* Должностные обязанности (раскрывающийся блок) */}
        {admin.duties && (
          <div className="pt-2 border-t border-border">
            <button
              type="button"
              onClick={onToggleDuties}
              className="text-xs font-semibold text-primary hover:underline flex items-center justify-between w-full py-1 focus:outline-none"
            >
              <span>{isUz ? 'Asosiy vazifalari va vakolatlari' : 'Основные обязанности и полномочия'}</span>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            {isExpanded && (
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed bg-muted/30 p-2.5 rounded-lg border border-border">
                {admin.duties}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Быстрые кнопки связи */}
      <div className="flex items-center gap-2 pt-3 border-t border-border">
        <a href={`tel:${admin.phone}`} className="flex-1">
          <Button size="sm" variant="outline" className="w-full text-xs h-8">
            <Phone className="h-3.5 w-3.5 mr-1 text-primary" />
            {isUz ? 'Qoʻngʻiroq qilish' : 'Позвонить'}
          </Button>
        </a>
        <a href={`mailto:${admin.email}`} className="flex-1">
          <Button size="sm" variant="outline" className="w-full text-xs h-8">
            <Mail className="h-3.5 w-3.5 mr-1 text-primary" />
            {isUz ? 'Xat yoʻllash' : 'Написать'}
          </Button>
        </a>
      </div>
    </article>
  );
}

// Карточка начальника отдела / административного сотрудника
function StaffCard({
  admin,
  isUz,
  isExpanded,
  onToggleDuties,
}: {
  admin: AdministratorMember;
  isUz: boolean;
  isExpanded: boolean;
  onToggleDuties: () => void;
}) {
  return (
    <article className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-2xs hover:shadow-sm transition-shadow flex flex-col justify-between space-y-3">
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="relative size-14 rounded-lg overflow-hidden bg-muted border border-border shrink-0">
            {admin.photoUrl ? (
              <Image
                src={admin.photoUrl}
                alt={admin.fullName}
                fill
                className="object-cover"
                sizes="56px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground font-semibold text-sm">
                {admin.fullName
                  .split(' ')
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join('')}
              </div>
            )}
          </div>

          <div className="space-y-1 min-w-0">
            <Badge variant="secondary" className="text-[10px] font-semibold">
              {admin.category === 'department_head'
                ? (isUz ? 'Boʻlim boshligʻi' : 'Начальник отдела')
                : (isUz ? 'Xizmat mudiri' : 'Административная служба')}
            </Badge>
            <h3 className="font-bold text-sm text-foreground leading-snug">
              {admin.fullName}
            </h3>
            <p className="text-xs text-muted-foreground font-medium">
              {admin.position}
            </p>
          </div>
        </div>

        {/* Информация о приеме */}
        <div className="p-2 rounded bg-muted/40 text-[11px] text-muted-foreground space-y-0.5">
          <div className="font-medium text-foreground flex items-center gap-1">
            <Clock className="h-3 w-3 text-primary" />
            <span>{isUz ? 'Ish va qabul vaqti:' : 'Часы приема:'}</span>
          </div>
          <div className="pl-4">{admin.receptionHours}</div>
        </div>

        {/* Контакты */}
        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3 text-primary shrink-0" />
            <span className="font-medium text-foreground">{admin.roomNumber}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Phone className="h-3 w-3 text-primary shrink-0" />
            <a
              href={`tel:${admin.phone}`}
              className="text-foreground hover:text-primary transition-colors font-medium truncate"
            >
              {admin.phone}
            </a>
          </div>
          <div className="flex items-center gap-1.5">
            <Mail className="h-3 w-3 text-primary shrink-0" />
            <a
              href={`mailto:${admin.email}`}
              className="text-foreground hover:text-primary transition-colors font-medium truncate"
            >
              {admin.email}
            </a>
          </div>
        </div>

        {/* Обязанности */}
        {admin.duties && (
          <div className="pt-2 border-t border-border">
            <button
              type="button"
              onClick={onToggleDuties}
              className="text-[11px] font-semibold text-primary hover:underline flex items-center justify-between w-full focus:outline-none"
            >
              <span>{isUz ? 'Vazifalari' : 'Обязанности'}</span>
              {isExpanded ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>
            {isExpanded && (
              <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed bg-muted/40 p-2 rounded border">
                {admin.duties}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-border">
        <a href={`tel:${admin.phone}`} className="block">
          <Button size="sm" variant="ghost" className="w-full text-xs h-7 hover:bg-primary/5 hover:text-primary">
            <Phone className="h-3 w-3 mr-1" />
            {admin.phone}
          </Button>
        </a>
      </div>
    </article>
  );
}
