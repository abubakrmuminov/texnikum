// Bo'limlar / Разделы согласно ст. 37 ЗРУ-637 и общим страницам
export type PageSection = 'info' | 'sveden' | 'about' | 'applicants' | 'students' | 'general';

export interface PageItem {
  id: string;
  title: string;
  slug: string;
  section: PageSection;
  contentHtml: string;
  metaTitle: string | null;
  metaDescription: string | null;
  isPublished: boolean;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}
