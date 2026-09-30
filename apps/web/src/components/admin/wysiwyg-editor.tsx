'use client';

import * as React from 'react';
import {
  Heading2,
  Heading3,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Eye,
  Edit3,
  FileText,
  Clock,
  Type,
  UploadCloud,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Modal } from '@/components/ui/dialog';
import { apiClient } from '@/lib/api-client';
import { useAppLocale } from '@/components/i18n/locale-provider';

interface WysiwygEditorProps {
  value: string;
  onChange: (val: string) => void;
  minHeight?: string;
  placeholder?: string;
  label?: string;
  error?: string;
}

export function WysiwygEditor({
  value,
  onChange,
  minHeight = '360px',
  placeholder,
  label,
  error,
}: WysiwygEditorProps) {
  const { locale } = useAppLocale();
  const isUz = locale === 'uz';

  const defaultPlaceholder = isUz
    ? 'Yangilik, buyruq yoki maqola matnini kiriting...'
    : 'Введите текст новости, приказа или статьи...';
  const defaultLabel = isUz ? 'Material mazmuni' : 'Содержание материала';

  const [activeTab, setActiveTab] = React.useState<'edit' | 'preview'>('edit');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Image Upload Dialog state
  const [isImageModalOpen, setIsImageModalOpen] = React.useState(false);
  const [imageModalTab, setImageModalTab] = React.useState<'upload' | 'url'>('upload');
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [filePreview, setFilePreview] = React.useState<string | null>(null);
  const [imageCaption, setImageCaption] = React.useState('');
  const [imageUrl, setImageUrl] = React.useState('');
  const [isUploadingImage, setIsUploadingImage] = React.useState(false);
  const [imageUploadError, setImageUploadError] = React.useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Calculate statistics
  const wordCount = React.useMemo(() => {
    if (!value) return 0;
    const clean = value.replace(/<[^>]*>/g, '').trim();
    return clean ? clean.split(/\s+/).length : 0;
  }, [value]);

  const readingTime = Math.max(1, Math.ceil(wordCount / 180));

  // Helper to insert formatting around selection or at cursor
  const insertFormat = (prefix: string, suffix: string = '', defaultText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;
    const selected = currentText.substring(start, end) || defaultText;

    const replacement = `${prefix}${selected}${suffix}`;
    const nextValue =
      currentText.substring(0, start) + replacement + currentText.substring(end);

    onChange(nextValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selected.length
      );
    }, 0);
  };

  const handleFileSelect = (file: File) => {
    setImageUploadError(null);
    if (!file.type.startsWith('image/')) {
      setImageUploadError(
        isUz
          ? 'Faqat rasm fayllari (JPG, PNG, WEBP, SVG) qabul qilinadi'
          : 'Разрешены только графические файлы (JPG, PNG, WEBP, SVG)'
      );
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setImageUploadError(
        isUz
          ? 'Fayl hajmi 10 MB dan oshmasligi kerak'
          : 'Размер файла не должен превышать 10 МБ'
      );
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    if (!imageCaption) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setImageCaption(nameWithoutExt);
    }
  };

  const handleInsertImageToContent = async () => {
    setImageUploadError(null);
    let finalUrl = '';

    if (imageModalTab === 'upload') {
      if (!selectedFile) {
        setImageUploadError(
          isUz ? 'Iltimos, avval rasm faylini tanlang' : 'Пожалуйста, выберите файл изображения'
        );
        return;
      }

      setIsUploadingImage(true);
      try {
        const uploaded = await apiClient.uploadMedia(selectedFile, 'news-media');
        finalUrl = uploaded.publicUrl || filePreview || '';
      } catch {
        if (filePreview) {
          finalUrl = filePreview;
        } else {
          setImageUploadError(
            isUz ? 'Rasmni yuklashda xatolik yuz berdi' : 'Ошибка при загрузке изображения'
          );
          setIsUploadingImage(false);
          return;
        }
      } finally {
        setIsUploadingImage(false);
      }
    } else {
      if (!imageUrl.trim()) {
        setImageUploadError(
          isUz ? 'Iltimos, rasm havolasini kiriting' : 'Пожалуйста, введите URL изображения'
        );
        return;
      }
      finalUrl = imageUrl.trim();
    }

    if (finalUrl) {
      const caption = imageCaption.trim() || (isUz ? 'Rasm' : 'Изображение');
      insertFormat(`\n\n![${caption}](`, `)\n\n`, finalUrl);
      setIsImageModalOpen(false);
      setSelectedFile(null);
      setFilePreview(null);
      setImageCaption('');
      setImageUrl('');
    }
  };

  const handleTextareaDrop = async (e: React.DragEvent<HTMLElement>) => {
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file && file.type.startsWith('image/')) {
        e.preventDefault();
        try {
          const uploaded = await apiClient.uploadMedia(file, 'news-media');
          const finalUrl = uploaded.publicUrl;
          if (finalUrl) {
            const caption = file.name.replace(/\.[^/.]+$/, '');
            insertFormat(`\n\n![${caption}](`, `)\n\n`, finalUrl);
          }
        } catch {
          // ignore or fallback
        }
      }
    }
  };

  const handleTextareaPaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item && item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            try {
              const uploaded = await apiClient.uploadMedia(file, 'news-media');
              const finalUrl = uploaded.publicUrl;
              if (finalUrl) {
                insertFormat(`\n\n![${isUz ? 'Rasm' : 'Изображение'}](`, `)\n\n`, finalUrl);
              }
            } catch {
              // ignore
            }
            break;
          }
        }
      }
    }
  };

  const handleInsertH2 = () =>
    insertFormat('\n## ', '\n', isUz ? 'H2 kichik sarlavhasi' : 'Подзаголовок H2');
  const handleInsertH3 = () =>
    insertFormat('\n### ', '\n', isUz ? 'H3 kichik sarlavhasi' : 'Подзаголовок H3');
  const handleInsertBold = () =>
    insertFormat('**', '**', isUz ? 'qalin matn' : 'жирный текст');
  const handleInsertItalic = () =>
    insertFormat('*', '*', isUz ? 'kursiv matn' : 'курсив');
  const handleInsertQuote = () =>
    insertFormat(
      '\n> ',
      '\n',
      isUz ? 'Rahbariyat iqtibosi yoki rasmiy izoh' : 'Цитата или комментарий руководства'
    );
  const handleInsertUl = () =>
    insertFormat('\n- ', '\n', isUz ? 'Roʻyxat bandi' : 'Элемент списка');
  const handleInsertOl = () =>
    insertFormat('\n1. ', '\n', isUz ? 'Birinchi band' : 'Первый пункт');
  const handleInsertLink = () =>
    insertFormat('[', '](https://example.com)', isUz ? 'Havola matni' : 'Текст ссылки');
  const handleInsertImage = () => {
    setImageUploadError(null);
    setIsImageModalOpen(true);
  };
  const handleInsertTable = () => {
    const tableTemplate = isUz
      ? `
| Koʻrsatkich nomi | Qiymat | Izoh |
| ----------------- | ------ | ---- |
| Nazorat reja oʻrinlari | 150 ta | Davlat granti |
| Oʻtish balli | 4.6 | Kunduzgi |
`
      : `
| Наименование показателя | Значение | Примечание |
| ----------------------- | -------- | ---------- |
| Контрольные цифры       | 150 мест | Бюджет     |
| Проходной балл аттестата| 4.6      | Очная форма|
`;
    insertFormat(tableTemplate, '');
  };
  const handleInsertDirective = () => {
    const docTemplate = isUz
      ? `\n> 📄 **124/OD-sonli buyruq, 15.09.2026**\n> «Oʻquv jarayonini tashkil etish va sessiyalar jadvalini tasdiqlash toʻgʻrisida»\n`
      : `\n> 📄 **Приказ №124/ОД от 15.09.2026**\n> «Об организации учебного процесса и утверждении графиков сессий»\n`;
    insertFormat(docTemplate, '');
  };

  // Convert basic markdown tags to styled preview HTML safely without heavy external deps
  const renderPreviewHtml = (text: string) => {
    if (!text) {
      return isUz
        ? '<p class="text-muted-foreground italic">Maqola matni hali kiritilmagan.</p>'
        : '<p class="text-muted-foreground italic">Текст статьи пока пуст.</p>';
    }

    // Simple markdown to HTML renderer
    let html = text
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-4 mb-2 text-foreground">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3 text-foreground pb-1 border-b">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-6 mb-4 text-foreground">$1</h1>')
      // Blockquotes
      .replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-primary pl-4 py-1.5 my-3 italic text-muted-foreground bg-muted/30 rounded-r">$1</blockquote>')
      // Bold & Italic
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline font-medium hover:text-primary/80">$1</a>')
      // Images
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<figure class="my-4"><img src="$2" alt="$1" class="rounded-lg max-h-96 w-auto object-cover border" /><figcaption class="text-xs text-muted-foreground mt-1">$1</figcaption></figure>')
      // Unordered lists
      .replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc text-foreground/90">$1</li>')
      // Line breaks
      .replace(/\n\n/g, '<div class="h-3"></div>');

    return html;
  };

  return (
    <div className="space-y-1.5 w-full">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground">
          {label || defaultLabel}
        </label>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Type className="h-3.5 w-3.5" />
            {wordCount} {isUz ? 'soʻz' : 'слов'}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            ~{readingTime} {isUz ? 'daqiqalik mutolaa' : 'мин чтения'}
          </span>
        </div>
      </div>

      <div className="rounded-lg border bg-card shadow-xs overflow-hidden">
        {/* Editor Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-1 p-2 border-b bg-muted/40">
          <div className="flex flex-wrap items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleInsertH2}
              className="h-8 px-2 text-xs font-bold"
              title={isUz ? 'H2 kichik sarlavhasi' : 'Заголовок H2'}
            >
              <Heading2 className="h-4 w-4 mr-0.5" />
              H2
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleInsertH3}
              className="h-8 px-2 text-xs font-bold"
              title={isUz ? 'H3 kichik sarlavhasi' : 'Заголовок H3'}
            >
              <Heading3 className="h-4 w-4 mr-0.5" />
              H3
            </Button>
            <div className="h-4 w-px bg-border mx-1" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleInsertBold}
              className="h-8 w-8 p-0"
              title={isUz ? 'Qalin' : 'Полужирный'}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleInsertItalic}
              className="h-8 w-8 p-0"
              title={isUz ? 'Kursiv' : 'Курсив'}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <div className="h-4 w-px bg-border mx-1" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleInsertUl}
              className="h-8 w-8 p-0"
              title={isUz ? 'Belgilangan roʻyxat' : 'Маркированный список'}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleInsertOl}
              className="h-8 w-8 p-0"
              title={isUz ? 'Raqamli roʻyxat' : 'Нумерованный список'}
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleInsertQuote}
              className="h-8 w-8 p-0"
              title={isUz ? 'Iqtibos' : 'Цитата'}
            >
              <Quote className="h-4 w-4" />
            </Button>
            <div className="h-4 w-px bg-border mx-1" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleInsertLink}
              className="h-8 w-8 p-0"
              title={isUz ? 'Havola' : 'Ссылка'}
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleInsertImage}
              className="h-8 w-8 p-0"
              title={isUz ? 'Rasm' : 'Изображение'}
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleInsertTable}
              className="h-8 w-8 p-0"
              title={isUz ? 'Jadval' : 'Таблица'}
            >
              <TableIcon className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleInsertDirective}
              className="h-8 px-2 text-xs text-primary"
              title={isUz ? 'Rasmiy buyruq kiritish' : 'Вставить официальный приказ'}
            >
              <FileText className="h-3.5 w-3.5 mr-1" />
              {isUz ? 'Buyruq' : 'Приказ'}
            </Button>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex items-center gap-1 bg-background/80 p-0.5 rounded-md border">
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded ${
                activeTab === 'edit'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Edit3 className="h-3.5 w-3.5" />
              {isUz ? 'Muharrir' : 'Редактор'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded ${
                activeTab === 'preview'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              {isUz ? 'Koʻrib chiqish' : 'Предпросмотр'}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-3">
          {activeTab === 'edit' ? (
            <div
              className={`relative transition-colors rounded-md ${
                isDraggingOver ? 'ring-2 ring-primary ring-offset-2 bg-primary/5' : ''
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingOver(true);
              }}
              onDragLeave={() => setIsDraggingOver(false)}
              onDrop={(e) => {
                setIsDraggingOver(false);
                handleTextareaDrop(e);
              }}
            >
              <Textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onPaste={handleTextareaPaste}
                placeholder={placeholder || defaultPlaceholder}
                className="w-full border-0 focus-visible:ring-0 focus-visible:ring-offset-0 font-mono text-sm leading-relaxed p-0 resize-y"
                style={{ minHeight }}
              />
              {isDraggingOver && (
                <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-md flex items-center justify-center pointer-events-none">
                  <div className="bg-background/90 px-4 py-2 rounded-lg shadow-sm border border-primary/30 flex items-center gap-2 text-xs font-semibold text-primary">
                    <UploadCloud className="size-4 animate-bounce" />
                    <span>
                      {isUz
                        ? 'Rasmni maqolaga joylash uchun shu yerga tashlang'
                        : 'Отпустите файл для вставки в статью'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div
              className="prose dark:prose-invert max-w-none text-sm leading-relaxed p-2"
              style={{ minHeight }}
              dangerouslySetInnerHTML={{ __html: renderPreviewHtml(value) }}
            />
          )}
        </div>
      </div>

      {error && <p className="text-xs text-destructive mt-1 font-medium">{error}</p>}

      {/* Modal диалог загрузки фото внутрь статьи */}
      <Modal
        isOpen={isImageModalOpen}
        onClose={() => {
          setIsImageModalOpen(false);
          setSelectedFile(null);
          setFilePreview(null);
          setImageUploadError(null);
        }}
        title={isUz ? 'Maqolaga rasm joylashtirish' : 'Вставка изображения в статью'}
        description={
          isUz
            ? 'Kompyuteringizdan rasm faylini yuklang yoki toʻgʻridan-toʻgʻri havolasini kiriting'
            : 'Загрузите файл изображения с устройства или укажите прямую ссылку'
        }
        maxWidth="md"
      >
        <div className="space-y-4 pt-2">
          {/* Переключатель способа вставки */}
          <div className="flex rounded-lg bg-muted p-1 gap-1">
            <button
              type="button"
              onClick={() => {
                setImageModalTab('upload');
                setImageUploadError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                imageModalTab === 'upload'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {isUz ? 'Faylni yuklash (Kompyuterdan)' : 'Загрузить файл (С устройства)'}
            </button>
            <button
              type="button"
              onClick={() => {
                setImageModalTab('url');
                setImageUploadError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                imageModalTab === 'url'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {isUz ? 'Havola orqali (URL)' : 'По прямой ссылке (URL)'}
            </button>
          </div>

          {/* Ошибка */}
          {imageUploadError && (
            <div className="flex items-center gap-2 p-2.5 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              <AlertCircle className="size-4 shrink-0" />
              <span>{imageUploadError}</span>
            </div>
          )}

          {imageModalTab === 'upload' ? (
            <div className="space-y-3">
              {/* Поле выбора файла */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
                className="hidden"
              />

              {filePreview ? (
                <div className="relative rounded-xl border border-border overflow-hidden bg-muted/40 p-2 flex flex-col items-center">
                  <div className="relative w-full max-h-56 overflow-hidden rounded-lg flex items-center justify-center bg-black/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="max-h-52 w-auto object-contain rounded"
                    />
                  </div>
                  <div className="w-full flex items-center justify-between pt-2 px-1 text-xs text-muted-foreground">
                    <span className="truncate max-w-[200px] font-mono text-[11px]">
                      {selectedFile?.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setFilePreview(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="text-destructive hover:underline text-xs"
                    >
                      {isUz ? 'Boshqa rasm tanlash' : 'Выбрать другое'}
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl border-2 border-dashed border-border hover:border-primary/60 bg-muted/20 hover:bg-muted/40 p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors text-center"
                >
                  <div className="size-11 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <UploadCloud className="size-5" />
                  </div>
                  <p className="text-xs font-semibold text-foreground">
                    {isUz
                      ? 'Rasm faylini tanlash uchun bosing'
                      : 'Нажмите для выбора файла с устройства'}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    PNG, JPG, WEBP, SVG (10 MB gacha)
                  </p>
                </div>
              )}

              {/* Подпись к картинке */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  {isUz ? 'Rasm osti izohi / tavsifi' : 'Подпись к изображению / описание'}
                </label>
                <Input
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  placeholder={
                    isUz
                      ? 'Masalan: «WorldSkills» chempionati laboratoriyasi'
                      : 'Например: Лаборатория чемпионата WorldSkills'
                  }
                  className="h-9 text-xs"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Ввод URL */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  {isUz ? 'Rasm havolasi (URL)' : 'Прямой URL адрес картинки'}
                </label>
                <Input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... yoki rasm manzili"
                  className="h-9 text-xs font-mono"
                />
              </div>

              {/* Подпись */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  {isUz ? 'Rasm osti izohi / tavsifi' : 'Подпись к изображению'}
                </label>
                <Input
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  placeholder={isUz ? 'Rasm tavsifi' : 'Описание изображения'}
                  className="h-9 text-xs"
                />
              </div>

              {imageUrl.trim() && (
                <div className="relative rounded-lg border p-2 bg-muted/20 flex items-center justify-center max-h-40 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl.trim()}
                    alt="Preview"
                    className="max-h-36 w-auto object-contain rounded"
                    onError={() => {
                      setImageUploadError(
                        isUz
                          ? 'Ushbu havola boʻyicha rasm yuklanmadi'
                          : 'Не удалось загрузить картинку по ссылке'
                      );
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Кнопки действий */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsImageModalOpen(false)}
            >
              {isUz ? 'Bekor qilish' : 'Отмена'}
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isUploadingImage}
              onClick={handleInsertImageToContent}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isUploadingImage ? (
                <span>{isUz ? 'Yuklanmoqda...' : 'Загрузка...'}</span>
              ) : (
                <span>{isUz ? 'Maqolaga joylash' : 'Вставить в статью'}</span>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
