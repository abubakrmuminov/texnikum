import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiResponse, UserProfile, UserRole } from '@college/shared';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UsersService } from './users.service';

@ApiTags('Управление пользователями и правами (Admin only)')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Получение списка всех пользователей' })
  @SwaggerResponse({ status: 200, description: 'Список пользователей' })
  async findAll(): Promise<ApiResponse<UserProfile[]>> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получение профиля пользователя по ID' })
  @SwaggerResponse({ status: 200, description: 'Профиль найден' })
  async findOne(@Param('id') id: string): Promise<ApiResponse<UserProfile>> {
    return this.usersService.findOne(id);
  }

  @Patch(':id/role')
  @ApiOperation({ summary: 'Изменение роли пользователя (только Администратор)' })
  @SwaggerResponse({ status: 200, description: 'Роль успешно изменена' })
  async updateRole(
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
    @CurrentUser() user: UserProfile,
  ): Promise<ApiResponse<UserProfile>> {
    return this.usersService.updateRole(id, dto, user);
  }
}
