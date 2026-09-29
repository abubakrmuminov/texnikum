'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  ExternalLink,
  GraduationCap,
  History,
  Image as ImageIcon,
  Newspaper,
  Plus,
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

export default function AdminDashboardPage(): JSX.Element {
  const { user, token } = useAdminAuth();

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
          collegeApi.getAuditLogs({ limit: 5 }),
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

  const todayFormatted = new Date().toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  if (loading) {
    return (
      <div className="p-12 text-center text-sm text-muted-foreground">
        Загрузка панели управления...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Заголовок дашборда */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Панель управления техникумом
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 capitalize">
            {todayFormatted} • Добро пожаловать, {user?.fullName || 'Сотрудник'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/news/new">
            <Button size="sm" className="text-xs font-semibold gap-1.5 shadow">
              <Plus className="size-4" aria-hidden="true" />
              <span>Создать новость</span>
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="sm" className="text-xs gap-1.5">
              <span>Открыть сайт</span>
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
            <span className="text-xs font-semibold text-muted-foreground">Новости и статьи</span>
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Newspaper className="size-4" aria-hidden="true" />
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-1">
            <div className="text-2xl font-black text-foreground">{news.length}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                {publishedNewsCount} опубл.
              </span>
              <span>•</span>
              <span className="text-amber-600 dark:text-amber-400">
                {draftNewsCount} черновик.
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Метрика 2: Педагоги */}
        <Card>
          <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between space-y-0">
            <span className="text-xs font-semibold text-muted-foreground">Педагогический состав</span>
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <UserCheck className="size-4" aria-hidden="true" />
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-1">
            <div className="text-2xl font-black text-foreground">{teachers.length}</div>
            <p className="text-xs text-muted-foreground">
              Преподавателей и экспертов в штате
            </p>
          </CardContent>
        </Card>

        {/* Метрика 3: Специальности */}
        <Card>
          <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between space-y-0">
            <span className="text-xs font-semibold text-muted-foreground">Программы обучения</span>
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <GraduationCap className="size-4" aria-hidden="true" />
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-1">
            <div className="text-2xl font-black text-foreground">{specialties.length}</div>
            <p className="text-xs text-muted-foreground">
              {totalBudgetPlaces} мест по государственному гранту
            </p>
          </CardContent>
        </Card>

        {/* Метрика 4: Расписание */}
        <Card>
          <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between space-y-0">
            <span className="text-xs font-semibold text-muted-foreground">Учебное расписание</span>
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Clock className="size-4" aria-hidden="true" />
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-1">
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              Актуально
            </div>
            <p className="text-xs text-muted-foreground">
              Семестр 2026/2027 • Числитель/знаменатель
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Быстрые действия */}
      <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Быстрый переход и добавление записей
        </span>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/news/new">
            <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8">
              <Newspaper className="size-3.5 text-primary" aria-hidden="true" />
              <span>Написать новость</span>
            </Button>
          </Link>
          <Link href="/admin/events">
            <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8">
              <Calendar className="size-3.5 text-primary" aria-hidden="true" />
              <span>Создать событие</span>
            </Button>
          </Link>
          <Link href="/admin/media">
            <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8">
              <ImageIcon className="size-3.5 text-primary" aria-hidden="true" />
              <span>Загрузить медиафайл</span>
            </Button>
          </Link>
          <Link href="/admin/schedule">
            <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8">
              <Clock className="size-3.5 text-primary" aria-hidden="true" />
              <span>Редактировать расписание</span>
            </Button>
          </Link>
          <Link href="/admin/pages">
            <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8">
              <History className="size-3.5 text-primary" aria-hidden="true" />
              <span>Сведения об ОО (37-модда)</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Таблица последних новостей и действий */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">
            Последние публикации и черновики
          </h2>
          <Link href="/admin/news">
            <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary">
              Все новости ({news.length}) →
            </Button>
          </Link>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-x-auto shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[11px] font-semibold">
                <th className="p-3.5">Заголовок</th>
                <th className="p-3.5 w-32">Статус</th>
                <th className="p-3.5 w-28 text-center">Главное</th>
                <th className="p-3.5 w-36">Дата</th>
                <th className="p-3.5 w-48 text-right">Действия</th>
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
                        Опубликовано
                      </Badge>
                    ) : item.status === NewsStatus.DRAFT ? (
                      <Badge variant="secondary">
                        Черновик
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        В архиве
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
                    {new Date(item.publishedAt || item.createdAt).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="p-3.5 text-right space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePublish(item)}
                      className="text-[11px] h-7"
                    >
                      {item.status === NewsStatus.PUBLISHED ? 'В черновик' : 'Опубликовать'}
                    </Button>
                    <Link href={`/admin/news/${item.id}`}>
                      <Button variant="outline" size="sm" className="text-[11px] h-7">
                        Правка
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
              <span>Последние события безопасности (Аудит)</span>
            </h2>
            <Link href="/admin/audit">
              <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary">
                Полный журнал аудита →
              </Button>
            </Link>
          </div>

          <div className="rounded-xl border border-border bg-card divide-y divide-border text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-mono ${
                      log.action === 'CREATE'
                        ? 'border-emerald-500 text-emerald-700 dark:text-emerald-400'
                        : log.action === 'UPDATE'
                        ? 'border-blue-500 text-blue-700 dark:text-blue-400'
                        : 'border-amber-500 text-amber-700 dark:text-amber-400'
                    }`}
                  >
                    {log.action}
                  </Badge>
                  <span className="font-semibold text-foreground">
                    {log.entityType}
                  </span>
                  <span className="text-muted-foreground truncate max-w-sm hidden sm:inline">
                    {JSON.stringify(log.newValues || log.oldValues || '')}
                  </span>
                </div>
                <div className="text-muted-foreground font-mono shrink-0">
                  {new Date(log.createdAt).toLocaleTimeString('ru-RU')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
