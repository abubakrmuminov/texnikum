import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ApiResponse, MediaFile, StorageBucket, UserProfile } from '@college/shared';
import { AuditService } from '../audit/audit.service';
import { SupabaseService } from '../supabase/supabase.service';

const ALLOWED_MIME_TYPES: Record<StorageBucket, string[]> = {
  'news-media': ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
  'official-docs': [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
};

const MAX_FILE_SIZE_BYTES: Record<StorageBucket, number> = {
  'news-media': 10 * 1024 * 1024, // 10MB
  'official-docs': 50 * 1024 * 1024, // 50MB
};

@Injectable()
export class MediaService {
  private mediaList: MediaFile[] = [
    {
      id: '50000000-0000-0000-0000-000000000001',
      fileName: 'champion-2026.webp',
      originalName: 'Победители чемпионата Профессионалы.webp',
      fileSizeBytes: 245760,
      mimeType: 'image/webp',
      bucket: 'news-media',
      storagePath: 'news/champion-2026.webp',
      publicUrl: '/images/news/champion-2026.webp',
      uploadedBy: 'a0000000-0000-0000-0000-000000000001',
      createdAt: '2026-09-01T00:00:00Z',
    },
    {
      id: '50000000-0000-0000-0000-000000000002',
      fileName: 'ustav-college.pdf',
      originalName: 'Устав колледжа с ЭЦП.pdf',
      fileSizeBytes: 2450820,
      mimeType: 'application/pdf',
      bucket: 'official-docs',
      storagePath: 'docs/ustav-college.pdf',
      publicUrl: '/docs/ustav.pdf',
      uploadedBy: 'a0000000-0000-0000-0000-000000000001',
      createdAt: '2026-09-01T00:00:00Z',
    },
  ];

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly auditService: AuditService,
  ) {}

  async uploadFile(
    file: Express.Multer.File | undefined,
    bucket: StorageBucket,
    user: UserProfile,
  ): Promise<ApiResponse<MediaFile>> {
    if (!file) {
      throw new BadRequestException('Файл не был передан');
    }

    // 1. Проверка размера файла
    const maxSizeBytes = MAX_FILE_SIZE_BYTES[bucket];
    if (file.size > maxSizeBytes) {
      const maxMb = Math.round(maxSizeBytes / (1024 * 1024));
      throw new BadRequestException(
        `Размер файла (${Math.round(file.size / 1024)} КБ) превышает допустимый лимит для ${bucket} (${maxMb} МБ)`,
      );
    }

    // 2. Проверка MIME-типа файла
    const allowedMime = ALLOWED_MIME_TYPES[bucket];
    if (!allowedMime.includes(file.mimetype)) {
      throw new BadRequestException(
        `Недопустимый тип файла (${file.mimetype}). Разрешены только: ${allowedMime.join(', ')}`,
      );
    }

    // 3. Безопасное имя файла и путь хранения
    const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9._\-а-яА-ЯёЁ]/g, '_');
    const ext = file.originalname.split('.').pop() || 'bin';
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const storagePath = `${bucket}/${uniqueFileName}`;

    let publicUrl =
      file.mimetype.startsWith('image/') && file.buffer
        ? `data:${file.mimetype};base64,${file.buffer.toString('base64')}`
        : `/uploads/${storagePath}`;

    // 4. Загрузка в Supabase Storage (если настроен)
    if (this.supabaseService.isReady()) {
      const supabase = this.supabaseService.getClient();
      if (supabase) {
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(uniqueFileName, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
          });

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(uniqueFileName);
          publicUrl = urlData.publicUrl;
        }
      }
    }

    const record: MediaFile = {
      id: `media-${Date.now()}`,
      fileName: uniqueFileName,
      originalName: sanitizedOriginalName,
      fileSizeBytes: file.size,
      mimeType: file.mimetype,
      bucket,
      storagePath,
      publicUrl,
      uploadedBy: user.id,
      createdAt: new Date().toISOString(),
    };

    this.mediaList.unshift(record);
    await this.auditService.log(
      user.id,
      'CREATE',
      'media',
      record.id,
      record as unknown as Record<string, unknown>,
    );

    return {
      success: true,
      data: record,
      message: 'Файл успешно загружен и проверен',
      timestamp: new Date().toISOString(),
    };
  }

  async findAll(bucket?: StorageBucket): Promise<ApiResponse<MediaFile[]>> {
    let list = [...this.mediaList];
    if (bucket) {
      list = list.filter((m) => m.bucket === bucket);
    }
    return {
      success: true,
      data: list,
      timestamp: new Date().toISOString(),
    };
  }

  async delete(id: string, user: UserProfile): Promise<ApiResponse<{ deleted: boolean }>> {
    const index = this.mediaList.findIndex((m) => m.id === id);
    if (index === -1) {
      throw new NotFoundException(`Файл с ID «${id}» не найден`);
    }

    const old = this.mediaList[index]!;
    this.mediaList.splice(index, 1);
    await this.auditService.log(user.id, 'DELETE', 'media', id, undefined, old as unknown as Record<string, unknown>);

    return {
      success: true,
      data: { deleted: true },
      message: 'Файл удален',
      timestamp: new Date().toISOString(),
    };
  }
}
