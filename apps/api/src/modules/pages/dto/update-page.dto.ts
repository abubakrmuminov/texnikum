import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { CreatePageDto } from './create-page.dto';

export class UpdatePageDto extends PartialType(CreatePageDto) {
  @ApiPropertyOptional({
    description:
      'Флаг подтверждения для скрытия/снятия с публикации обязательной уставной страницы (ст. 37 ЗРУ-637)',
  })
  @IsOptional()
  @IsBoolean()
  confirm?: boolean;

  @ApiPropertyOptional({
    description: 'Описание внесенных изменений для истории ревизий',
    example: 'Обновлены контактные телефоны и расписание',
  })
  @IsOptional()
  @IsString()
  changeSummary?: string;
}

export class DeletePageDto {
  @ApiPropertyOptional({
    description: 'Флаг подтверждения для удаления страницы',
  })
  @IsOptional()
  @IsBoolean()
  confirm?: boolean;
}
