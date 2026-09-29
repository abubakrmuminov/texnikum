import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
  ApiResponse as SwaggerResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  ApiResponse,
  MediaFile,
  StorageBucket,
  UserProfile,
  UserRole,
} from '@college/shared';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UploadMediaDto } from './dto/upload-media.dto';
import { MediaService } from './media.service';

@ApiTags('Медиафайлы и документы (Хранилище)')
@ApiBearerAuth('JWT-auth')
@Controller('media')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.MODERATOR)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Безопасная загрузка файла в хранилище с проверкой размера и MIME-типа' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        bucket: {
          type: 'string',
          enum: ['news-media', 'official-docs'],
          description: 'Целевой бакет',
        },
        file: {
          type: 'string',
          format: 'binary',
          description: 'Загружаемый файл',
        },
      },
    },
  })
  @SwaggerResponse({ status: 201, description: 'Файл успешно загружен' })
  @SwaggerResponse({ status: 400, description: 'Файл не прошел валидацию типа или размера' })
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadMediaDto,
    @CurrentUser() user: UserProfile,
  ): Promise<ApiResponse<MediaFile>> {
    return this.mediaService.uploadFile(file, dto.bucket, user);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Получение списка загруженных медиафайлов' })
  @SwaggerResponse({ status: 200, description: 'Список медиафайлов получен' })
  async findAll(@Query('bucket') bucket?: StorageBucket): Promise<ApiResponse<MediaFile[]>> {
    return this.mediaService.findAll(bucket);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Удаление файла' })
  @SwaggerResponse({ status: 200, description: 'Файл удален' })
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: UserProfile,
  ): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.mediaService.delete(id, user);
  }
}
