'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Download,
  Calendar,
  ChevronDown,
  ChevronUp,
  MapPin,
  Phone,
  Mail,
  Clock,
  ExternalLink,
  Users,
  Newspaper,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Trash2,
  Plus,
} from 'lucide-react';
import { useInlineEdit, EditableText, EditableHtml } from './inline-edit-context';
import {
  PageBlock,
  HeadingBlockConfig,
  RichTextBlockConfig,
  ImageBlockConfig,
  GalleryBlockConfig,
  FileListBlockConfig,
  TableBlockConfig,
  AccordionBlockConfig,
  ButtonBlockConfig,
  ColumnsBlockConfig,
  VideoEmbedBlockConfig,
  ContactCardBlockConfig,
  DividerBlockConfig,
  LatestNewsListBlockConfig,
  TeachersListBlockConfig,
  NewsItem,
  Teacher,
  isAllowedVideoUrl,
  GridRow,
  GridCell,
  migrateBlocksToRows,
  RowBackgroundStyle,
  RowPaddingVertical,
  RowContainerWidth,
  CellVerticalAlign,
} from '@college/shared';
import { apiClient } from '@/lib/api-client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CardsGridBlock,
  TabsBlock,
  HeroBlock,
  BannerAlertBlock,
  CallToActionBlock,
  QuoteBlock,
  ImageTextBlock,
  ImageCarouselBlock,
  StatsCounterBlock,
  TimelineBlock,
  DocumentsListBlock,
  StaffCardsBlock,
  SpecialtiesFeedBlock,
  EventsFeedBlock,
  ScheduleWidgetBlock,
  AnchorNavBlock,
  SocialLinksBlock,
  MapEmbedBlock,
  ReusableRefBlock,
} from './extra-blocks';
import { getResponsiveCellSpanClasses, getResponsiveVisibilityClasses, getResponsiveGridConfig } from '@/lib/responsive-grid';

export const ROW_BG_CLASSES: Record<RowBackgroundStyle, string> = {
  none: 'bg-transparent',
  subtle: 'bg-muted/40 text-foreground',
  card: 'bg-card border-y border-border/60 shadow-2xs text-card-foreground',
  brand: 'bg-primary text-primary-foreground',
  dark: 'bg-slate-900 text-slate-50 dark:bg-slate-950 dark:text-slate-100',
};

export const ROW_PADDING_CLASSES: Record<RowPaddingVertical, string> = {
  none: 'py-0',
  compact: 'py-3 sm:py-6',
  normal: 'py-6 sm:py-10',
  relaxed: 'py-10 sm:py-16',
};

export const ROW_CONTAINER_CLASSES: Record<RowContainerWidth, string> = {
  prose: 'max-w-3xl mx-auto px-4 sm:px-6',
  standard: 'max-w-5xl mx-auto px-4 sm:px-6',
  wide: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  full: 'w-full px-4 sm:px-6 lg:px-8',
};

export const CELL_SPAN_CLASSES: Record<number, string> = {
  3: 'col-span-12 md:col-span-3',
  4: 'col-span-12 md:col-span-4',
  5: 'col-span-12 md:col-span-5',
  6: 'col-span-12 md:col-span-6',
  7: 'col-span-12 md:col-span-7',
  8: 'col-span-12 md:col-span-8',
  9: 'col-span-12 md:col-span-9',
  10: 'col-span-12 md:col-span-10',
  11: 'col-span-12 md:col-span-11',
  12: 'col-span-12 md:col-span-12',
};

export const CELL_ALIGN_CLASSES: Record<CellVerticalAlign, string> = {
  top: 'self-start',
  center: 'self-center',
  bottom: 'self-end',
};

export interface BlockRendererProps {
  rows?: GridRow[];
  blocks?: PageBlock[];
  lang?: 'uz' | 'ru';
  className?: string;
}

export function BlockRenderer({
  rows,
  blocks = [],
  lang = 'uz',
  className = '',
}: BlockRendererProps): JSX.Element {
  const isUz = lang === 'uz';
  const effectiveRows: GridRow[] =
    Array.isArray(rows) && rows.length > 0
      ? rows
      : Array.isArray(blocks) && blocks.length > 0
      ? migrateBlocksToRows(blocks)
      : [];

  if (effectiveRows.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground text-sm">
        {isUz
          ? 'Sahifada hozircha qoʻshimcha bloklar mavjud emas.'
          : 'На странице пока нет дополнительных контентных блоков.'}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {effectiveRows.map((row) => (
        <GridRowRenderer key={row.id} row={row} isUz={isUz} />
      ))}
    </div>
  );
}

