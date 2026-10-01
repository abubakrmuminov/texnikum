export type PageBlockType =
  | 'heading'
  | 'rich_text'
  | 'image'
  | 'gallery'
  | 'file_list'
  | 'table'
  | 'accordion'
  | 'button'
  | 'columns'
  | 'video_embed'
  | 'contact_card'
  | 'divider'
  | 'latest_news_list'
  | 'teachers_list'
  // Layout & Containers
  | 'cards_grid'
  | 'tabs'
  // Hero & Banners
  | 'hero'
  | 'banner_alert'
  | 'call_to_action'
  | 'quote'
  // Content & Media
  | 'image_text'
  | 'image_carousel'
  // Academic & Dynamic Data
  | 'stats_counter'
  | 'timeline'
  | 'documents_list'
  | 'staff_cards'
  | 'specialties_feed'
  | 'events_feed'
  | 'schedule_widget'
  // Navigation & Utilities
  | 'anchor_nav'
  | 'social_links'
  | 'map_embed'
  // Reusable
  | 'reusable_ref';

export const ALLOWED_BLOCK_TYPES: PageBlockType[] = [
  'heading',
  'rich_text',
  'image',
  'gallery',
  'file_list',
  'table',
  'accordion',
  'button',
  'columns',
  'video_embed',
  'contact_card',
  'divider',
  'latest_news_list',
  'teachers_list',
  'cards_grid',
  'tabs',
  'hero',
  'banner_alert',
  'call_to_action',
  'quote',
  'image_text',
  'image_carousel',
  'stats_counter',
  'timeline',
  'documents_list',
  'staff_cards',
  'specialties_feed',
  'events_feed',
  'schedule_widget',
  'anchor_nav',
  'social_links',
  'map_embed',
  'reusable_ref',
];

export const ALLOWED_VIDEO_DOMAINS = [
  'youtube.com',
  'www.youtube.com',
  'youtu.be',
  'vimeo.com',
  'www.vimeo.com',
  'player.vimeo.com',
  'mover.uz',
  'www.mover.uz',
];

export function isAllowedVideoUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    const hostname = parsed.hostname.toLowerCase();
    return ALLOWED_VIDEO_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
    );
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// BLOCK CONFIG INTERFACES
// ---------------------------------------------------------------------------

// 1. Heading
export interface HeadingBlockConfig {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  textUz: string;
  textRu: string;
  align?: 'left' | 'center' | 'right';
}

// 2. Rich Text
export interface RichTextBlockConfig {
  contentUzHtml: string;
  contentRuHtml: string;
  containerWidth?: 'prose' | 'wide' | 'full';
}

// 3. Image
export interface ImageBlockConfig {
  url: string;
  altTextUz?: string;
  altTextRu?: string;
  captionUz?: string;
  captionRu?: string;
  isDecorative?: boolean;
  aspectRatio?: '16:9' | '4:3' | '1:1' | 'auto';
}

// 4. Gallery
export interface GalleryItem {
  id: string;
  url: string;
  altTextUz?: string;
  altTextRu?: string;
  captionUz?: string;
  captionRu?: string;
}

export interface GalleryBlockConfig {
  items: GalleryItem[];
  columns?: 2 | 3 | 4;
  enableLightbox?: boolean;
}

// 5. File / Document List (Legacy & simple)
export interface DocumentItem {
  id: string;
  titleUz: string;
  titleRu: string;
  documentNumber?: string;
  issueDate?: string;
  fileUrl: string;
  fileSizeBytes?: number;
  fileFormat?: string;
}

export interface FileListBlockConfig {
  titleUz?: string;
  titleRu?: string;
  documents: DocumentItem[];
}

// 6. Table
export interface TableBlockConfig {
  captionUz?: string;
  captionRu?: string;
  headersUz: string[];
  headersRu: string[];
  rowsUz: string[][];
  rowsRu: string[][];
}

// 7. Accordion
export interface AccordionItem {
  id: string;
  questionUz: string;
  questionRu: string;
  answerUzHtml: string;
  answerRuHtml: string;
}

export interface AccordionBlockConfig {
  titleUz?: string;
  titleRu?: string;
  allowMultiple?: boolean;
  items: AccordionItem[];
}

// 8. Button / Link
export interface ButtonBlockConfig {
  textUz: string;
  textRu: string;
  url: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  openInNewTab?: boolean;
  align?: 'left' | 'center' | 'right';
}

