import {
  Body,
  Controller,
  Get,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiResponse, ContactsData, UserProfile, UserRole } from '@college/shared';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ContactsService } from './contacts.service';
import { UpdateContactsDto } from './dto/update-contacts.dto';

@ApiTags('Контакты и реквизиты (Aloqa)')
@Controller('contacts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Получение контактных данных, корпусов и справочника телефонов' })
  @SwaggerResponse({ status: 200, description: 'Контактные данные успешно получены' })
  async getContacts(): Promise<ApiResponse<ContactsData>> {
    return this.contactsService.getContacts();
  }

  @Put()
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Обновление контактных данных, адресов корпусов и телефонов' })
  @SwaggerResponse({ status: 200, description: 'Контактные данные обновлены' })
  @SwaggerResponse({ status: 403, description: 'Недостаточно прав' })
  async updateContacts(
    @Body() dto: UpdateContactsDto,
    @CurrentUser() user: UserProfile,
  ): Promise<ApiResponse<ContactsData>> {
    return this.contactsService.updateContacts(dto, user);
  }
}
