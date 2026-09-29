import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse as SwaggerResponse, ApiTags } from '@nestjs/swagger';
import { ApiResponse, UserProfile } from '@college/shared';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Аутентификация и профиль')
@ApiBearerAuth('JWT-auth')
@Controller('auth')
@UseGuards(JwtAuthGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @ApiOperation({ summary: 'Получение текущего профиля авторизованного пользователя' })
  @SwaggerResponse({ status: 200, description: 'Данные профиля успешно получены' })
  @SwaggerResponse({ status: 401, description: 'Не авторизован' })
  getProfile(@CurrentUser() user: UserProfile): ApiResponse<UserProfile> {
    return this.authService.getProfile(user);
  }
}
