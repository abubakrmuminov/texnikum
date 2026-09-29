import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Parity } from '@college/shared';

export class QueryScheduleDto {
  @ApiPropertyOptional({ description: 'Название учебной группы', example: 'ИС-301' })
  @IsOptional()
  @IsString()
  groupName?: string;

  @ApiPropertyOptional({ description: 'ID преподавателя' })
  @IsOptional()
  @IsString()
  teacherId?: string;

  @ApiPropertyOptional({ description: 'День недели (1..6)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(6)
  dayOfWeek?: number;

  @ApiPropertyOptional({ enum: ['both', 'odd', 'even'], description: 'Четность недели' })
  @IsOptional()
  @IsIn(['both', 'odd', 'even'])
  parity?: Parity;

  @ApiPropertyOptional({ description: 'Только активные', default: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}