// 9. Columns
export interface ColumnContent {
  id: string;
  titleUz?: string;
  titleRu?: string;
  contentUzHtml?: string;
  contentRuHtml?: string;
  imageUrl?: string;
}

export interface ColumnsBlockConfig {
  columns: 2 | 3;
  items: ColumnContent[];
}

// 10. Video Embed
export interface VideoEmbedBlockConfig {
  url: string;
  titleUz?: string;
  titleRu?: string;
  aspectRatio?: '16:9' | '4:3';
}

// 11. Contact Card
export interface ContactCardBlockConfig {
  titleUz?: string;
  titleRu?: string;
  addressUz?: string;
  addressRu?: string;
  phone?: string;
  email?: string;
  workHoursUz?: string;
  workHoursRu?: string;
  showMap?: boolean;
  latitude?: number;
  longitude?: number;
}

// 12. Divider
export interface DividerBlockConfig {
  style?: 'solid' | 'dashed' | 'dotted';
  spacing?: 'small' | 'medium' | 'large';
}

// 13. Latest News List
export interface LatestNewsListBlockConfig {
  titleUz?: string;
  titleRu?: string;
  limit: number; // 1-12
  showCover?: boolean;
  categoryId?: string | null;
}

// 14. Teachers List
export interface TeachersListBlockConfig {
  titleUz?: string;
  titleRu?: string;
  limit: number; // 1-20
  departmentId?: string | null;
  category?: string | null;
}

// 15. Cards Grid (Layout & Containers)
export interface CardItem {
  id: string;
  titleUz: string;
  titleRu: string;
  descriptionUz?: string;
  descriptionRu?: string;
  icon?: string;
  badgeUz?: string;
  badgeRu?: string;
  linkUrl?: string;
  linkTextUz?: string;
  linkTextRu?: string;
}

export interface CardsGridBlockConfig {
  titleUz?: string;
  titleRu?: string;
  columns?: 2 | 3 | 4;
  cards: CardItem[];
}

// 16. Tabs (Accessible with keyboard ARIA)
export interface TabItem {
  id: string;
  labelUz: string;
  labelRu: string;
  contentUzHtml: string;
  contentRuHtml: string;
  icon?: string;
}

export interface TabsBlockConfig {
  titleUz?: string;
  titleRu?: string;
  defaultActiveIndex?: number;
  items: TabItem[];
}

// 17. Hero (Hero & Banners)
export interface HeroBlockConfig {
  badgeUz?: string;
  badgeRu?: string;
  titleUz: string;
  titleRu: string;
  subtitleUz?: string;
  subtitleRu?: string;
  primaryActionTextUz?: string;
  primaryActionTextRu?: string;
  primaryActionUrl?: string;
  secondaryActionTextUz?: string;
  secondaryActionTextRu?: string;
  secondaryActionUrl?: string;
  imageUrl?: string;
  imageAltUz?: string;
  imageAltRu?: string;
  align?: 'left' | 'center';
  backgroundVariant?: 'none' | 'brand' | 'subtle' | 'dark';
}

// 18. Banner Alert
export interface BannerAlertBlockConfig {
  variant: 'info' | 'warning' | 'success' | 'destructive';
  titleUz: string;
  titleRu: string;
  messageUz?: string;
  messageRu?: string;
  actionTextUz?: string;
  actionTextRu?: string;
  actionUrl?: string;
  isDismissible?: boolean;
}

// 19. Call To Action (CTA)
export interface CallToActionBlockConfig {
  badgeUz?: string;
  badgeRu?: string;
  titleUz: string;
  titleRu: string;
  descriptionUz?: string;
  descriptionRu?: string;
  primaryButtonTextUz: string;
  primaryButtonTextRu: string;
  primaryButtonUrl: string;
  secondaryButtonTextUz?: string;
  secondaryButtonTextRu?: string;
  secondaryButtonUrl?: string;
  cardStyle?: 'gradient' | 'outlined' | 'solid';
}

// 20. Quote
export interface QuoteBlockConfig {
  quoteTextUz: string;
  quoteTextRu: string;
  authorUz: string;
  authorRu: string;
  roleUz?: string;
  roleRu?: string;
  avatarUrl?: string;
}

// 21. Image + Text
export interface ImageTextBlockConfig {
  titleUz?: string;
  titleRu?: string;
  contentUzHtml: string;
  contentRuHtml: string;
  imageUrl: string;
  imageAltUz?: string;
  imageAltRu?: string;
  imagePosition: 'left' | 'right';
  badgeUz?: string;
  badgeRu?: string;
  actionTextUz?: string;
  actionTextRu?: string;
  actionUrl?: string;
}

