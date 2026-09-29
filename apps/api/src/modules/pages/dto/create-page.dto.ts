import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { PageSection } from '@college/shared';

export class CreatePageDto {
  @ApiProperty({ description: 'Заголовок страницы', example: 'Основные сведения' })
  @IsString()
  @IsNotEmpty({ message: 'Заголовок страницы обязателен' })
  title!: string;

  @ApiProperty({ description: 'Символьный slug', example: 'sveden-common' })
  @IsString()
  @IsNotEmpty({ message: 'Slug страницы обязателен' })
  slug!: string;

  @ApiProperty({
    enum: ['info', 'sveden', 'about', 'applicants', 'students', 'general'],
    description: 'Раздел сайта (ст. 37 ЗРУ-637)',
    example: 'info',
  })
  @IsIn(['info', 'sveden', 'about', 'applicants', 'students', 'general'])
  section!: PageSection;

  @ApiProperty({ description: 'HTML-содержимое страницы' })
  @IsString()
  @IsNotEmpty({ message: 'Содержимое страницы обязательно' })
  contentHtml!: string;

  @ApiPropertyOptional({ description: 'SEO Meta Title' })
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @ApiPropertyOptional({ description: 'SEO Meta Description' })
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @ApiPropertyOptional({ description: 'Опубликована ли страница', default: true })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ description: 'Порядок сортировки', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  orderIndex?: number;
}
