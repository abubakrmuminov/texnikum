import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { EventCategory } from '@college/shared';

export class CreateEventDto {
  @ApiProperty({ description: 'Название события / мероприятия', example: 'День открытых дверей' })
  @IsString()
  @IsNotEmpty({ message: 'Название обязательно' })
  title!: string;

  @ApiPropertyOptional({ description: 'Символьный slug' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({ description: 'Краткое описание мероприятия' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiPropertyOptional({ description: 'Полный текст / программа мероприятия в HTML' })
  @IsOptional()
  @IsString()
  contentHtml?: string;

  @ApiProperty({ description: 'Дата и время начала (ISO8601)', example: '2026-04-15T10:00:00Z' })
  @IsISO8601({}, { message: 'Дата начала должна быть в формате ISO8601' })
  eventDate!: string;

  @ApiPropertyOptional({ description: 'Дата и время окончания (ISO8601)' })
  @IsOptional()
  @IsISO8601({}, { message: 'Дата окончания должна быть в формате ISO8601' })
  endDate?: string;

  @ApiProperty({ description: 'Место проведения', example: 'Главный корпус, Актовый зал' })
  @IsString()
  @IsNotEmpty()
  location!: string;

  @ApiProperty({
    enum: ['open_doors', 'science', 'sports', 'culture', 'general'],
    description: 'Категория мероприятия',
    default: 'general',
  })
  @IsIn(['open_doors', 'science', 'sports', 'culture', 'general'])
  category!: EventCategory;

  @ApiPropertyOptional({ description: 'URL обложки / афиши' })
  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @ApiPropertyOptional({ description: 'Закрепить в анонсах', default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: 'Опубликовано', default: true })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ description: 'Организатор мероприятия' })
  @IsOptional()
  @IsString()
  organizer?: string;

  @ApiPropertyOptional({ description: 'Ссылка на регистрацию участников' })
  @IsOptional()
  @IsString()
  registrationUrl?: string;
}
