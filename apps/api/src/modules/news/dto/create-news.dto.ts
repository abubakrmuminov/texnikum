import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { NewsStatus } from '@college/shared';

export class CreateNewsDto {
  @ApiProperty({ description: 'Заголовок новости', example: 'Победа на чемпионате «Профессионалы 2026»' })
  @IsString({ message: 'Заголовок должен быть строкой' })
  @IsNotEmpty({ message: 'Заголовок не может быть пустым' })
  @MinLength(5, { message: 'Заголовок должен содержать не менее 5 символов' })
  @MaxLength(250, { message: 'Заголовок не может превышать 250 символов' })
  title!: string;

  @ApiPropertyOptional({ description: 'Символьный идентификатор (slug)', example: 'pobeda-chempionat-2026' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({ description: 'ID категории новости', example: 1 })
  @IsNotEmpty({ message: 'Категория обязательна' })
  categoryId!: string | number;

  @ApiProperty({ description: 'Краткий вводный текст (лид)', example: 'Команда колледжа завоевала первые места...' })
  @IsString()
  @IsNotEmpty({ message: 'Лид-текст обязателен' })
  @MinLength(10, { message: 'Лид-текст должен быть не менее 10 символов' })
  @MaxLength(500, { message: 'Лид-текст не может превышать 500 символов' })
  leadText!: string;

  @ApiProperty({ description: 'Полный текст статьи в формате HTML' })
  @IsString()
  @IsNotEmpty({ message: 'Тело статьи не может быть пустым' })
  @MinLength(20, { message: 'Тело статьи должно быть содержательным (от 20 символов)' })
  contentHtml!: string;

  @ApiPropertyOptional({ description: 'URL обложки новости' })
  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @ApiPropertyOptional({ description: 'Ориентировочное время чтения в минутах', default: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  readingTimeMin?: number;

  @ApiPropertyOptional({ enum: NewsStatus, default: NewsStatus.DRAFT, description: 'Статус публикации' })
  @IsOptional()
  @IsEnum(NewsStatus, { message: 'Статус должен быть draft, published или archived' })
  status?: NewsStatus;

  @ApiPropertyOptional({ description: 'Закрепить в Bento Grid на главной', default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: 'Дата публикации (ISO8601)' })
  @IsOptional()
  @IsISO8601({}, { message: 'Дата публикации должна быть в формате ISO8601' })
  publishedAt?: string;
}