// 22. Image Carousel (WCAG 2.2.2 compliant: pause control, no auto-advance)
export interface CarouselSlide {
  id: string;
  imageUrl: string;
  altTextUz: string;
  altTextRu: string;
  captionUz?: string;
  captionRu?: string;
}

export interface ImageCarouselBlockConfig {
  titleUz?: string;
  titleRu?: string;
  slides: CarouselSlide[];
  aspectRatio?: '16:9' | '4:3' | '21:9';
  hasPauseControl: boolean;
  autoAdvance?: boolean;
  intervalSeconds?: number;
}

// 23. Stats Counter
export interface StatItem {
  id: string;
  value: string;
  labelUz: string;
  labelRu: string;
  descriptionUz?: string;
  descriptionRu?: string;
  icon?: string;
}

export interface StatsCounterBlockConfig {
  titleUz?: string;
  titleRu?: string;
  columns?: 2 | 3 | 4;
  stats: StatItem[];
}

// 24. Timeline
export interface TimelineItem {
  id: string;
  dateOrYear: string;
  titleUz: string;
  titleRu: string;
  descriptionUz?: string;
  descriptionRu?: string;
  badgeUz?: string;
  badgeRu?: string;
}

export interface TimelineBlockConfig {
  titleUz?: string;
  titleRu?: string;
  items: TimelineItem[];
}

// 25. Documents List (Enhanced with categories and search)
export interface DocumentListItem {
  id: string;
  titleUz: string;
  titleRu: string;
  documentNumber?: string;
  issueDate?: string;
  fileUrl: string;
  fileType?: 'pdf' | 'doc' | 'docx' | 'xls' | 'xlsx' | 'zip' | 'other';
  fileSizeBytes?: number;
  categoryUz?: string;
  categoryRu?: string;
}

export interface DocumentsListBlockConfig {
  titleUz?: string;
  titleRu?: string;
  subtitleUz?: string;
  subtitleRu?: string;
  enableSearch?: boolean;
  documents: DocumentListItem[];
}

// 26. Staff Cards (Enhanced Teachers/Masters catalog)
export interface StaffCardsBlockConfig {
  titleUz?: string;
  titleRu?: string;
  subtitleUz?: string;
  subtitleRu?: string;
  category?: 'all' | 'administrative' | 'pedagogical' | 'master';
  departmentId?: string | null;
  limit?: number;
  layout?: 'grid' | 'compact';
}

// 27. Specialties Feed (Dynamic catalog)
export interface SpecialtiesFeedBlockConfig {
  titleUz?: string;
  titleRu?: string;
  subtitleUz?: string;
  subtitleRu?: string;
  limit?: number;
  departmentId?: string | null;
  featuredOnly?: boolean;
}

// 28. Events Feed (Dynamic catalog)
export interface EventsFeedBlockConfig {
  titleUz?: string;
  titleRu?: string;
  subtitleUz?: string;
  subtitleRu?: string;
  limit?: number;
  upcomingOnly?: boolean;
}

// 29. Schedule Widget
export interface ScheduleWidgetBlockConfig {
  titleUz?: string;
  titleRu?: string;
  defaultGroupName?: string;
  showDayTabs?: boolean;
}

// 30. Anchor Nav (Table of Contents)
export interface AnchorNavBlockConfig {
  titleUz?: string;
  titleRu?: string;
  levels?: ('h2' | 'h3')[];
  sticky?: boolean;
}

// 31. Social Links
export interface SocialLinkItem {
  id: string;
  platform: 'telegram' | 'youtube' | 'facebook' | 'instagram' | 'website';
  titleUz: string;
  titleRu: string;
  url: string;
}

export interface SocialLinksBlockConfig {
  titleUz?: string;
  titleRu?: string;
  subtitleUz?: string;
  subtitleRu?: string;
  links: SocialLinkItem[];
}

// 32. Map Embed (OpenStreetMap verified in UZ_COMPLIANCE.md)
export interface MapEmbedBlockConfig {
  titleUz?: string;
  titleRu?: string;
  latitude: number;
  longitude: number;
  zoom?: number;
  addressUz?: string;
  addressRu?: string;
  markerTitleUz?: string;
  markerTitleRu?: string;
  height?: number;
}

// 33. Reusable Block Reference
export interface ReusableRefBlockConfig {
  reusableBlockId: string;
  blockTitle?: string;
  isGlobal?: boolean;
}

