import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse as SwaggerResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ApiResponse, SetupStatusResponse } from '@college/shared';
import { Public } from '../auth/decorators/public.decorator';
import { CompleteSetupDto } from './dto/complete-setup.dto';
import { VerifyTokenDto } from './dto/verify-token.dto';
import { InstitutionService } from './institution.service';

@ApiTags('Первичная настройка системы (Setup Wizard)')
@Controller('setup')
export class SetupController {
  constructor(private readonly institutionService: InstitutionService) {}

  @Public()
  @Get('status')
  @ApiOperation({
    summary: 'Проверка статуса первичной настройки',
    description: 'Возвращает { configured: false }, если система еще не настроена. После завершения настройки навсегда возвращает 404.',
  })
  @SwaggerResponse({ status: 200, description: 'Система ожидает настройки ({ configured: false })' })
  @SwaggerResponse({ status: 404, description: 'Система уже настроена, мастер опечатан' })
  async getStatus(): Promise<SetupStatusResponse> {
    return this.institutionService.getSetupStatus();
  }

  @Public()
  @Post('verify-token')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({
    summary: 'Проверка ключа первичной настройки',
    description: 'Проверяет SETUP_TOKEN в константном времени. Возвращает { valid: true }, если ключ верный, или 401, если неверный.',
  })
  @SwaggerResponse({ status: 200, description: 'SETUP_TOKEN верный' })
  @SwaggerResponse({ status: 401, description: 'Неверный или недействительный SETUP_TOKEN' })
  @SwaggerResponse({ status: 404, description: 'Система уже настроена' })
  async verifyToken(
    @Body() dto: VerifyTokenDto,
  ): Promise<ApiResponse<{ valid: boolean }>> {
    return this.institutionService.verifySetupToken(dto.setupToken);
  }

  @Public()
  @Post('complete')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // Строгий rate limit против подбора токена
  @ApiOperation({
    summary: 'Завершение первичной настройки учреждения и создание первого администратора',
    description:
      'Атомарная операция: проверяет одноразовый SETUP_TOKEN в константном времени, создает первого суперадминистратора, сохраняет настройки заведения и устанавливает is_configured = true. После успешного вызова эндпоинт навсегда возвращает 404.',
  })
  @SwaggerResponse({ status: 200, description: 'Настройка успешно завершена' })
  @SwaggerResponse({ status: 401, description: 'Неверный или недействительный SETUP_TOKEN' })
  @SwaggerResponse({ status: 404, description: 'Система уже настроена, повторная настройка невозможна' })
  async complete(
    @Body() dto: CompleteSetupDto,
  ): Promise<ApiResponse<{ message: string }>> {
    return this.institutionService.completeSetup(dto);
  }
}
