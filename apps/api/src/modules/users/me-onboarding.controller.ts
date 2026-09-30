import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiResponse, OnboardingState, UserProfile } from '@college/shared';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateOnboardingDto } from './dto/update-onboarding.dto';
import { UsersService } from './users.service';

@ApiTags('Онбординг пользователя (/me/onboarding)')
@ApiBearerAuth('JWT-auth')
@Controller('me/onboarding')
@UseGuards(JwtAuthGuard)
export class MeOnboardingController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Получение состояния онбординга текущего пользователя' })
  @SwaggerResponse({
    status: 200,
    description: 'Текущее состояние онбординга (тур и разделы)',
  })
  async getOnboarding(
    @CurrentUser() user: UserProfile,
  ): Promise<ApiResponse<OnboardingState>> {
    return this.usersService.getOnboarding(user.id);
  }

  @Patch()
  @ApiOperation({
    summary: 'Обновление состояния онбординга (слияние без перезаписи)',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Обновленное состояние онбординга пользователя',
  })
  async patchOnboarding(
    @CurrentUser() user: UserProfile,
    @Body() dto: UpdateOnboardingDto,
  ): Promise<ApiResponse<OnboardingState>> {
    return this.usersService.patchOnboarding(user.id, dto);
  }
}
