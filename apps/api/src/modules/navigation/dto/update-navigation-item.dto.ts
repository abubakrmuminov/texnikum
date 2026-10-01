import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateNavigationItemDto } from './create-navigation-item.dto';

export class UpdateNavigationItemDto extends PartialType(CreateNavigationItemDto) {
  @ApiPropertyOptional({
    description:
      'Флаг подтверждения для скрытия или изменения обязательного уставного пункта (ст. 37 ЗРУ-637)',
  })
  @IsOptional()
  @IsBoolean()
  confirm?: boolean;
}

export class DeleteNavigationItemDto {
  @ApiPropertyOptional({
    description:
      'Флаг подтверждения для удаления обязательного уставного пункта (ст. 37 ЗРУ-637)',
  })
  @IsOptional()
  @IsBoolean()
  confirm?: boolean;
}
