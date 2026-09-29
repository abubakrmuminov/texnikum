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
  ScheduleItem,
  UserProfile,
  UserRole,
} from '@college/shared';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { QueryScheduleDto } from './dto/query-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { ScheduleService } from './schedule.service';

@ApiTags('Расписание занятий')
@Controller('schedule')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Получение расписания с фильтрацией по группе, преподавателю, дню и четности' })
  @SwaggerResponse({ status: 200, description: 'Расписание получено' })
  async findAll(@Query() query: QueryScheduleDto): Promise<ApiResponse<ScheduleItem[]>> {
    return this.scheduleService.findAll(query);
  }

  @Public()
  @Get('groups')
  @ApiOperation({ summary: 'Получение списка всех доступных учебных групп' })
  @SwaggerResponse({ status: 200, description: 'Список групп' })
  async findGroups(): Promise<ApiResponse<string[]>> {
    return this.scheduleService.findGroups();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Получение конкретного занятия по ID' })
  @SwaggerResponse({ status: 200, description: 'Занятие найдено' })
  async findOne(@Param('id') id: string): Promise<ApiResponse<ScheduleItem>> {
    return this.scheduleService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Добавление занятия в расписание' })
  @SwaggerResponse({ status: 201, description: 'Занятие добавлено' })
  async create(
    @Body() dto: CreateScheduleDto,
    @CurrentUser() user: UserProfile,
  ): Promise<ApiResponse<ScheduleItem>> {
    return this.scheduleService.create(dto, user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Обновление занятия в расписании' })
  @SwaggerResponse({ status: 200, description: 'Занятие обновлено' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateScheduleDto,
    @CurrentUser() user: UserProfile,
  ): Promise<ApiResponse<ScheduleItem>> {
    return this.scheduleService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Удаление занятия из расписания' })
  @SwaggerResponse({ status: 200, description: 'Занятие удалено' })
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: UserProfile,
  ): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.scheduleService.delete(id, user);
  }
}
