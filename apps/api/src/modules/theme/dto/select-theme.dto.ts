import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ThemePresetId } from '@college/shared';

export class SelectThemeDto {
  @ApiProperty({
    enum: [
      'classic_academic',
      'modern_tech',
      'emerald_oasis',
      'traditional_navy',
      'clean_slate',
    ],
    description: 'Идентификатор пресета темы оформления',
    example: 'classic_academic',
  })
  @IsString()
  @IsNotEmpty({ message: 'Идентификатор пресета темы обязателен' })
  @IsIn([
    'classic_academic',
    'modern_tech',
    'emerald_oasis',
    'traditional_navy',
    'clean_slate',
  ])
  preset!: ThemePresetId;

  @ApiPropertyOptional({ description: 'Основное семейство шрифтов', default: 'Inter' })
  @IsOptional()
  @IsString()
  fontFamily?: string;

  @ApiPropertyOptional({ description: 'Стиль скруглений', default: 'rounded' })
  @IsOptional()
  @IsString()
  borderRadiusMode?: string;
}
