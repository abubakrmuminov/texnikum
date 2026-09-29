import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { NewsStatus } from '@college/shared';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class QueryNewsDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Фильтр по slug или ID категории' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ enum: NewsStatus, description: 'Фильтр по статусу (для панели управления)' })
  @IsOptional()
  @IsEnum(NewsStatus)
  status?: NewsStatus;
}
