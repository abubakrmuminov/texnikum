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
  ApiResponse as SwaggerResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  ApiResponse,
  PaginatedResponse,
  Specialty,
  UserProfile,
  UserRole,
} from '@college/shared';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { QuerySpecialtiesDto } from './dto/query-specialties.dto';
import { UpdateSpecialtyDto } from './dto/update-specialty.dto';
import { SpecialtiesService } from './specialties.service';

@ApiTags('Специальности и поступление')
@Controller('specialties')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SpecialtiesController {
  constructor(private readonly specialtiesService: SpecialtiesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Получение списка специальностей колледжа' })
  @SwaggerResponse({ status: 200, description: 'Список специальностей получен' })
  async findAll(@Query() query: QuerySpecialtiesDto): Promise<ApiResponse<PaginatedResponse<Specialty>>> {
    return this.specialtiesService.findAll(query);
  }

  @Public()
  @Get(':slugOrId')
  @ApiOperation({ summary: 'Получение детальной информации о специальности' })
  @SwaggerResponse({ status: 200, description: 'Специальность найдена' })
  @SwaggerResponse({ status: 404, description: 'Специальность не найдена' })
  async findOne(@Param('slugOrId') slugOrId: string): Promise<ApiResponse<Specialty>> {
    return this.specialtiesService.findOne(slugOrId);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Добавление новой специальности' })
  @SwaggerResponse({ status: 201, description: 'Специальность создана' })
  async create(
    @Body() dto: CreateSpecialtyDto,
    @CurrentUser() user: UserProfile,
  ): Promise<ApiResponse<Specialty>> {
    return this.specialtiesService.create(dto, user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Редактирование специальности' })
  @SwaggerResponse({ status: 200, description: 'Специальность обновлена' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSpecialtyDto,
    @CurrentUser() user: UserProfile,
  ): Promise<ApiResponse<Specialty>> {
    return this.specialtiesService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Удаление специальности' })
  @SwaggerResponse({ status: 200, description: 'Специальность удалена' })
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: UserProfile,
  ): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.specialtiesService.delete(id, user);
  }
}
