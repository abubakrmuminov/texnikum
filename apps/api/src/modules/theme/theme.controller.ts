import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  ApiResponse,
  ThemePreset,
  ThemeSettings,
  UserProfile,
  UserRole,
} from '@college/shared';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SelectThemeDto } from './dto/select-theme.dto';
import { ThemeService } from './theme.service';

@ApiTags('Темы оформления сайта')
@Controller('theme')
export class ThemeController {
  constructor(private readonly themeService: ThemeService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Получение текущих настроек темы оформления сайта (публичный)' })
  @SwaggerResponse({ status: 200, description: 'Настройки темы получены' })
  async getCurrentTheme(): Promise<ApiResponse<ThemeSettings>> {
    return this.themeService.getCurrentTheme();
  }
}

@ApiTags('Панель управления: Темы оформления')
@ApiBearerAuth('JWT-auth')
@Controller('admin/theme')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminThemeController {
  constructor(private readonly themeService: ThemeService) {}

  @Get('presets')
  @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.MODERATOR)
  @ApiOperation({ summary: 'Список доступных дизайн-пресетов оформления' })
  @SwaggerResponse({ status: 200, description: 'Список пресетов получен' })
  async listPresets(): Promise<ApiResponse<ThemePreset[]>> {
    return this.themeService.listPresets();
  }

  @Post('select')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Выбор пресета темы оформления (только Admin)' })
  @SwaggerResponse({ status: 200, description: 'Пресет успешно выбран' })
  async selectPreset(
    @Body() dto: SelectThemeDto,
    @CurrentUser() user: UserProfile,
  ): Promise<ApiResponse<ThemeSettings>> {
    return this.themeService.selectPreset(dto, user);
  }
}
