import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse as SwaggerResponse, ApiTags } from '@nestjs/swagger';
import { ApiResponse, AuditLogItem, PaginatedResponse, UserRole } from '@college/shared';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuditService } from './audit.service';
import { QueryAuditDto } from './dto/query-audit.dto';

@ApiTags('Журнал аудита')
@ApiBearerAuth('JWT-auth')
@Controller('audit-log')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Просмотр журнала аудита (только для Администратора)' })
  @SwaggerResponse({ status: 200, description: 'Записи журнала успешно получены' })
  @SwaggerResponse({ status: 403, description: 'Недостаточно прав доступа' })
  async findAll(@Query() query: QueryAuditDto): Promise<ApiResponse<PaginatedResponse<AuditLogItem>>> {
    return this.auditService.findAll(query);
  }
}
