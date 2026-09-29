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
  NewsCategory,
  NewsItem,
  PaginatedResponse,
  UserProfile,
  UserRole,
} from '@college/shared';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateNewsDto } from './dto/create-news.dto';
import { QueryNewsDto } from './dto/query-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { NewsService } from './news.service';

@ApiTags('Новости и публикации')
@Controller('news')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Получение списка новостей с фильтрацией и пагинацией' })
  @SwaggerResponse({ status: 200, description: 'Список новостей получен' })
  async findAll(@Query() query: QueryNewsDto): Promise<ApiResponse<PaginatedResponse<NewsItem>>> {
    return this.newsService.findAll(query);
  }

  @Public()
  @Get('categories')
  @ApiOperation({ summary: 'Получение списка всех рубрик новостей' })
  @SwaggerResponse({ status: 200, description: 'Список рубрик' })
  async findCategories(): Promise<ApiResponse<NewsCategory[]>> {
    return this.newsService.findAllCategories();
  }

  @Public()
  @Get('featured')
  @ApiOperation({ summary: 'Получение главной закрепленной новости (Bento Hero)' })
  @SwaggerResponse({ status: 200, description: 'Главная новость' })
  async findFeatured(): Promise<ApiResponse<NewsItem | null>> {
    return this.newsService.findFeatured();
  }

  @Public()
  @Get(':slugOrId')
  @ApiOperation({ summary: 'Получение детальной новости по символьному slug или ID' })
  @SwaggerResponse({ status: 200, description: 'Новость найдена' })
  @SwaggerResponse({ status: 404, description: 'Новость не найдена' })
  async findOne(@Param('slugOrId') slugOrId: string): Promise<ApiResponse<NewsItem>> {
    return this.newsService.findOne(slugOrId);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Создание новости (для администраторов и редакторов)' })
  @SwaggerResponse({ status: 201, description: 'Новость успешно создана' })
  @SwaggerResponse({ status: 403, description: 'Недостаточно прав' })
  async create(
    @Body() dto: CreateNewsDto,
    @CurrentUser() user: UserProfile,
  ): Promise<ApiResponse<NewsItem>> {
    return this.newsService.create(dto, user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Редактирование новости' })
  @SwaggerResponse({ status: 200, description: 'Новость обновлена' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateNewsDto,
    @CurrentUser() user: UserProfile,
  ): Promise<ApiResponse<NewsItem>> {
    return this.newsService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Удаление новости (только администратор)' })
  @SwaggerResponse({ status: 200, description: 'Новость удалена' })
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: UserProfile,
  ): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.newsService.delete(id, user);
  }

  @Post('categories')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Создание новой рубрики новостей' })
  @SwaggerResponse({ status: 201, description: 'Рубрика создана' })
  async createCategory(
    @Body() dto: CreateCategoryDto,
    @CurrentUser() user: UserProfile,
  ): Promise<ApiResponse<NewsCategory>> {
    return this.newsService.createCategory(dto, user);
  }
}
