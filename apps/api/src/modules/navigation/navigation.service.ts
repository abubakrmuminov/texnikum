import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiResponse,
  NavigationItem,
  NavigationMenuLocation,
  UserProfile,
  UserRole,
} from '@college/shared';
import { AuditService } from '../audit/audit.service';
import { CacheService } from '../cache/cache.service';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateNavigationItemDto } from './dto/create-navigation-item.dto';
import { DeleteNavigationItemDto, UpdateNavigationItemDto } from './dto/update-navigation-item.dto';

const FACTORY_NAVIGATION_ITEMS: NavigationItem[] = [
  // Header
  {
    id: '00000000-0000-0000-0001-000000000001',
    parentId: null,
    location: 'header',
    labelUz: 'Bosh sahifa',
    labelRu: 'Главная',
    targetType: 'module',
    path: '/',
    iconName: 'BookOpen',
    openInNewTab: false,
    isVisible: true,
    sortOrder: 10,
    isSystem: true,
    isRequired: false,
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0001-000000000002',
    parentId: null,
    location: 'header',
    labelUz: 'Texnikum haqida',
    labelRu: 'О техникуме',
    targetType: 'module',
    path: '/info',
    iconName: 'Info',
    openInNewTab: false,
    isVisible: true,
    sortOrder: 20,
    isSystem: true,
    isRequired: true,
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0001-000000000011',
    parentId: '00000000-0000-0000-0001-000000000002',
    location: 'header',
    labelUz: 'Asosiy maʼlumotlar',
    labelRu: 'Основные сведения',
    targetType: 'internal_page',
    path: '/info/info-common',
    openInNewTab: false,
    isVisible: true,
    sortOrder: 10,
    isSystem: true,
    isRequired: true,
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0001-000000000012',
    parentId: '00000000-0000-0000-0001-000000000002',
    location: 'header',
    labelUz: 'Tuzilma va boshqaruv',
    labelRu: 'Структура и органы управления',
    targetType: 'internal_page',
    path: '/info/info-struct',
    openInNewTab: false,
    isVisible: true,
    sortOrder: 20,
    isSystem: true,
    isRequired: true,
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0001-000000000013',
    parentId: '00000000-0000-0000-0001-000000000002',
    location: 'header',
    labelUz: 'Meʼyoriy hujjatlar',
    labelRu: 'Документы и лицензии',
    targetType: 'internal_page',
    path: '/info/info-documents',
    openInNewTab: false,
    isVisible: true,
    sortOrder: 30,
    isSystem: true,
    isRequired: true,
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0001-000000000014',
    parentId: '00000000-0000-0000-0001-000000000002',
    location: 'header',
    labelUz: 'Moddiy-texnik taʼminot',
    labelRu: 'Материально-техническая база',
    targetType: 'internal_page',
    path: '/info/info-material',
    openInNewTab: false,
    isVisible: true,
    sortOrder: 40,
    isSystem: true,
    isRequired: true,
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0001-000000000015',
    parentId: '00000000-0000-0000-0001-000000000002',
    location: 'header',
    labelUz: 'Moliyaviy faoliyat',
    labelRu: 'Финансовая деятельность',
    targetType: 'internal_page',
    path: '/info/info-financial',
    openInNewTab: false,
    isVisible: true,
    sortOrder: 50,
    isSystem: true,
    isRequired: true,
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0001-000000000016',
    parentId: '00000000-0000-0000-0001-000000000002',
    location: 'header',
    labelUz: 'Xalqaro hamkorlik',
    labelRu: 'Международное сотрудничество',
    targetType: 'internal_page',
    path: '/info/info-international',
    openInNewTab: false,
    isVisible: true,
    sortOrder: 60,
    isSystem: true,
    isRequired: true,
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0001-000000000017',
    parentId: '00000000-0000-0000-0001-000000000002',
    location: 'header',
    labelUz: 'Barcha 12 boʻlim (37-modda)',
    labelRu: 'Все 12 обязательных разделов',
    targetType: 'module',
    path: '/info',
    openInNewTab: false,
    isVisible: true,
    sortOrder: 70,
    isSystem: true,
    isRequired: true,
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0001-000000000003',
    parentId: null,
    location: 'header',
    labelUz: 'Taʼlim yoʻnalishlari',
    labelRu: 'Специальности',
    targetType: 'module',
    path: '/specialties',
    iconName: 'GraduationCap',
    openInNewTab: false,
    isVisible: true,
    sortOrder: 30,
    isSystem: true,
    isRequired: false,
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0001-000000000004',
    parentId: null,
    location: 'header',
    labelUz: 'Rahbariyat va maʼmuriyat',
    labelRu: 'Руководство и администрация',
    targetType: 'module',
    path: '/administration',
    iconName: 'Users',
    openInNewTab: false,
    isVisible: true,
    sortOrder: 40,
    isSystem: true,
    isRequired: true,
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0001-000000000005',
    parentId: null,
    location: 'header',
    labelUz: 'Oʻqituvchilar',
    labelRu: 'Преподаватели',
    targetType: 'module',
    path: '/teachers',
    iconName: 'Users',
    openInNewTab: false,
    isVisible: true,
    sortOrder: 50,
    isSystem: true,
    isRequired: false,
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0001-000000000006',
    parentId: null,
    location: 'header',
    labelUz: 'Yangiliklar',
    labelRu: 'Новости',
    targetType: 'module',
    path: '/news',
    iconName: 'Newspaper',
    openInNewTab: false,
    isVisible: true,
    sortOrder: 60,
    isSystem: true,
    isRequired: false,
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0001-000000000007',
    parentId: null,
    location: 'header',
    labelUz: 'Bogʻlanish va aloqa',
    labelRu: 'Контакты',
    targetType: 'module',
    path: '/contacts',
    iconName: 'Phone',
    openInNewTab: false,
    isVisible: true,
    sortOrder: 70,
    isSystem: true,
    isRequired: true,
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z',
  },
];

