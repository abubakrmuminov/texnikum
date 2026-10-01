import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse as SwaggerResponse, ApiTags } from '@nestjs/swagger';
import { ApiResponse, NavigationItem, NavigationMenuLocation } from '@college/shared';
import { Public } from '../auth/decorators/public.decorator';
import { NavigationService } from './navigation.service';

@ApiTags('Публичная навигация сайта')
@Controller('navigation')
export class NavigationController {
  constructor(private readonly navigationService: NavigationService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Получение публичного дерева навигации (шапка, подвал)' })
  @ApiQuery({
    name: 'location',
    required: false,
    enum: ['header', 'footer_regulatory', 'footer_students', 'footer_custom'],
    description: 'Фильтр по расположению меню',
  })
  @SwaggerResponse({ status: 200, description: 'Дерево навигации успешно получено' })
  async getPublicNavigation(
    @Query('location') location?: NavigationMenuLocation,
  ): Promise<ApiResponse<NavigationItem[]>> {
    return this.navigationService.getPublicNavigation(location);
  }
}
