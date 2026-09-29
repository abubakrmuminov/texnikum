import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { BaseEducation } from '@college/shared';

export class CreateSpecialtyDto {
  @ApiProperty({ description: 'Код специальности ФГОС СПО', example: '09.02.07' })
  @IsString()
  @IsNotEmpty({ message: 'Код специальности обязателен' })
  code!: string;

  @ApiProperty({ description: 'Наименование специальности', example: 'Информационные системы и программирование' })
  @IsString()
  @IsNotEmpty({ message: 'Наименование обязательно' })
  name!: string;

  @ApiPropertyOptional({ description: 'Символьный slug' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({ description: 'Присваиваемая квалификация', example: 'Программист' })
  @IsString()
  @IsNotEmpty({ message: 'Квалификация обязательна' })
  qualification!: string;

  @ApiPropertyOptional({ description: 'ID учебного отделения' })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiProperty({ description: 'Срок обучения в месяцах', example: 46 })
  @Type(() => Number)
  @IsInt()
  @Min(10)
  durationMonths!: number;

  @ApiProperty({ description: 'Текстовое описание срока', example: '3 года 10 месяцев на базе 9 классов' })
  @IsString()
  @IsNotEmpty()
  durationText!: string;

  @ApiProperty({ enum: ['9_classes', '11_classes', 'both'], description: 'Базовое образование для поступления' })
  @IsIn(['9_classes', '11_classes', 'both'], { message: 'Базовое образование должно быть 9_classes, 11_classes или both' })
  baseEducation!: BaseEducation;

  @ApiProperty({ description: 'Количество мест государственного гранта (davlat granti)', example: 50 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  budgetPlaces!: number;

  @ApiProperty({ description: 'Количество мест платного контракта (toʻlov-kontrakt)', example: 25 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  commercialPlaces!: number;

  @ApiPropertyOptional({ description: 'Стоимость обучения в год (сум / UZS)', example: 9500000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  costPerYear?: number;

  @ApiPropertyOptional({ description: 'Конкурсный балл документа об образовании (shahodatnoma)', example: 4.65 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  passingScore?: number;

  @ApiProperty({ description: 'Подробное описание специальности' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiPropertyOptional({ description: 'Карьерные возможности и профессии' })
  @IsOptional()
  @IsString()
  careerOpportunities?: string;

  @ApiPropertyOptional({ description: 'URL обложки направления' })
  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @ApiPropertyOptional({ description: 'Статус активности', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Порядок отображения', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  orderIndex?: number;
}
