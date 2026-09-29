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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

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
  placeholder = 'Введите текст новости, приказа или статьи...',
  label = 'Содержание материала',
  error,
}: WysiwygEditorProps) {
  const [activeTab, setActiveTab] = React.useState<'edit' | 'preview'>('edit');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

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

  const handleInsertH2 = () => insertFormat('\n## ', '\n', 'Подзаголовок H2');
  const handleInsertH3 = () => insertFormat('\n### ', '\n', 'Подзаголовок H3');
  const handleInsertBold = () => insertFormat('**', '**', 'жирный текст');
  const handleInsertItalic = () => insertFormat('*', '*', 'курсив');
  const handleInsertQuote = () => insertFormat('\n> ', '\n', 'Цитата или комментарий руководства');
  const handleInsertUl = () => insertFormat('\n- ', '\n', 'Элемент списка');
  const handleInsertOl = () => insertFormat('\n1. ', '\n', 'Первый пункт');
  const handleInsertLink = () => insertFormat('[', '](https://example.com)', 'Текст ссылки');
  const handleInsertImage = () => insertFormat('![Описание фото](', ')', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800');
  const handleInsertTable = () => {
    const tableTemplate = `
| Наименование показателя | Значение | Примечание |
| ----------------------- | -------- | ---------- |
| Контрольные цифры       | 150 мест | Бюджет     |
| Проходной балл аттестата| 4.6      | Очная форма|
`;
    insertFormat(tableTemplate, '');
  };
  const handleInsertDirective = () => {
    const docTemplate = `\n> 📄 **Приказ №124/ОД от 15.09.2026**\n> «Об организации учебного процесса и утверждении графиков сессий»\n`;
    insertFormat(docTemplate, '');
  };

  // Convert basic markdown tags to styled preview HTML safely without heavy external deps
  const renderPreviewHtml = (text: string) => {
    if (!text) return '<p class="text-muted-foreground italic">Текст статьи пока пуст.</p>';

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
          {label}
        </label>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Type className="h-3.5 w-3.5" />
            {wordCount} слов
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            ~{readingTime} мин чтения
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
              title="Заголовок H2"
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
              title="Заголовок H3"
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
              title="Полужирный"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleInsertItalic}
              className="h-8 w-8 p-0"
              title="Курсив"
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
              title="Маркированный список"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleInsertOl}
              className="h-8 w-8 p-0"
              title="Нумерованный список"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleInsertQuote}
              className="h-8 w-8 p-0"
              title="Цитата"
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
              title="Ссылка"
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleInsertImage}
              className="h-8 w-8 p-0"
              title="Изображение"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleInsertTable}
              className="h-8 w-8 p-0"
              title="Таблица"
            >
              <TableIcon className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleInsertDirective}
              className="h-8 px-2 text-xs text-primary"
              title="Вставить официальный приказ"
            >
              <FileText className="h-3.5 w-3.5 mr-1" />
              Приказ
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
              Редактор
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
              Предпросмотр
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-3">
          {activeTab === 'edit' ? (
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full border-0 focus-visible:ring-0 focus-visible:ring-offset-0 font-mono text-sm leading-relaxed p-0 resize-y"
              style={{ minHeight }}
            />
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
    </div>
  );
}
