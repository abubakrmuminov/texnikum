'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  ExternalLink,
  GraduationCap,
  History,
  Image as ImageIcon,
  Newspaper,
  Plus,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import {
  AuditLogItem,
  NewsItem,
  NewsStatus,
  Specialty,
  Teacher,
  UserRole,
} from '@college/shared';
import { useAdminAuth } from '@/components/admin/admin-auth-context';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { collegeApi } from '@/lib/api-client';
import { useAppLocale } from '@/components/i18n/locale-provider';

export default function AdminDashboardPage(): JSX.Element {
  const { user, token } = useAdminAuth();
  const { locale } = useAppLocale();
  const isUz = locale === 'uz';

  const [news, setNews] = useState<NewsItem[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [newsRes, teachersRes, specialtiesRes, auditRes] = await Promise.all([
          collegeApi.getNews({ limit: 10 }),
          collegeApi.getTeachers({ limit: 100 }),
          collegeApi.getSpecialties({ limit: 100 }),
          collegeApi.getAuditLogs({ limit: 5 }, token || undefined),
        ]);
        setNews(newsRes.items);
        setTeachers(teachersRes.items);
        setSpecialties(specialtiesRes.items);
        setAuditLogs(auditRes.items);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [token]);

  const publishedNewsCount = news.filter((n) => n.status === NewsStatus.PUBLISHED).length;
  const draftNewsCount = news.filter((n) => n.status === NewsStatus.DRAFT).length;
  const totalBudgetPlaces = specialties.reduce((sum, s) => sum + s.budgetPlaces, 0);

  const togglePublish = async (item: NewsItem) => {
    const newStatus =
      item.status === NewsStatus.PUBLISHED ? NewsStatus.DRAFT : NewsStatus.PUBLISHED;
    await collegeApi.updateNews(item.id, { status: newStatus }, token || undefined);
    setNews((prev) =>
      prev.map((n) =>
        n.id === item.id
          ? {
              ...n,
              status: newStatus,
              publishedAt: newStatus === NewsStatus.PUBLISHED ? new Date().toISOString() : n.publishedAt,
            }
          : n,
      ),
    );
  };

  const todayFormatted = new Date().toLocaleDateString(isUz ? 'uz-UZ' : 'ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  if (loading) {
    return (
      <div className="p-12 text-center text-sm text-muted-foreground">
        {isUz ? 'Boshqaruv paneli yuklanmoqda...' : 'Загрузка панели управления...'}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Заголовок дашборда */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {isUz ? 'Texnikum boshqaruv paneli' : 'Панель управления техникумом'}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 capitalize">
            {todayFormatted} • {isUz ? 'Xush kelibsiz' : 'Добро пожаловать'}, {user?.fullName || (isUz ? 'Xodim' : 'Сотрудник')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/news/new">
            <Button size="sm" className="text-xs font-semibold gap-1.5 shadow">
              <Plus className="size-4" aria-hidden="true" />
              <span>{isUz ? 'Yangi maqola yaratish' : 'Создать новость'}</span>
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="sm" className="text-xs gap-1.5">
              <span>{isUz ? 'Saytni ochish' : 'Открыть сайт'}</span>
              <ExternalLink className="size-3.5" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Карточки метрик (KPI) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Метрика 1: Новости */}
        <Card>
          <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between space-y-0">
            <span className="text-xs font-semibold text-muted-foreground">
              {isUz ? 'Yangiliklar va maqolalar' : 'Новости и статьи'}
            </span>
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Newspaper className="size-4" aria-hidden="true" />
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-1">
            <div className="text-2xl font-black text-foreground">{news.length}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                {publishedNewsCount} {isUz ? 'eʼlon' : 'опубл.'}
              </span>
              <span>•</span>
              <span className="text-amber-600 dark:text-amber-400">
                {draftNewsCount} {isUz ? 'qoralama' : 'черновик.'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Метрика 2: Педагоги */}
        <Card>
          <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between space-y-0">
            <span className="text-xs font-semibold text-muted-foreground">
              {isUz ? 'Oʻqituvchilar tarkibi' : 'Педагогический состав'}
            </span>
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <UserCheck className="size-4" aria-hidden="true" />
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-1">
            <div className="text-2xl font-black text-foreground">{teachers.length}</div>
            <p className="text-xs text-muted-foreground">
              {isUz ? 'Shtatdagi oʻqituvchilar va ekspertlar' : 'Преподавателей и экспертов в штате'}
            </p>
          </CardContent>
        </Card>

        {/* Метрика 3: Специальности */}
        <Card>
          <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between space-y-0">
            <span className="text-xs font-semibold text-muted-foreground">
              {isUz ? 'Taʼlim dasturlari' : 'Программы обучения'}
            </span>
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <GraduationCap className="size-4" aria-hidden="true" />
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-1">
            <div className="text-2xl font-black text-foreground">{specialties.length}</div>
            <p className="text-xs text-muted-foreground">
              {totalBudgetPlaces} {isUz ? 'ta davlat granti oʻrni' : 'мест по государственному гранту'}
            </p>
          </CardContent>
        </Card>

        {/* Метрика 4: Руководство и администрация */}
        <Card>
          <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between space-y-0">
            <span className="text-xs font-semibold text-muted-foreground">
              {isUz ? 'Rahbariyat va maʼmuriyat' : 'Руководство и администрация'}
            </span>
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <ShieldCheck className="size-4" aria-hidden="true" />
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-1">
            <div className="text-2xl font-black text-foreground">
              10
            </div>
            <p className="text-xs text-muted-foreground">
              {isUz ? 'Boshqaruv tarkibi va boʻlim boshliqlari' : 'Дирекция и начальники отделов'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Быстрые действия */}
      <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {isUz ? 'Tezkor oʻtish va yozuv qoʻshish' : 'Быстрый переход и добавление записей'}
        </span>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/news/new">
            <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8">
              <Newspaper className="size-3.5 text-primary" aria-hidden="true" />
              <span>{isUz ? 'Yangilik yozish' : 'Написать новость'}</span>
            </Button>
          </Link>
          <Link href="/admin/events">
            <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8">
              <Calendar className="size-3.5 text-primary" aria-hidden="true" />
              <span>{isUz ? 'Tadbir yaratish' : 'Создать событие'}</span>
            </Button>
          </Link>
          <Link href="/admin/media">
            <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8">
              <ImageIcon className="size-3.5 text-primary" aria-hidden="true" />
              <span>{isUz ? 'Fayl yuklash' : 'Загрузить медиафайл'}</span>
            </Button>
          </Link>
          <Link href="/admin/administration">
            <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8">
              <ShieldCheck className="size-3.5 text-primary" aria-hidden="true" />
              <span>{isUz ? 'Rahbariyat va maʼmuriyat' : 'Руководство и администрация'}</span>
            </Button>
          </Link>
          <Link href="/admin/contacts">
            <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8">
              <History className="size-3.5 text-primary" aria-hidden="true" />
              <span>{isUz ? 'Aloqa maʼlumotlari' : 'Контакты и реквизиты'}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Таблица последних новостей и действий */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">
            {isUz ? 'Soʻnggi nashrlar va qoralamalar' : 'Последние публикации и черновики'}
          </h2>
          <Link href="/admin/news">
            <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary">
              {isUz ? `Barcha yangiliklar (${news.length}) →` : `Все новости (${news.length}) →`}
            </Button>
          </Link>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-x-auto shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[11px] font-semibold">
                <th className="p-3.5">{isUz ? 'Sarlavha' : 'Заголовок'}</th>
                <th className="p-3.5 w-32">{isUz ? 'Holat' : 'Статус'}</th>
                <th className="p-3.5 w-28 text-center">{isUz ? 'Asosiy' : 'Главное'}</th>
                <th className="p-3.5 w-36">{isUz ? 'Sana' : 'Дата'}</th>
                <th className="p-3.5 w-48 text-right">{isUz ? 'Amallar' : 'Действия'}</th>
              </tr>
            </thead>
            <tbody>
              {news.slice(0, 5).map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                >
                  <td className="p-3.5 font-medium text-foreground">
                    <div className="flex items-center gap-2">
                      <span className="truncate max-w-md">{item.title}</span>
                    </div>
                  </td>
                  <td className="p-3.5">
                    {item.status === NewsStatus.PUBLISHED ? (
                      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300">
                        {isUz ? 'Eʼlon qilingan' : 'Опубликовано'}
                      </Badge>
                    ) : item.status === NewsStatus.DRAFT ? (
                      <Badge variant="secondary">
                        {isUz ? 'Qoralama' : 'Черновик'}
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        {isUz ? 'Arxiv' : 'В архиве'}
                      </Badge>
                    )}
                  </td>
                  <td className="p-3.5 text-center">
                    {item.isFeatured ? (
                      <span className="text-amber-600 font-bold text-xs">Hero ★</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="p-3.5 text-muted-foreground font-mono">
                    {new Date(item.publishedAt || item.createdAt).toLocaleDateString(isUz ? 'uz-UZ' : 'ru-RU')}
                  </td>
                  <td className="p-3.5 text-right space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePublish(item)}
                      className="text-[11px] h-7"
                    >
                      {item.status === NewsStatus.PUBLISHED
                        ? (isUz ? 'Qoralamaga' : 'В черновик')
                        : (isUz ? 'Eʼlon qilish' : 'Опубликовать')}
                    </Button>
                    <Link href={`/admin/news/${item.id}`}>
                      <Button variant="outline" size="sm" className="text-[11px] h-7">
                        {isUz ? 'Tahrirlash' : 'Правка'}
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Журнал аудита: краткая сводка (только для Admin) */}
      {user?.role === UserRole.ADMIN && auditLogs.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <History className="size-4 text-primary" aria-hidden="true" />
              <span>{isUz ? 'Xavfsizlik va soʻnggi amallar jurnali (Audit)' : 'Последние события безопасности (Аудит)'}</span>
            </h2>
            <Link href="/admin/audit">
              <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary">
                {isUz ? 'Toʻliq audit jurnali →' : 'Полный журнал аудита →'}
              </Button>
            </Link>
          </div>

          <div className="rounded-xl border border-border bg-card divide-y divide-border text-xs">
            {auditLogs.map((log) => {
              const summary =
                (log.newValues?.title as string) ||
                (log.newValues?.fullName as string) ||
                (log.newValues?.name as string) ||
                (log.newValues?.message as string) ||
                (log.newValues?.email as string) ||
                (log.oldValues?.title as string) ||
                (log.oldValues?.fullName as string) ||
                log.entityId;

              return (
                <div key={log.id} className="p-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-mono shrink-0 ${
                        log.action === 'CREATE'
                          ? 'border-emerald-500 text-emerald-700 dark:text-emerald-400'
                          : log.action === 'UPDATE'
                          ? 'border-blue-500 text-blue-700 dark:text-blue-400'
                          : 'border-amber-500 text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      {log.action}
                    </Badge>
                    <span className="font-semibold text-foreground shrink-0 font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded">
                      {log.entityType}
                    </span>
                    <span className="text-muted-foreground truncate max-w-xs sm:max-w-md text-xs font-medium">
                      {summary}
                    </span>
                  </div>
                  <div className="text-muted-foreground font-mono shrink-0 text-[11px]">
                    {new Date(log.createdAt).toLocaleTimeString(isUz ? 'uz-UZ' : 'ru-RU')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
