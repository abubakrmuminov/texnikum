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
  Department,
  PaginatedResponse,
  Teacher,
  UserProfile,
  UserRole,
} from '@college/shared';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { QueryTeachersDto } from './dto/query-teachers.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { TeachersService } from './teachers.service';

@ApiTags('Преподавательский состав')
@Controller('teachers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Получение списка преподавателей с фильтрами по отделению и предмету' })
  @SwaggerResponse({ status: 200, description: 'Список преподавателей получен' })
  async findAll(@Query() query: QueryTeachersDto): Promise<ApiResponse<PaginatedResponse<Teacher>>> {
    return this.teachersService.findAll(query);
  }

  @Public()
  @Get('departments')
  @ApiOperation({ summary: 'Получение списка всех отделений / кафедр' })
  @SwaggerResponse({ status: 200, description: 'Список отделений получен' })
  async findDepartments(): Promise<ApiResponse<Department[]>> {
    return this.teachersService.findAllDepartments();
  }

  @Public()
  @Get(':slugOrId')
  @ApiOperation({ summary: 'Получение профиля преподавателя по slug или ID' })
  @SwaggerResponse({ status: 200, description: 'Преподаватель найден' })
  @SwaggerResponse({ status: 404, description: 'Преподаватель не найден' })
  async findOne(@Param('slugOrId') slugOrId: string): Promise<ApiResponse<Teacher>> {
    return this.teachersService.findOne(slugOrId);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Добавление преподавателя в систему' })
  @SwaggerResponse({ status: 201, description: 'Преподаватель успешно добавлен' })
  async create(
    @Body() dto: CreateTeacherDto,
    @CurrentUser() user: UserProfile,
  ): Promise<ApiResponse<Teacher>> {
    return this.teachersService.create(dto, user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Обновление данных преподавателя' })
  @SwaggerResponse({ status: 200, description: 'Данные обновлены' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTeacherDto,
    @CurrentUser() user: UserProfile,
  ): Promise<ApiResponse<Teacher>> {
    return this.teachersService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Удаление преподавателя из системы' })
  @SwaggerResponse({ status: 200, description: 'Преподаватель удален' })
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: UserProfile,
  ): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.teachersService.delete(id, user);
  }
}
