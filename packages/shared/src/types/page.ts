import { PageBlock } from './page-blocks';
import { GridRow } from './page-grid';

// Bo'limlar / Разделы согласно ст. 37 ЗРУ-637 и общим страницам
export type PageSection = 'info' | 'sveden' | 'about' | 'applicants' | 'students' | 'general';

export type PageType = 'statutory' | 'custom' | 'module_landing';

export interface PageItem {
  id: string;
  title: string;
  titleUz?: string;
  titleRu?: string;
  slug: string;
  section: PageSection;
  pageType?: PageType;
  contentHtml: string;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImageUrl?: string | null;
  isPublished: boolean;
  isSystem?: boolean;
  isRequired?: boolean;
  orderIndex: number;
  schemaVersion?: number; // 1 = legacy flat blocks, 2 = 12-column grid layout
  rows?: GridRow[];
  blocks?: PageBlock[];
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PageRevision {
  id: string;
  pageId: string;
  authorId?: string | null;
  authorName?: string | null;
  changeSummary?: string | null;
  snapshot: PageItem;
  createdAt: string;
}

export interface PageSlugRedirect {
  id: string;
  oldSlug: string;
  newSlug: string;
  statusCode: number;
  createdAt: string;
}
