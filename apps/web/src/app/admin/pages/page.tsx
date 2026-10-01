'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Plus,
  Edit2,
  Copy,
  Trash2,
  ExternalLink,
  Shield,
  CheckCircle2,
  AlertCircle,
  Layers,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { apiClient } from '@/lib/api-client';
import { PageItem, PageSection, UserRole, COLLEGE_PAGE_TEMPLATES } from '@college/shared';
import { useAppLocale } from '@/components/i18n/locale-provider';
import { useAdminAuth } from '@/components/admin/admin-auth-context';
import { PlusCircle } from 'lucide-react';

export default function AdminPagesPage(): JSX.Element {
  const router = useRouter();
  const { locale } = useAppLocale();
  const isUz = locale === 'uz';
  const { hasRole, token } = useAdminAuth();
  const isAdmin = hasRole(UserRole.ADMIN);
  const canEdit = hasRole(UserRole.ADMIN) || hasRole(UserRole.EDITOR);

  const [pages, setPages] = React.useState<PageItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [sectionFilter, setSectionFilter] = React.useState<string>('all');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<string>('blank');
  const [newTitleUz, setNewTitleUz] = React.useState('');
  const [newTitleRu, setNewTitleRu] = React.useState('');
  const [newSlug, setNewSlug] = React.useState('');
  const newSection: PageSection = 'general';
  const [isCreating, setIsCreating] = React.useState(false);
  const [createError, setCreateError] = React.useState<string | null>(null);

  // Delete State
  const [pageToDelete, setPageToDelete] = React.useState<PageItem | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Statutory Warning Modal State
  const [statutoryWarningOpen, setStatutoryWarningOpen] = React.useState(false);

  const loadPages = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getAdminPages(undefined, token || undefined);
      setPages(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : isUz
          ? 'Sahifalar roʻyxatini yuklab boʻlmadi'
          : 'Не удалось загрузить разделы сайта',
      );
    } finally {
      setIsLoading(false);
    }
  }, [isUz, token]);

  React.useEffect(() => {
    loadPages();
  }, [loadPages]);

  // Auto-generate slug from UZ title
  const handleTitleUzChange = (val: string) => {
    setNewTitleUz(val);
    if (!newSlug || newSlug.startsWith('sahifa-')) {
      const slugified = val
        .toLowerCase()
        .replace(/ʻ|ʼ|'/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setNewSlug(slugified || `sahifa-${Date.now().toString().slice(-4)}`);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitleUz.trim() || !newSlug.trim()) {
      setCreateError(
        isUz
          ? 'Iltimos, sahifa sarlavhasi va manzilini toʻldiring'
          : 'Пожалуйста, заполните название и адрес страницы',
      );
      return;
    }

    try {
      setIsCreating(true);
      setCreateError(null);

      const selectedTmpl = COLLEGE_PAGE_TEMPLATES.find((t) => t.id === selectedTemplateId);
      const initialRows = selectedTmpl ? JSON.parse(JSON.stringify(selectedTmpl.rows)) : [];

      const created = await apiClient.createPage(
        {
          title: newTitleUz.trim(),
          titleUz: newTitleUz.trim(),
          titleRu: newTitleRu.trim() || newTitleUz.trim(),
          slug: newSlug.trim().toLowerCase(),
          section: newSection,
          pageType: 'custom',
          isPublished: false,
          schemaVersion: 2,
          rows: initialRows,
          blocks: [],
        },
        token || undefined,
      );

      setIsCreateOpen(false);
      setSelectedTemplateId('blank');
      setNewTitleUz('');
      setNewTitleRu('');
      setNewSlug('');
      router.push(`/admin/pages/${created.id}`);
    } catch (err: unknown) {
      setCreateError(
        err instanceof Error ? err.message : isUz ? 'Xatolik yuz berdi' : 'Произошла ошибка',
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleDuplicate = async (p: PageItem) => {
    try {
      const duplicated = await apiClient.duplicatePage(p.id, token || undefined);
      setPages((prev) => [duplicated, ...prev]);
      setSuccess(
        isUz
          ? `«${p.titleUz || p.title}» sahifasidan nusxa olindi`
          : `Создана копия страницы «${p.titleRu || p.title}»`,
      );
      setTimeout(() => setSuccess(null), 3500);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : isUz
          ? 'Nusxa koʻchirishda xatolik yuz berdi'
          : 'Ошибка при дублировании',
      );
    }
  };

  const handleDeletePrompt = (p: PageItem) => {
    if (p.isRequired || p.isSystem) {
      setStatutoryWarningOpen(true);
      return;
    }
    setPageToDelete(p);
  };

  const confirmDelete = async () => {
    if (!pageToDelete) return;
    try {
      setIsDeleting(true);
      await apiClient.deletePage(pageToDelete.id, token || undefined);
      setPages((prev) => prev.filter((p) => p.id !== pageToDelete.id));
      setSuccess(
        isUz
          ? `«${pageToDelete.titleUz || pageToDelete.title}» sahifasi oʻchirildi`
          : `Страница «${pageToDelete.titleRu || pageToDelete.title}» удалена`,
      );
      setPageToDelete(null);
      setTimeout(() => setSuccess(null), 3500);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : isUz
          ? 'Sahifani oʻchirishda xatolik yuz berdi'
          : 'Ошибка при удалении',
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredPages = React.useMemo(() => {
    return pages.filter((p) => {
      const titleUz = p.titleUz || p.title || '';
      const titleRu = p.titleRu || p.title || '';
      const q = searchQuery.toLowerCase().trim();

      const matchesSearch =
        !q ||
        titleUz.toLowerCase().includes(q) ||
        titleRu.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q);

      const matchesSection =
        sectionFilter === 'all' ||
        (sectionFilter === 'statutory' && (p.section === 'info' || p.isSystem)) ||
        (sectionFilter === 'custom' && p.pageType === 'custom');

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'published' && p.isPublished) ||
        (statusFilter === 'draft' && !p.isPublished);

      return matchesSearch && matchesSection && matchesStatus;
    });
  }, [pages, searchQuery, sectionFilter, statusFilter]);

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-7xl space-y-6">
      {/* Заголовок страницы */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <Layers className="size-7 text-primary" />
            <span>
              {isUz
                ? 'Sayt sahifalari va ustav boʻlimlari'
                : 'Страницы сайта и разделы ст. 37'}
            </span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isUz
              ? '«Taʼlim toʻgʻrisida»gi Qonunning 37-moddasi boʻyicha ustav maʼlumotlari va mustaqil sahifalar konstruktori'
              : 'Управление 12 разделами открытости ст. 37 ЗРУ-637 и создание произвольных страниц портала'}
          </p>
        </div>

        {canEdit && (
          <Button
            type="button"
            data-tour="pages.create-btn"
            onClick={() => {
              setNewTitleUz('');
              setNewTitleRu('');
              setNewSlug(`sahifa-${Date.now().toString().slice(-4)}`);
              setCreateError(null);
              setIsCreateOpen(true);
            }}
            className="text-xs"
          >
            <Plus className="size-4 mr-1.5" />
            <span>{isUz ? 'Yangi sahifa yaratish' : 'Создать страницу'}</span>
          </Button>
        )}
      </div>

      {/* Оповещения */}
      {success && (
        <div className="p-3.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Панель фильтров и поиска */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md" data-tour="pages.search-input">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isUz
                ? 'Sarlavha yoki slug boʻyicha qidiruv...'
                : 'Поиск по названию или слагу...'
            }
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Фильтр по типам разделов */}
          <div className="flex items-center rounded-lg border border-border bg-card p-1 text-xs">
            <button
              type="button"
              onClick={() => setSectionFilter('all')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                sectionFilter === 'all'
                  ? 'bg-primary text-primary-foreground font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {isUz ? 'Barchasi' : 'Все'} ({pages.length})
            </button>
            <button
              type="button"
              onClick={() => setSectionFilter('statutory')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                sectionFilter === 'statutory'
                  ? 'bg-primary text-primary-foreground font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {isUz ? '37-modda (Ustav)' : 'Ст. 37 (Устав)'}
            </button>
            <button
              type="button"
              onClick={() => setSectionFilter('custom')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                sectionFilter === 'custom'
                  ? 'bg-primary text-primary-foreground font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {isUz ? 'Maxsus sahifalar' : 'Пользовательские'}
            </button>
          </div>

          {/* Фильтр по статусу публикации */}
          <div className="flex items-center rounded-lg border border-border bg-card p-1 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-muted text-foreground font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {isUz ? 'Holat: Hammasi' : 'Все статусы'}
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('published')}
              className={`px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                statusFilter === 'published'
                  ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {isUz ? 'Chop etilgan' : 'Опубликовано'}
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('draft')}
              className={`px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                statusFilter === 'draft'
                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {isUz ? 'Qoralama' : 'Черновики'}
            </button>
          </div>
        </div>
      </div>

      {/* Таблица реестра страниц */}
      <Card className="border-border shadow-xs overflow-hidden" data-tour="pages.table">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-muted/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th scope="col" className="p-4 font-semibold">
                  {isUz ? 'Sahifa nomi va manzili' : 'Название и адрес страницы'}
                </th>
                <th scope="col" className="p-4 font-semibold hidden md:table-cell">
                  {isUz ? 'Boʻlim / Toifa' : 'Раздел / Категория'}
                </th>
                <th scope="col" className="p-4 font-semibold">
                  {isUz ? 'Holati' : 'Статус'}
                </th>
                <th scope="col" className="p-4 font-semibold hidden lg:table-cell">
                  {isUz ? 'Tillar' : 'Языки'}
                </th>
                <th scope="col" className="p-4 font-semibold hidden sm:table-cell">
                  {isUz ? 'Yangilangan' : 'Изменено'}
                </th>
                <th scope="col" className="p-4 font-semibold text-right">
                  {isUz ? 'Amallar' : 'Действия'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    <Loader2 className="size-6 animate-spin mx-auto text-primary mb-2" />
                    <span>{isUz ? 'Sahifalar yuklanmoqda...' : 'Загрузка разделов...'}</span>
                  </td>
                </tr>
              ) : filteredPages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    {isUz ? 'Mos keladigan sahifalar topilmadi' : 'Разделы не найдены'}
                  </td>
                </tr>
              ) : (
                filteredPages.map((page, idx) => {
                  const titleUz = page.titleUz || page.title;
                  const titleRu = page.titleRu || page.title;
                  const isStatutory = page.section === 'info' || page.isSystem || page.isRequired;
                  const blockCount = page.blocks?.length || 0;

                  return (
                    <tr
                      key={page.id}
                      className="hover:bg-muted/20 transition-colors group"
                    >
                      {/* Название и ссылка */}
                      <td className="p-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground text-sm">
                              {isUz ? titleUz : titleRu}
                            </span>
                            {page.isRequired && (
                              <Badge
                                variant="outline"
                                className="text-[10px] px-1.5 py-0 border-primary/30 text-primary bg-primary/5"
                              >
                                {isUz ? 'Majburiy (37-modda)' : 'Ст. 37 ЗРУ-637'}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 font-mono">
                            <span>/{isStatutory ? `info/${page.slug}` : page.slug}</span>
                            {blockCount > 0 && (
                              <span className="font-sans text-[11px] text-muted-foreground">
                                • {blockCount} {isUz ? 'ta blok' : 'блоков'}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Раздел / Тип */}
                      <td className="p-4 hidden md:table-cell">
                        {isStatutory ? (
                          <Badge variant="outline" className="text-xs bg-muted/40 font-medium">
                            <Shield className="size-3 mr-1 text-primary" />
                            {isUz ? 'Rasmiy ustav' : 'Уставной раздел'}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs font-normal">
                            <Sparkles className="size-3 mr-1 text-amber-500" />
                            {isUz ? 'Maxsus sahifa' : 'Кастомная'}
                          </Badge>
                        )}
                      </td>

                      {/* Статус публикации */}
                      <td className="p-4">
                        {page.isPublished ? (
                          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
                            <CheckCircle2 className="size-3 mr-1" />
                            {isUz ? 'Chop etilgan' : 'Опубликовано'}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10 text-xs font-semibold">
                            {isUz ? 'Qoralama' : 'Черновик'}
                          </Badge>
                        )}
                      </td>

                      {/* Индикаторы языков */}
                      <td className="p-4 hidden lg:table-cell">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              page.titleUz ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground/40'
                            }`}
                            title="Oʻzbekcha talqin"
                          >
                            UZ
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              page.titleRu ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground/40'
                            }`}
                            title="Русская версия"
                          >
                            RU
                          </span>
                        </div>
                      </td>

                      {/* Дата обновления */}
                      <td className="p-4 hidden sm:table-cell text-xs text-muted-foreground">
                        {page.updatedAt
                          ? new Date(page.updatedAt).toLocaleDateString(isUz ? 'uz-UZ' : 'ru-RU')
                          : '—'}
                      </td>

                      {/* Кнопки действий */}
                      <td className="p-4 text-right">
                        <div
                          className="flex items-center justify-end gap-1"
                          data-tour={idx === 0 ? 'pages.row-actions' : undefined}
                        >
                          {/* Просмотр на сайте */}
                          <Link
                            href={isStatutory ? `/info/${page.slug}` : `/${page.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title={isUz ? 'Saytda koʻrish' : 'Открыть на сайте'}
                          >
                            <ExternalLink className="size-4" />
                          </Link>

                          {/* Редактирование в супер-редакторе */}
                          {canEdit && (
                            <Link
                              href={`/admin/pages/${page.id}`}
                              className="p-1.5 rounded-md hover:bg-primary/10 text-primary transition-colors"
                              title={isUz ? 'Konstruktorda tahrirlash' : 'Открыть в конструкторе'}
                            >
                              <Edit2 className="size-4" />
                            </Link>
                          )}

                          {/* Дублирование страницы */}
                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => handleDuplicate(page)}
                              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                              title={isUz ? 'Nusxa koʻchirish' : 'Дублировать страницу'}
                            >
                              <Copy className="size-4" />
                            </button>
                          )}

                          {/* Удаление */}
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => handleDeletePrompt(page)}
                              className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                              title={isUz ? 'Oʻchirish' : 'Удалить'}
                            >
                              <Trash2 className="size-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Модальное окно создания новой страницы */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="size-5 text-primary" />
                <span>{isUz ? 'Yangi sahifa yaratish' : 'Создать новую страницу'}</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                {isUz
                  ? 'Tayyor akademik andozani tanlang yoki yangi sahifani boʻsh xolstdan boshlang.'
                  : 'Выберите готовый шаблон для колледжа или начните с чистого листа.'}
              </DialogDescription>
            </DialogHeader>

            {createError && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            {/* Выбор готового шаблона */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-2">
                {isUz ? 'Sahifa shabloni (andoza)' : 'Шаблон страницы'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  id="template-card-blank"
                  onClick={() => {
                    setSelectedTemplateId('blank');
                  }}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                    selectedTemplateId === 'blank'
                      ? 'border-primary bg-primary/10 ring-2 ring-primary/40 shadow-xs'
                      : 'border-border bg-card hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs text-foreground">
                    <PlusCircle className="size-4 text-primary shrink-0" />
                    <span>{isUz ? 'Boʻsh sahifa' : 'Пустая страница'}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-tight">
                    {isUz ? 'Noldan boshlash: boʻsh xolst' : 'Чистый холст без блоков'}
                  </p>
                </button>

                {COLLEGE_PAGE_TEMPLATES.map((tmpl) => {
                  const isSelected = selectedTemplateId === tmpl.id;
                  return (
                    <button
                      key={tmpl.id}
                      type="button"
                      id={`template-card-${tmpl.id}`}
                      onClick={() => {
                        setSelectedTemplateId(tmpl.id);
                        setNewTitleUz(tmpl.titleUz.replace(/\s*\([^)]*\)/, ''));
                        setNewTitleRu(tmpl.titleRu.replace(/\s*\([^)]*\)/, ''));
                        setNewSlug(`${tmpl.id.replace(/_/g, '-')}-${Date.now().toString().slice(-4)}`);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                        isSelected
                          ? 'border-primary bg-primary/10 ring-2 ring-primary/40 shadow-xs'
                          : 'border-border bg-card hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <span className="font-bold text-xs text-foreground line-clamp-1">
                          {isUz ? tmpl.titleUz : tmpl.titleRu}
                        </span>
                        <Badge variant="outline" className="text-[9px] px-1 py-0 shrink-0 font-mono">
                          {tmpl.rows.length} {isUz ? 'qator' : 'секц.'}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-tight">
                        {isUz ? tmpl.descriptionUz : tmpl.descriptionRu}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3 pt-1 border-t border-border/60">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  {isUz ? 'Sarlavha (Oʻzbekcha)' : 'Название (Узбекский)'} *
                </label>
                <Input
                  value={newTitleUz}
                  onChange={(e) => handleTitleUzChange(e.target.value)}
                  placeholder="Masalan: Bitiruvchilar uyushmasi"
                  className="text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  {isUz ? 'Sarlavha (Ruscha)' : 'Название (Русский)'}
                </label>
                <Input
                  value={newTitleRu}
                  onChange={(e) => setNewTitleRu(e.target.value)}
                  placeholder="Например: Ассоциация выпускников"
                  className="text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  {isUz ? 'URL manzili (Slug)' : 'URL-слаг (Адрес)'} *
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground font-mono">/</span>
                  <Input
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value)}
                    placeholder="alumni"
                    className="text-xs font-mono"
                    required
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="text-xs"
              >
                {isUz ? 'Bekor qilish' : 'Отмена'}
              </Button>
              <Button type="submit" disabled={isCreating} className="text-xs">
                {isCreating && <Loader2 className="size-4 mr-1.5 animate-spin" />}
                <span>{isUz ? 'Yaratish va konstruktorni ochish' : 'Создать и открыть редактор'}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Модальное окно подтверждения удаления */}
      <Dialog open={Boolean(pageToDelete)} onOpenChange={() => setPageToDelete(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="size-5" />
              <span>{isUz ? 'Sahifani oʻchirishni tasdiqlang' : 'Подтверждение удаления'}</span>
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed pt-2">
              {isUz
                ? `Haqiqatan ham «${pageToDelete?.titleUz || pageToDelete?.title}» sahifasini oʻchirmoqchimisiz? Sahifa arxivga koʻchiriladi va ommaviy saytda koʻrinmaydi.`
                : `Вы действительно хотите удалить страницу «${pageToDelete?.titleRu || pageToDelete?.title}»? Она будет перемещена в корзину.`}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPageToDelete(null)}
              className="text-xs"
            >
              {isUz ? 'Bekor qilish' : 'Отмена'}
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeleting}
              onClick={confirmDelete}
              className="text-xs"
            >
              {isDeleting && <Loader2 className="size-4 mr-1.5 animate-spin" />}
              <span>{isUz ? 'Oʻchirish' : 'Удалить'}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Модальное предупреждение о защите обязательных разделов ст. 37 ЗРУ-637 */}
      <Dialog open={statutoryWarningOpen} onOpenChange={setStatutoryWarningOpen}>
        <DialogContent className="max-w-lg border-destructive/40">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Shield className="size-5" />
              <span>
                {isUz
                  ? 'Qonuniy himoyalangan ustav boʻlimi'
                  : 'Законодательно защищенный раздел'}
              </span>
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed pt-2 text-foreground space-y-2">
              <p>
                {isUz
                  ? 'Ushbu boʻlim Oʻzbekiston Respublikasining «Taʼlim toʻgʻrisida»gi Qonuni 37-moddasiga muvofiq davlat taʼlim muassasasi rasmiy veb-saytida joylashtirilishi majburiy hisoblanadi va butunlay oʻchirib yuborilishi mumkin emas.'
                  : 'Данный раздел является законодательно обязательным согласно статье 37 Закона Республики Узбекистан «Об образовании» (№ ЗРУ-637) и не подлежит удалению.'}
              </p>
              <p className="text-muted-foreground">
                {isUz
                  ? 'Siz ushbu boʻlimning matnini, hujjatlarini va bloklarini konstruktorda erkin tahrirlashingiz mumkin.'
                  : 'Вы можете свободно редактировать содержимое, прикреплять актуальные документы и обновлять блоки в конструкторе.'}
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button
              type="button"
              onClick={() => setStatutoryWarningOpen(false)}
              className="text-xs"
            >
              {isUz ? 'Tushundim' : 'Понятно'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