// ---------------------------------------------------------------------------
// BLOCK CONFIG MAP & BLOCK MODEL
// ---------------------------------------------------------------------------

export type BlockConfigMap = {
  heading: HeadingBlockConfig;
  rich_text: RichTextBlockConfig;
  image: ImageBlockConfig;
  gallery: GalleryBlockConfig;
  file_list: FileListBlockConfig;
  table: TableBlockConfig;
  accordion: AccordionBlockConfig;
  button: ButtonBlockConfig;
  columns: ColumnsBlockConfig;
  video_embed: VideoEmbedBlockConfig;
  contact_card: ContactCardBlockConfig;
  divider: DividerBlockConfig;
  latest_news_list: LatestNewsListBlockConfig;
  teachers_list: TeachersListBlockConfig;
  // New blocks
  cards_grid: CardsGridBlockConfig;
  tabs: TabsBlockConfig;
  hero: HeroBlockConfig;
  banner_alert: BannerAlertBlockConfig;
  call_to_action: CallToActionBlockConfig;
  quote: QuoteBlockConfig;
  image_text: ImageTextBlockConfig;
  image_carousel: ImageCarouselBlockConfig;
  stats_counter: StatsCounterBlockConfig;
  timeline: TimelineBlockConfig;
  documents_list: DocumentsListBlockConfig;
  staff_cards: StaffCardsBlockConfig;
  specialties_feed: SpecialtiesFeedBlockConfig;
  events_feed: EventsFeedBlockConfig;
  schedule_widget: ScheduleWidgetBlockConfig;
  anchor_nav: AnchorNavBlockConfig;
  social_links: SocialLinksBlockConfig;
  map_embed: MapEmbedBlockConfig;
  reusable_ref: ReusableRefBlockConfig;
};

export interface BlockStyleConfig {
  marginTop?: 'none' | 'small' | 'normal' | 'large';
  marginBottom?: 'none' | 'small' | 'normal' | 'large';
  paddingTop?: 'none' | 'small' | 'normal' | 'large';
  paddingBottom?: 'none' | 'small' | 'normal' | 'large';
  customClass?: string;
  textAlign?: 'left' | 'center' | 'right';
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  // Per-breakpoint overrides
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
  hideOnDesktop?: boolean;
  textAlignMobile?: 'left' | 'center' | 'right';
  textAlignTablet?: 'left' | 'center' | 'right';
  // Focal point and aspect ratio for media
  focalPoint?: { x: number; y: number };
  aspectRatioPreset?: 'original' | '16:9' | '4:3' | '1:1' | '3:4';
}

export interface PageBlock<T extends PageBlockType = PageBlockType> {
  id: string;
  type: T;
  sortOrder: number;
  isVisible: boolean;
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
  hideOnDesktop?: boolean;
  config: BlockConfigMap[T];
  style?: BlockStyleConfig;
}

export interface BlockValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Валидация отдельного блока страницы
 */
