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
  EventItem,
  PaginatedResponse,
  UserProfile,
  UserRole,
} from '@college/shared';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateEventDto } from './dto/create-event.dto';
import { QueryEventsDto } from './dto/query-events.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventsService } from './events.service';

@ApiTags('Календарь событий и мероприятий')
@Controller('events')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Получение календаря мероприятий с фильтрацией' })
  @SwaggerResponse({ status: 200, description: 'Список событий получен' })
  async findAll(@Query() query: QueryEventsDto): Promise<ApiResponse<PaginatedResponse<EventItem>>> {
    return this.eventsService.findAll(query);
  }

  @Public()
  @Get(':slugOrId')
  @ApiOperation({ summary: 'Получение детальной информации о мероприятии' })
  @SwaggerResponse({ status: 200, description: 'Событие найдено' })
  @SwaggerResponse({ status: 404, description: 'Событие не найдено' })
  async findOne(@Param('slugOrId') slugOrId: string): Promise<ApiResponse<EventItem>> {
    return this.eventsService.findOne(slugOrId);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Создание нового события' })
  @SwaggerResponse({ status: 201, description: 'Событие успешно создано' })
  async create(
    @Body() dto: CreateEventDto,
    @CurrentUser() user: UserProfile,
  ): Promise<ApiResponse<EventItem>> {
    return this.eventsService.create(dto, user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Обновление мероприятия' })
  @SwaggerResponse({ status: 200, description: 'Событие обновлено' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
    @CurrentUser() user: UserProfile,
  ): Promise<ApiResponse<EventItem>> {
    return this.eventsService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Удаление мероприятия' })
  @SwaggerResponse({ status: 200, description: 'Событие удалено' })
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: UserProfile,
  ): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.eventsService.delete(id, user);
  }
}
