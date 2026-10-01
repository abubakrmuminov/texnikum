export type NavigationMenuLocation =
  | 'header'
  | 'footer_regulatory'
  | 'footer_students'
  | 'footer_custom';

export type NavigationTargetType = 'internal_page' | 'module' | 'custom_url';

export interface NavigationItem {
  id: string;
  parentId: string | null;
  location: NavigationMenuLocation;
  labelUz: string;
  labelRu: string;
  targetType: NavigationTargetType;
  path: string;
  pageId?: string | null;
  iconName?: string | null;
  badgeTextUz?: string | null;
  badgeTextRu?: string | null;
  openInNewTab: boolean;
  isVisible: boolean;
  sortOrder: number;
  isSystem: boolean;
  isRequired: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  children?: NavigationItem[];
}

export interface CreateNavigationItemPayload {
  parentId?: string | null;
  location?: NavigationMenuLocation;
  labelUz: string;
  labelRu: string;
  targetType?: NavigationTargetType;
  path: string;
  pageId?: string | null;
  iconName?: string | null;
  badgeTextUz?: string | null;
  badgeTextRu?: string | null;
  openInNewTab?: boolean;
  isVisible?: boolean;
  sortOrder?: number;
}

export interface UpdateNavigationItemPayload {
  parentId?: string | null;
  location?: NavigationMenuLocation;
  labelUz?: string;
  labelRu?: string;
  targetType?: NavigationTargetType;
  path?: string;
  pageId?: string | null;
  iconName?: string | null;
  badgeTextUz?: string | null;
  badgeTextRu?: string | null;
  openInNewTab?: boolean;
  isVisible?: boolean;
  sortOrder?: number;
  confirm?: boolean;
}

export interface DeleteNavigationItemPayload {
  confirm?: boolean;
}

export const FACTORY_NAVIGATION_ITEMS: NavigationItem[] = [
  // Header items
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

  // Footer regulatory items
  {
    id: '00000000-0000-0000-0002-000000000001',
    parentId: null,
    location: 'footer_regulatory',
    labelUz: 'Umumiy maʼlumotlar (37-modda)',
    labelRu: 'Основные сведения (ст. 37)',
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
    id: '00000000-0000-0000-0002-000000000002',
    parentId: null,
    location: 'footer_regulatory',
    labelUz: 'Tuzilma va boshqaruv organlari',
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
    id: '00000000-0000-0000-0002-000000000003',
    parentId: null,
    location: 'footer_regulatory',
    labelUz: 'Rasmiy hujjatlar va litsenziyalar',
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
    id: '00000000-0000-0000-0002-000000000004',
    parentId: null,
    location: 'footer_regulatory',
    labelUz: 'Inklyuziv taʼlim va qulay muhit (OʻRQ-641)',
    labelRu: 'Доступная среда и инклюзивность (ЗРУ-641)',
    targetType: 'internal_page',
    path: '/info/info-environment',
    openInNewTab: false,
    isVisible: true,
    sortOrder: 40,
    isSystem: true,
    isRequired: true,
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0002-000000000005',
    parentId: null,
    location: 'footer_regulatory',
    labelUz: 'Texnikum maʼmuriyati va rahbariyat',
    labelRu: 'Администрация и руководство',
    targetType: 'module',
    path: '/administration',
    openInNewTab: false,
    isVisible: true,
    sortOrder: 50,
    isSystem: true,
    isRequired: true,
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z',
  },

  // Footer students items
  {
    id: '00000000-0000-0000-0003-000000000001',
    parentId: null,
    location: 'footer_students',
    labelUz: 'Mutaxassisliklar va davlat grantlari',
    labelRu: 'Специальности и гранты',
    targetType: 'module',
    path: '/specialties',
    openInNewTab: false,
    isVisible: true,
    sortOrder: 10,
    isSystem: true,
    isRequired: false,
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0003-000000000002',
    parentId: null,
    location: 'footer_students',
    labelUz: 'Ochiq eshiklar kuni va tadbirlar',
    labelRu: 'Дни открытых дверей и мероприятия',
    targetType: 'module',
    path: '/events',
    openInNewTab: false,
    isVisible: true,
    sortOrder: 20,
    isSystem: true,
    isRequired: false,
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0003-000000000003',
    parentId: null,
    location: 'footer_students',
    labelUz: 'Pedagogik tarkib',
    labelRu: 'Педагогический состав',
    targetType: 'module',
    path: '/teachers',
    openInNewTab: false,
    isVisible: true,
    sortOrder: 30,
    isSystem: true,
    isRequired: false,
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0003-000000000004',
    parentId: null,
    location: 'footer_students',
    labelUz: 'Yangiliklar va eʼlonlar',
    labelRu: 'Новости и объявления',
    targetType: 'module',
    path: '/news',
    openInNewTab: false,
    isVisible: true,
    sortOrder: 40,
    isSystem: true,
    isRequired: false,
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0003-000000000005',
    parentId: null,
    location: 'footer_students',
    labelUz: 'Maxsus imkoniyatlar (WCAG 2.1 AA)',
    labelRu: 'Версия для слабовидящих (WCAG 2.1 AA)',
    targetType: 'internal_page',
    path: '/settings',
    openInNewTab: false,
    isVisible: true,
    sortOrder: 50,
    isSystem: true,
    isRequired: false,
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z',
  },
];

export function buildNavigationTree(items: NavigationItem[]): NavigationItem[] {
  const itemMap = new Map<string, NavigationItem>();
  const roots: NavigationItem[] = [];

  for (const item of items) {
    itemMap.set(item.id, { ...item, children: [] });
  }

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

