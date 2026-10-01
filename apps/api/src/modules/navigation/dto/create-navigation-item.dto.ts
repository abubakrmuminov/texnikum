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
import { NavigationMenuLocation, NavigationTargetType } from '@college/shared';

export class CreateNavigationItemDto {
  @ApiPropertyOptional({ description: 'ID родительского пункта меню (для выпадающих списков)' })
  @IsOptional()
  @IsString()
  parentId?: string | null;

  @ApiProperty({
    enum: ['header', 'footer_regulatory', 'footer_students', 'footer_custom'],
    description: 'Расположение меню',
    default: 'header',
  })
  @IsOptional()
  @IsIn(['header', 'footer_regulatory', 'footer_students', 'footer_custom'])
  location?: NavigationMenuLocation = 'header';

  @ApiProperty({ description: 'Название на узбекском', example: 'Bosh sahifa' })
  @IsString()
  @IsNotEmpty({ message: 'Название пункта меню на узбекском обязательно' })
  labelUz!: string;

  @ApiProperty({ description: 'Название на русском', example: 'Главная' })
  @IsString()
  @IsNotEmpty({ message: 'Название пункта меню на русском обязательно' })
  labelRu!: string;

  @ApiPropertyOptional({
    enum: ['internal_page', 'module', 'custom_url'],
    description: 'Тип целевой ссылки',
    default: 'internal_page',
  })
  @IsOptional()
  @IsIn(['internal_page', 'module', 'custom_url'])
  targetType?: NavigationTargetType = 'internal_page';

  @ApiProperty({ description: 'Путь ссылки или URL', example: '/info/info-common' })
  @IsString()
  @IsNotEmpty({ message: 'Путь ссылки обязателен' })
  path!: string;

  @ApiPropertyOptional({ description: 'ID связанной страницы из таблицы pages' })
  @IsOptional()
  @IsString()
  pageId?: string | null;

  @ApiPropertyOptional({ description: 'Имя иконки Lucide', example: 'BookOpen' })
  @IsOptional()
  @IsString()
  iconName?: string | null;

  @ApiPropertyOptional({ description: 'Текст бейджа на узбекском' })
  @IsOptional()
  @IsString()
  badgeTextUz?: string | null;

  @ApiPropertyOptional({ description: 'Текст бейджа на русском' })
  @IsOptional()
  @IsString()
  badgeTextRu?: string | null;

  @ApiPropertyOptional({ description: 'Открывать в новой вкладке', default: false })
  @IsOptional()
  @IsBoolean()
  openInNewTab?: boolean = false;

  @ApiPropertyOptional({ description: 'Видимость на сайте', default: true })
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean = true;

  @ApiPropertyOptional({ description: 'Порядок сортировки', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number = 0;
}
