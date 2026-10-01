import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse as SwaggerResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  ApiResponse,
  InstitutionFullSettings,
  UserProfile,
  UserRole,
} from '@college/shared';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UpdateInstitutionDto } from './dto/update-institution.dto';
import { InstitutionService } from './institution.service';

@ApiTags('Панель администратора: Управление заведением (Admin Institution)')
@ApiBearerAuth('JWT-auth')
@Controller('admin/institution')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminInstitutionController {
  constructor(private readonly institutionService: InstitutionService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Получение полных настроек учреждения (включая приватные финансовые реквизиты)',
  })
  @SwaggerResponse({ status: 200, description: 'Полные настройки заведения успешно получены' })
  @SwaggerResponse({ status: 403, description: 'Доступ запрещен (требуется роль admin)' })
  async getSettings(): Promise<ApiResponse<InstitutionFullSettings>> {
    return this.institutionService.getAdminSettings();
  }

  @Patch()
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Обновление настроек учреждения (публичных и приватных реквизитов)',
  })
  @SwaggerResponse({ status: 200, description: 'Настройки успешно обновлены' })
  @SwaggerResponse({ status: 400, description: 'Ошибка валидации полей' })
  @SwaggerResponse({ status: 403, description: 'Доступ запрещен' })
  async updateSettings(
    @Body() dto: UpdateInstitutionDto,
    @CurrentUser() currentUser: UserProfile,
  ): Promise<ApiResponse<InstitutionFullSettings>> {
    return this.institutionService.updateAdminSettings(dto, currentUser);
  }

  @Post('upload-asset')
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Загрузка логотипа, фавикона или герба учреждения (PNG, JPG, WEBP; SVG запрещен)',
  })
  @ApiQuery({
    name: 'type',
    enum: ['logo', 'favicon', 'coat_of_arms'],
    description: 'Тип загружаемого ассета',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Файл изображения (PNG, JPG, WEBP)',
        },
      },
    },
  })
  @SwaggerResponse({ status: 201, description: 'Файл успешно загружен, возвращен URL' })
  @SwaggerResponse({ status: 400, description: 'Файл недопустимого формата или превышает лимит размера' })
  async uploadAsset(
    @UploadedFile() file: Express.Multer.File,
    @Query('type') type: 'logo' | 'favicon' | 'coat_of_arms' = 'logo',
    @CurrentUser() currentUser: UserProfile,
  ): Promise<ApiResponse<{ url: string }>> {
    return this.institutionService.uploadBrandAsset(file, type, currentUser);
  }
}
