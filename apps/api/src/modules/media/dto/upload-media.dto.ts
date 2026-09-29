import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty } from 'class-validator';
import { StorageBucket } from '@college/shared';

export class UploadMediaDto {
  @ApiProperty({
    enum: ['news-media', 'official-docs'],
    description: 'Целевой бакет хранилища Supabase',
    example: 'news-media',
  })
  @IsIn(['news-media', 'official-docs'], {
    message: 'Бакет должен быть news-media или official-docs',
  })
  @IsNotEmpty()
  bucket!: StorageBucket;
}
