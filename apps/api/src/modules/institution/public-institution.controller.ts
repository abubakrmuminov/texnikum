import { Controller, Get, Header } from '@nestjs/common';
import { ApiOperation, ApiResponse as SwaggerResponse, ApiTags } from '@nestjs/swagger';
import { ApiResponse, InstitutionPublicSettings } from '@college/shared';
import { Public } from '../auth/decorators/public.decorator';
import { InstitutionService } from './institution.service';

@ApiTags('Публичные настройки учреждения (Muassasa sozlamalari)')
@Controller('public/institution')
export class PublicInstitutionController {
  constructor(private readonly institutionService: InstitutionService) {}

  @Public()
  @Get()
  @Header('Cache-Control', 'public, max-age=300, stale-while-revalidate=600')
  @ApiOperation({
    summary: 'Получение публичных реквизитов и брендинга учреждения',
    description: 'Возвращает только публичные поля (названия, контакты, цвета, домен, логотипы). Приватные поля не отдаются.',
  })
  @SwaggerResponse({ status: 200, description: 'Публичные настройки успешно получены' })
  async getPublicSettings(): Promise<ApiResponse<InstitutionPublicSettings>> {
    return this.institutionService.getPublicSettings();
  }
}
