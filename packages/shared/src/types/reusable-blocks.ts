import { GridRow } from './page-grid';

export type ReusableBlockCategory = 'general' | 'academic' | 'hero' | 'footer' | 'cta' | 'custom' | string;

export interface ReusableBlock {
  id: string;
  titleUz: string;
  titleRu: string;
  category: string;
  isGlobal: boolean;
  rowData: GridRow;
  usageCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReusableBlockPayload {
  titleUz: string;
  titleRu: string;
  category?: string;
  isGlobal?: boolean;
  rowData: GridRow;
}

export interface UpdateReusableBlockPayload {
  titleUz?: string;
  titleRu?: string;
  category?: string;
  isGlobal?: boolean;
  rowData?: GridRow;
}