export function validatePageBlock(block: unknown): BlockValidationResult {
  if (!block || typeof block !== 'object') {
    return { valid: false, error: 'Блок должен быть объектом' };
  }

  const b = block as Record<string, unknown>;

  if (typeof b.id !== 'string' || !b.id.trim()) {
    return { valid: false, error: 'Поле id блока обязательно и должно быть строкой' };
  }

  if (typeof b.type !== 'string' || !ALLOWED_BLOCK_TYPES.includes(b.type as PageBlockType)) {
    return {
      valid: false,
      error: `Недопустимый тип блока «${b.type}». Разрешенные: ${ALLOWED_BLOCK_TYPES.join(', ')}`,
    };
  }

  if (typeof b.sortOrder !== 'number' || isNaN(b.sortOrder)) {
    return { valid: false, error: 'Поле sortOrder блока должно быть числом' };
  }

  if (typeof b.isVisible !== 'boolean') {
    return { valid: false, error: 'Поле isVisible блока должно быть boolean' };
  }

  if (b.hideOnMobile !== undefined && typeof b.hideOnMobile !== 'boolean') {
    return { valid: false, error: 'Поле hideOnMobile блока должно быть boolean' };
  }
  if (b.hideOnTablet !== undefined && typeof b.hideOnTablet !== 'boolean') {
    return { valid: false, error: 'Поле hideOnTablet блока должно быть boolean' };
  }
  if (b.hideOnDesktop !== undefined && typeof b.hideOnDesktop !== 'boolean') {
    return { valid: false, error: 'Поле hideOnDesktop блока должно быть boolean' };
  }

  if (!b.config || typeof b.config !== 'object' || Array.isArray(b.config)) {
    return { valid: false, error: 'Поле config блока должно быть объектом' };
  }

  const type = b.type as PageBlockType;
  const cfg = b.config as Record<string, unknown>;

  switch (type) {
    case 'heading': {
      if (!cfg.textUz && !cfg.textRu) {
        return { valid: false, error: 'Для блока heading необходим текст хотя бы на одном языке' };
      }
      const lvl = Number(cfg.level);
      if (!lvl || lvl < 1 || lvl > 6) {
        return { valid: false, error: 'Уровень заголовка (level) должен быть от 1 до 6' };
      }
      break;
    }

    case 'rich_text': {
      if (typeof cfg.contentUzHtml !== 'string' && typeof cfg.contentRuHtml !== 'string') {
        return { valid: false, error: 'Для блока rich_text необходим HTML-контент' };
      }
      break;
    }

    case 'image': {
      if (!cfg.url || typeof cfg.url !== 'string') {
        return { valid: false, error: 'Для блока image обязателен url' };
      }
      const isDecorative = Boolean(cfg.isDecorative);
      if (!isDecorative) {
        const altUz = typeof cfg.altTextUz === 'string' ? cfg.altTextUz.trim() : '';
        const altRu = typeof cfg.altTextRu === 'string' ? cfg.altTextRu.trim() : '';
        if (!altUz && !altRu) {
          return {
            valid: false,
            error:
              'Для блока image обязателен alt-текст (altTextUz или altTextRu), если изображение не помечено как декоративное (isDecorative: true)',
          };
        }
      }
      break;
    }

    case 'gallery': {
      if (!Array.isArray(cfg.items)) {
        return { valid: false, error: 'Для блока gallery обязателен массив items' };
      }
      for (let i = 0; i < cfg.items.length; i++) {
        const item = cfg.items[i] as Record<string, unknown>;
        if (!item || !item.url || typeof item.url !== 'string') {
          return { valid: false, error: `В галерее элемент #${i + 1} не содержит корректный url` };
        }
      }
      break;
    }

    case 'file_list': {
      if (!Array.isArray(cfg.documents)) {
        return { valid: false, error: 'Для блока file_list обязателен массив documents' };
      }
      break;
    }

    case 'table': {
      if (!Array.isArray(cfg.rowsUz) && !Array.isArray(cfg.rowsRu)) {
        return { valid: false, error: 'Для блока table необходим массив строк rowsUz или rowsRu' };
      }
      break;
    }

    case 'accordion': {
      if (!Array.isArray(cfg.items)) {
        return { valid: false, error: 'Для блока accordion обязателен массив items' };
      }
      break;
    }

    case 'button': {
      if (!cfg.url || typeof cfg.url !== 'string') {
        return { valid: false, error: 'Для блока button обязателен url' };
      }
      if (!cfg.textUz && !cfg.textRu) {
        return { valid: false, error: 'Для блока button необходим текст на узбекском или русском' };
      }
      break;
    }

    case 'columns': {
      const cols = Number(cfg.columns);
      if (cols !== 2 && cols !== 3) {
        return { valid: false, error: 'Для блока columns допустимо только 2 или 3 колонки' };
      }
      if (!Array.isArray(cfg.items)) {
        return { valid: false, error: 'Для блока columns обязателен массив items' };
      }
      break;
    }

    case 'video_embed': {
      if (!cfg.url || typeof cfg.url !== 'string') {
        return { valid: false, error: 'Для блока video_embed обязателен url' };
      }
      if (!isAllowedVideoUrl(cfg.url)) {
        return {
          valid: false,
          error: `URL видео «${cfg.url}» недопустим. Разрешены только доверенные хостинги: ${ALLOWED_VIDEO_DOMAINS.join(
            ', ',
          )}`,
        };
      }
      break;
    }

    case 'contact_card':
    case 'divider':
      break;

    case 'latest_news_list': {
      const limit = Number(cfg.limit);
      if (!limit || limit < 1 || limit > 12) {
        return { valid: false, error: 'Для блока latest_news_list limit должен быть от 1 до 12' };
      }
      break;
    }

    case 'teachers_list': {
      const limit = Number(cfg.limit);
      if (!limit || limit < 1 || limit > 20) {
        return { valid: false, error: 'Для блока teachers_list limit должен быть от 1 до 20' };
      }
      break;
    }

    case 'cards_grid': {
      if (!Array.isArray(cfg.cards)) {
        return { valid: false, error: 'Для блока cards_grid обязателен массив cards' };
      }
      break;
    }

    case 'tabs': {
      if (!Array.isArray(cfg.items) || cfg.items.length === 0) {
        return { valid: false, error: 'Для блока tabs необходим массив items с хотя бы 1 вкладкой' };
      }
      break;
    }

    case 'hero': {
      if (!cfg.titleUz && !cfg.titleRu) {
        return { valid: false, error: 'Для блока hero обязателен заголовок titleUz или titleRu' };
      }
      break;
    }

    case 'banner_alert': {
      if (!cfg.titleUz && !cfg.titleRu) {
        return { valid: false, error: 'Для блока banner_alert обязателен заголовок' };
      }
      break;
    }

    case 'call_to_action': {
      if (!cfg.titleUz && !cfg.titleRu) {
        return { valid: false, error: 'Для блока call_to_action обязателен заголовок' };
      }
      break;
    }

    case 'quote': {
      if (!cfg.quoteTextUz && !cfg.quoteTextRu) {
        return { valid: false, error: 'Для блока quote обязателен текст цитаты' };
      }
      break;
    }

    case 'image_text': {
      if (!cfg.imageUrl || typeof cfg.imageUrl !== 'string') {
        return { valid: false, error: 'Для блока image_text обязателен imageUrl' };
      }
      break;
    }

    case 'image_carousel': {
      if (!Array.isArray(cfg.slides) || cfg.slides.length === 0) {
        return { valid: false, error: 'Для блока image_carousel необходим массив слайдов slides' };
      }
      break;
    }

    case 'stats_counter': {
      if (!Array.isArray(cfg.stats)) {
        return { valid: false, error: 'Для блока stats_counter обязателен массив stats' };
      }
      break;
    }

    case 'timeline': {
      if (!Array.isArray(cfg.items)) {
        return { valid: false, error: 'Для блока timeline обязателен массив items' };
      }
      break;
    }

    case 'documents_list': {
      if (!Array.isArray(cfg.documents)) {
        return { valid: false, error: 'Для блока documents_list обязателен массив documents' };
      }
      break;
    }

    case 'staff_cards': {
      if (cfg.limit !== undefined) {
        const limit = Number(cfg.limit);
        if (isNaN(limit) || limit < 1 || limit > 36) {
          return { valid: false, error: 'Лимит карточек staff_cards должен быть от 1 до 36' };
        }
      }
      break;
    }

    case 'specialties_feed': {
      if (cfg.limit !== undefined) {
        const limit = Number(cfg.limit);
        if (isNaN(limit) || limit < 1 || limit > 24) {
          return { valid: false, error: 'Лимит направлений specialties_feed должен быть от 1 до 24' };
        }
      }
      break;
    }

    case 'events_feed': {
      if (cfg.limit !== undefined) {
        const limit = Number(cfg.limit);
        if (isNaN(limit) || limit < 1 || limit > 12) {
          return { valid: false, error: 'Лимит событий events_feed должен быть от 1 до 12' };
        }
      }
      break;
    }

    case 'schedule_widget':
    case 'anchor_nav':
      break;

    case 'social_links': {
      if (!Array.isArray(cfg.links)) {
        return { valid: false, error: 'Для блока social_links обязателен массив links' };
      }
      break;
    }

    case 'map_embed': {
      if (typeof cfg.latitude !== 'number' || typeof cfg.longitude !== 'number') {
        return { valid: false, error: 'Для блока map_embed требуются координаты (latitude, longitude)' };
      }
      break;
    }

    case 'reusable_ref': {
      if (!cfg.reusableBlockId || typeof cfg.reusableBlockId !== 'string') {
        return { valid: false, error: 'Для блока reusable_ref обязателен reusableBlockId' };
      }
      break;
    }
  }

  return { valid: true };
}

/**
 * Валидация массива блоков страницы
 */
export function validatePageBlocks(blocks: unknown): BlockValidationResult {
  if (!Array.isArray(blocks)) {
    return { valid: false, error: 'Поле blocks должно быть массивом' };
  }

  for (let i = 0; i < blocks.length; i++) {
    const res = validatePageBlock(blocks[i]);
    if (!res.valid) {
      return { valid: false, error: `Ошибка в блоке #${i + 1}: ${res.error}` };
    }
  }

  return { valid: true };
}
