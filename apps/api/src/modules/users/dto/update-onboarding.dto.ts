import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsObject, IsOptional } from 'class-validator';
import { AdminSectionKey, OnboardingMainStatus } from '@college/shared';

export class UpdateOnboardingDto {
  @ApiPropertyOptional({
    description: 'Статус завершения основного тура онбординга',
    enum: ['done', 'skipped'],
    example: 'done',
  })
  @IsOptional()
  @IsIn(['done', 'skipped'], {
    message: 'Статус основного тура (main) должен быть "done" или "skipped"',
  })
  main?: OnboardingMainStatus;

  @ApiPropertyOptional({
    description: 'Объект с флагами просмотренных разделов панели управления',
    example: { news: true, events: true },
  })
  @IsOptional()
  @IsObject({
    message: 'Поле sections должно быть объектом с флагами разделов',
  })
  sections?: Partial<Record<AdminSectionKey, boolean>>;
}
