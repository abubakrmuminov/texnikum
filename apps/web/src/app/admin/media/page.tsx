'use client';

import * as React from 'react';
import {
  Upload,
  Search,
  Copy,
  Check,
  Trash2,
  FileText,
  Image as ImageIcon,
  FolderOpen,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import { MediaFile, StorageBucket } from '@college/shared';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function AdminMediaPage() {
  const [files, setFiles] = React.useState<MediaFile[]>([]);
  const [selectedBucket, setSelectedBucket] = React.useState<StorageBucket>('news-media');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [isUploading, setIsUploading] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const loadMedia = React.useCallback(async (bucket: StorageBucket) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.getMediaFiles(bucket);
      setFiles(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить файлы');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadMedia(selectedBucket);
  }, [loadMedia, selectedBucket]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        if (!file) continue;

        // Validation for size
        if (file.size > 20 * 1024 * 1024) {
          throw new Error(`Файл «${file.name}» превышает лимит 20 МБ`);
        }

        const uploaded = await apiClient.uploadMedia(file, selectedBucket);
        setFiles((prev) => [uploaded, ...prev]);
      }
      setSuccess('Файлы успешно загружены в хранилище');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка при загрузке файлов');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCopyUrl = async (id: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      alert('URL: ' + url);
    }
  };

  const handleDelete = async (file: MediaFile) => {
    if (!window.confirm(`Удалить файл «${file.originalName}» из хранилища?`)) {
      return;
    }
    try {
      await apiClient.deleteMediaFile(file.id);
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
      setSuccess(`Файл «${file.originalName}» удален`);
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      alert('Не удалось удалить файл');
    }
  };

  const filteredFiles = React.useMemo(() => {
    return files.filter((f) =>
      f.originalName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [files, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FolderOpen className="h-6 w-6 text-primary" />
            Медиатека и документы
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Управление файловыми хранилищами Supabase Storage: изображения для публикаций и скан-копии документов
          </p>
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileUpload}
            accept={
              selectedBucket === 'news-media'
                ? 'image/jpeg,image/png,image/webp,image/svg+xml'
                : 'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*'
            }
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-xs"
          >
            <Upload className="h-4 w-4" />
            {isUploading ? 'Загрузка...' : 'Загрузить файлы'}
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

      {/* Storage Bucket Tabs */}
      <div className="flex items-center gap-2 border-b pb-3">
        <button
          onClick={() => setSelectedBucket('news-media')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
            selectedBucket === 'news-media'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <ImageIcon className="h-4 w-4" />
          Медиа новостей (news-media)
        </button>

        <button
          onClick={() => setSelectedBucket('official-docs')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
            selectedBucket === 'official-docs'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <FileText className="h-4 w-4" />
          Официальные документы (official-docs)
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Поиск по имени файла..."
          className="pl-9 h-10"
        />
      </div>

      {/* Media Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-sm text-muted-foreground rounded-xl border bg-card">
          Загрузка файлов...
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="p-12 text-center rounded-xl border bg-card space-y-3">
          <p className="text-sm text-muted-foreground">В этом бакете пока нет файлов</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            Загрузить первый файл
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredFiles.map((file) => {
            const isImage = file.mimeType.startsWith('image/');

            return (
              <div
                key={file.id}
                className="group rounded-xl border bg-card overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Preview Thumbnail */}
                <div className="relative aspect-video bg-muted/40 flex items-center justify-center overflow-hidden border-b">
                  {isImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={file.publicUrl}
                      alt={file.originalName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-muted-foreground">
                      <FileText className="h-10 w-10 text-primary/70" />
                      <span className="text-[11px] font-mono uppercase">
                        {file.originalName.split('.').pop() || 'DOC'}
                      </span>
                    </div>
                  )}

                  <Badge
                    variant="outline"
                    className="absolute top-2 left-2 bg-background/80 backdrop-blur-xs text-[10px]"
                  >
                    {formatBytes(file.fileSizeBytes)}
                  </Badge>
                </div>

                {/* Details */}
                <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h3
                      className="font-medium text-xs text-foreground truncate"
                      title={file.originalName}
                    >
                      {file.originalName}
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {new Date(file.createdAt).toLocaleDateString('ru-RU')}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-1 pt-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyUrl(file.id, file.publicUrl)}
                      className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 flex-1 justify-start"
                      title="Скопировать публичный URL"
                    >
                      {copiedId === file.id ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Скопировано</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Копировать URL</span>
                        </>
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(file)}
                      className="h-8 w-8 p-0 text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                      title="Удалить файл"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