@Injectable()
export class NavigationService {
  private readonly logger = new Logger(NavigationService.name);
  private items: NavigationItem[] = JSON.parse(JSON.stringify(FACTORY_NAVIGATION_ITEMS));

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly auditService: AuditService,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Сборка плоского списка пунктов меню в иерархическое дерево (максимум 1 уровень вложенности)
   */
  private buildTree(items: NavigationItem[]): NavigationItem[] {
    const itemMap = new Map<string, NavigationItem>();
    const roots: NavigationItem[] = [];

    for (const item of items) {
      itemMap.set(item.id, { ...item, children: [] });
    }

    // Сортируем элементы по sortOrder
    const sorted = Array.from(itemMap.values()).sort((a, b) => a.sortOrder - b.sortOrder);

    for (const item of sorted) {
      if (item.parentId && itemMap.has(item.parentId)) {
        const parent = itemMap.get(item.parentId)!;
        parent.children = parent.children || [];
        parent.children.push(item);
      } else {
        roots.push(item);
      }
    }

    return roots;
  }

  /**
   * Получение публичного дерева навигации (только видимые и не удаленные)
   */
  async getPublicNavigation(location?: NavigationMenuLocation): Promise<ApiResponse<NavigationItem[]>> {
    const cacheKey = `navigation:public:${location || 'all'}`;
    const cached = await this.cacheService.get<NavigationItem[]>(cacheKey);
    if (cached) {
      return {
        success: true,
        data: cached,
        timestamp: new Date().toISOString(),
      };
    }

    let activeItems: NavigationItem[];

    if (this.supabaseService.isReady()) {
      const client = this.supabaseService.getClient()!;
      let query = client
        .from('navigation_items')
        .select('*')
        .eq('is_visible', true)
        .is('deleted_at', null)
        .order('sort_order', { ascending: true });

      if (location) {
        query = query.eq('location', location);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        activeItems = data.map(this.mapDbItemToModel);
      } else {
        activeItems = this.items.filter(
          (i) => i.isVisible && !i.deletedAt && (!location || i.location === location),
        );
      }
    } else {
      activeItems = this.items.filter(
        (i) => i.isVisible && !i.deletedAt && (!location || i.location === location),
      );
    }

    const tree = this.buildTree(activeItems);
    await this.cacheService.set(cacheKey, tree, 300);

    return {
      success: true,
      data: tree,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Получение всех пунктов навигации для панели управления (включая скрытые и удаленные)
   */
  async getAllForAdmin(includeDeleted = false): Promise<ApiResponse<NavigationItem[]>> {
    let allItems: NavigationItem[];

    if (this.supabaseService.isReady()) {
      const client = this.supabaseService.getClient()!;
      let query = client
        .from('navigation_items')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!includeDeleted) {
        query = query.is('deleted_at', null);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        allItems = data.map(this.mapDbItemToModel);
      } else {
        allItems = this.items.filter((i) => includeDeleted || !i.deletedAt);
      }
    } else {
      allItems = this.items.filter((i) => includeDeleted || !i.deletedAt);
    }

    const tree = this.buildTree(allItems);
    return {
      success: true,
      data: tree,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Создание нового пункта навигации (только Admin)
   */
  async create(dto: CreateNavigationItemDto, user: UserProfile): Promise<ApiResponse<NavigationItem>> {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Только администратор имеет право изменять структуру навигации');
    }

    // Проверка глубины вложенности: строгий максимум 1 уровень!
    if (dto.parentId) {
      const parent = await this.findRawItem(dto.parentId);
      if (!parent) {
        throw new NotFoundException(`Родительский пункт с ID «${dto.parentId}» не найден`);
      }
      if (parent.parentId !== null) {
        throw new BadRequestException(
          'Вложенность меню строго ограничена 1 уровнем (корень + прямые дочерние ссылки). Нельзя делать вложенность глубже 1 уровня.',
        );
      }
    }

    const newItem: NavigationItem = {
      id: `nav-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      parentId: dto.parentId || null,
      location: dto.location || 'header',
      labelUz: dto.labelUz,
      labelRu: dto.labelRu,
      targetType: dto.targetType || 'internal_page',
      path: dto.path,
      pageId: dto.pageId || null,
      iconName: dto.iconName || null,
      badgeTextUz: dto.badgeTextUz || null,
      badgeTextRu: dto.badgeTextRu || null,
      openInNewTab: Boolean(dto.openInNewTab),
      isVisible: dto.isVisible !== undefined ? dto.isVisible : true,
      sortOrder: dto.sortOrder || 0,
      isSystem: false,
      isRequired: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (this.supabaseService.isReady()) {
      const client = this.supabaseService.getClient()!;
      await client.from('navigation_items').insert({
        parent_id: newItem.parentId,
        location: newItem.location,
        label_uz: newItem.labelUz,
        label_ru: newItem.labelRu,
        target_type: newItem.targetType,
        path: newItem.path,
        page_id: newItem.pageId,
        icon_name: newItem.iconName,
        badge_text_uz: newItem.badgeTextUz,
        badge_text_ru: newItem.badgeTextRu,
        open_in_new_tab: newItem.openInNewTab,
        is_visible: newItem.isVisible,
        sort_order: newItem.sortOrder,
        is_system: false,
        is_required: false,
      });
    }

    this.items.push(newItem);

    await this.auditService.log(
      user.id,
      'CREATE',
      'navigation_items',
      newItem.id,
      newItem as unknown as Record<string, unknown>,
    );
    await this.cacheService.delByPattern('navigation:*');

    return {
      success: true,
      data: newItem,
      message: 'Пункт меню успешно создан',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Обновление пункта навигации (только Admin)
   */
  async update(
    id: string,
    dto: UpdateNavigationItemDto,
    user: UserProfile,
  ): Promise<ApiResponse<NavigationItem>> {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Только администратор имеет право изменять структуру навигации');
    }

    const existing = await this.findRawItem(id);
    if (!existing) {
      throw new NotFoundException(`Пункт навигации с ID «${id}» не найден`);
    }

    // Защита обязательных разделов (ст. 37 ЗРУ-637): если раздел обязателен и скрывается, требуется confirm=true
    if (existing.isRequired && dto.isVisible === false && !dto.confirm) {
      throw new BadRequestException(
        'Скрытие обязательного уставного раздела (ст. 37 ЗРУ-637) требует обязательного флага подтверждения confirm=true',
      );
    }

    // Проверка глубины вложенности:
    if (dto.parentId !== undefined && dto.parentId !== null) {
      if (dto.parentId === id) {
        throw new BadRequestException('Пункт меню не может быть своим собственным родителем');
      }
      const parent = await this.findRawItem(dto.parentId);
      if (!parent) {
        throw new NotFoundException(`Родительский пункт с ID «${dto.parentId}» не найден`);
      }
      if (parent.parentId !== null) {
        throw new BadRequestException(
          'Вложенность меню строго ограничена 1 уровнем (корень + прямые дочерние ссылки). Нельзя делать вложенность глубже 1 уровня.',
        );
      }
      // Также проверяем: если текущий пункт уже имеет детей, его нельзя делать дочерним
      const hasChildren = this.items.some((i) => i.parentId === id && !i.deletedAt);
      if (hasChildren) {
        throw new BadRequestException(
          'Пункт меню, имеющий дочерние элементы, не может быть перемещен внутрь другого пункта (превышение лимита вложенности).',
        );
      }
    }

    const updated: NavigationItem = {
      ...existing,
      ...dto,
      parentId: dto.parentId !== undefined ? dto.parentId : existing.parentId,
      updatedAt: new Date().toISOString(),
    };

    const index = this.items.findIndex((i) => i.id === id);
    if (index !== -1) {
      this.items[index] = updated;
    }

    if (this.supabaseService.isReady()) {
      const client = this.supabaseService.getClient()!;
      await client
        .from('navigation_items')
        .update({
          parent_id: updated.parentId,
          location: updated.location,
          label_uz: updated.labelUz,
          label_ru: updated.labelRu,
          target_type: updated.targetType,
          path: updated.path,
          page_id: updated.pageId,
          icon_name: updated.iconName,
          badge_text_uz: updated.badgeTextUz,
          badge_text_ru: updated.badgeTextRu,
          open_in_new_tab: updated.openInNewTab,
          is_visible: updated.isVisible,
          sort_order: updated.sortOrder,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
    }

    await this.auditService.log(
      user.id,
      'UPDATE',
      'navigation_items',
      id,
      updated as unknown as Record<string, unknown>,
      existing as unknown as Record<string, unknown>,
    );
    await this.cacheService.delByPattern('navigation:*');

    return {
      success: true,
      data: updated,
      message: 'Пункт меню успешно обновлен',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Удаление пункта навигации (Soft Delete)
   */
  async delete(
    id: string,
    dto: DeleteNavigationItemDto,
    user: UserProfile,
  ): Promise<ApiResponse<{ deleted: boolean }>> {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Только администратор имеет право изменять структуру навигации');
    }

    const existing = await this.findRawItem(id);
    if (!existing) {
      throw new NotFoundException(`Пункт навигации с ID «${id}» не найден`);
    }

    // Системные пункты нельзя физически удалять
    // А если он обязателен, требуется явное подтверждение confirm=true
    if (existing.isRequired && !dto.confirm) {
      throw new BadRequestException(
        'Удаление обязательного уставного раздела (ст. 37 ЗРУ-637) требует обязательного флага подтверждения confirm=true',
      );
    }

    const deletedAt = new Date().toISOString();
    const index = this.items.findIndex((i) => i.id === id);
    if (index !== -1) {
      this.items[index].deletedAt = deletedAt;
    }

    if (this.supabaseService.isReady()) {
      const client = this.supabaseService.getClient()!;
      await client
        .from('navigation_items')
        .update({ deleted_at: deletedAt })
        .eq('id', id);
    }

    await this.auditService.log(
      user.id,
      'DELETE',
      'navigation_items',
      id,
      undefined,
      existing as unknown as Record<string, unknown>,
    );
    await this.cacheService.delByPattern('navigation:*');

    return {
      success: true,
      data: { deleted: true },
      message: 'Пункт меню перемещен в корзину',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Восстановление пункта из корзины
   */
  async restore(id: string, user: UserProfile): Promise<ApiResponse<NavigationItem>> {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Только администратор имеет право восстанавливать структуру');
    }

    const existing = await this.findRawItem(id, true);
    if (!existing) {
      throw new NotFoundException(`Пункт навигации с ID «${id}» не найден`);
    }

    const updated: NavigationItem = {
      ...existing,
      deletedAt: null,
      updatedAt: new Date().toISOString(),
    };

    const index = this.items.findIndex((i) => i.id === id);
    if (index !== -1) {
      this.items[index] = updated;
    }

    if (this.supabaseService.isReady()) {
      const client = this.supabaseService.getClient()!;
      await client
        .from('navigation_items')
        .update({ deleted_at: null, updated_at: new Date().toISOString() })
        .eq('id', id);
    }

    await this.auditService.log(
      user.id,
      'UPDATE',
      'navigation_items',
      id,
      updated as unknown as Record<string, unknown>,
      existing as unknown as Record<string, unknown>,
    );
    await this.cacheService.delByPattern('navigation:*');

    return {
      success: true,
      data: updated,
      message: 'Пункт меню успешно восстановлен',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Восстановление заводской системной навигации (Restore Defaults)
   */
  async restoreDefaults(user: UserProfile): Promise<ApiResponse<{ restored: boolean; count: number }>> {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Только администратор может восстановить настройки по умолчанию');
    }

    this.items = JSON.parse(JSON.stringify(FACTORY_NAVIGATION_ITEMS));

    if (this.supabaseService.isReady()) {
      const client = this.supabaseService.getClient()!;
      // Сбрасываем soft-delete на системных
      await client
        .from('navigation_items')
        .update({ deleted_at: null, is_visible: true })
        .eq('is_system', true);
    }

    await this.auditService.log(user.id, 'UPDATE', 'navigation_items', 'system_defaults', {
      action: 'restore_defaults',
    });
    await this.cacheService.delByPattern('navigation:*');

    return {
      success: true,
      data: { restored: true, count: FACTORY_NAVIGATION_ITEMS.length },
      message: 'Заводская структура навигации успешно восстановлена',
      timestamp: new Date().toISOString(),
    };
  }

  private async findRawItem(id: string, includeDeleted = false): Promise<NavigationItem | null> {
    const local = this.items.find((i) => i.id === id && (includeDeleted || !i.deletedAt));
    if (local) return local;

    if (this.supabaseService.isReady()) {
      const client = this.supabaseService.getClient()!;
      let query = client.from('navigation_items').select('*').eq('id', id);
      if (!includeDeleted) {
        query = query.is('deleted_at', null);
      }
      const { data } = await query.single();
      if (data) return this.mapDbItemToModel(data);
    }

    return null;
  }

  private mapDbItemToModel(raw: Record<string, unknown>): NavigationItem {
    return {
      id: String(raw.id),
      parentId: raw.parent_id ? String(raw.parent_id) : null,
      location: (raw.location as NavigationMenuLocation) || 'header',
      labelUz: String(raw.label_uz || ''),
      labelRu: String(raw.label_ru || ''),
      targetType: (raw.target_type as NavigationItem['targetType']) || 'internal_page',
      path: String(raw.path || ''),
      pageId: raw.page_id ? String(raw.page_id) : null,
      iconName: raw.icon_name ? String(raw.icon_name) : null,
      badgeTextUz: raw.badge_text_uz ? String(raw.badge_text_uz) : null,
      badgeTextRu: raw.badge_text_ru ? String(raw.badge_text_ru) : null,
      openInNewTab: Boolean(raw.open_in_new_tab),
      isVisible: Boolean(raw.is_visible),
      sortOrder: Number(raw.sort_order || 0),
      isSystem: Boolean(raw.is_system),
      isRequired: Boolean(raw.is_required),
      deletedAt: raw.deleted_at ? String(raw.deleted_at) : null,
      createdAt: String(raw.created_at || new Date().toISOString()),
      updatedAt: String(raw.updated_at || new Date().toISOString()),
    };
  }
}
