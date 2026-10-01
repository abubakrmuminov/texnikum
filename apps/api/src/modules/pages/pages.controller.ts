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
  ApiQuery,
  ApiResponse as SwaggerResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  ApiResponse,
  PageItem,
  PageRevision,
  ReusableBlock,
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
import { DeletePageDto, UpdatePageDto } from './dto/update-page.dto';
import { CreateReusableBlockDto, UpdateReusableBlockDto } from './dto/reusable-block.dto';
import { PagesService } from './pages.service';

@ApiTags('Обязательные и уставные страницы (ст. 37 ЗРУ-637)')
@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Получение списка опубликованных страниц по разделу' })
  @SwaggerResponse({ status: 200, description: 'Список страниц получен' })
  async findAll(@Query() query: QueryPagesDto): Promise<ApiResponse<PageItem[]>> {
    return this.pagesService.findAll(query);
  }

  @Public()
  @Get('by-slug/:slug')
  @ApiOperation({ summary: 'Получение опубликованной страницы по slug (с поддержкой 301 редиректов)' })
  @ApiQuery({ name: 'lang', required: false, enum: ['uz', 'ru'] })
  @SwaggerResponse({ status: 200, description: 'Страница найдена' })
  @SwaggerResponse({ status: 404, description: 'Страница не найдена' })
  async findBySlug(
    @Param('slug') slug: string,
    @Query('lang') lang?: string,
  ): Promise<ApiResponse<PageItem>> {
    return this.pagesService.findOne(slug, lang || 'uz');
  }

  @Public()
  @Get('reusable-blocks')
  @ApiOperation({ summary: 'Получение списка переиспользуемых блоков' })
  @SwaggerResponse({ status: 200, description: 'Список переиспользуемых блоков получен' })
  async getPublicReusableBlocks(): Promise<ApiResponse<ReusableBlock[]>> {
    return this.pagesService.getAllReusableBlocks();
  }

  @Public()
  @Get('reusable-blocks/:blockId')
  @ApiOperation({ summary: 'Получение одного переиспользуемого блока по ID' })
  @SwaggerResponse({ status: 200, description: 'Блок найден' })
  @SwaggerResponse({ status: 404, description: 'Блок не найден' })
  async getPublicReusableBlockById(
    @Param('blockId') blockId: string,
  ): Promise<ApiResponse<ReusableBlock>> {
    return this.pagesService.getReusableBlockById(blockId);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Получение опубликованной страницы по slug (например, info-common)' })
  @ApiQuery({ name: 'lang', required: false, enum: ['uz', 'ru'] })
  @SwaggerResponse({ status: 200, description: 'Страница найдена' })
  @SwaggerResponse({ status: 404, description: 'Страница не найдена' })
  async findOne(
    @Param('slug') slug: string,
    @Query('lang') lang?: string,
  ): Promise<ApiResponse<PageItem>> {
    return this.pagesService.findOne(slug, lang || 'uz');
  }

  // Обратная совместимость для существующих вызовов /pages
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Создание страницы' })
  async create(
    @Body() dto: CreatePageDto,
    @CurrentUser() user: UserProfile,
  ): Promise<ApiResponse<PageItem>> {
    return this.pagesService.create(dto, user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Обновление страницы' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePageDto,
    @CurrentUser() user: UserProfile,
  ): Promise<ApiResponse<PageItem>> {
    return this.pagesService.update(id, dto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Удаление страницы' })
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: UserProfile,
  ): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.pagesService.delete(id, {}, user);
  }
}

@ApiTags('Панель управления: Конструктор страниц')
@ApiBearerAuth('JWT-auth')
@Controller('admin/pages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminPagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.MODERATOR)
  @ApiOperation({ summary: 'Список всех страниц для админки' })
  @SwaggerResponse({ status: 200, description: 'Список страниц получен' })
  async getAllForAdmin(@Query() query: QueryPagesDto): Promise<ApiResponse<PageItem[]>> {
    return this.pagesService.getAllForAdmin(query);
  }

  @Get('reusable-blocks')
  @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.MODERATOR)
  @ApiOperation({ summary: 'Список переиспользуемых блоков' })
  @SwaggerResponse({ status: 200, description: 'Список получен' })
  async getReusableBlocks(): Promise<ApiResponse<ReusableBlock[]>> {
    return this.pagesService.getAllReusableBlocks();
  }

  @Get('reusable-blocks/:blockId')
  @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.MODERATOR)
  @ApiOperation({ summary: 'Получение переиспользуемого блока по ID' })
  @SwaggerResponse({ status: 200, description: 'Блок найден' })
  async getReusableBlockById(
    @Param('blockId') blockId: string,
  ): Promise<ApiResponse<ReusableBlock>> {
    return this.pagesService.getReusableBlockById(blockId);
  }

  @Post('reusable-blocks')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Создание переиспользуемого блока' })
  @SwaggerResponse({ status: 201, description: 'Блок создан' })
  async createReusableBlock(
    @Body() dto: CreateReusableBlockDto,
    @CurrentUser() user: UserProfile,
  ): Promise<ApiResponse<ReusableBlock>> {
    return this.pagesService.createReusableBlock(dto, user);
  }

  @Patch('reusable-blocks/:blockId')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Обновление переиспользуемого блока' })
  @SwaggerResponse({ status: 200, description: 'Блок обновлен' })
  async updateReusableBlock(
    @Param('blockId') blockId: string,
    @Body() dto: UpdateReusableBlockDto,
    @CurrentUser() user: UserProfile,
  ): Promise<ApiResponse<ReusableBlock>> {
    return this.pagesService.updateReusableBlock(blockId, dto, user);
  }

  @Delete('reusable-blocks/:blockId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Удаление переиспользуемого блока' })
  @SwaggerResponse({ status: 200, description: 'Блок удален' })
  async deleteReusableBlock(
    @Param('blockId') blockId: string,
    @CurrentUser() user: UserProfile,
  ): Promise<ApiResponse<{ deleted: boolean; usageCount: number }>> {
    return this.pagesService.deleteReusableBlock(blockId, user);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.MODERATOR)
  @ApiOperation({ summary: 'Получение страницы по ID' })
  @SwaggerResponse({ status: 200, description: 'Страница найдена' })
  async getByIdForAdmin(@Param('id') id: string): Promise<ApiResponse<PageItem>> {
    return this.pagesService.getByIdForAdmin(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Создание страницы (Admin / Editor)' })
  @SwaggerResponse({ status: 201, description: 'Страница создана' })
  async create(
    @Body() dto: CreatePageDto,
    @CurrentUser() user: UserProfile,
  ): Promise<ApiResponse<PageItem>> {
    return this.pagesService.create(dto, user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Обновление страницы и блоков (Admin / Editor)' })
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
  @ApiOperation({ summary: 'Удаление страницы (только Admin)' })
  @SwaggerResponse({ status: 200, description: 'Страница перемещена в корзину' })
  async delete(
    @Param('id') id: string,
    @Body() dto: DeletePageDto,
    @CurrentUser() user: UserProfile,
  ): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.pagesService.delete(id, dto, user);
  }

  @Post(':id/duplicate')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Дублирование страницы как нового черновика' })
  @SwaggerResponse({ status: 201, description: 'Страница скопирована' })
  async duplicate(
    @Param('id') id: string,
    @CurrentUser() user: UserProfile,
  ): Promise<ApiResponse<PageItem>> {
    return this.pagesService.duplicate(id, user);
  }

  @Get(':id/revisions')
  @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.MODERATOR)
  @ApiOperation({ summary: 'История ревизий страницы (до 20 записей)' })
  @SwaggerResponse({ status: 200, description: 'История ревизий получена' })
  async listRevisions(@Param('id') id: string): Promise<ApiResponse<PageRevision[]>> {
    return this.pagesService.listRevisions(id);
  }

  @Post(':id/revisions/:revisionId/restore')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Восстановление страницы из ревизии' })
  @SwaggerResponse({ status: 200, description: 'Страница восстановлена' })
  async restoreRevision(
    @Param('id') id: string,
    @Param('revisionId') revisionId: string,
    @CurrentUser() user: UserProfile,
  ): Promise<ApiResponse<PageItem>> {
    return this.pagesService.restoreRevision(id, revisionId, user);
  }
}
