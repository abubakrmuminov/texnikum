import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse as SwaggerResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  ApiResponse,
  NavigationItem,
  UserProfile,
  UserRole,
} from '@college/shared';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateNavigationItemDto } from './dto/create-navigation-item.dto';
import { DeleteNavigationItemDto, UpdateNavigationItemDto } from './dto/update-navigation-item.dto';
import { NavigationService } from './navigation.service';

@ApiTags('Панель управления: Навигация и меню')
@ApiBearerAuth('JWT-auth')
@Controller('admin/navigation')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminNavigationController {
  constructor(private readonly navigationService: NavigationService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.MODERATOR)
  @ApiOperation({ summary: 'Получение полного дерева навигации для админки' })
  @ApiQuery({ name: 'includeDeleted', required: false, type: Boolean })
  @SwaggerResponse({ status: 200, description: 'Дерево навигации получено' })
  async getAll(
    @Query('includeDeleted') includeDeleted?: string,
  ): Promise<ApiResponse<NavigationItem[]>> {
    return this.navigationService.getAllForAdmin(includeDeleted === 'true');
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Создание пункта навигации (только Admin)' })
  @SwaggerResponse({ status: 201, description: 'Пункт навигации создан' })
  async create(
    @Body() dto: CreateNavigationItemDto,
    @CurrentUser() user: UserProfile,
  ): Promise<ApiResponse<NavigationItem>> {
    return this.navigationService.create(dto, user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Обновление пункта навигации (только Admin)' })
  @SwaggerResponse({ status: 200, description: 'Пункт навигации обновлен' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateNavigationItemDto,
    @CurrentUser() user: UserProfile,
  ): Promise<ApiResponse<NavigationItem>> {
    return this.navigationService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Удаление пункта навигации (Soft Delete, только Admin)' })
  @SwaggerResponse({ status: 200, description: 'Пункт навигации удален' })
  async delete(
    @Param('id') id: string,
    @Body() dto: DeleteNavigationItemDto,
    @CurrentUser() user: UserProfile,
  ): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.navigationService.delete(id, dto, user);
  }

  @Post(':id/restore')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Восстановление пункта навигации из корзины (только Admin)' })
  @SwaggerResponse({ status: 200, description: 'Пункт навигации восстановлен' })
  async restore(
    @Param('id') id: string,
    @CurrentUser() user: UserProfile,
  ): Promise<ApiResponse<NavigationItem>> {
    return this.navigationService.restore(id, user);
  }

  @Post('restore-defaults')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Восстановление заводской системной структуры меню (только Admin)' })
  @SwaggerResponse({ status: 200, description: 'Заводская структура восстановлена' })
  async restoreDefaults(
    @CurrentUser() user: UserProfile,
  ): Promise<ApiResponse<{ restored: boolean; count: number }>> {
    return this.navigationService.restoreDefaults(user);
  }
}
