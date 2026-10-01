import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { GridRow, PageBlock, PageSection, PageType } from '@college/shared';

export class CreatePageDto {
  @ApiPropertyOptional({ description: 'Основной заголовок страницы', example: 'Asosiy maʼlumotlar' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Заголовок на узбекском', example: 'Asosiy maʼlumotlar' })
  @IsOptional()
  @IsString()
  titleUz?: string;

  @ApiPropertyOptional({ description: 'Заголовок на русском', example: 'Основные сведения' })
  @IsOptional()
  @IsString()
  titleRu?: string;

  @ApiProperty({ description: 'Символьный slug в формате kebab-case', example: 'info-common' })
  @IsString()
  @IsNotEmpty({ message: 'Slug страницы обязателен' })
  @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    message: 'Slug страницы должен состоять из строчных латинских букв, цифр и дефисов (kebab-case)',
  })
  slug!: string;

  @ApiProperty({
    enum: ['info', 'sveden', 'about', 'applicants', 'students', 'general'],
    description: 'Раздел сайта (ст. 37 ЗРУ-637)',
    default: 'general',
  })
  @IsOptional()
  @IsIn(['info', 'sveden', 'about', 'applicants', 'students', 'general'])
  section?: PageSection = 'general';

  @ApiPropertyOptional({
    enum: ['statutory', 'custom', 'module_landing'],
    description: 'Тип страницы',
    default: 'custom',
  })
  @IsOptional()
  @IsIn(['statutory', 'custom', 'module_landing'])
  pageType?: PageType = 'custom';

  @ApiPropertyOptional({ description: 'HTML-содержимое страницы (для классических страниц)' })
  @IsOptional()
  @IsString()
  contentHtml?: string;

  @ApiPropertyOptional({ description: 'Версия схемы контента (1 = плоские блоки, 2 = 12-колоночная сетка)', default: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  schemaVersion?: number;

  @ApiPropertyOptional({ description: '12-колоночная структура строк и ячеек', type: 'array' })
  @IsOptional()
  @IsArray({ message: 'Строки страницы должны быть массивом' })
  rows?: GridRow[];

  @ApiPropertyOptional({ description: 'Массив контентных блоков страницы (устаревший плоский формат)', type: 'array' })
  @IsOptional()
  @IsArray({ message: 'Блоки страницы должны быть массивом' })
  blocks?: PageBlock[];

  @ApiPropertyOptional({ description: 'SEO Meta Title' })
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @ApiPropertyOptional({ description: 'SEO Meta Description' })
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @ApiPropertyOptional({ description: 'Ссылка на изображение Open Graph' })
  @IsOptional()
  @IsString()
  ogImageUrl?: string;

  @ApiPropertyOptional({ description: 'Опубликована ли страница', default: true })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ description: 'Системная страница', default: false })
  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;

  @ApiPropertyOptional({ description: 'Обязательная уставная страница (ст. 37 ЗРУ-637)', default: false })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiPropertyOptional({ description: 'Порядок сортировки', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  orderIndex?: number;
}
