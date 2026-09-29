import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse as SwaggerResponse, ApiTags } from '@nestjs/swagger';
import { ApiResponse } from '@college/shared';
import { HealthService, HealthStatus } from './health.service';

@ApiTags('Мониторинг')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Проверка работоспособности сервиса' })
  @SwaggerResponse({ status: 200, description: 'Сервер доступен и работает корректно' })
  check(): ApiResponse<HealthStatus> {
    return this.healthService.check();
  }
}
