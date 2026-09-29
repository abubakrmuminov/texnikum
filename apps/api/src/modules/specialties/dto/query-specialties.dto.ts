import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseEducation } from '@college/shared';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class QuerySpecialtiesDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ['9_classes', '11_classes', 'both'], description: 'Базовое образование' })
  @IsOptional()
  @IsIn(['9_classes', '11_classes', 'both'])
  baseEducation?: BaseEducation;

  @ApiPropertyOptional({ description: 'ID отделения' })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiPropertyOptional({ description: 'Только активные', default: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}
