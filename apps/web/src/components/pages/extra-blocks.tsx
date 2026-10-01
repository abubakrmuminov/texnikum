'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Award,
  Building,
  Sparkles,
  BookOpen,
  Briefcase,
  Play,
  Pause,
  Info,
  CheckCircle2,
  AlertTriangle,
  Search,
  Share2,
  ArrowRight,
  Quote as QuoteIcon,
  FolderTree,
  Calendar,
  Clock,
  MapPin,
  Users,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Download,
  FileText,
  X,
  AlertCircle,
  Trash2,
  Plus,
} from 'lucide-react';
import { useInlineEdit, EditableText, EditableHtml } from './inline-edit-context';
import {
  PageBlock,
  CardsGridBlockConfig,
  TabsBlockConfig,
  HeroBlockConfig,
  BannerAlertBlockConfig,
  CallToActionBlockConfig,
  QuoteBlockConfig,
  ImageTextBlockConfig,
  ImageCarouselBlockConfig,
  StatsCounterBlockConfig,
  TimelineBlockConfig,
  DocumentsListBlockConfig,
  StaffCardsBlockConfig,
  SpecialtiesFeedBlockConfig,
  EventsFeedBlockConfig,
  ScheduleWidgetBlockConfig,
  AnchorNavBlockConfig,
  SocialLinksBlockConfig,
  MapEmbedBlockConfig,
  ReusableRefBlockConfig,
  ReusableBlock,
  Specialty,
  EventItem,
  Teacher,
  ScheduleItem,
} from '@college/shared';
import { apiClient } from '@/lib/api-client';
import { Badge } from '@/components/ui/badge';
import { getResponsiveGridConfig } from '@/lib/responsive-grid';

// Helper for icon resolution in cards/stats
function getLucideIcon(name?: string, className = 'size-5'): JSX.Element {
  switch (name) {
    case 'GraduationCap':
      return <GraduationCap className={className} />;
    case 'Award':
      return <Award className={className} />;
    case 'Building':
    case 'Building2':
      return <Building className={className} />;
    case 'Sparkles':
      return <Sparkles className={className} />;
    case 'BookOpen':
      return <BookOpen className={className} />;
    case 'Briefcase':
      return <Briefcase className={className} />;
    case 'Users':
      return <Users className={className} />;
    default:
      return <Sparkles className={className} />;
  }
}

