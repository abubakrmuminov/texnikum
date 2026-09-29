export type StorageBucket = 'news-media' | 'official-docs';

export interface MediaFile {
  id: string;
  fileName: string;
  originalName: string;
  fileSizeBytes: number;
  mimeType: string;
  bucket: StorageBucket;
  storagePath: string;
  publicUrl: string;
  uploadedBy: string | null;
  createdAt: string;
}
