'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
  Star,
  Clock,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import { NewsItem, NewsCategory, NewsStatus } from '@college/shared';
import { useAppLocale } from '@/components/i18n/locale-provider';

export default function AdminNewsPage() {
  const { locale } = useAppLocale();
  const isUz = locale === 'uz';
  const [news, setNews] = React.useState<NewsItem[]>([]);
  const [categories, setCategories] = React.useState<NewsCategory[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedStatus, setSelectedStatus] = React.useState<string>('all');
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string>('all');

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [newsData, catsData] = await Promise.all([
        apiClient.getNews({ limit: 100 }),
        apiClient.getNewsCategories(),
      ]);
      setNews(newsData.items);
      setCategories(catsData);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Не удалось загрузить публикации'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Quick Toggle Status
  const handleToggleStatus = async (item: NewsItem) => {
    const nextStatus =
      item.status === NewsStatus.PUBLISHED
        ? NewsStatus.DRAFT
        : NewsStatus.PUBLISHED;

    try {
      await apiClient.updateNews(item.id, {
        status: nextStatus,
        publishedAt:
          nextStatus === NewsStatus.PUBLISHED
            ? new Date().toISOString()
            : null,
      });
      setNews((prev) =>
        prev.map((n) =>
          n.id === item.id
            ? {
                ...n,
                status: nextStatus,
                publishedAt:
                  nextStatus === NewsStatus.PUBLISHED
                    ? new Date().toISOString()
                    : null,
              }
            : n
        )
      );
    } catch {
      alert('Не удалось изменить статус публикации');
    }
  };

  // Handle Quick Delete
  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Вы уверены, что хотите удалить новость «${title}»?`)) {
      return;
    }

    try {
      await apiClient.deleteNews(id);
      setNews((prev) => prev.filter((n) => n.id !== id));
    } catch {
      alert('Не удалось удалить публикацию');
    }
  };

  // Filtered Items
  const filteredNews = React.useMemo(() => {
    return news.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.leadText.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        selectedStatus === 'all' || item.status === selectedStatus;
      const matchesCategory =
        selectedCategoryId === 'all' ||
        item.categoryId === Number(selectedCategoryId);
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [news, searchQuery, selectedStatus, selectedCategoryId]);

  const getStatusBadge = (st: NewsStatus) => {
    switch (st) {
      case NewsStatus.PUBLISHED:
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">
            {isUz ? 'Eʼlon qilingan' : 'Опубликовано'}
          </Badge>
        );
      case NewsStatus.DRAFT:
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs">
            {isUz ? 'Qoralama' : 'Черновик'}
          </Badge>
        );
      case NewsStatus.ARCHIVED:
        return (
          <Badge variant="outline" className="bg-muted text-muted-foreground text-xs">
            {isUz ? 'Arxiv' : 'Архив'}
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {isUz ? 'Yangiliklarni boshqarish' : 'Управление новостями'}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isUz
              ? 'Yangiliklar nashr qilish, maqolalarni tahrirlash va ruknlarni boshqarish'
              : 'Публикация новостей, редактирование статей и управление рубриками'}
          </p>
        </div>

        <Link href="/admin/news/new">
          <Button data-tour="news.create-btn" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-xs">
            <Plus className="h-4 w-4" />
            {isUz ? 'Yangilik yozish' : 'Написать новость'}
          </Button>
        </Link>
      </div>

      {/* Error alert */}
      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            data-tour="news.search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isUz ? 'Sarlavha yoki matn boʻyicha qidirish...' : 'Поиск по названию или тексту...'}
            className="pl-9 h-10"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Status filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="h-4 w-4 text-muted-foreground hidden sm:inline-block" />
            <select
              data-tour="news.status-filter"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="all">{isUz ? 'Barcha holatlar' : 'Все статусы'}</option>
              <option value={NewsStatus.PUBLISHED}>{isUz ? 'Eʼlon qilinganlar' : 'Опубликованные'}</option>
              <option value={NewsStatus.DRAFT}>{isUz ? 'Qoralamalar' : 'Черновики'}</option>
              <option value={NewsStatus.ARCHIVED}>{isUz ? 'Arxivdagilar' : 'Архивные'}</option>
            </select>
          </div>

          {/* Category filter */}
          <select
            data-tour="news.category-filter"
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">{isUz ? 'Barcha ruknlar' : 'Все рубрики'}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* News Table */}
      <div data-tour="news.table" className="rounded-xl border bg-card shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            {isUz ? 'Maqolalar yuklanmoqda...' : 'Загрузка публикаций...'}
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              {searchQuery || selectedStatus !== 'all' || selectedCategoryId !== 'all'
                ? (isUz ? 'Kriteriyalar boʻyicha maqolalar topilmadi' : 'Публикаций по заданным критериям не найдено')
                : (isUz ? 'Yangiliklar roʻyxati boʻsh' : 'Список новостей пуст')}
            </p>
            <Link href="/admin/news/new">
              <Button variant="outline" size="sm">
                {isUz ? 'Birinchi maqolani yaratish' : 'Создать первую публикацию'}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs font-semibold text-muted-foreground uppercase border-b">
                <tr>
                  <th className="py-3 px-4">{isUz ? 'Muqova' : 'Обложка'}</th>
                  <th className="py-3 px-4">{isUz ? 'Sarlavha / Rukn' : 'Заголовок / Рубрика'}</th>
                  <th className="py-3 px-4">{isUz ? 'Holat' : 'Статус'}</th>
                  <th className="py-3 px-4">{isUz ? 'Eʼlon sanasi' : 'Дата публикации'}</th>
                  <th className="py-3 px-4 text-right">{isUz ? 'Amallar' : 'Действия'}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredNews.map((item, index) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 w-20">
                      <div className="h-12 w-16 rounded-md bg-muted/60 overflow-hidden relative border shrink-0">
                        {item.coverImageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.coverImageUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-muted-foreground text-[10px]">
                            {isUz ? 'Rasm yoʻq' : 'Нет фото'}
                          </div>
                        )}
                        {item.isFeatured && (
                          <span
                            className="absolute top-1 left-1 bg-amber-500 text-white rounded-full p-0.5 shadow-xs"
                            title={isUz ? 'Bosh sahifaga biriktirilgan' : 'Закрепленная главная новость'}
                          >
                            <Star className="h-2.5 w-2.5 fill-white" />
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 max-w-md">
                      <div className="font-semibold text-foreground line-clamp-1 hover:text-primary">
                        <Link href={`/admin/news/${item.id}`}>{item.title}</Link>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded">
                          /{item.slug}
                        </span>
                        {item.category && (
                          <span className="text-primary font-medium">
                            • {item.category.name}
                          </span>
                        )}
                        <span className="flex items-center gap-0.5 text-[11px]">
                          <Clock className="h-3 w-3" />
                          {item.readingTimeMin} {isUz ? 'daq' : 'мин'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {getStatusBadge(item.status)}
                    </td>

                    <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">
                      {item.publishedAt ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(item.publishedAt).toLocaleDateString(isUz ? 'uz-UZ' : 'ru-RU', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                      ) : (
                        <span className="text-muted-foreground/60">
                          {isUz ? 'Eʼlon qilinmagan' : 'Не опубликовано'}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div
                        data-tour={index === 0 ? 'news.row-actions' : undefined}
                        className="flex items-center justify-end gap-1"
                      >
                        {/* Quick View Public */}
                        {item.status === NewsStatus.PUBLISHED && (
                          <Link
                            href={`/news/${item.slug}`}
                            target="_blank"
                            title={isUz ? 'Saytda koʻrish' : 'Открыть на сайте'}
                          >
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                        )}

                        {/* Quick Toggle Status */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(item)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                          title={
                            item.status === NewsStatus.PUBLISHED
                              ? (isUz ? 'Qoralamaga oʻtkazish' : 'Снять с публикации (в черновик)')
                              : (isUz ? 'Saytda eʼlon qilish' : 'Опубликовать на сайте')
                          }
                        >
                          {item.status === NewsStatus.PUBLISHED ? (
                            <EyeOff className="h-3.5 w-3.5 text-amber-600" />
                          ) : (
                            <Eye className="h-3.5 w-3.5 text-emerald-600" />
                          )}
                        </Button>

                        {/* Edit Link */}
                        <Link href={`/admin/news/${item.id}`} title={isUz ? 'Tahrirlash' : 'Редактировать'}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                        </Link>

                        {/* Delete */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id, item.title)}
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
    </div>
  );
}
