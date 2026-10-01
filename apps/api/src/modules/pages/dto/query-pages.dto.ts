import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';
import { PageSection } from '@college/shared';

export class QueryPagesDto {
  @ApiPropertyOptional({
    enum: ['info', 'sveden', 'about', 'applicants', 'students', 'general'],
    description: 'Фильтр по разделу',
  })
  @IsOptional()
  @IsIn(['info', 'sveden', 'about', 'applicants', 'students', 'general'])
  section?: PageSection;

  @ApiPropertyOptional({ description: 'Только опубликованные', default: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ description: 'Поисковый запрос по названию или slug' })
  @IsOptional()
  @IsString()
  search?: string;
}
