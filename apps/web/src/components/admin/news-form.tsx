'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Sparkles,
  Save,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { WysiwygEditor } from './wysiwyg-editor';
import { NewsItem, NewsCategory, NewsStatus } from '@college/shared';
import { apiClient } from '@/lib/api-client';
import { ImageUploadField } from '@/components/admin/image-upload-field';

interface NewsFormProps {
  initialData?: NewsItem;
  categories: NewsCategory[];
  isEditing?: boolean;
}

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
    .slice(0, 80);
}

export function NewsForm({
  initialData,
  categories,
  isEditing = false,
}: NewsFormProps) {
  const router = useRouter();

  const [title, setTitle] = React.useState(initialData?.title || '');
  const [slug, setSlug] = React.useState(initialData?.slug || '');
  const [autoSlug, setAutoSlug] = React.useState(!isEditing);
  const [categoryId, setCategoryId] = React.useState<number>(
    initialData?.categoryId || (categories[0]?.id ?? 1)
  );
  const [leadText, setLeadText] = React.useState(initialData?.leadText || '');
  const [contentHtml, setContentHtml] = React.useState(
    initialData?.contentHtml || ''
  );
  const [coverImageUrl, setCoverImageUrl] = React.useState(
    initialData?.coverImageUrl || ''
  );
  const [status, setStatus] = React.useState<NewsStatus>(
    initialData?.status || NewsStatus.PUBLISHED
  );
  const [isFeatured, setIsFeatured] = React.useState(
    initialData?.isFeatured || false
  );
  const [publishedAtDate, setPublishedAtDate] = React.useState(
    initialData?.publishedAt
      ? initialData.publishedAt.substring(0, 16)
      : new Date().toISOString().substring(0, 16)
  );

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  // Handle title changes & auto slug
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (autoSlug) {
      setSlug(slugify(val));
    }
  };

  const handleSave = async (targetStatus?: NewsStatus) => {
    setError(null);
    setSuccess(null);

    if (!title.trim()) {
      setError('Укажите заголовок новости');
      return;
    }
    if (!slug.trim()) {
      setError('Укажите slug для URL');
      return;
    }
    if (!leadText.trim()) {
      setError('Укажите краткое описание (лид)');
      return;
    }
    if (!contentHtml.trim()) {
      setError('Текст статьи не может быть пустым');
      return;
    }

    const currentStatus = targetStatus || status;

    // Word count calculation
    const wordCount = contentHtml.replace(/<[^>]*>/g, '').trim().split(/\s+/).length;
    const readingTimeMin = Math.max(1, Math.ceil(wordCount / 180));

    setIsSubmitting(true);
    try {
      const payload: Partial<NewsItem> = {
        title: title.trim(),
        slug: slug.trim(),
        categoryId: Number(categoryId),
        leadText: leadText.trim(),
        contentHtml,
        coverImageUrl: coverImageUrl.trim() || null,
        readingTimeMin,
        status: currentStatus,
        isFeatured,
        publishedAt:
          currentStatus === NewsStatus.PUBLISHED
            ? new Date(publishedAtDate).toISOString()
            : null,
      };

      if (isEditing && initialData?.id) {
        await apiClient.updateNews(initialData.id, payload);
        setSuccess('Материал успешно обновлен!');
      } else {
        await apiClient.createNews(payload);
        setSuccess('Материал успешно создан!');
      }

      setTimeout(() => {
        router.push('/admin/news');
        router.refresh();
      }, 1000);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Произошла непредвиденная ошибка при сохранении'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin/news')}
            className="h-9 px-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Назад к списку
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {isEditing ? 'Редактирование публикации' : 'Новая публикация'}
            </h1>
            <p className="text-xs text-muted-foreground">
              {isEditing
                ? `ID: ${initialData?.id}`
                : 'Заполните обязательные поля и выберите статус публикации'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isSubmitting}
            onClick={() => handleSave(NewsStatus.DRAFT)}
          >
            Сохранить как черновик
          </Button>
          <Button
            type="button"
            variant="default"
            size="sm"
            disabled={isSubmitting}
            onClick={() => handleSave(NewsStatus.PUBLISHED)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Save className="h-4 w-4 mr-1.5" />
            {isEditing ? 'Сохранить изменения' : 'Опубликовать'}
          </Button>
        </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor Column (2 cols) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">
              Заголовок публикации <span className="text-destructive">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Например: Студенты колледжа победили в региональном чемпионате..."
              className="text-base font-medium h-11"
              maxLength={180}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Рекомендуется от 10 до 120 символов</span>
              <span>{title.length}/180</span>
            </div>
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-foreground">
                URL-идентификатор (slug) <span className="text-destructive">*</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setAutoSlug(!autoSlug);
                  if (!autoSlug) setSlug(slugify(title));
                }}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <Sparkles className="h-3 w-3" />
                {autoSlug ? 'Ручной ввод' : 'Автогенерация из заголовка'}
              </button>
            </div>
            <div className="flex items-center rounded-md border bg-muted/30 px-3">
              <span className="text-xs text-muted-foreground mr-1">/news/</span>
              <input
                value={slug}
                onChange={(e) => {
                  setAutoSlug(false);
                  setSlug(slugify(e.target.value));
                }}
                placeholder="slug-novosti"
                className="w-full bg-transparent py-2 text-sm focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Lead Text */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Краткое содержание (лид) <span className="text-destructive">*</span>
            </label>
            <Textarea
              value={leadText}
              onChange={(e) => setLeadText(e.target.value)}
              placeholder="1–2 предложения с главной сутью новости для анонса и поисковых систем..."
              rows={3}
              maxLength={300}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Отображается на карточке в ленте и в мета-тегах</span>
              <span>{leadText.length}/300</span>
            </div>
          </div>

          {/* WYSIWYG Body */}
          <WysiwygEditor
            value={contentHtml}
            onChange={setContentHtml}
            minHeight="400px"
          />
        </div>

        {/* Sidebar Settings (1 col) */}
        <div className="space-y-5">
          {/* Publication Workflow Card */}
          <div className="rounded-xl border bg-card p-5 space-y-4 shadow-2xs">
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2 border-b pb-2">
              <Calendar className="h-4 w-4 text-primary" />
              Статус и публикация
            </h3>

            {/* Status Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Статус материала
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as NewsStatus)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value={NewsStatus.PUBLISHED}>Опубликовано (на сайте)</option>
                <option value={NewsStatus.DRAFT}>Черновик (скрыто)</option>
                <option value={NewsStatus.ARCHIVED}>Архив</option>
              </select>
            </div>

            {/* Publication Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Дата и время публикации
              </label>
              <Input
                type="datetime-local"
                value={publishedAtDate}
                onChange={(e) => setPublishedAtDate(e.target.value)}
                className="text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                Можно установить будущую дату для отложенной публикации
              </p>
            </div>

            {/* Featured toggle */}
            <div className="pt-2 border-t">
              <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                />
                <span>Закрепить на главной (Главная новость)</span>
              </label>
            </div>
          </div>

          {/* Category Card */}
          <div className="rounded-xl border bg-card p-5 space-y-3 shadow-2xs">
            <h3 className="font-semibold text-sm text-foreground border-b pb-2">
              Рубрика и классификация
            </h3>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Рубрика
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cover Image Card */}
          <div className="rounded-xl border bg-card p-5 space-y-3 shadow-2xs">
            <ImageUploadField
              value={coverImageUrl}
              onChange={setCoverImageUrl}
              label="Maqola muqovasi / Обложка материала"
              description="Sayt bosh sahifasi va yangiliklar lentasida koʻrinadigan asosiy rasm"
              bucket="news-media"
              aspectRatio="video"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
