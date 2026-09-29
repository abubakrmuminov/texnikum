import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Parity } from '@college/shared';

export class CreateScheduleDto {
  @ApiProperty({ description: 'Название учебной группы', example: 'ИС-301' })
  @IsString()
  @IsNotEmpty({ message: 'Название группы обязательно' })
  groupName!: string;

  @ApiProperty({ description: 'День недели (1 = Пн, 6 = Сб)', example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(6)
  dayOfWeek!: number;

  @ApiProperty({ description: 'Номер пары (1..7)', example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(7)
  lessonNumber!: number;

  @ApiProperty({ description: 'Время начала пары (ЧЧ:ММ)', example: '08:30' })
  @IsString()
  @IsNotEmpty()
  timeStart!: string;

  @ApiProperty({ description: 'Время окончания пары (ЧЧ:ММ)', example: '10:00' })
  @IsString()
  @IsNotEmpty()
  timeEnd!: string;

  @ApiProperty({ description: 'Наименование предмета', example: 'Разработка веб-приложений' })
  @IsString()
  @IsNotEmpty()
  subject!: string;

  @ApiPropertyOptional({ description: 'ID преподавателя' })
  @IsOptional()
  @IsString()
  teacherId?: string;

  @ApiProperty({ description: 'Номер аудитории или лаборатории', example: 'Ауд. 305' })
  @IsString()
  @IsNotEmpty()
  classroom!: string;

  @ApiPropertyOptional({ enum: ['both', 'odd', 'even'], description: 'Четность недели (числитель/знаменатель)', default: 'both' })
  @IsOptional()
  @IsIn(['both', 'odd', 'even'])
  parity?: Parity;

  @ApiPropertyOptional({ description: 'Статус активности', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
