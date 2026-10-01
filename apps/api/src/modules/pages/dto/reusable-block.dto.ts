import { IsBoolean, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GridRow } from '@college/shared';

export class CreateReusableBlockDto {
  @ApiProperty({ description: 'Название на узбекском', example: 'Qabul komissiyasi baneri' })
  @IsString()
  @IsNotEmpty()
  titleUz!: string;

  @ApiProperty({ description: 'Название на русском', example: 'Баннер приемной комиссии' })
  @IsString()
  @IsNotEmpty()
  titleRu!: string;

  @ApiPropertyOptional({ description: 'Категория блока', example: 'banner' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Глобальный синхронизируемый блок', default: false })
  @IsOptional()
  @IsBoolean()
  isGlobal?: boolean;

  @ApiProperty({ description: 'Данные строки сетки GridRow' })
  @IsObject()
  rowData!: GridRow;
}

export class UpdateReusableBlockDto {
  @ApiPropertyOptional({ description: 'Название на узбекском' })
  @IsOptional()
  @IsString()
  titleUz?: string;

  @ApiPropertyOptional({ description: 'Название на русском' })
  @IsOptional()
  @IsString()
  titleRu?: string;

  @ApiPropertyOptional({ description: 'Категория блока' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Глобальный синхронизируемый блок' })
  @IsOptional()
  @IsBoolean()
  isGlobal?: boolean;

  @ApiPropertyOptional({ description: 'Данные строки сетки GridRow' })
  @IsOptional()
  @IsObject()
  rowData?: GridRow;
}
