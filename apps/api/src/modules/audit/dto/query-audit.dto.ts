import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class QueryAuditDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Фильтр по типу сущности (news, teachers, specialties, schedule, etc.)' })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional({ description: 'Фильтр по действию (CREATE, UPDATE, DELETE, PUBLISH)' })
  @IsOptional()
  @IsString()
  action?: string;
}
