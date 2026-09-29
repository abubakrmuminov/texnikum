import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { EventCategory } from '@college/shared';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class QueryEventsDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ['open_doors', 'science', 'sports', 'culture', 'general'], description: 'Категория события' })
  @IsOptional()
  @IsIn(['open_doors', 'science', 'sports', 'culture', 'general'])
  category?: EventCategory;

  @ApiPropertyOptional({ description: 'Только опубликованные события', default: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isPublished?: boolean;
}
