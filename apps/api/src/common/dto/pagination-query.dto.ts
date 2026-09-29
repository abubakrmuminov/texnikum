import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Номер страницы (начиная с 1)', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Номер страницы должен быть целым числом' })
  @Min(1, { message: 'Номер страницы должен быть не менее 1' })
  page: number = 1;

  @ApiPropertyOptional({ description: 'Количество элементов на странице (1-100)', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Лимит должен быть целым числом' })
  @Min(1, { message: 'Лимит должен быть не менее 1' })
  @Max(100, { message: 'Лимит не может превышать 100' })
  limit: number = 10;

  @ApiPropertyOptional({ description: 'Поисковый запрос' })
  @IsOptional()
  @IsString({ message: 'Поисковый запрос должен быть строкой' })
  search?: string;
}
