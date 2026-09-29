import { NewsStatus } from '../enums/news-status.enum';

export interface NewsCategory {
  id: number;
  name: string;
  slug: string;
  colorBadge: string;
  createdAt: string;
}

export interface NewsItem {
  id: string;
  title: string;
  slug: string;
  categoryId: number;
  category?: NewsCategory;
  leadText: string;
  contentHtml: string;
  coverImageUrl: string | null;
  readingTimeMin: number;
  status: NewsStatus;
  isFeatured: boolean;
  authorId: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