export function GridRowRenderer({
  row,
  isUz,
}: {
  row: GridRow;
  isUz: boolean;
}): JSX.Element {
  const bgClass = ROW_BG_CLASSES[row.style?.backgroundStyle || 'none'] || 'bg-transparent';
  const padClass = ROW_PADDING_CLASSES[row.style?.paddingVertical || 'normal'] || 'py-6';
  const containerClass =
    ROW_CONTAINER_CLASSES[row.style?.containerWidth || 'standard'] || 'max-w-5xl mx-auto px-4';
  const visibilityClass = getResponsiveVisibilityClasses(row.style);

  return (
    <section className={`w-full ${bgClass} ${padClass} ${visibilityClass} transition-colors`}>
      <div className={containerClass}>
        <div className="grid grid-cols-1 sm:grid-cols-12 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
          {row.cells.map((cell) => (
            <GridCellRenderer key={cell.id} cell={cell} siblingCells={row.cells} isUz={isUz} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function GridCellRenderer({
  cell,
  siblingCells = [],
  isUz,
}: {
  cell: GridCell;
  siblingCells?: GridCell[];
  isUz: boolean;
}): JSX.Element {
  const spanClass = getResponsiveCellSpanClasses(cell, siblingCells);
  const visibilityClass = getResponsiveVisibilityClasses(cell);
  const alignClass = CELL_ALIGN_CLASSES[cell.verticalAlign || 'top'] || 'self-start';
  const cardClass = cell.isCard ? 'p-5 sm:p-6 rounded-2xl border border-border bg-card shadow-xs' : '';
  const visibleBlocks = (cell.blocks || []).filter((b) => b.isVisible);

  return (
    <div className={`${spanClass} ${visibilityClass} ${alignClass} ${cardClass} container-cell flex flex-col justify-start w-full`}>
      {visibleBlocks.length === 0 ? null : (
        <div className="space-y-6 w-full">
          {visibleBlocks.map((block) => (
            <SingleBlockRenderer key={block.id} block={block} isUz={isUz} />
          ))}
        </div>
      )}
    </div>
  );
}

export function SingleBlockRenderer({
  block,
  isUz,
}: {
  block: PageBlock;
  isUz: boolean;
}): JSX.Element | null {
  const visibilityClass = getResponsiveVisibilityClasses(block.style);

  let rendered: JSX.Element | null = null;
  switch (block.type) {
    case 'heading':
      rendered = <HeadingBlock block={block} isUz={isUz} />;
      break;
    case 'rich_text':
      rendered = <RichTextBlock block={block} isUz={isUz} />;
      break;
    case 'image':
      rendered = <ImageBlock block={block} isUz={isUz} />;
      break;
    case 'gallery':
      rendered = <GalleryBlock block={block} isUz={isUz} />;
      break;
    case 'file_list':
      rendered = <FileListBlock block={block} isUz={isUz} />;
      break;
    case 'table':
      rendered = <TableBlock block={block} isUz={isUz} />;
      break;
    case 'accordion':
      rendered = <AccordionBlock block={block} isUz={isUz} />;
      break;
    case 'button':
      rendered = <ButtonBlock block={block} isUz={isUz} />;
      break;
    case 'columns':
      rendered = <ColumnsBlock block={block} isUz={isUz} />;
      break;
    case 'video_embed':
      rendered = <VideoEmbedBlock block={block} isUz={isUz} />;
      break;
    case 'contact_card':
      rendered = <ContactCardBlock block={block} isUz={isUz} />;
      break;
    case 'divider':
      rendered = <DividerBlock block={block} />;
      break;
    case 'latest_news_list':
      rendered = <LatestNewsListBlock block={block} isUz={isUz} />;
      break;
    case 'teachers_list':
      rendered = <TeachersListBlock block={block} isUz={isUz} />;
      break;
    case 'cards_grid':
      rendered = <CardsGridBlock block={block} isUz={isUz} />;
      break;
    case 'tabs':
      rendered = <TabsBlock block={block} isUz={isUz} />;
      break;
    case 'hero':
      rendered = <HeroBlock block={block} isUz={isUz} />;
      break;
    case 'banner_alert':
      rendered = <BannerAlertBlock block={block} isUz={isUz} />;
      break;
    case 'call_to_action':
      rendered = <CallToActionBlock block={block} isUz={isUz} />;
      break;
    case 'quote':
      rendered = <QuoteBlock block={block} isUz={isUz} />;
      break;
    case 'image_text':
      rendered = <ImageTextBlock block={block} isUz={isUz} />;
      break;
    case 'image_carousel':
      rendered = <ImageCarouselBlock block={block} isUz={isUz} />;
      break;
    case 'stats_counter':
      rendered = <StatsCounterBlock block={block} isUz={isUz} />;
      break;
    case 'timeline':
      rendered = <TimelineBlock block={block} isUz={isUz} />;
      break;
    case 'documents_list':
      rendered = <DocumentsListBlock block={block} isUz={isUz} />;
      break;
    case 'staff_cards':
      rendered = <StaffCardsBlock block={block} isUz={isUz} />;
      break;
    case 'specialties_feed':
      rendered = <SpecialtiesFeedBlock block={block} isUz={isUz} />;
      break;
    case 'events_feed':
      rendered = <EventsFeedBlock block={block} isUz={isUz} />;
      break;
    case 'schedule_widget':
      rendered = <ScheduleWidgetBlock block={block} isUz={isUz} />;
      break;
    case 'anchor_nav':
      rendered = <AnchorNavBlock block={block} isUz={isUz} />;
      break;
    case 'social_links':
      rendered = <SocialLinksBlock block={block} isUz={isUz} />;
      break;
    case 'map_embed':
      rendered = <MapEmbedBlock block={block} isUz={isUz} />;
      break;
    case 'reusable_ref':
      rendered = <ReusableRefBlock block={block} isUz={isUz} />;
      break;
    default:
      return null;
  }

  if (!rendered) return null;
  if (visibilityClass) {
    return <div className={visibilityClass}>{rendered}</div>;
  }
  return rendered;
}

// 1. Heading Block
function HeadingBlock({ block, isUz }: { block: PageBlock; isUz: boolean }): JSX.Element {
  const { onUpdateBlockConfig } = useInlineEdit();
  const cfg = block.config as HeadingBlockConfig;
  const text = isUz ? cfg.textUz || cfg.textRu : cfg.textRu || cfg.textUz;
  const alignClass =
    cfg.align === 'center' ? 'text-center' : cfg.align === 'right' ? 'text-right' : 'text-left';

  const handleTextChange = (val: string) => {
    onUpdateBlockConfig?.(block.id, isUz ? { textUz: val } : { textRu: val });
  };

  const level = cfg.level || 2;
  const headingClasses: Record<number, string> = {
    1: 'text-fluid-h1 font-extrabold tracking-tight text-foreground',
    2: 'text-fluid-h2 font-bold tracking-tight text-foreground border-b border-border pb-2.5 mt-6 mb-4',
    3: 'text-fluid-h3 font-bold tracking-tight text-foreground mt-4 mb-2',
    4: 'text-fluid-h4 font-semibold text-foreground',
    5: 'text-base font-semibold text-foreground',
    6: 'text-sm font-semibold uppercase tracking-wider text-muted-foreground',
  };

  const tagMap: Record<number, 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'> = {
    1: 'h1',
    2: 'h2',
    3: 'h3',
    4: 'h4',
    5: 'h5',
    6: 'h6',
  };

  return (
    <EditableText
      as={tagMap[level] || 'h2'}
      value={text}
      onChange={handleTextChange}
      placeholder={isUz ? 'Sarlavha matni...' : 'Текст заголовка...'}
      className={`${headingClasses[level] || headingClasses[2]} ${alignClass} block`}
    />
  );
}

// 2. Rich Text Block
function RichTextBlock({ block, isUz }: { block: PageBlock; isUz: boolean }): JSX.Element {
  const { onUpdateBlockConfig } = useInlineEdit();
  const cfg = block.config as RichTextBlockConfig;
  const html = isUz ? cfg.contentUzHtml || cfg.contentRuHtml : cfg.contentRuHtml || cfg.contentUzHtml;
  const widthClass =
    cfg.containerWidth === 'prose'
      ? 'max-w-3xl'
      : cfg.containerWidth === 'wide'
      ? 'max-w-5xl'
      : 'max-w-none';

  return (
    <div
      className={`prose prose-slate dark:prose-invert max-w-none mx-auto leading-relaxed text-foreground ${widthClass}`}
    >
      <EditableHtml
        html={html}
        onChange={(newHtml) =>
          onUpdateBlockConfig?.(block.id, isUz ? { contentUzHtml: newHtml } : { contentRuHtml: newHtml })
        }
      />
    </div>
  );
}

// 3. Image Block (with responsive focalPoint and aspect ratio presets)
function ImageBlock({ block, isUz }: { block: PageBlock; isUz: boolean }): JSX.Element {
  const cfg = block.config as ImageBlockConfig;
  const altText = cfg.isDecorative
    ? ''
    : isUz
    ? cfg.altTextUz || cfg.altTextRu || ''
    : cfg.altTextRu || cfg.altTextUz || '';
  const caption = isUz ? cfg.captionUz || cfg.captionRu : cfg.captionRu || cfg.captionUz;

  const preset = block.style?.aspectRatioPreset || cfg.aspectRatio || 'auto';
  const aspectClasses: Record<string, string> = {
    '16:9': 'aspect-video',
    '4:3': 'aspect-4/3',
    '1:1': 'aspect-square',
    '3:4': 'aspect-[3/4]',
    auto: 'aspect-auto',
    original: 'aspect-auto',
  };

  const focalPoint = block.style?.focalPoint;
  const objectPosition = focalPoint ? `${focalPoint.x}% ${focalPoint.y}%` : '50% 50%';

  return (
    <figure className="my-6 space-y-2">
      <div className={`overflow-hidden rounded-xl border border-border bg-muted/40 shadow-xs ${aspectClasses[preset] || 'aspect-auto'}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cfg.url}
          alt={altText}
          loading="lazy"
          style={{ objectPosition }}
          className="w-full h-full object-cover transition-transform duration-300"
        />
      </div>
      {caption && (
        <figcaption className="text-center text-xs text-muted-foreground italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

// 4. Gallery Block with Lightbox
function GalleryBlock({ block, isUz }: { block: PageBlock; isUz: boolean }): JSX.Element {
  const { effectiveViewport } = useInlineEdit();
  const cfg = block.config as GalleryBlockConfig;
  const items = cfg.items || [];
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  const count = items.length;
  const gridConfig = getResponsiveGridConfig(count, cfg.columns || 3, effectiveViewport, 200);

  return (
    <div className="space-y-4">
      <div className={gridConfig.className} style={gridConfig.style}>
        {items.map((item, idx) => {
          const altText = isUz
            ? item.altTextUz || item.altTextRu || `Rasm ${idx + 1}`
            : item.altTextRu || item.altTextUz || `Изображение ${idx + 1}`;
          const caption = isUz ? item.captionUz || item.captionRu : item.captionRu || item.captionUz;

          return (
            <div
              key={item.id || idx}
              tabIndex={0}
              role="button"
              aria-label={altText}
              onClick={() => cfg.enableLightbox !== false && setActiveImageIndex(idx)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  cfg.enableLightbox !== false && setActiveImageIndex(idx);
                }
              }}
              className="group relative overflow-hidden rounded-xl border border-border bg-muted aspect-4/3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt={altText}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {caption && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 text-white text-xs">
                  <p className="line-clamp-2">{caption}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Accessible Lightbox Modal */}
      {activeImageIndex !== null && items[activeImageIndex] && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-in fade-in"
          onClick={() => setActiveImageIndex(null)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-white hover:text-white/80 p-2 rounded-full bg-white/10 focus:outline-none focus:ring-2 focus:ring-white"
            onClick={() => setActiveImageIndex(null)}
            aria-label="Yopish / Закрыть"
          >
            <X className="size-6" />
          </button>

          {items.length > 1 && (
            <>
              <button
                type="button"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-3 rounded-full bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex((prev) => (prev! > 0 ? prev! - 1 : items.length - 1));
                }}
                aria-label="Oldingi / Предыдущее"
              >
                <ChevronLeft className="size-6" />
              </button>

              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-3 rounded-full bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex((prev) => (prev! < items.length - 1 ? prev! + 1 : 0));
                }}
                aria-label="Keyingi / Следующее"
              >
                <ChevronRight className="size-6" />
              </button>
            </>
          )}

          <div
            className="relative max-w-4xl max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={items[activeImageIndex].url}
              alt={items[activeImageIndex].altTextUz || items[activeImageIndex].altTextRu || ''}
              className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
            />
            {(items[activeImageIndex].captionUz || items[activeImageIndex].captionRu) && (
              <p className="mt-3 text-center text-sm text-white/90 max-w-2xl">
                {isUz
                  ? items[activeImageIndex].captionUz || items[activeImageIndex].captionRu
                  : items[activeImageIndex].captionRu || items[activeImageIndex].captionUz}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// 5. File / Document List Block
function FileListBlock({ block, isUz }: { block: PageBlock; isUz: boolean }): JSX.Element {
  const cfg = block.config as FileListBlockConfig;
  const title = isUz ? cfg.titleUz || cfg.titleRu : cfg.titleRu || cfg.titleUz;
  const docs = cfg.documents || [];

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4 my-6">
      {title && <h3 className="text-xl font-bold text-foreground">{title}</h3>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {docs.map((doc, idx) => {
          const docTitle = isUz ? doc.titleUz || doc.titleRu : doc.titleRu || doc.titleUz;
          return (
            <div
              key={doc.id || idx}
              className="p-4 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors flex items-start justify-between gap-3 shadow-xs"
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
                  <FileText className="size-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground leading-snug">{docTitle}</p>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
                    {doc.documentNumber && <span>№ {doc.documentNumber}</span>}
                    {doc.issueDate && <span>• {doc.issueDate}</span>}
                    {doc.fileFormat && (
                      <Badge variant="outline" className="text-[10px] uppercase px-1.5 py-0">
                        {doc.fileFormat}
                      </Badge>
                    )}
                    {doc.fileSizeBytes && <span>{formatFileSize(doc.fileSizeBytes)}</span>}
                  </div>
                </div>
              </div>

              <a
                href={doc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                aria-label={`${isUz ? 'Yuklab olish' : 'Скачать'}: ${docTitle}`}
                className="p-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-primary shrink-0 transition-colors"
              >
                <Download className="size-4" />
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 6. Accessible Table Block
function TableBlock({ block, isUz }: { block: PageBlock; isUz: boolean }): JSX.Element {
  const cfg = block.config as TableBlockConfig;
  const caption = isUz ? cfg.captionUz || cfg.captionRu : cfg.captionRu || cfg.captionUz;
  const headers = isUz
    ? cfg.headersUz?.length
      ? cfg.headersUz
      : cfg.headersRu || []
    : cfg.headersRu?.length
    ? cfg.headersRu
    : cfg.headersUz || [];
  const rows = isUz
    ? cfg.rowsUz?.length
      ? cfg.rowsUz
      : cfg.rowsRu || []
    : cfg.rowsRu?.length
    ? cfg.rowsRu
    : cfg.rowsUz || [];

  return (
    <div className="space-y-1.5 my-6">
      <div
        tabIndex={0}
        role="region"
        aria-label={caption || (isUz ? 'Maʼlumotlar jadvali' : 'Таблица данных')}
        className="table-responsive-container rounded-xl border border-border bg-card shadow-xs focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <table className="w-full text-left text-sm border-collapse min-w-[500px]">
          {caption && (
            <caption className="p-3 text-left font-bold text-foreground bg-muted/40 border-b border-border text-sm">
              {caption}
            </caption>
          )}
          {headers.length > 0 && (
            <thead className="bg-muted/70 text-foreground border-b border-border">
              <tr>
                {headers.map((h, idx) => (
                  <th key={idx} scope="col" className="p-3 font-semibold whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody className="divide-y divide-border">
            {rows.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-muted/20 transition-colors">
                {row.map((cell, cellIdx) =>
                  cellIdx === 0 ? (
                    <th key={cellIdx} scope="row" className="p-3 font-medium text-foreground">
                      {cell}
                    </th>
                  ) : (
                    <td key={cellIdx} className="p-3 text-muted-foreground">
                      {cell}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-muted-foreground sm:hidden text-center">
        {isUz ? '↔ Jadvalni koʻrish uchun yon tomonga suring' : '↔ Прокручивайте таблицу вбок для просмотра'}
      </p>
    </div>
  );
}

// 7. Accessible Accordion Block
function AccordionBlock({ block, isUz }: { block: PageBlock; isUz: boolean }): JSX.Element {
  const { isEditable, onUpdateBlockConfig } = useInlineEdit();
  const cfg = block.config as AccordionBlockConfig;
  const title = isUz ? cfg.titleUz || cfg.titleRu : cfg.titleRu || cfg.titleUz;
  const items = cfg.items || [];
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!cfg.allowMultiple) next.clear();
        next.add(id);
      }
      return next;
    });
  };

  const updateItem = (itemId: string, patch: Partial<(typeof items)[0]>) => {
    const updated = items.map((it, idx) => {
      const curId = it.id || `acc-${idx}`;
      return curId === itemId ? { ...it, ...patch } : it;
    });
    onUpdateBlockConfig?.(block.id, { items: updated });
  };

  const deleteItem = (itemId: string) => {
    const updated = items.filter((it, idx) => (it.id || `acc-${idx}`) !== itemId);
    onUpdateBlockConfig?.(block.id, { items: updated });
  };

  const addItem = () => {
    const newItem = {
      id: `acc-${Date.now()}`,
      questionUz: isUz ? 'Yangi savol' : 'Новый вопрос',
      questionRu: 'Новый вопрос',
      answerUzHtml: isUz ? '<p>Savolga javob matni...</p>' : '<p>Текст ответа на вопрос...</p>',
      answerRuHtml: '<p>Текст ответа на вопрос...</p>',
    };
    onUpdateBlockConfig?.(block.id, { items: [...items, newItem] });
  };

  return (
    <div className="space-y-4 my-6">
      {title && (
        <h3 className="text-xl font-bold text-foreground">
          <EditableText
            value={title}
            placeholder={isUz ? 'Akkordeon sarlavhasi...' : 'Заголовок аккордеона...'}
            onChange={(val) =>
              onUpdateBlockConfig?.(block.id, isUz ? { titleUz: val } : { titleRu: val })
            }
          />
        </h3>
      )}

      <div className="divide-y divide-border rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        {items.map((item, idx) => {
          const itemId = item.id || `acc-${idx}`;
          const isOpen = openItems.has(itemId);
          const q = isUz ? item.questionUz || item.questionRu : item.questionRu || item.questionUz;
          const a = isUz ? item.answerUzHtml || item.answerRuHtml : item.answerRuHtml || item.answerUzHtml;

          return (
            <div key={itemId}>
              <div
                className="w-full p-4 flex items-center justify-between text-left font-semibold text-foreground hover:bg-muted/30 focus-within:ring-2 focus-within:ring-primary transition-colors text-sm sm:text-base min-h-[44px] cursor-pointer"
                onClick={() => toggleItem(itemId)}
              >
                <div className="flex-1 pr-3" onClick={(e) => isEditable && e.stopPropagation()}>
                  <EditableText
                    value={q}
                    placeholder={isUz ? 'Savol matni...' : 'Текст вопроса...'}
                    onChange={(val) =>
                      updateItem(itemId, isUz ? { questionUz: val } : { questionRu: val })
                    }
                  />
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {isEditable && (
                    <button
                      type="button"
                      title={isUz ? 'Elementni oʻchirish' : 'Удалить вопрос'}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteItem(itemId);
                      }}
                      className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors mr-1"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                  {isOpen ? (
                    <ChevronUp className="size-5 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="size-5 shrink-0 text-muted-foreground" />
                  )}
                </div>
              </div>

              {isOpen && (
                <div
                  id={`panel-${itemId}`}
                  role="region"
                  aria-labelledby={`header-${itemId}`}
                  className="p-4 pt-1 text-sm text-muted-foreground border-t border-border/40 bg-muted/10 leading-relaxed prose prose-sm dark:prose-invert max-w-none"
                >
                  <EditableHtml
                    html={a}
                    placeholder={isUz ? 'Javob matni...' : 'Текст ответа...'}
                    onChange={(newHtml) =>
                      updateItem(itemId, isUz ? { answerUzHtml: newHtml } : { answerRuHtml: newHtml })
                    }
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isEditable && (
        <div className="text-center pt-1">
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-border hover:border-primary text-xs font-semibold text-muted-foreground hover:text-primary transition-colors bg-card"
          >
            <Plus className="size-3.5" />
            <span>{isUz ? 'Savol qoʻshish' : 'Добавить вопрос'}</span>
          </button>
        </div>
      )}
    </div>
  );
}

// 8. Button Block
function ButtonBlock({ block, isUz }: { block: PageBlock; isUz: boolean }): JSX.Element {
  const { isEditable, onUpdateBlockConfig } = useInlineEdit();
  const cfg = block.config as ButtonBlockConfig;
  const text = isUz ? cfg.textUz || cfg.textRu : cfg.textRu || cfg.textUz;
  const alignClass =
    cfg.align === 'center'
      ? 'justify-center'
      : cfg.align === 'right'
      ? 'justify-end'
      : 'justify-start';

  const variantClass = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-border bg-background hover:bg-muted text-foreground',
    ghost: 'hover:bg-muted text-foreground',
  };

  const content = (
    <>
      <EditableText
        value={text}
        placeholder={isUz ? 'Tugma matni...' : 'Текст кнопки...'}
        onChange={(val) =>
          onUpdateBlockConfig?.(block.id, isUz ? { textUz: val } : { textRu: val })
        }
      />
      {cfg.openInNewTab && <ExternalLink className="size-4 shrink-0 ml-1" />}
    </>
  );

  return (
    <div className={`flex my-4 ${alignClass}`}>
      {isEditable ? (
        <div
          role="button"
          tabIndex={0}
          className={`inline-flex items-center justify-center gap-2 min-h-[44px] min-w-[44px] px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-xs cursor-pointer max-sm:w-full ${
            variantClass[cfg.variant || 'primary']
          }`}
        >
          {content}
        </div>
      ) : (
        <a
          href={cfg.url}
          target={cfg.openInNewTab ? '_blank' : '_self'}
          rel={cfg.openInNewTab ? 'noopener noreferrer' : undefined}
          className={`inline-flex items-center justify-center gap-2 min-h-[44px] min-w-[44px] px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-xs focus:outline-none focus:ring-2 focus:ring-primary max-sm:w-full ${
            variantClass[cfg.variant || 'primary']
          }`}
        >
          {content}
        </a>
      )}
    </div>
  );
}

// 9. Columns Block
function ColumnsBlock({ block, isUz }: { block: PageBlock; isUz: boolean }): JSX.Element {
  const { isEditable, effectiveViewport, onUpdateBlockConfig } = useInlineEdit();
  const cfg = block.config as ColumnsBlockConfig;
  const items = cfg.items || [];
  const count = items.length;

  const gridConfig = getResponsiveGridConfig(count, cfg.columns || 2, effectiveViewport, 280);

  const updateItem = (itemId: string, patch: Partial<(typeof items)[0]>) => {
    const updated = items.map((col, idx) => {
      const curId = col.id || `col-${idx}`;
      return curId === itemId ? { ...col, ...patch } : col;
    });
    onUpdateBlockConfig?.(block.id, { items: updated });
  };

  const deleteItem = (itemId: string) => {
    const updated = items.filter((col, idx) => (col.id || `col-${idx}`) !== itemId);
    onUpdateBlockConfig?.(block.id, { items: updated });
  };

  const addItem = () => {
    const newItem = {
      id: `col-${Date.now()}`,
      titleUz: isUz ? 'Yangi ustun' : 'Новая колонка',
      titleRu: 'Новая колонка',
      contentUzHtml: isUz ? '<p>Ustun matni mazmuni...</p>' : '<p>Содержимое колонки...</p>',
      contentRuHtml: '<p>Содержимое колонки...</p>',
    };
    onUpdateBlockConfig?.(block.id, { items: [...items, newItem] });
  };

  return (
    <div className="space-y-4 my-6 w-full">
      <div className={gridConfig.className} style={gridConfig.style}>
        {items.map((col, idx) => {
          const curId = col.id || `col-${idx}`;
          const title = isUz ? col.titleUz || col.titleRu : col.titleRu || col.titleUz;
          const html = isUz
            ? col.contentUzHtml || col.contentRuHtml
            : col.contentRuHtml || col.contentUzHtml;

          return (
            <Card key={curId} className="border-border bg-card shadow-xs relative group/col h-full flex flex-col justify-between">
              <div>
                {col.imageUrl && (
                  <div className="aspect-video overflow-hidden rounded-t-xl bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={col.imageUrl}
                      alt={title || ''}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-bold">
                      <EditableText
                        value={title}
                        placeholder={isUz ? 'Ustun sarlavhasi...' : 'Заголовок колонки...'}
                        onChange={(val) =>
                          updateItem(curId, isUz ? { titleUz: val } : { titleRu: val })
                        }
                      />
                    </CardTitle>
                  </div>
                  {isEditable && (
                    <button
                      type="button"
                      title={isUz ? 'Ustunni oʻchirish' : 'Удалить колонку'}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteItem(curId);
                      }}
                      className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors pointer-events-auto"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </CardHeader>
                <CardContent className="p-4 pt-1">
                  <EditableHtml
                    html={html}
                    placeholder={isUz ? 'Ustun mazmuni...' : 'Содержимое колонки...'}
                    onChange={(newHtml) =>
                      updateItem(curId, isUz ? { contentUzHtml: newHtml } : { contentRuHtml: newHtml })
                    }
                    className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed"
                  />
                </CardContent>
              </div>
            </Card>
          );
        })}
      </div>

      {isEditable && items.length < 4 && (
        <div className="text-center pt-1">
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-border hover:border-primary text-xs font-semibold text-muted-foreground hover:text-primary transition-colors bg-card"
          >
            <Plus className="size-3.5" />
            <span>{isUz ? 'Ustun qoʻshish' : 'Добавить колонку'}</span>
          </button>
        </div>
      )}
    </div>
  );
}

// 10. Video Embed Block
function VideoEmbedBlock({ block, isUz }: { block: PageBlock; isUz: boolean }): JSX.Element {
  const cfg = block.config as VideoEmbedBlockConfig;
  const title = isUz ? cfg.titleUz || cfg.titleRu : cfg.titleRu || cfg.titleUz;
  const isValid = isAllowedVideoUrl(cfg.url);

  if (!isValid) {
    return (
      <div className="p-4 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive text-sm flex items-center gap-2">
        <AlertCircle className="size-5 shrink-0" />
        <span>
          {isUz
            ? 'Ruxsat etilmagan video xizmati (faqat YouTube, Vimeo va Mover.uz ruxsat etilgan)'
            : 'Недопустимый видеохостинг (разрешены только YouTube, Vimeo, Mover.uz)'}
        </span>
      </div>
    );
  }

  // Parse embed URL
  let embedUrl = cfg.url;
  try {
    if (cfg.url.includes('youtube.com/watch?v=')) {
      const v = new URL(cfg.url).searchParams.get('v');
      embedUrl = `https://www.youtube.com/embed/${v}`;
    } else if (cfg.url.includes('youtu.be/')) {
      const v = cfg.url.split('youtu.be/')[1]?.split('?')[0];
      embedUrl = `https://www.youtube.com/embed/${v}`;
    } else if (cfg.url.includes('vimeo.com/') && !cfg.url.includes('player.vimeo.com')) {
      const v = cfg.url.split('vimeo.com/')[1]?.split('?')[0];
      embedUrl = `https://player.vimeo.com/video/${v}`;
    }
  } catch {}

  const aspectClass = cfg.aspectRatio === '4:3' ? 'aspect-4/3' : 'aspect-video';

  return (
    <div className="my-6 space-y-2">
      <div className={`overflow-hidden rounded-xl border border-border shadow-xs bg-black ${aspectClass}`}>
        <iframe
          src={embedUrl}
          title={title || (isUz ? 'Video rolik' : 'Видеоролик')}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>
      {title && (
        <p className="text-center text-xs text-muted-foreground">{title}</p>
      )}
    </div>
  );
}

// 11. Contact Card Block
function ContactCardBlock({ block, isUz }: { block: PageBlock; isUz: boolean }): JSX.Element {
  const cfg = block.config as ContactCardBlockConfig;
  const title = isUz ? cfg.titleUz || cfg.titleRu : cfg.titleRu || cfg.titleUz;
  const address = isUz ? cfg.addressUz || cfg.addressRu : cfg.addressRu || cfg.addressUz;
  const workHours = isUz ? cfg.workHoursUz || cfg.workHoursRu : cfg.workHoursRu || cfg.workHoursUz;

  const lat = cfg.latitude || 40.3864;
  const lng = cfg.longitude || 71.7864;

  return (
    <Card className="my-6 border-border bg-card shadow-xs overflow-hidden">
      {title && (
        <CardHeader className="bg-muted/30 border-b border-border p-4">
          <CardTitle className="text-lg font-bold">{title}</CardTitle>
        </CardHeader>
      )}

      <CardContent className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3.5">
          {address && (
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="size-5 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground block">
                  {isUz ? 'Manzil' : 'Адрес'}:
                </span>
                <span className="text-muted-foreground">{address}</span>
              </div>
            </div>
          )}

          {cfg.phone && (
            <div className="flex items-start gap-3 text-sm">
              <Phone className="size-5 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground block">
                  {isUz ? 'Telefon' : 'Телефон'}:
                </span>
                <a
                  href={`tel:${cfg.phone}`}
                  className="text-primary hover:underline"
                >
                  {cfg.phone}
                </a>
              </div>
            </div>
          )}

          {cfg.email && (
            <div className="flex items-start gap-3 text-sm">
              <Mail className="size-5 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground block">Email:</span>
                <a
                  href={`mailto:${cfg.email}`}
                  className="text-primary hover:underline"
                >
                  {cfg.email}
                </a>
              </div>
            </div>
          )}

          {workHours && (
            <div className="flex items-start gap-3 text-sm">
              <Clock className="size-5 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground block">
                  {isUz ? 'Ish vaqti' : 'Режим работы'}:
                </span>
                <span className="text-muted-foreground">{workHours}</span>
              </div>
            </div>
          )}
        </div>

        {cfg.showMap && (
          <div className="h-56 rounded-lg overflow-hidden border border-border bg-muted">
            <iframe
              title={isUz ? 'Interaktiv xarita' : 'Интерактивная карта'}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01}%2C${lat - 0.01}%2C${lng + 0.01}%2C${lat + 0.01}&layer=mapnik&marker=${lat}%2C${lng}`}
              className="w-full h-full border-0"
              loading="lazy"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 12. Divider Block
function DividerBlock({ block }: { block: PageBlock }): JSX.Element {
  const cfg = block.config as DividerBlockConfig;
  const styleClass =
    cfg.style === 'dashed'
      ? 'border-dashed'
      : cfg.style === 'dotted'
      ? 'border-dotted'
      : 'border-solid';

  const spacingClass =
    cfg.spacing === 'small' ? 'my-4' : cfg.spacing === 'large' ? 'my-12' : 'my-8';

  return <hr className={`border-t border-border ${styleClass} ${spacingClass}`} />;
}

// 13. Dynamic Widget: Latest News List
function LatestNewsListBlock({ block, isUz }: { block: PageBlock; isUz: boolean }): JSX.Element {
  const { effectiveViewport } = useInlineEdit();
  const cfg = block.config as LatestNewsListBlockConfig;
  const title = isUz ? cfg.titleUz || cfg.titleRu : cfg.titleRu || cfg.titleUz;
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    apiClient
      .getNews()
      .then((res) => {
        if (!isMounted) return;
        let list: NewsItem[] = res?.items || [];
        if (cfg.categoryId) {
          list = list.filter((n: NewsItem) => String(n.categoryId) === String(cfg.categoryId));
        }
        setNews(list.slice(0, cfg.limit || 3));
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [cfg.categoryId, cfg.limit]);

  const newsGridConfig = getResponsiveGridConfig(news.length, 3, effectiveViewport, 260);

  return (
    <div className="space-y-4 my-8">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Newspaper className="size-5 text-primary" />
          <span>{title || (isUz ? 'Soʻnggi yangiliklar' : 'Последние новости')}</span>
        </h3>
        <Link
          href="/news"
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
        >
          <span>{isUz ? 'Barcha yangiliklar' : 'Все новости'}</span>
          <ChevronRight className="size-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="py-8 flex items-center justify-center text-muted-foreground">
          <Loader2 className="size-6 animate-spin text-primary mr-2" />
          <span className="text-sm">{isUz ? 'Yuklanmoqda...' : 'Загрузка...'}</span>
        </div>
      ) : news.length === 0 ? (
        <div className="p-6 text-center text-muted-foreground text-sm border border-dashed rounded-xl">
          {isUz ? 'Yangiliklar mavjud emas' : 'Новости отсутствуют'}
        </div>
      ) : (
        <div className={newsGridConfig.className} style={newsGridConfig.style}>
          {news.map((item) => (
            <Link
              key={item.id}
              href={`/news/${item.slug}`}
              className="group p-4 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors flex flex-col justify-between shadow-xs"
            >
              <div className="space-y-2">
                {cfg.showCover !== false && item.coverImageUrl && (
                  <div className="aspect-video rounded-lg overflow-hidden bg-muted mb-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.coverImageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <h4 className="font-bold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                  {item.title}
                </h4>
                {item.leadText && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{item.leadText}</p>
                )}
              </div>
              <div className="pt-3 text-[11px] text-muted-foreground flex items-center gap-1">
                <Calendar className="size-3" />
                <span>
                  {new Date(item.publishedAt || item.createdAt).toLocaleDateString(
                    isUz ? 'uz-UZ' : 'ru-RU',
                  )}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// 14. Dynamic Widget: Teachers List
function TeachersListBlock({ block, isUz }: { block: PageBlock; isUz: boolean }): JSX.Element {
  const { effectiveViewport } = useInlineEdit();
  const cfg = block.config as TeachersListBlockConfig;
  const title = isUz ? cfg.titleUz || cfg.titleRu : cfg.titleRu || cfg.titleUz;
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    apiClient
      .getTeachers()
      .then((res) => {
        if (!isMounted) return;
        let list: Teacher[] = res?.items || [];
        if (cfg.departmentId) {
          list = list.filter((t: Teacher) => t.departmentId === cfg.departmentId);
        }
        setTeachers(list.slice(0, cfg.limit || 4));
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [cfg.departmentId, cfg.limit]);

  const teacherGridConfig = getResponsiveGridConfig(teachers.length, 4, effectiveViewport, 220);

  return (
    <div className="space-y-4 my-8">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Users className="size-5 text-primary" />
          <span>{title || (isUz ? 'Oʻqituvchilar tarkibi' : 'Преподавательский состав')}</span>
        </h3>
        <Link
          href="/teachers"
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
        >
          <span>{isUz ? 'Barcha oʻqituvchilar' : 'Все преподаватели'}</span>
          <ChevronRight className="size-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="py-8 flex items-center justify-center text-muted-foreground">
          <Loader2 className="size-6 animate-spin text-primary mr-2" />
          <span className="text-sm">{isUz ? 'Yuklanmoqda...' : 'Загрузка...'}</span>
        </div>
      ) : teachers.length === 0 ? (
        <div className="p-6 text-center text-muted-foreground text-sm border border-dashed rounded-xl">
          {isUz ? 'Oʻqituvchilar topilmadi' : 'Преподаватели не найдены'}
        </div>
      ) : (
        <div className={teacherGridConfig.className} style={teacherGridConfig.style}>
          {teachers.map((teacher) => (
            <Link
              key={teacher.id}
              href={`/teachers/${teacher.slug}`}
              className="group p-4 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors flex flex-col items-center text-center shadow-xs"
            >
              <div className="size-20 rounded-full overflow-hidden bg-muted mb-3 border-2 border-primary/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={teacher.photoUrl || '/images/default-avatar.webp'}
                  alt={teacher.fullName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                {teacher.fullName}
              </h4>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {teacher.position}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
