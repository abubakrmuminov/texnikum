import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Название рубрики', example: 'Студенческая жизнь' })
  @IsString()
  @IsNotEmpty({ message: 'Название рубрики обязательно' })
  name!: string;

  @ApiPropertyOptional({ description: 'Символьный slug', example: 'studencheskaya-zhizn' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ description: 'Цвет бейджа', example: 'indigo' })
  @IsOptional()
  @IsString()
  colorBadge?: string;
}
