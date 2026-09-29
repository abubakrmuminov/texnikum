import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { PageSection } from '@college/shared';

export class QueryPagesDto {
  @ApiPropertyOptional({ enum: ['info', 'sveden', 'about', 'applicants', 'students', 'general'], description: 'Фильтр по разделу' })
  @IsOptional()
  @IsIn(['info', 'sveden', 'about', 'applicants', 'students', 'general'])
  section?: PageSection;

  @ApiPropertyOptional({ description: 'Только опубликованные', default: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isPublished?: boolean;
}
