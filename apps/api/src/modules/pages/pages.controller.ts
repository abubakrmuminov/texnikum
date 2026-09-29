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
  PageItem,
  UserProfile,
  UserRole,
} from '@college/shared';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreatePageDto } from './dto/create-page.dto';
import { QueryPagesDto } from './dto/query-pages.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { PagesService } from './pages.service';

@ApiTags('Обязательные и уставные страницы (ст. 37 ЗРУ-637)')
@Controller('pages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Получение списка страниц по разделу' })
  @SwaggerResponse({ status: 200, description: 'Список страниц получен' })
  async findAll(@Query() query: QueryPagesDto): Promise<ApiResponse<PageItem[]>> {
    return this.pagesService.findAll(query);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Получение страницы по slug (например, info-common)' })
  @SwaggerResponse({ status: 200, description: 'Страница найдена' })
  @SwaggerResponse({ status: 404, description: 'Страница не найдена' })
  async findOne(@Param('slug') slug: string): Promise<ApiResponse<PageItem>> {
    return this.pagesService.findOne(slug);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Создание страницы' })
  @SwaggerResponse({ status: 201, description: 'Страница создана' })
  async create(
    @Body() dto: CreatePageDto,
    @CurrentUser() user: UserProfile,
  ): Promise<ApiResponse<PageItem>> {
    return this.pagesService.create(dto, user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Обновление страницы' })
  @SwaggerResponse({ status: 200, description: 'Страница обновлена' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePageDto,
    @CurrentUser() user: UserProfile,
  ): Promise<ApiResponse<PageItem>> {
    return this.pagesService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Удаление страницы' })
  @SwaggerResponse({ status: 200, description: 'Страница удалена' })
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: UserProfile,
  ): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.pagesService.delete(id, user);
  }
}
