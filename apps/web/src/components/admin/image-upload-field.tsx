'use client';

import * as React from 'react';
import {
  UploadCloud,
  X,
  RefreshCw,
  Link as LinkIcon,
  AlertCircle,
  FileImage,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api-client';
import { StorageBucket } from '@college/shared';
import { useAppLocale } from '@/components/i18n/locale-provider';

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  description?: string;
  bucket?: StorageBucket;
  aspectRatio?: 'video' | 'square' | 'portrait';
  disabled?: boolean;
}

export function ImageUploadField({
  value,
  onChange,
  label,
  description,
  bucket = 'news-media',
  aspectRatio = 'video',
  disabled = false,
}: ImageUploadFieldProps): JSX.Element {
  const { locale } = useAppLocale();
  const isUz = locale === 'uz';

  const [isDragging, setIsDragging] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = React.useState(false);
  const [urlInputValue, setUrlInputValue] = React.useState(value);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Sync external value changes
  React.useEffect(() => {
    setUrlInputValue(value);
  }, [value]);

  const t = React.useMemo(() => {
    return isUz
      ? {
          defaultLabel: 'Rasmni yuklash',
          defaultDesc: 'PNG, JPG, WEBP yoki SVG formatlar (10 MB gacha)',
          dragDrop: 'Rasmni tanlang yoki shu yerga tashlang',
          browse: 'Kompyuterdan tanlash',
          uploading: 'Rasm yuklanmoqda...',
          change: 'Almashtirish',
          remove: 'Oʻchirish',
          urlToggle: 'Havola (URL) orqali kiritish',
          fileToggle: 'Fayl yuklashga qaytish',
          urlPlaceholder: 'https://images.unsplash.com/... yoki rasm manzili',
          applyUrl: 'Qoʻllash',
          sizeLimitError: 'Fayl hajmi 10 MB dan oshmasligi kerak',
          typeError: 'Faqat rasm fayllari (JPG, PNG, WEBP, SVG) qabul qilinadi',
          uploadFailed: 'Rasmni yuklashda xatolik yuz berdi',
        }
      : {
          defaultLabel: 'Загрузка изображения',
          defaultDesc: 'Поддерживаются PNG, JPG, WEBP, SVG (до 10 МБ)',
          dragDrop: 'Выберите файл или перетащите его сюда',
          browse: 'Выбрать с устройства',
          uploading: 'Изображение загружается...',
          change: 'Заменить фото',
          remove: 'Удалить',
          urlToggle: 'Указать прямую ссылку (URL)',
          fileToggle: 'Вернуться к загрузке файла',
          urlPlaceholder: 'https://images.unsplash.com/... или URL картинки',
          applyUrl: 'Применить',
          sizeLimitError: 'Размер файла не должен превышать 10 МБ',
          typeError: 'Разрешены только графические файлы (JPG, PNG, WEBP, SVG)',
          uploadFailed: 'Не удалось загрузить изображение',
        };
  }, [isUz]);

  const processFile = async (file: File) => {
    if (!file) return;

    setUploadError(null);

    // Validate mime type
    if (!file.type.startsWith('image/')) {
      setUploadError(t.typeError);
      return;
    }

    // Validate size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError(t.sizeLimitError);
      return;
    }

    setIsUploading(true);

    try {
      // 1. Read preview immediately for zero-lag response
      const previewUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      // 2. Upload via API client
      const uploaded = await apiClient.uploadMedia(file, bucket);
      const finalUrl = uploaded.publicUrl || previewUrl;
      onChange(finalUrl);
    } catch {
      // If server upload fails, fallback to local data URI
      try {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            onChange(reader.result);
          }
        };
        reader.readAsDataURL(file);
      } catch {
        setUploadError(t.uploadFailed);
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || isUploading) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleApplyUrl = () => {
    if (urlInputValue.trim()) {
      onChange(urlInputValue.trim());
    }
  };

  const handleRemove = () => {
    onChange('');
    setUrlInputValue('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const aspectClass =
    aspectRatio === 'square'
      ? 'aspect-square max-w-[200px]'
      : aspectRatio === 'portrait'
      ? 'aspect-[3/4] max-w-[240px]'
      : 'aspect-video w-full';

  return (
    <div className="space-y-2">
      {/* Label and Mode Switcher */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <FileImage className="size-3.5 text-primary" aria-hidden="true" />
          <span>{label || t.defaultLabel}</span>
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
        >
          <LinkIcon className="size-3" aria-hidden="true" />
          <span>{showUrlInput ? t.fileToggle : t.urlToggle}</span>
        </button>
      </div>

      {description && (
        <p className="text-[11px] text-muted-foreground">{description}</p>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
        className="sr-only"
        aria-label={label || t.defaultLabel}
      />

      {/* Mode 1: URL input mode */}
      {showUrlInput ? (
        <div className="flex gap-2">
          <Input
            value={urlInputValue}
            onChange={(e) => setUrlInputValue(e.target.value)}
            placeholder={t.urlPlaceholder}
            className="text-xs h-9"
            disabled={disabled || isUploading}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleApplyUrl}
            className="text-xs h-9 px-3 shrink-0"
          >
            {t.applyUrl}
          </Button>
        </div>
      ) : null}

      {/* Mode 2: Existing Image Preview */}
      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-border bg-card shadow-xs">
          <div className={`${aspectClass} mx-auto relative bg-muted/20 flex items-center justify-center overflow-hidden`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover transition-transform group-hover:scale-[1.01]"
              onError={(e) => {
                // In case of broken external URL, fallback gracefully
                (e.currentTarget as HTMLImageElement).src = '/images/specialties/090207.webp';
              }}
            />

            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isUploading}
                className="text-xs h-8 gap-1.5 shadow"
              >
                <RefreshCw className="size-3.5" aria-hidden="true" />
                <span>{t.change}</span>
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemove}
                disabled={disabled || isUploading}
                className="text-xs h-8 gap-1.5 shadow"
              >
                <X className="size-3.5" aria-hidden="true" />
                <span>{t.remove}</span>
              </Button>
            </div>
          </div>

          <div className="p-2.5 bg-card border-t border-border flex items-center justify-between text-xs">
            <span className="text-muted-foreground truncate max-w-[200px] text-[11px]">
              {value.startsWith('data:') ? 'Lokal yuklangan rasm / Base64' : value.split('/').pop()}
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="h-7 text-xs px-2 gap-1 text-primary"
              >
                <RefreshCw className="size-3" />
                {t.change}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="h-7 text-xs px-2 gap-1 text-destructive hover:text-destructive"
              >
                <X className="size-3" />
                {t.remove}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Mode 3: Drag & Drop Zone */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
          className={`relative rounded-xl border-2 border-dashed p-6 transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-2.5 ${
            isDragging
              ? 'border-primary bg-primary/5 scale-[0.99]'
              : 'border-border hover:border-primary/50 hover:bg-muted/40 bg-card/50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="size-11 rounded-full bg-primary/10 text-primary flex items-center justify-center shadow-xs">
            {isUploading ? (
              <RefreshCw className="size-5 animate-spin" aria-hidden="true" />
            ) : (
              <UploadCloud className="size-5" aria-hidden="true" />
            )}
          </div>

          <div>
            <p className="text-xs font-semibold text-foreground">
              {isUploading ? t.uploading : t.dragDrop}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {t.defaultDesc}
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || isUploading}
            className="text-xs h-7 px-3 pointer-events-none mt-1"
          >
            {t.browse}
          </Button>
        </div>
      )}

      {/* Error alert */}
      {uploadError && (
        <div className="flex items-center gap-1.5 text-xs text-destructive p-2 rounded-lg bg-destructive/10">
          <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
          <span>{uploadError}</span>
        </div>
      )}
    </div>
  );
}