// ---------------------------------------------------------------------------
// 15. Cards Grid Block
// ---------------------------------------------------------------------------
export function CardsGridBlock({
  block,
  isUz,
}: {
  block: PageBlock;
  isUz: boolean;
}): JSX.Element {
  const cfg = block.config as CardsGridBlockConfig;
  const { isEditable, effectiveViewport, onUpdateBlockConfig } = useInlineEdit();
  const title = isUz ? cfg.titleUz || cfg.titleRu : cfg.titleRu || cfg.titleUz;
  const cards = cfg.cards || [];
  const count = cards.length;

  const gridConfig = getResponsiveGridConfig(count, cfg.columns || 3, effectiveViewport, 260);

  const updateCard = (cardId: string, patch: Partial<(typeof cards)[0]>) => {
    const updated = cards.map((c) => (c.id === cardId ? { ...c, ...patch } : c));
    onUpdateBlockConfig?.(block.id, { cards: updated });
  };

  const deleteCard = (cardId: string) => {
    const updated = cards.filter((c) => c.id !== cardId);
    onUpdateBlockConfig?.(block.id, { cards: updated });
  };

  const addCard = () => {
    const newCard = {
      id: `card-${Date.now()}`,
      titleUz: isUz ? 'Yangi yoʻnalish' : 'Новое направление',
      titleRu: 'Новое направление',
      descriptionUz: isUz ? 'Yoʻnalish haqida qisqacha maʼlumot...' : 'Краткое описание направления...',
      descriptionRu: 'Краткое описание направления...',
      badgeUz: isUz ? 'Yangi' : 'Новое',
      badgeRu: 'Новое',
      linkUrl: '/specialties',
    };
    onUpdateBlockConfig?.(block.id, { cards: [...cards, newCard] });
  };

  return (
    <div className="w-full space-y-4">
      {title && (
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground border-b border-border pb-2.5">
          <EditableText
            value={title}
            placeholder={isUz ? 'Boʻlim sarlavhasi...' : 'Заголовок раздела...'}
            onChange={(val) =>
              onUpdateBlockConfig?.(block.id, isUz ? { titleUz: val } : { titleRu: val })
            }
          />
        </h3>
      )}
      <div className={gridConfig.className} style={gridConfig.style}>
        {cards.map((card) => {
          const cardTitle = isUz ? card.titleUz || card.titleRu : card.titleRu || card.titleUz;
          const cardDesc = isUz ? card.descriptionUz || card.descriptionRu : card.descriptionRu || card.descriptionUz;
          const cardBadge = isUz ? card.badgeUz || card.badgeRu : card.badgeRu || card.badgeUz;
          const cardLinkText = isUz ? card.linkTextUz || card.linkTextRu : card.linkTextRu || card.linkTextUz;

          const cardBody = (
            <div className="h-full p-5 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors flex flex-col justify-between shadow-xs relative group/card">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                    {getLucideIcon(card.icon, 'size-5')}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {cardBadge && (
                      <Badge variant="outline" className="text-xs font-semibold">
                        <EditableText
                          value={cardBadge}
                          placeholder={isUz ? 'Nishon...' : 'Бейдж...'}
                          onChange={(val) =>
                            updateCard(card.id, isUz ? { badgeUz: val } : { badgeRu: val })
                          }
                        />
                      </Badge>
                    )}
                    {isEditable && (
                      <button
                        type="button"
                        title={isUz ? 'Kartani oʻchirish' : 'Удалить карточку'}
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCard(card.id);
                        }}
                        className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors pointer-events-auto"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <EditableText
                  as="h4"
                  value={cardTitle}
                  placeholder={isUz ? 'Karta nomi...' : 'Название карточки...'}
                  onChange={(val) =>
                    updateCard(card.id, isUz ? { titleUz: val } : { titleRu: val })
                  }
                  className="font-bold text-base text-foreground mb-2 line-clamp-2 block"
                />
                <EditableText
                  multiline
                  as="p"
                  value={cardDesc}
                  placeholder={isUz ? 'Tavsif matni...' : 'Текст описания...'}
                  onChange={(val) =>
                    updateCard(card.id, isUz ? { descriptionUz: val } : { descriptionRu: val })
                  }
                  className="text-sm text-muted-foreground line-clamp-3 leading-relaxed block"
                />
              </div>
              {card.linkUrl && (
                <div className="mt-4 pt-3 border-t border-border/50 flex items-center text-xs font-semibold text-primary group-hover/card:underline gap-1">
                  <EditableText
                    value={cardLinkText || (isUz ? 'Batafsil tanishish' : 'Подробнее')}
                    onChange={(val) =>
                      updateCard(card.id, isUz ? { linkTextUz: val } : { linkTextRu: val })
                    }
                  />
                  <ArrowRight className="size-3.5" />
                </div>
              )}
            </div>
          );

          if (card.linkUrl && !isEditable) {
            return (
              <Link key={card.id} href={card.linkUrl} className="group block focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
                {cardBody}
              </Link>
            );
          }
          return <div key={card.id}>{cardBody}</div>;
        })}
      </div>

      {isEditable && (
        <div className="pt-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              addCard();
            }}
            className="text-xs font-medium text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors pointer-events-auto"
          >
            <Plus className="size-3.5" />
            <span>{isUz ? 'Karta qoʻshish' : 'Добавить карточку'}</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 16. Tabs Block (WCAG ARIA compliant with keyboard navigation)
// ---------------------------------------------------------------------------
export function TabsBlock({
  block,
  isUz,
}: {
  block: PageBlock;
  isUz: boolean;
}): JSX.Element {
  const cfg = block.config as TabsBlockConfig;
  const { isEditable, onUpdateBlockConfig } = useInlineEdit();
  const title = isUz ? cfg.titleUz || cfg.titleRu : cfg.titleRu || cfg.titleUz;
  const items = cfg.items || [];
  const [activeIndex, setActiveIndex] = useState(cfg.defaultActiveIndex || 0);
  const tabListRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (items.length === 0) return;
    let nextIndex = index;
    if (e.key === 'ArrowRight') {
      nextIndex = (index + 1) % items.length;
      e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (index - 1 + items.length) % items.length;
      e.preventDefault();
    } else if (e.key === 'Home') {
      nextIndex = 0;
      e.preventDefault();
    } else if (e.key === 'End') {
      nextIndex = items.length - 1;
      e.preventDefault();
    }
    if (nextIndex !== index) {
      setActiveIndex(nextIndex);
      const buttons = tabListRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
      buttons?.[nextIndex]?.focus();
    }
  };

  const updateTab = (tabId: string, patch: Partial<(typeof items)[0]>) => {
    const updated = items.map((t) => (t.id === tabId ? { ...t, ...patch } : t));
    onUpdateBlockConfig?.(block.id, { items: updated });
  };

  const deleteTab = (tabId: string) => {
    const updated = items.filter((t) => t.id !== tabId);
    onUpdateBlockConfig?.(block.id, { items: updated });
    if (activeIndex >= updated.length) setActiveIndex(Math.max(0, updated.length - 1));
  };

  const addTab = () => {
    const newTab = {
      id: `tab-${Date.now()}`,
      labelUz: isUz ? 'Yangi boʻlim' : 'Новый раздел',
      labelRu: 'Новый раздел',
      contentUzHtml: isUz ? '<p>Boʻlim matni mazmuni...</p>' : '<p>Содержимое раздела...</p>',
      contentRuHtml: '<p>Содержимое раздела...</p>',
    };
    onUpdateBlockConfig?.(block.id, { items: [...items, newTab] });
  };

  if (items.length === 0) return <div />;

  const activeTab = items[activeIndex] || items[0]!;
  const activeContentHtml = isUz
    ? activeTab.contentUzHtml || activeTab.contentRuHtml
    : activeTab.contentRuHtml || activeTab.contentUzHtml;

  return (
    <div className="w-full space-y-4">
      {title && (
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground border-b border-border pb-2.5">
          <EditableText
            value={title}
            placeholder={isUz ? 'Boʻlimlar sarlavhasi...' : 'Заголовок вкладок...'}
            onChange={(val) =>
              onUpdateBlockConfig?.(block.id, isUz ? { titleUz: val } : { titleRu: val })
            }
          />
        </h3>
      )}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
        <div
          ref={tabListRef}
          role="tablist"
          aria-label={title || (isUz ? 'Boʻlimlar' : 'Вкладки')}
          className="flex gap-1 p-1 rounded-xl bg-muted/60 border border-border max-w-full"
        >
          {items.map((tab, idx) => {
            const tabLabel = isUz ? tab.labelUz || tab.labelRu : tab.labelRu || tab.labelUz;
            const isSelected = idx === activeIndex;
            return (
              <div
                key={tab.id}
                role="tab"
                id={`tab-${block.id}-${tab.id}`}
                aria-selected={isSelected}
                aria-controls={`panel-${block.id}-${tab.id}`}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => setActiveIndex(idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className={`shrink-0 px-3 py-1.5 min-h-[40px] text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring ${
                  isSelected
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <EditableText
                  value={tabLabel}
                  placeholder={isUz ? 'Boʻlim...' : 'Вкладка...'}
                  onChange={(val) =>
                    updateTab(tab.id, isUz ? { labelUz: val } : { labelRu: val })
                  }
                />
                {isEditable && items.length > 1 && (
                  <button
                    type="button"
                    title={isUz ? 'Boʻlimni oʻchirish' : 'Удалить вкладку'}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTab(tab.id);
                    }}
                    className="p-0.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors ml-1"
                  >
                    <Trash2 className="size-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
        {isEditable && (
          <button
            type="button"
            onClick={addTab}
            title={isUz ? 'Boʻlim qoʻshish' : 'Добавить вкладку'}
            className="p-2 rounded-lg border border-dashed border-border hover:border-primary text-muted-foreground hover:text-primary transition-colors text-xs font-semibold flex items-center gap-1 shrink-0"
          >
            <Plus className="size-3.5" />
            <span className="hidden sm:inline">{isUz ? 'Qoʻshish' : 'Добавить'}</span>
          </button>
        )}
      </div>
      <div
        role="tabpanel"
        id={`panel-${block.id}-${activeTab.id}`}
        aria-labelledby={`tab-${block.id}-${activeTab.id}`}
        tabIndex={0}
        className="p-5 sm:p-6 rounded-xl border border-border bg-card shadow-xs prose max-w-none dark:prose-invert focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
      >
        <EditableHtml
          html={activeContentHtml}
          placeholder={isUz ? 'Boʻlim mazmuni...' : 'Содержимое вкладки...'}
          onChange={(newHtml) =>
            updateTab(activeTab.id, isUz ? { contentUzHtml: newHtml } : { contentRuHtml: newHtml })
          }
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 17. Hero Block
// ---------------------------------------------------------------------------
export function HeroBlock({
  block,
  isUz,
}: {
  block: PageBlock;
  isUz: boolean;
}): JSX.Element {
  const { isEditable, effectiveViewport, onUpdateBlockConfig } = useInlineEdit();
  const cfg = block.config as HeroBlockConfig;
  const isMobile = effectiveViewport === 'mobile';
  const title = isUz ? cfg.titleUz || cfg.titleRu : cfg.titleRu || cfg.titleUz;
  const badge = isUz ? cfg.badgeUz || cfg.badgeRu : cfg.badgeRu || cfg.badgeUz;
  const subtitle = isUz ? cfg.subtitleUz || cfg.subtitleRu : cfg.subtitleRu || cfg.subtitleUz;
  const primaryText = isUz
    ? cfg.primaryActionTextUz || cfg.primaryActionTextRu
    : cfg.primaryActionTextRu || cfg.primaryActionTextUz;
  const secondaryText = isUz
    ? cfg.secondaryActionTextUz || cfg.secondaryActionTextRu
    : cfg.secondaryActionTextRu || cfg.secondaryActionTextUz;
  const imageAlt = isUz ? cfg.imageAltUz || cfg.imageAltRu : cfg.imageAltRu || cfg.imageAltUz;

  const isCenter = cfg.align === 'center' && !cfg.imageUrl;
  const alignClass = isCenter ? 'text-center items-center mx-auto' : 'text-left items-start';

  return (
    <div className={`w-full py-6 sm:py-10 flex flex-col ${alignClass}`}>
      {(badge || isEditable) && (
        <Badge className="mb-4 text-xs font-semibold px-3 py-1 bg-primary/10 text-primary border-primary/20">
          <EditableText
            value={badge}
            placeholder={isUz ? 'Nishon...' : 'Бейдж...'}
            onChange={(val) =>
              onUpdateBlockConfig?.(block.id, isUz ? { badgeUz: val } : { badgeRu: val })
            }
          />
        </Badge>
      )}
      <div className={`grid grid-cols-1 ${!isMobile && cfg.imageUrl ? 'lg:grid-cols-12 gap-6 lg:gap-8 items-center' : 'gap-6'} w-full`}>
        <div className={!isMobile && cfg.imageUrl ? 'lg:col-span-7' : 'w-full'}>
          <EditableText
            as="h1"
            value={title}
            placeholder={isUz ? 'Asosiy sarlavha...' : 'Главный заголовок...'}
            onChange={(val) =>
              onUpdateBlockConfig?.(block.id, isUz ? { titleUz: val } : { titleRu: val })
            }
            className="text-fluid-h1 font-extrabold tracking-tight text-foreground leading-tight block"
          />
          {(subtitle || isEditable) && (
            <div className="mt-3 sm:mt-4 text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed max-w-2xl">
              <EditableText
                multiline
                as="p"
                value={subtitle}
                placeholder={isUz ? 'Quyi sarlavha tavsifi...' : 'Подзаголовок описания...'}
                onChange={(val) =>
                  onUpdateBlockConfig?.(block.id, isUz ? { subtitleUz: val } : { subtitleRu: val })
                }
              />
            </div>
          )}
          {(primaryText || secondaryText || isEditable) && (
            <div className={`mt-5 sm:mt-8 flex ${isMobile ? 'flex-col w-full' : 'flex-col sm:flex-row'} gap-3 ${isCenter ? 'justify-center items-center' : 'justify-start items-stretch sm:items-center'}`}>
              {(primaryText || isEditable) && (
                isEditable ? (
                  <div className="min-h-[44px] px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-xs flex items-center justify-center gap-2 cursor-pointer">
                    <EditableText
                      value={primaryText}
                      placeholder={isUz ? 'Boshlash' : 'Начать'}
                      onChange={(val) =>
                        onUpdateBlockConfig?.(block.id, isUz ? { primaryActionTextUz: val } : { primaryActionTextRu: val })
                      }
                    />
                    <ArrowRight className="size-4" />
                  </div>
                ) : (
                  <Link
                    href={cfg.primaryActionUrl || '#'}
                    className="min-h-[44px] px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 shadow-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring flex items-center justify-center gap-2"
                  >
                    <span>{primaryText}</span>
                    <ArrowRight className="size-4" />
                  </Link>
                )
              )}
              {(secondaryText || isEditable) && (
                isEditable ? (
                  <div className="min-h-[44px] px-6 py-2.5 rounded-xl border border-input bg-card font-semibold text-sm text-foreground flex items-center justify-center cursor-pointer">
                    <EditableText
                      value={secondaryText}
                      placeholder={isUz ? 'Batafsil' : 'Подробнее'}
                      onChange={(val) =>
                        onUpdateBlockConfig?.(block.id, isUz ? { secondaryActionTextUz: val } : { secondaryActionTextRu: val })
                      }
                    />
                  </div>
                ) : (
                  <Link
                    href={cfg.secondaryActionUrl || '#'}
                    className="min-h-[44px] px-6 py-2.5 rounded-xl border border-input bg-card hover:bg-muted font-semibold text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring flex items-center justify-center"
                  >
                    {secondaryText}
                  </Link>
                )
              )}
            </div>
          )}
        </div>
        {cfg.imageUrl && (
          <div className={`${!isMobile ? 'lg:col-span-5' : 'w-full'} rounded-2xl overflow-hidden shadow-lg border border-border mt-4 lg:mt-0`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cfg.imageUrl}
              alt={imageAlt || title}
              className="w-full h-auto object-cover max-h-[280px] sm:max-h-[360px]"
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 18. Banner Alert Block
// ---------------------------------------------------------------------------
export function BannerAlertBlock({
  block,
  isUz,
}: {
  block: PageBlock;
  isUz: boolean;
}): JSX.Element {
  const { isEditable, onUpdateBlockConfig } = useInlineEdit();
  const cfg = block.config as BannerAlertBlockConfig;
  const [dismissed, setDismissed] = useState(false);
  const title = isUz ? cfg.titleUz || cfg.titleRu : cfg.titleRu || cfg.titleUz;
  const message = isUz ? cfg.messageUz || cfg.messageRu : cfg.messageRu || cfg.messageUz;
  const actionText = isUz ? cfg.actionTextUz || cfg.actionTextRu : cfg.actionTextRu || cfg.actionTextUz;

  if (dismissed && !isEditable) return <div />;

  const variantStyles = {
    info: 'bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-950/40 dark:text-blue-100 dark:border-blue-900',
    warning: 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/40 dark:text-amber-100 dark:border-amber-900',
    success: 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-100 dark:border-emerald-900',
    destructive: 'bg-red-50 text-red-900 border-red-200 dark:bg-red-950/40 dark:text-red-100 dark:border-red-900',
  }[cfg.variant || 'info'];

  const icon = {
    info: <Info className="size-5 shrink-0 text-blue-600 dark:text-blue-400" />,
    warning: <AlertTriangle className="size-5 shrink-0 text-amber-600 dark:text-amber-400" />,
    success: <CheckCircle2 className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />,
    destructive: <AlertCircle className="size-5 shrink-0 text-red-600 dark:text-red-400" />,
  }[cfg.variant || 'info'];

  return (
    <div role="alert" className={`w-full p-4 rounded-xl border flex items-start gap-3 shadow-xs ${variantStyles}`}>
      {icon}
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-sm leading-tight">
          <EditableText
            value={title}
            placeholder={isUz ? 'Ogohlantirish sarlavhasi...' : 'Заголовок предупреждения...'}
            onChange={(val) =>
              onUpdateBlockConfig?.(block.id, isUz ? { titleUz: val } : { titleRu: val })
            }
          />
        </h4>
        <div className="text-xs sm:text-sm mt-1 opacity-90 leading-relaxed">
          <EditableText
            multiline
            value={message}
            placeholder={isUz ? 'Xabar matni...' : 'Текст сообщения...'}
            onChange={(val) =>
              onUpdateBlockConfig?.(block.id, isUz ? { messageUz: val } : { messageRu: val })
            }
          />
        </div>
        {(actionText || isEditable) && (
          <div className="mt-2.5">
            {isEditable ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold underline cursor-pointer">
                <EditableText
                  value={actionText}
                  placeholder={isUz ? 'Harakat matni...' : 'Текст действия...'}
                  onChange={(val) =>
                    onUpdateBlockConfig?.(block.id, isUz ? { actionTextUz: val } : { actionTextRu: val })
                  }
                />
                <ArrowRight className="size-3" />
              </span>
            ) : (
              <Link
                href={cfg.actionUrl || '#'}
                className="inline-flex items-center gap-1 text-xs font-bold underline hover:opacity-80"
              >
                <span>{actionText}</span>
                <ArrowRight className="size-3" />
              </Link>
            )}
          </div>
        )}
      </div>
      {cfg.isDismissible && !isEditable && (
        <button
          onClick={() => setDismissed(true)}
          aria-label={isUz ? 'Yopish' : 'Закрыть'}
          className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 19. Call To Action (CTA) Block
// ---------------------------------------------------------------------------
export function CallToActionBlock({
  block,
  isUz,
}: {
  block: PageBlock;
  isUz: boolean;
}): JSX.Element {
  const { isEditable, effectiveViewport, onUpdateBlockConfig } = useInlineEdit();
  const cfg = block.config as CallToActionBlockConfig;
  const isMobile = effectiveViewport === 'mobile';
  const title = isUz ? cfg.titleUz || cfg.titleRu : cfg.titleRu || cfg.titleUz;
  const badge = isUz ? cfg.badgeUz || cfg.badgeRu : cfg.badgeRu || cfg.badgeUz;
  const desc = isUz ? cfg.descriptionUz || cfg.descriptionRu : cfg.descriptionRu || cfg.descriptionUz;
  const pBtn = isUz ? cfg.primaryButtonTextUz || cfg.primaryButtonTextRu : cfg.primaryButtonTextRu || cfg.primaryButtonTextUz;
  const sBtn = isUz ? cfg.secondaryButtonTextUz || cfg.secondaryButtonTextRu : cfg.secondaryButtonTextRu || cfg.secondaryButtonTextUz;

  return (
    <div className={`w-full p-6 sm:p-10 rounded-2xl border border-primary/30 bg-primary/5 text-foreground flex flex-col ${!isMobile ? 'md:flex-row' : ''} items-center justify-between gap-6 shadow-sm`}>
      <div className={`max-w-2xl ${isMobile ? 'text-center' : 'text-center md:text-left'}`}>
        {(badge || isEditable) && (
          <Badge className="mb-2.5 text-xs font-semibold bg-primary text-primary-foreground">
            <EditableText
              value={badge}
              placeholder={isUz ? 'Nishon...' : 'Бейдж...'}
              onChange={(val) =>
                onUpdateBlockConfig?.(block.id, isUz ? { badgeUz: val } : { badgeRu: val })
              }
            />
          </Badge>
        )}
        <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          <EditableText
            value={title}
            placeholder={isUz ? 'Chaqiriq sarlavhasi...' : 'Заголовок призыва...'}
            onChange={(val) =>
              onUpdateBlockConfig?.(block.id, isUz ? { titleUz: val } : { titleRu: val })
            }
          />
        </h3>
        {(desc || isEditable) && (
          <div className="mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed">
            <EditableText
              multiline
              value={desc}
              placeholder={isUz ? 'Tavsif matni...' : 'Текст описания...'}
              onChange={(val) =>
                onUpdateBlockConfig?.(block.id, isUz ? { descriptionUz: val } : { descriptionRu: val })
              }
            />
          </div>
        )}
      </div>
      <div className={`flex ${isMobile ? 'flex-col w-full' : 'flex-wrap'} items-center justify-center gap-3 shrink-0`}>
        {(pBtn || isEditable) && (
          isEditable ? (
            <div className="px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-xs flex items-center gap-2 cursor-pointer">
              <EditableText
                value={pBtn}
                placeholder={isUz ? 'Tugma matni' : 'Текст кнопки'}
                onChange={(val) =>
                  onUpdateBlockConfig?.(block.id, isUz ? { primaryButtonTextUz: val } : { primaryButtonTextRu: val })
                }
              />
              <ArrowRight className="size-4" />
            </div>
          ) : (
            <Link
              href={cfg.primaryButtonUrl || '#'}
              className="px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 shadow-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring flex items-center gap-2"
            >
              <span>{pBtn}</span>
              <ArrowRight className="size-4" />
            </Link>
          )
        )}
        {(sBtn || isEditable) && (
          isEditable ? (
            <div className="px-5 py-3 rounded-xl border border-input bg-card font-semibold text-sm text-foreground flex items-center cursor-pointer">
              <EditableText
                value={sBtn}
                placeholder={isUz ? 'Ikkinchi tugma' : 'Вторая кнопка'}
                onChange={(val) =>
                  onUpdateBlockConfig?.(block.id, isUz ? { secondaryButtonTextUz: val } : { secondaryButtonTextRu: val })
                }
              />
            </div>
          ) : (
            <Link
              href={cfg.secondaryButtonUrl || '#'}
              className="px-5 py-3 rounded-xl border border-input bg-card hover:bg-muted font-semibold text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
            >
              {sBtn}
            </Link>
          )
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 20. Quote Block
// ---------------------------------------------------------------------------
export function QuoteBlock({
  block,
  isUz,
}: {
  block: PageBlock;
  isUz: boolean;
}): JSX.Element {
  const { onUpdateBlockConfig } = useInlineEdit();
  const cfg = block.config as QuoteBlockConfig;
  const text = isUz ? cfg.quoteTextUz || cfg.quoteTextRu : cfg.quoteTextRu || cfg.quoteTextUz;
  const author = isUz ? cfg.authorUz || cfg.authorRu : cfg.authorRu || cfg.authorUz;
  const role = isUz ? cfg.roleUz || cfg.roleRu : cfg.roleRu || cfg.roleUz;

  return (
    <figure className="w-full my-6 p-6 sm:p-8 rounded-2xl border border-border bg-card shadow-xs relative overflow-hidden">
      <QuoteIcon className="absolute right-4 bottom-4 size-24 text-muted/30 -z-0 pointer-events-none" />
      <blockquote className="relative z-10 text-base sm:text-lg italic font-medium text-foreground leading-relaxed">
        «
        <EditableText
          multiline
          value={text}
          placeholder={isUz ? 'Iqtibos matni...' : 'Текст цитаты...'}
          onChange={(val) =>
            onUpdateBlockConfig?.(block.id, isUz ? { quoteTextUz: val } : { quoteTextRu: val })
          }
        />
        »
      </blockquote>
      <figcaption className="relative z-10 mt-4 pt-4 border-t border-border flex items-center gap-3">
        {cfg.avatarUrl && (
          <div className="size-12 rounded-full overflow-hidden border border-border bg-muted shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cfg.avatarUrl} alt={author || ''} className="w-full h-full object-cover" />
          </div>
        )}
        <div>
          <cite className="font-bold text-sm not-italic text-foreground block">
            <EditableText
              value={author}
              placeholder={isUz ? 'Muallif ismi...' : 'Имя автора...'}
              onChange={(val) =>
                onUpdateBlockConfig?.(block.id, isUz ? { authorUz: val } : { authorRu: val })
              }
            />
          </cite>
          <span className="text-xs text-muted-foreground block">
            <EditableText
              value={role}
              placeholder={isUz ? 'Lavozimi...' : 'Должность...'}
              onChange={(val) =>
                onUpdateBlockConfig?.(block.id, isUz ? { roleUz: val } : { roleRu: val })
              }
            />
          </span>
        </div>
      </figcaption>
    </figure>
  );
}

// ---------------------------------------------------------------------------
// 21. Image + Text Block
// ---------------------------------------------------------------------------
export function ImageTextBlock({
  block,
  isUz,
}: {
  block: PageBlock;
  isUz: boolean;
}): JSX.Element {
  const { isEditable, effectiveViewport, onUpdateBlockConfig } = useInlineEdit();
  const cfg = block.config as ImageTextBlockConfig;
  const isMobile = effectiveViewport === 'mobile';
  const title = isUz ? cfg.titleUz || cfg.titleRu : cfg.titleRu || cfg.titleUz;
  const contentHtml = isUz ? cfg.contentUzHtml || cfg.contentRuHtml : cfg.contentRuHtml || cfg.contentUzHtml;
  const badge = isUz ? cfg.badgeUz || cfg.badgeRu : cfg.badgeRu || cfg.badgeUz;
  const actionText = isUz ? cfg.actionTextUz || cfg.actionTextRu : cfg.actionTextRu || cfg.actionTextUz;
  const alt = isUz ? cfg.imageAltUz || cfg.imageAltRu : cfg.imageAltRu || cfg.imageAltUz;

  const isImgRight = cfg.imagePosition === 'right';

  const textCol = (
    <div className={`${isMobile ? 'w-full' : 'w-full md:col-span-6'} space-y-3`}>
      {(badge || isEditable) && (
        <Badge variant="outline" className="text-xs font-semibold">
          <EditableText
            value={badge}
            placeholder={isUz ? 'Nishon...' : 'Бейдж...'}
            onChange={(val) =>
              onUpdateBlockConfig?.(block.id, isUz ? { badgeUz: val } : { badgeRu: val })
            }
          />
        </Badge>
      )}
      <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
        <EditableText
          value={title}
          placeholder={isUz ? 'Sarlavha...' : 'Заголовок...'}
          onChange={(val) =>
            onUpdateBlockConfig?.(block.id, isUz ? { titleUz: val } : { titleRu: val })
          }
        />
      </h3>
      <div className="prose max-w-none text-muted-foreground text-sm sm:text-base leading-relaxed dark:prose-invert">
        <EditableHtml
          html={contentHtml}
          placeholder={isUz ? 'Mazmun matni...' : 'Текст описания...'}
          onChange={(newHtml) =>
            onUpdateBlockConfig?.(block.id, isUz ? { contentUzHtml: newHtml } : { contentRuHtml: newHtml })
          }
        />
      </div>
      {(actionText || isEditable) && (
        <div className="pt-2">
          {isEditable ? (
            <span className="inline-flex items-center gap-1.5 min-h-[44px] text-sm font-semibold text-primary cursor-pointer">
              <EditableText
                value={actionText}
                placeholder={isUz ? 'Batafsil' : 'Подробнее'}
                onChange={(val) =>
                  onUpdateBlockConfig?.(block.id, isUz ? { actionTextUz: val } : { actionTextRu: val })
                }
              />
              <ArrowRight className="size-4" />
            </span>
          ) : (
            <Link
              href={cfg.actionUrl || '#'}
              className="inline-flex items-center gap-1.5 min-h-[44px] text-sm font-semibold text-primary hover:underline"
            >
              <span>{actionText}</span>
              <ArrowRight className="size-4" />
            </Link>
          )}
        </div>
      )}
    </div>
  );

  const imageCol = (
    <div className={`${isMobile ? 'w-full' : 'w-full md:col-span-6'} rounded-2xl overflow-hidden border border-border shadow-xs`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={cfg.imageUrl}
        alt={alt || title || 'Tasvir'}
        className="w-full h-auto object-cover max-h-[380px]"
      />
    </div>
  );

  return (
    <div className={`w-full ${isMobile ? 'flex flex-col gap-6' : 'flex flex-col md:grid md:grid-cols-12 gap-6 sm:gap-8'} items-center my-6`}>
      {isImgRight ? (
        <>
          {textCol}
          {imageCol}
        </>
      ) : (
        <>
          {imageCol}
          {textCol}
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 22. Image Carousel Block (WCAG 2.2.2 compliant: pause control, no auto-advance)
// ---------------------------------------------------------------------------
export function ImageCarouselBlock({
  block,
  isUz,
}: {
  block: PageBlock;
  isUz: boolean;
}): JSX.Element {
  const cfg = block.config as ImageCarouselBlockConfig;
  const title = isUz ? cfg.titleUz || cfg.titleRu : cfg.titleRu || cfg.titleUz;
  const slides = cfg.slides || [];
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(Boolean(cfg.autoAdvance));

  // WCAG: check prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setIsPlaying(false);
    }
  }, []);

  // Timer only runs if explicitly set to playing
  useEffect(() => {
    if (!isPlaying || slides.length <= 1) return;
    const interval = (cfg.intervalSeconds || 5) * 1000;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, interval);
    return () => clearInterval(timer);
  }, [isPlaying, slides.length, cfg.intervalSeconds]);

  if (slides.length === 0) return <div />;

  const activeSlide = slides[currentSlide] || slides[0]!;
  const altText = isUz ? activeSlide.altTextUz || activeSlide.altTextRu : activeSlide.altTextRu || activeSlide.altTextUz;
  const caption = isUz ? activeSlide.captionUz || activeSlide.captionRu : activeSlide.captionRu || activeSlide.captionUz;

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={title || (isUz ? 'Rasmlar karuseli' : 'Карусель изображений')}
      className="w-full space-y-3 my-6"
    >
      {title && (
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground border-b border-border pb-2.5">
          {title}
        </h3>
      )}
      <div className="relative rounded-2xl overflow-hidden border border-border shadow-md bg-muted aspect-16/9 max-h-[460px] touch-pan-y">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={activeSlide.imageUrl}
          alt={altText}
          className="w-full h-full object-cover select-none"
        />
        {caption && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 sm:p-6 text-white text-sm sm:text-base">
            {caption}
          </div>
        )}
      </div>

      {/* Controls Bar: Prev, Next, Slide counter, and REQUIRED Pause / Play toggle */}
      <div className="flex items-center justify-between gap-4 p-2 rounded-xl bg-card border border-border">
        <div className="flex items-center gap-2">
          <button
            onClick={prevSlide}
            aria-label={isUz ? 'Oldingi slayd' : 'Предыдущий слайд'}
            className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg hover:bg-muted focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            onClick={nextSlide}
            aria-label={isUz ? 'Keyingi slayd' : 'Следующий слайд'}
            className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg hover:bg-muted focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronRight className="size-5" />
          </button>
          {/* Pause / Play button */}
          <button
            onClick={() => setIsPlaying((p) => !p)}
            aria-label={isPlaying ? (isUz ? 'Pauza' : 'Пауза') : (isUz ? 'Ijro' : 'Воспроизведение')}
            className="px-3 py-2 min-h-[40px] rounded-lg bg-muted/80 hover:bg-muted focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring flex items-center gap-1.5 text-xs font-semibold"
          >
            {isPlaying ? (
              <>
                <Pause className="size-4 text-primary" />
                <span>{isUz ? 'Pauza' : 'Пауза'}</span>
              </>
            ) : (
              <>
                <Play className="size-4 text-primary" />
                <span>{isUz ? 'Ijro' : 'Пуск'}</span>
              </>
            )}
          </button>
        </div>
        <div className="text-xs font-semibold text-muted-foreground px-2">
          {currentSlide + 1} / {slides.length}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 23. Stats Counter Block
// ---------------------------------------------------------------------------
export function StatsCounterBlock({
  block,
  isUz,
}: {
  block: PageBlock;
  isUz: boolean;
}): JSX.Element {
  const { isEditable, effectiveViewport, onUpdateBlockConfig } = useInlineEdit();
  const cfg = block.config as StatsCounterBlockConfig;
  const title = isUz ? cfg.titleUz || cfg.titleRu : cfg.titleRu || cfg.titleUz;
  const stats = cfg.stats || [];
  const count = stats.length;

  const gridConfig = getResponsiveGridConfig(count, cfg.columns || 4, effectiveViewport, 160);

  const updateStat = (statId: string, patch: Partial<(typeof stats)[0]>) => {
    const updated = stats.map((s) => (s.id === statId ? { ...s, ...patch } : s));
    onUpdateBlockConfig?.(block.id, { stats: updated });
  };

  const deleteStat = (statId: string) => {
    const updated = stats.filter((s) => s.id !== statId);
    onUpdateBlockConfig?.(block.id, { stats: updated });
  };

  const addStat = () => {
    const newStat = {
      id: `stat-${Date.now()}`,
      value: '100+',
      labelUz: isUz ? 'Yangi koʻrsatkich' : 'Новый показатель',
      labelRu: 'Новый показатель',
      descriptionUz: isUz ? 'Qisqa tavsif' : 'Краткое описание',
      descriptionRu: 'Краткое описание',
      icon: 'Award',
    };
    onUpdateBlockConfig?.(block.id, { stats: [...stats, newStat] });
  };

  return (
    <div className="w-full space-y-4 my-6">
      {title && (
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground border-b border-border pb-2.5">
          <EditableText
            value={title}
            placeholder={isUz ? 'Koʻrsatkichlar sarlavhasi...' : 'Заголовок показателей...'}
            onChange={(val) =>
              onUpdateBlockConfig?.(block.id, isUz ? { titleUz: val } : { titleRu: val })
            }
          />
        </h3>
      )}
      <div className={gridConfig.className} style={gridConfig.style}>
        {stats.map((stat) => {
          const label = isUz ? stat.labelUz || stat.labelRu : stat.labelRu || stat.labelUz;
          const desc = isUz ? stat.descriptionUz || stat.descriptionRu : stat.descriptionRu || stat.descriptionUz;

          return (
            <div
              key={stat.id}
              className="p-5 sm:p-6 rounded-2xl border border-border bg-card shadow-xs flex flex-col justify-between relative group/stat"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-primary">
                  <EditableText
                    value={stat.value}
                    placeholder="100+"
                    onChange={(val) => updateStat(stat.id, { value: val })}
                  />
                </span>
                <div className="flex items-center gap-1.5">
                  {stat.icon && (
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      {getLucideIcon(stat.icon, 'size-5')}
                    </div>
                  )}
                  {isEditable && (
                    <button
                      type="button"
                      title={isUz ? 'Koʻrsatkichni oʻchirish' : 'Удалить показатель'}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteStat(stat.id);
                      }}
                      className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors pointer-events-auto"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <div>
                <EditableText
                  as="h4"
                  value={label}
                  placeholder={isUz ? 'Nomi...' : 'Название...'}
                  onChange={(val) =>
                    updateStat(stat.id, isUz ? { labelUz: val } : { labelRu: val })
                  }
                  className="font-bold text-sm sm:text-base text-foreground block"
                />
                <EditableText
                  as="p"
                  value={desc}
                  placeholder={isUz ? 'Tavsif...' : 'Описание...'}
                  onChange={(val) =>
                    updateStat(stat.id, isUz ? { descriptionUz: val } : { descriptionRu: val })
                  }
                  className="text-xs text-muted-foreground mt-1 line-clamp-2 block"
                />
              </div>
            </div>
          );
        })}
      </div>

      {isEditable && (
        <div className="pt-1">
          <button
            type="button"
            onClick={addStat}
            className="text-xs font-medium text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors pointer-events-auto"
          >
            <Plus className="size-3.5" />
            <span>{isUz ? 'Koʻrsatkich qoʻshish' : 'Добавить показатель'}</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 24. Timeline Block
// ---------------------------------------------------------------------------
export function TimelineBlock({
  block,
  isUz,
}: {
  block: PageBlock;
  isUz: boolean;
}): JSX.Element {
  const { isEditable, onUpdateBlockConfig } = useInlineEdit();
  const cfg = block.config as TimelineBlockConfig;
  const title = isUz ? cfg.titleUz || cfg.titleRu : cfg.titleRu || cfg.titleUz;
  const items = cfg.items || [];

  const updateItem = (itemId: string, patch: Partial<(typeof items)[0]>) => {
    const updated = items.map((it) => (it.id === itemId ? { ...it, ...patch } : it));
    onUpdateBlockConfig?.(block.id, { items: updated });
  };

  const deleteItem = (itemId: string) => {
    const updated = items.filter((it) => it.id !== itemId);
    onUpdateBlockConfig?.(block.id, { items: updated });
  };

  const addItem = () => {
    const newItem = {
      id: `time-${Date.now()}`,
      dateOrYear: '2026',
      titleUz: isUz ? 'Yangi voqea' : 'Новое событие',
      titleRu: 'Новое событие',
      descriptionUz: isUz ? 'Voqea tavsifi' : 'Описание события',
      descriptionRu: 'Описание события',
    };
    onUpdateBlockConfig?.(block.id, { items: [...items, newItem] });
  };

  return (
    <div className="w-full space-y-6 my-6">
      {title && (
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground border-b border-border pb-2.5">
          <EditableText
            value={title}
            placeholder={isUz ? 'Vaqt shkalasi sarlavhasi...' : 'Заголовок таймлайна...'}
            onChange={(val) =>
              onUpdateBlockConfig?.(block.id, isUz ? { titleUz: val } : { titleRu: val })
            }
          />
        </h3>
      )}
      <div className="relative border-l-2 border-primary/30 ml-4 sm:ml-6 pl-6 sm:pl-8 space-y-8">
        {items.map((item) => {
          const itemTitle = isUz ? item.titleUz || item.titleRu : item.titleRu || item.titleUz;
          const itemDesc = isUz ? item.descriptionUz || item.descriptionRu : item.descriptionRu || item.descriptionUz;
          const badge = isUz ? item.badgeUz || item.badgeRu : item.badgeRu || item.badgeUz;

          return (
            <div key={item.id} className="relative group">
              {/* Bullet Node */}
              <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 size-4 rounded-full bg-primary border-4 border-background group-hover:scale-125 transition-transform" />
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm sm:text-base text-primary">
                    <EditableText
                      value={item.dateOrYear}
                      placeholder="2026"
                      onChange={(val) => updateItem(item.id, { dateOrYear: val })}
                    />
                  </span>
                  {(badge || isEditable) && (
                    <Badge variant="outline" className="text-xs">
                      <EditableText
                        value={badge}
                        placeholder={isUz ? 'Nishon...' : 'Бейдж...'}
                        onChange={(val) =>
                          updateItem(item.id, isUz ? { badgeUz: val } : { badgeRu: val })
                        }
                      />
                    </Badge>
                  )}
                </div>
                {isEditable && (
                  <button
                    type="button"
                    title={isUz ? 'Voqeani oʻchirish' : 'Удалить событие'}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteItem(item.id);
                    }}
                    className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors pointer-events-auto"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                )}
              </div>
              <h4 className="font-bold text-base sm:text-lg text-foreground">
                <EditableText
                  value={itemTitle}
                  placeholder={isUz ? 'Voqea nomi...' : 'Название события...'}
                  onChange={(val) =>
                    updateItem(item.id, isUz ? { titleUz: val } : { titleRu: val })
                  }
                />
              </h4>
              <div className="mt-1 text-sm text-muted-foreground leading-relaxed max-w-3xl">
                <EditableText
                  multiline
                  value={itemDesc}
                  placeholder={isUz ? 'Voqea tavsifi...' : 'Описание события...'}
                  onChange={(val) =>
                    updateItem(item.id, isUz ? { descriptionUz: val } : { descriptionRu: val })
                  }
                />
              </div>
            </div>
          );
        })}
      </div>

      {isEditable && (
        <div className="pt-1">
          <button
            type="button"
            onClick={addItem}
            className="text-xs font-medium text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors pointer-events-auto"
          >
            <Plus className="size-3.5" />
            <span>{isUz ? 'Voqea qoʻshish' : 'Добавить событие'}</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 25. Documents List Block (Enhanced with search & categories)
// ---------------------------------------------------------------------------
export function DocumentsListBlock({
  block,
  isUz,
}: {
  block: PageBlock;
  isUz: boolean;
}): JSX.Element {
  const cfg = block.config as DocumentsListBlockConfig;
  const title = isUz ? cfg.titleUz || cfg.titleRu : cfg.titleRu || cfg.titleUz;
  const subtitle = isUz ? cfg.subtitleUz || cfg.subtitleRu : cfg.subtitleRu || cfg.subtitleUz;
  const docs = cfg.documents || [];
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = docs.filter((doc) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const docTitle = (isUz ? doc.titleUz || doc.titleRu : doc.titleRu || doc.titleUz).toLowerCase();
    const num = (doc.documentNumber || '').toLowerCase();
    return docTitle.includes(term) || num.includes(term);
  });

  return (
    <div className="w-full space-y-4 my-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {title || (isUz ? 'Rasmiy hujjatlar roʻyxati' : 'Реестр документов')}
          </h3>
          {subtitle && <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        {cfg.enableSearch && (
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isUz ? 'Hujjatlarni qidirish...' : 'Поиск документов...'}
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-lg border border-input bg-background focus:outline-hidden focus:ring-2 focus:ring-ring"
            />
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground text-sm border border-dashed rounded-xl">
          {isUz ? 'Hujjatlar topilmadi' : 'Документы не найдены'}
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((doc) => {
            const docTitle = isUz ? doc.titleUz || doc.titleRu : doc.titleRu || doc.titleUz;
            const category = isUz ? doc.categoryUz || doc.categoryRu : doc.categoryRu || doc.categoryUz;
            const sizeStr = doc.fileSizeBytes
              ? `${(doc.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB`
              : 'PDF';

            return (
              <div
                key={doc.id}
                className="p-3.5 sm:p-4 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors flex items-center justify-between gap-4 shadow-xs"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
                    <FileText className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm sm:text-base text-foreground truncate">{docTitle}</h4>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                      {doc.documentNumber && (
                        <span className="font-mono bg-muted px-1.5 py-0.5 rounded">
                          {doc.documentNumber}
                        </span>
                      )}
                      {doc.issueDate && <span>{doc.issueDate}</span>}
                      {category && <Badge variant="secondary" className="text-[10px]">{category}</Badge>}
                      <span>{sizeStr}</span>
                    </div>
                  </div>
                </div>
                <a
                  href={doc.fileUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 shrink-0"
                >
                  <Download className="size-3.5" />
                  <span className="hidden sm:inline">{isUz ? 'Yuklab olish' : 'Скачать'}</span>
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 26. Staff Cards Block
// ---------------------------------------------------------------------------
export function StaffCardsBlock({
  block,
  isUz,
}: {
  block: PageBlock;
  isUz: boolean;
}): JSX.Element {
  const { effectiveViewport } = useInlineEdit();
  const cfg = block.config as StaffCardsBlockConfig;
  const title = isUz ? cfg.titleUz || cfg.titleRu : cfg.titleRu || cfg.titleUz;
  const [staff, setStaff] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    apiClient
      .getTeachers()
      .then((res) => {
        if (!isMounted) return;
        let list: Teacher[] = res?.items || [];
        if (cfg.departmentId) {
          list = list.filter((t) => t.departmentId === cfg.departmentId);
        }
        setStaff(list.slice(0, cfg.limit || 8));
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [cfg.departmentId, cfg.limit]);

  const gridConfig = getResponsiveGridConfig(staff.length, 4, effectiveViewport, 220);

  return (
    <div className="w-full space-y-4 my-6">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Users className="size-5 text-primary" />
          <span>{title || (isUz ? 'Pedagoglar va mutaxassislar' : 'Педагогический состав')}</span>
        </h3>
        <Link
          href="/teachers"
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
        >
          <span>{isUz ? 'Barcha pedagoglar' : 'Все преподаватели'}</span>
          <ChevronRight className="size-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="py-8 flex items-center justify-center text-muted-foreground">
          <Loader2 className="size-6 animate-spin text-primary mr-2" />
          <span className="text-sm">{isUz ? 'Yuklanmoqda...' : 'Загрузка...'}</span>
        </div>
      ) : staff.length === 0 ? (
        <div className="p-6 text-center text-muted-foreground text-sm border border-dashed rounded-xl">
          {isUz ? 'Xodimlar topilmadi' : 'Сотрудники не найдены'}
        </div>
      ) : (
        <div className={gridConfig.className} style={gridConfig.style}>
          {staff.map((teacher) => (
            <Link
              key={teacher.id}
              href={`/teachers/${teacher.slug}`}
              className="p-4 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors flex flex-col items-center text-center shadow-xs group"
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

// ---------------------------------------------------------------------------
// 27. Specialties Feed Block
// ---------------------------------------------------------------------------
export function SpecialtiesFeedBlock({
  block,
  isUz,
}: {
  block: PageBlock;
  isUz: boolean;
}): JSX.Element {
  const { effectiveViewport } = useInlineEdit();
  const cfg = block.config as SpecialtiesFeedBlockConfig;
  const title = isUz ? cfg.titleUz || cfg.titleRu : cfg.titleRu || cfg.titleUz;
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    apiClient
      .getSpecialties()
      .then((res) => {
        if (!isMounted) return;
        const list: Specialty[] = Array.isArray(res) ? res : res?.items || [];
        setSpecialties(list.slice(0, cfg.limit || 6));
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [cfg.limit]);

  const gridConfig = getResponsiveGridConfig(specialties.length, 3, effectiveViewport, 260);

  return (
    <div className="w-full space-y-4 my-6">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <GraduationCap className="size-5 text-primary" />
          <span>{title || (isUz ? 'Taʼlim yoʻnalishlari va kasblar' : 'Направления подготовки')}</span>
        </h3>
        <Link
          href="/specialties"
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
        >
          <span>{isUz ? 'Barcha yoʻnalishlar' : 'Все специальности'}</span>
          <ChevronRight className="size-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="py-8 flex items-center justify-center text-muted-foreground">
          <Loader2 className="size-6 animate-spin text-primary mr-2" />
          <span className="text-sm">{isUz ? 'Yuklanmoqda...' : 'Загрузка...'}</span>
        </div>
      ) : specialties.length === 0 ? (
        <div className="p-6 text-center text-muted-foreground text-sm border border-dashed rounded-xl">
          {isUz ? 'Yoʻnalishlar topilmadi' : 'Специальности не найдены'}
        </div>
      ) : (
        <div className={gridConfig.className} style={gridConfig.style}>
          {specialties.map((spec) => (
            <Link
              key={spec.id}
              href={`/specialties/${spec.slug}`}
              className="p-5 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors flex flex-col justify-between shadow-xs group"
            >
              <div>
                <span className="font-mono text-xs text-primary font-bold bg-primary/10 px-2 py-0.5 rounded">
                  {spec.code}
                </span>
                <h4 className="font-bold text-base text-foreground mt-2 group-hover:text-primary transition-colors line-clamp-2">
                  {spec.name}
                </h4>
                {spec.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-3">
                    {spec.description}
                  </p>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-border/50 text-xs font-semibold text-primary flex items-center justify-between">
                <span>{spec.durationText || (isUz ? '2 yil taʼlim' : '2 года обучения')}</span>
                <ArrowRight className="size-3.5" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 28. Events Feed Block
// ---------------------------------------------------------------------------
export function EventsFeedBlock({
  block,
  isUz,
}: {
  block: PageBlock;
  isUz: boolean;
}): JSX.Element {
  const cfg = block.config as EventsFeedBlockConfig;
  const title = isUz ? cfg.titleUz || cfg.titleRu : cfg.titleRu || cfg.titleUz;
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    apiClient
      .getEvents()
      .then((res) => {
        if (!isMounted) return;
        const list: EventItem[] = res?.items || (Array.isArray(res) ? res : []);
        setEvents(list.slice(0, cfg.limit || 4));
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [cfg.limit]);

  return (
    <div className="w-full space-y-4 my-6">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Calendar className="size-5 text-primary" />
          <span>{title || (isUz ? 'Boʻlajak tadbirlar' : 'Мероприятия')}</span>
        </h3>
        <Link
          href="/events"
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
        >
          <span>{isUz ? 'Barcha tadbirlar' : 'Все события'}</span>
          <ChevronRight className="size-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="py-8 flex items-center justify-center text-muted-foreground">
          <Loader2 className="size-6 animate-spin text-primary mr-2" />
          <span className="text-sm">{isUz ? 'Yuklanmoqda...' : 'Загрузка...'}</span>
        </div>
      ) : events.length === 0 ? (
        <div className="p-6 text-center text-muted-foreground text-sm border border-dashed rounded-xl">
          {isUz ? 'Tadbirlar topilmadi' : 'События не найдены'}
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const dateObj = new Date(event.eventDate);
            const day = dateObj.getDate();
            const month = dateObj.toLocaleDateString(isUz ? 'uz-UZ' : 'ru-RU', { month: 'short' });

            return (
              <Link
                key={event.id}
                href={`/events/${event.slug}`}
                className="p-3.5 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors flex items-center gap-4 shadow-xs group"
              >
                <div className="size-14 rounded-xl bg-primary/10 border border-primary/20 flex flex-col items-center justify-center shrink-0">
                  <span className="text-lg font-black text-primary leading-none">{day}</span>
                  <span className="text-[10px] font-bold uppercase text-primary/80 mt-0.5">{month}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {event.title}
                  </h4>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="size-3 shrink-0" />
                      {event.location}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 29. Schedule Widget Block
// ---------------------------------------------------------------------------
export function ScheduleWidgetBlock({
  block,
  isUz,
}: {
  block: PageBlock;
  isUz: boolean;
}): JSX.Element {
  const cfg = block.config as ScheduleWidgetBlockConfig;
  const title = isUz ? cfg.titleUz || cfg.titleRu : cfg.titleRu || cfg.titleUz;
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState(cfg.defaultGroupName || 'DASTUR-21');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    apiClient
      .getScheduleGroups()
      .then((gList) => {
        if (!isMounted) return;
        if (Array.isArray(gList) && gList.length > 0) {
          setGroups(gList);
          if (!selectedGroup) setSelectedGroup(gList[0]!);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [selectedGroup]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    apiClient
      .getSchedule({ groupName: selectedGroup })
      .then((res) => {
        if (!isMounted) return;
        const list: ScheduleItem[] = Array.isArray(res) ? (res as ScheduleItem[]) : [];
        setSchedule(list);
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedGroup]);

  const daysUz = ['', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
  const daysRu = ['', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

  return (
    <div className="w-full space-y-4 my-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Clock className="size-5 text-primary" />
          <span>{title || (isUz ? 'Darslar jadvali' : 'Расписание занятий')}</span>
        </h3>
        {groups.length > 0 && (
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg border border-input bg-card focus:outline-hidden focus:ring-2 focus:ring-ring"
          >
            {groups.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <div className="py-8 flex items-center justify-center text-muted-foreground">
          <Loader2 className="size-6 animate-spin text-primary mr-2" />
          <span className="text-sm">{isUz ? 'Yuklanmoqda...' : 'Загрузка...'}</span>
        </div>
      ) : schedule.length === 0 ? (
        <div className="p-6 text-center text-muted-foreground text-sm border border-dashed rounded-xl">
          {isUz ? 'Dars jadvali kiritilmagan' : 'Расписание не найдено'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((dayNum) => {
            const dayLessons = schedule
              .filter((s) => s.dayOfWeek === dayNum)
              .sort((a, b) => a.lessonNumber - b.lessonNumber);

            if (dayLessons.length === 0) return null;

            return (
              <div key={dayNum} className="p-4 rounded-xl border border-border bg-card shadow-xs">
                <h4 className="font-bold text-sm text-primary border-b border-border/60 pb-2 mb-3">
                  {isUz ? daysUz[dayNum] : daysRu[dayNum]}
                </h4>
                <div className="space-y-2">
                  {dayLessons.map((l) => (
                    <div key={l.id} className="text-xs flex items-start gap-2">
                      <span className="font-mono font-bold bg-muted px-1.5 py-0.5 rounded text-[11px] shrink-0">
                        {l.lessonNumber}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">{l.subject}</p>
                        <p className="text-muted-foreground text-[11px]">{l.classroom} • {l.timeStart}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 30. Anchor Nav Block (Table of Contents)
// ---------------------------------------------------------------------------
export function AnchorNavBlock({
  block,
  isUz,
}: {
  block: PageBlock;
  isUz: boolean;
}): JSX.Element {
  const cfg = block.config as AnchorNavBlockConfig;
  const title = isUz ? cfg.titleUz || cfg.titleRu : cfg.titleRu || cfg.titleUz;
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const elements = document.querySelectorAll('h2, h3');
    const items: { id: string; text: string; level: number }[] = [];
    elements.forEach((el, idx) => {
      const text = el.textContent || '';
      if (!text.trim() || el.closest('[role="dialog"]')) return;
      let id = el.id;
      if (!id) {
        id = `heading-${idx}`;
        el.id = id;
      }
      items.push({
        id,
        text,
        level: el.tagName.toLowerCase() === 'h2' ? 2 : 3,
      });
    });
    setHeadings(items);
  }, []);

  if (headings.length === 0) return <div />;

  return (
    <nav
      aria-label={title || (isUz ? 'Mundarija' : 'Оглавление')}
      className="w-full p-4 sm:p-5 rounded-xl border border-border bg-card shadow-xs my-4"
    >
      <h4 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
        <FolderTree className="size-4 text-primary" />
        <span>{title || (isUz ? 'Sahifa mundarijasi' : 'Оглавление страницы')}</span>
      </h4>
      <ul className="space-y-1.5 text-xs sm:text-sm">
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? 'pl-4' : ''}>
            <a
              href={`#${h.id}`}
              className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 py-0.5"
            >
              <span className="size-1.5 rounded-full bg-primary/40 shrink-0" />
              <span className="truncate">{h.text}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// 31. Social Links Block
// ---------------------------------------------------------------------------
export function SocialLinksBlock({
  block,
  isUz,
}: {
  block: PageBlock;
  isUz: boolean;
}): JSX.Element {
  const cfg = block.config as SocialLinksBlockConfig;
  const title = isUz ? cfg.titleUz || cfg.titleRu : cfg.titleRu || cfg.titleUz;
  const links = cfg.links || [];

  return (
    <div className="w-full space-y-3 my-4">
      {title && <h4 className="font-bold text-base text-foreground">{title}</h4>}
      <div className="flex flex-wrap gap-2.5">
        {links.map((link) => {
          const label = isUz ? link.titleUz || link.titleRu : link.titleRu || link.titleUz;
          return (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl border border-border bg-card hover:bg-primary hover:text-primary-foreground transition-all text-xs font-bold flex items-center gap-2 shadow-xs"
            >
              <Share2 className="size-3.5" />
              <span>{label}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 32. Map Embed Block (OpenStreetMap verified in UZ_COMPLIANCE.md)
// ---------------------------------------------------------------------------
export function MapEmbedBlock({
  block,
  isUz,
}: {
  block: PageBlock;
  isUz: boolean;
}): JSX.Element {
  const cfg = block.config as MapEmbedBlockConfig;
  const title = isUz ? cfg.titleUz || cfg.titleRu : cfg.titleRu || cfg.titleUz;
  const lat = cfg.latitude || 40.3864;
  const lon = cfg.longitude || 71.7864;
  const height = cfg.height || 360;

  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.006}%2C${lat - 0.004}%2C${lon + 0.006}%2C${lat + 0.004}&layer=mapnik&marker=${lat}%2C${lon}`;

  return (
    <div className="w-full space-y-2 my-6">
      {title && (
        <h4 className="font-bold text-base sm:text-lg text-foreground flex items-center gap-2">
          <MapPin className="size-4 text-primary" />
          <span>{title}</span>
        </h4>
      )}
      <div
        className="w-full rounded-2xl overflow-hidden border border-border shadow-md bg-muted"
        style={{ height: `${height}px` }}
      >
        <iframe
          src={osmUrl}
          title={title || (isUz ? 'Kollej joylashuvi xaritasi' : 'Карта расположения колледжа')}
          className="w-full h-full border-0"
          loading="lazy"
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 33. Reusable Block Reference
// ---------------------------------------------------------------------------
export function ReusableRefBlock({
  block,
  isUz,
}: {
  block: PageBlock;
  isUz: boolean;
}): JSX.Element {
  const cfg = block.config as ReusableRefBlockConfig;
  const [reusable, setReusable] = useState<ReusableBlock | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (!cfg.reusableBlockId) {
      setLoading(false);
      return;
    }
    apiClient
      .getPublicReusableBlockById(cfg.reusableBlockId)
      .then((data) => {
        if (!isMounted) return;
        setReusable(data);
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [cfg.reusableBlockId]);

  if (loading) {
    return (
      <div className="py-6 flex items-center justify-center text-muted-foreground text-xs">
        <Loader2 className="size-4 animate-spin mr-2" />
        <span>{isUz ? 'Blok yuklanmoqda...' : 'Загрузка блока...'}</span>
      </div>
    );
  }

  if (!reusable || !reusable.rowData) {
    return (
      <div className="p-4 rounded-xl border border-dashed text-xs text-muted-foreground text-center">
        {isUz ? 'Global blok topilmadi' : 'Глобальный блок не найден'}
      </div>
    );
  }

  // Renders the resolved row data directly
  return (
    <div className="w-full border-l-2 border-primary/40 pl-2 my-2">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        {(reusable.rowData.cells || []).map((cell) => {
          const visibleBlocks = (cell.blocks || []).filter((b) => b.isVisible);
          return (
            <div key={cell.id} className="col-span-12 space-y-4">
              {visibleBlocks.map((b) => (
                <div key={b.id} className="w-full">
                  {/* Reusable blocks render self-contained blocks */}
                  {b.type === 'banner_alert' && <BannerAlertBlock block={b} isUz={isUz} />}
                  {b.type === 'stats_counter' && <StatsCounterBlock block={b} isUz={isUz} />}
                  {b.type === 'call_to_action' && <CallToActionBlock block={b} isUz={isUz} />}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
