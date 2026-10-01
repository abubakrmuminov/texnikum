import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiResponse,
  GridRow,
  PageBlock,
  PageItem,
  PageRevision,
  PageSlugRedirect,
  ReusableBlock,
  UserProfile,
  UserRole,
  migrateBlocksToRows,
  normalizePageRows,
  validatePageBlocks,
  validatePageGrid,
} from '@college/shared';
import { sanitizeBlockConfig, sanitizeHtmlContent } from '../../common/utils/sanitizer.util';
import { AuditService } from '../audit/audit.service';
import { CacheService } from '../cache/cache.service';
import { SupabaseService } from '../supabase/supabase.service';
import { CreatePageDto } from './dto/create-page.dto';
import { QueryPagesDto } from './dto/query-pages.dto';
import { DeletePageDto, UpdatePageDto } from './dto/update-page.dto';
import { CreateReusableBlockDto, UpdateReusableBlockDto } from './dto/reusable-block.dto';

const RESERVED_SLUGS = new Set([
  'admin',
  'api',
  'setup',
  'login',
  'logout',
  '_next',
  'public',
  'media',
  'static',
  'sitemap',
  'robots',
  'news',
  'events',
  'teachers',
  'specialties',
  'administration',
  'contacts',
  'info',
  'settings',
]);

const INITIAL_PAGES: PageItem[] = [
  {
    id: '40000000-0000-0000-0000-000000000001',
    title: 'Asosiy maʼlumotlar (Основные сведения)',
    titleUz: 'Asosiy maʼlumotlar',
    titleRu: 'Основные сведения',
    slug: 'info-common',
    section: 'info',
    pageType: 'statutory',
    contentHtml:
      '<h2>Asosiy maʼlumotlar / Основные сведения</h2><p>Oʻzbekiston Respublikasi Oliy taʼlim, fan va innovatsiyalar vazirligi tasarrufidagi davlat taʼlim muassasasi.</p>',
    metaTitle: 'Asosiy maʼlumotlar — Texnikum nizomi',
    metaDescription: 'Texnikum haqida rasmiy maʼlumotlar, tashkil topgan yili, muassisi va manzili',
    isPublished: true,
    isSystem: true,
    isRequired: true,
    orderIndex: 1,
    blocks: [],
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: '40000000-0000-0000-0000-000000000002',
    title: 'Tuzilma va boshqaruv (Структура и управление)',
    titleUz: 'Tuzilma va boshqaruv organlari',
    titleRu: 'Структура и органы управления',
    slug: 'info-struct',
    section: 'info',
    pageType: 'statutory',
    contentHtml:
      '<h2>Tuzilma va boshqaruv organlari</h2><p>Texnikum faoliyati Oʻzbekiston Respublikasining «Taʼlim toʻgʻrisida»gi Qonuni va Texnikum Ustavi asosida boshqariladi.</p>',
    metaTitle: 'Tuzilma va boshqaruv organlari',
    metaDescription: 'Texnikum boshqaruv organlari, pedagogik kengash va boʻlimlar',
    isPublished: true,
    isSystem: true,
    isRequired: true,
    orderIndex: 2,
    blocks: [],
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: '40000000-0000-0000-0000-000000000003',
    title: 'Ustav va meʼyoriy hujjatlar (Устав и документы)',
    titleUz: 'Ustav va meʼyoriy hujjatlar',
    titleRu: 'Устав и нормативные документы',
    slug: 'info-documents',
    section: 'info',
    pageType: 'statutory',
    contentHtml:
      '<h2>Rasmiy hujjatlar</h2><p>Texnikum Ustavi, Davlat akkreditatsiyasi sertifikati va taʼlim litsenziyasi.</p>',
    metaTitle: 'Ustav va meʼyoriy hujjatlar',
    metaDescription: 'Taʼlim muassasasining huquqiy va taʼsis hujjatlari',
    isPublished: true,
    isSystem: true,
    isRequired: true,
    orderIndex: 3,
    blocks: [],
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: '40000000-0000-0000-0000-000000000004',
    title: 'Taʼlim tillari (Языки обучения)',
    titleUz: 'Taʼlim tillari',
    titleRu: 'Языки обучения',
    slug: 'info-languages',
    section: 'info',
    pageType: 'statutory',
    contentHtml:
      '<h2>Taʼlim tillari / Языки обучения</h2><p>«Davlat tili haqida»gi va «Taʼlim toʻgʻrisida»gi Qonunlarga muvofiq texnikumda taʼlim oʻzbek va rus tillarida olib boriladi.</p>',
    metaTitle: 'Taʼlim tillari — Texnikum maʼlumotlari',
    metaDescription: 'Taʼlim jarayonida qoʻllaniladigan tillar haqida maʼlumot',
    isPublished: true,
    isSystem: true,
    isRequired: true,
    orderIndex: 4,
    blocks: [],
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: '40000000-0000-0000-0000-000000000005',
    title: 'Taʼlim dasturlari va standartlari (Образование)',
    titleUz: 'Taʼlim dasturlari va standartlari',
    titleRu: 'Образовательные программы и стандарты',
    slug: 'info-education',
    section: 'info',
    pageType: 'statutory',
    contentHtml:
      '<h2>Taʼlim dasturlari va standartlari</h2><p>Davlat taʼlim standartlari (DTS) asosidagi oʻquv rejalari va kasbiy taʼlim dasturlari.</p>',
    metaTitle: 'Taʼlim dasturlari va standartlari',
    metaDescription: 'Oʻquv rejalari, mutaxassisliklar va taʼlim standartlari',
    isPublished: true,
    isSystem: true,
    isRequired: true,
    orderIndex: 5,
    blocks: [],
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: '40000000-0000-0000-0000-000000000006',
    title: 'Pedagogik tarkib (Руководство и педсостав)',
    titleUz: 'Rahbariyat va pedagogik tarkib',
    titleRu: 'Руководство и педагогический состав',
    slug: 'info-leadership',
    section: 'info',
    pageType: 'statutory',
    contentHtml:
      '<h2>Pedagogik tarkib va maʼmuriyat</h2><p>Texnikumning yuqori malakali oʻqituvchilar va rahbarlar jamoasi toʻgʻrisida maʼlumotlar.</p>',
    metaTitle: 'Pedagogik tarkib — Texnikum oʻqituvchilari',
    metaDescription: 'Oʻqituvchilar malakasi, maʼlumoti va ilmiy darajalari',
    isPublished: true,
    isSystem: true,
    isRequired: true,
    orderIndex: 6,
    blocks: [],
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: '40000000-0000-0000-0000-000000000007',
    title: 'Moddiy-texnik taʼminot (Материально-техническая база)',
    titleUz: 'Moddiy-texnik taʼminot',
    titleRu: 'Материально-техническое обеспечение',
    slug: 'info-material',
    section: 'info',
    pageType: 'statutory',
    contentHtml:
      '<h2>Moddiy-texnik taʼminot</h2><p>Zamonaviy oʻquv laboratoriyalari, kompyuter sinflari va amaliyot ustaxonalari.</p>',
    metaTitle: 'Moddiy-texnik taʼminot — Texnikum infratuzilmasi',
    metaDescription: 'Texnikum laboratoriyalari, sinflari va jihozlari',
    isPublished: true,
    isSystem: true,
    isRequired: true,
    orderIndex: 7,
    blocks: [],
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: '40000000-0000-0000-0000-000000000008',
    title: 'Yotoqxona / Talabalar turar joyi (Общежитие)',
    titleUz: 'Yotoqxona / Talabalar turar joyi',
    titleRu: 'Общежитие и условия проживания',
    slug: 'info-dormitory',
    section: 'info',
    pageType: 'statutory',
    contentHtml:
      '<h2>Talabalar turar joyi</h2><p>Talabalar turar joyi bilan taʼminlanganlik va yashash sharoitlari toʻgʻrisida maʼlumot.</p>',
    metaTitle: 'Talabalar turar joyi — Texnikum yotoqxonasi',
    metaDescription: 'Talabalar yotoqxonasida joylar soni va qulayliklar',
    isPublished: true,
    isSystem: true,
    isRequired: true,
    orderIndex: 8,
    blocks: [],
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: '40000000-0000-0000-0000-000000000009',
    title: 'Stipendiyalar va ijtimoiy yordam (Стипендии)',
    titleUz: 'Stipendiyalar va ijtimoiy yordam',
    titleRu: 'Стипендии и социальная поддержка',
    slug: 'info-grants',
    section: 'info',
    pageType: 'statutory',
    contentHtml:
      '<h2>Stipendiyalar va moddiy koʻmak</h2><p>Davlat granti boʻyicha stipendiyalar tayinlash tartibi va ijtimoiy himoya choralari.</p>',
    metaTitle: 'Stipendiyalar va ijtimoiy koʻmak',
    metaDescription: 'Oʻquvchilarga stipendiya toʻlash shartlari va imtiyozlar',
    isPublished: true,
    isSystem: true,
    isRequired: true,
    orderIndex: 9,
    blocks: [],
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: '40000000-0000-0000-0000-000000000010',
    title: 'Reyting va sifat monitoringi (Рейтинг)',
    titleUz: 'Reyting va sifat monitoringi',
    titleRu: 'Рейтинг и мониторинг качества',
    slug: 'info-rating',
    section: 'info',
    pageType: 'statutory',
    contentHtml:
      '<h2>Taʼlim sifati monitoringi</h2><p>Vazirlik milliy reytingidagi koʻrsatkichlar va sifat nazorati hisobotlari.</p>',
    metaTitle: 'Reyting va taʼlim sifati',
    metaDescription: 'Texnikum reytingi va taʼlim sifati koʻrsatkichlari',
    isPublished: true,
    isSystem: true,
    isRequired: true,
    orderIndex: 10,
    blocks: [],
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: '40000000-0000-0000-0000-000000000011',
    title: 'Ilmiy va innovatsion faoliyat (Наука)',
    titleUz: 'Ilmiy va innovatsion faoliyat',
    titleRu: 'Научная и инновационная деятельность',
    slug: 'info-science',
    section: 'info',
    pageType: 'statutory',
    contentHtml:
      '<h2>Ilmiy-amaliy ishlanmalar</h2><p>Oʻqituvchilar va oʻquvchilarning ilmiy loyihalari, texnoparklar bilan hamkorlik.</p>',
    metaTitle: 'Ilmiy va innovatsion faoliyat',
    metaDescription: 'Texnikumda ilmiy-tadqiqot va innovatsion loyihalar',
    isPublished: true,
    isSystem: true,
    isRequired: true,
    orderIndex: 11,
    blocks: [],
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: '40000000-0000-0000-0000-000000000012',
    title: 'Qabul komissiyasi va boʻsh oʻrinlar (Вакантные места)',
    titleUz: 'Qabul komissiyasi va boʻsh oʻrinlar',
    titleRu: 'Приемная комиссия и вакантные места',
    slug: 'info-vacant',
    section: 'info',
    pageType: 'statutory',
    contentHtml:
      '<h2>Qabul kvotalari va vakant oʻrinlar</h2><p>Davlat granti va toʻlov-kontrakt oʻrinlari, koʻchirish va tiklash uchun boʻsh oʻrinlar.</p>',
    metaTitle: 'Qabul va boʻsh oʻrinlar',
    metaDescription: 'Taʼlim yoʻnalishlari boʻyicha qabul kvotalari va vakant oʻrinlar',
    isPublished: true,
    isSystem: true,
    isRequired: true,
    orderIndex: 12,
    blocks: [],
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
];

function sanitizeGridRows(rows: GridRow[]): GridRow[] {
  return rows.map((row) => ({
    ...row,
    cells: row.cells.map((cell) => ({
      ...cell,
      blocks: cell.blocks.map((block) => {
        const blkRecord = block as unknown as Record<string, unknown>;
        const sanitizedBlock = {
          ...block,
          config: sanitizeBlockConfig(block.config as Record<string, unknown>),
        } as unknown as PageBlock;
        if (Array.isArray(blkRecord.nestedRows) && blkRecord.nestedRows.length > 0) {
          (sanitizedBlock as unknown as Record<string, unknown>).nestedRows = sanitizeGridRows(
            blkRecord.nestedRows as GridRow[],
          );
        }
        return sanitizedBlock;
      }),
    })),
  }));
}

function extractFlatBlocksFromRows(rows: GridRow[]): PageBlock[] {
  const result: PageBlock[] = [];
  let sortOrder = 0;
  for (const row of rows) {
    for (const cell of row.cells) {
      for (const block of cell.blocks) {
        result.push({
          ...block,
          sortOrder: sortOrder++,
        });
      }
    }
  }
  return result;
}

const INITIAL_REUSABLE_BLOCKS: ReusableBlock[] = [
  {
    id: '50000000-0000-0000-0000-000000000001',
    titleUz: 'Qabul komissiyasi tezkor axborot paneli',
    titleRu: 'Информационная панель приемной комиссии',
    category: 'banner',
    isGlobal: true,
    rowData: {
      id: 'row-reusable-qabul-banner',
      style: {
        backgroundStyle: 'brand',
        paddingVertical: 'compact',
        containerWidth: 'standard',
      },
      cells: [
        {
          id: 'cell-reusable-qabul-banner',
          colSpan: 12,
          blocks: [
            {
              id: 'blk-reusable-qabul-banner',
              type: 'banner_alert',
              sortOrder: 1,
              isVisible: true,
              config: {
                variant: 'info',
                titleUz: 'Qabul 2026/2027: Yagona my.edu.uz portali orqali ariza topshiring',
                titleRu: 'Прием 2026/2027: Подавайте заявки через единый портал my.edu.uz',
                messageUz: 'Hujjatlar 2026-yil 15-avgustga qadar qabul qilinadi. Qabul komissiyasi: +998 (73) 244-00-00.',
                messageRu: 'Прием документов ведется до 15 августа 2026 года. Приемная комиссия: +998 (73) 244-00-00.',
                actionTextUz: 'my.edu.uz saytiga oʻtish',
                actionTextRu: 'Перейти на my.edu.uz',
                actionUrl: 'https://my.edu.uz',
              },
            },
          ],
        },
      ],
    },
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: '50000000-0000-0000-0000-000000000002',
    titleUz: 'Texnikum asosiy yutuqlari (KPI)',
    titleRu: 'Ключевые достижения техникума (KPI)',
    category: 'stats',
    isGlobal: false,
    rowData: {
      id: 'row-reusable-kpi-stats',
      style: {
        backgroundStyle: 'subtle',
        paddingVertical: 'normal',
        containerWidth: 'standard',
      },
      cells: [
        {
          id: 'cell-reusable-kpi-stats',
          colSpan: 12,
          blocks: [
            {
              id: 'blk-reusable-kpi-stats',
              type: 'stats_counter',
              sortOrder: 1,
              isVisible: true,
              config: {
                titleUz: 'Texnikum raqamlarda',
                titleRu: 'Техникум в цифрах',
                columns: 4,
                stats: [
                  { id: 's1', value: '1,200+', labelUz: 'Talabalar', labelRu: 'Студентов', icon: 'GraduationCap' },
                  { id: 's2', value: '85+', labelUz: 'Pedagoglar', labelRu: 'Педагогов', icon: 'Users' },
                  { id: 's3', value: '14 ta', labelUz: 'Laboratoriyalar', labelRu: 'Лабораторий', icon: 'Building' },
                  { id: 's4', value: '92%', labelUz: 'Ishga joylashish', labelRu: 'Трудоустройство', icon: 'Award' },
                ],
              },
            },
          ],
        },
      ],
    },
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
];

@Injectable()
export class PagesService {
  private readonly logger = new Logger(PagesService.name);
  private pages: PageItem[] = JSON.parse(JSON.stringify(INITIAL_PAGES));
  private revisions: PageRevision[] = [];
  private redirects: PageSlugRedirect[] = [];
  private reusableBlocks: ReusableBlock[] = JSON.parse(JSON.stringify(INITIAL_REUSABLE_BLOCKS));

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly auditService: AuditService,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Публичный поиск страницы по slug с автоматической проверкой 301-редиректов
   */
  async findOne(slug: string, lang = 'uz'): Promise<ApiResponse<PageItem>> {
    // 1. Проверяем таблицу редиректов
    const redirect = await this.findRedirect(slug);
    if (redirect) {
      // Ищем страницу по новому слагу
      const targetPage = await this.findActivePageBySlug(redirect.newSlug);
      if (targetPage) {
        return {
          success: true,
          data: this.localizePage(targetPage, lang),
          message: `Страница перемещена (301 Redirect на «${redirect.newSlug}»)`,
          timestamp: new Date().toISOString(),
        };
      }
    }

    const page = await this.findActivePageBySlug(slug);
    if (!page) {
      throw new NotFoundException(`Страница со слагом «${slug}» не найдена`);
    }

    return {
      success: true,
      data: this.localizePage(page, lang),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Список опубликованных страниц (публичный)
   */
  async findAll(query: QueryPagesDto): Promise<ApiResponse<PageItem[]>> {
    const { section, isPublished, search } = query;
    let list = this.pages.filter((p) => !p.deletedAt);

    if (section) {
      list = list.filter((p) => p.section === section);
    }
    if (isPublished !== undefined) {
      list = list.filter((p) => p.isPublished === isPublished);
    } else {
      // По умолчанию публичные запросы видят только опубликованные
      list = list.filter((p) => p.isPublished);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.titleUz && p.titleUz.toLowerCase().includes(q)) ||
          (p.titleRu && p.titleRu.toLowerCase().includes(q)) ||
          p.slug.toLowerCase().includes(q),
      );
    }

    list = list.sort((a, b) => a.orderIndex - b.orderIndex);

    return {
      success: true,
      data: list,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Полный список страниц для панели управления (включая черновики)
   */
  async getAllForAdmin(query: QueryPagesDto): Promise<ApiResponse<PageItem[]>> {
    let list = this.pages.filter((p) => !p.deletedAt);

    if (query.section) {
      list = list.filter((p) => p.section === query.section);
    }
    if (query.isPublished !== undefined) {
      list = list.filter((p) => p.isPublished === query.isPublished);
    }
    if (query.search) {
      const q = query.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.titleUz && p.titleUz.toLowerCase().includes(q)) ||
          (p.titleRu && p.titleRu.toLowerCase().includes(q)) ||
          p.slug.toLowerCase().includes(q),
      );
    }

    list = list.sort((a, b) => a.orderIndex - b.orderIndex);

    return {
      success: true,
      data: list,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Получение страницы по ID для редактирования в админке
   */
  async getByIdForAdmin(id: string): Promise<ApiResponse<PageItem>> {
    const page = this.pages.find((p) => p.id === id && !p.deletedAt);
    if (!page) {
      throw new NotFoundException(`Страница с ID «${id}» не найдена`);
    }

    const normalizedPage: PageItem = {
      ...page,
      schemaVersion: page.schemaVersion || 2,
      rows: normalizePageRows(page),
    };

    return {
      success: true,
      data: normalizedPage,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Создание страницы (Admin / Editor)
   */
  async create(dto: CreatePageDto, user: UserProfile): Promise<ApiResponse<PageItem>> {
    this.assertCanEditPages(user);

    const cleanSlug = dto.slug.toLowerCase().trim();

    // 1. Проверка зарезервированных слагов
    if (RESERVED_SLUGS.has(cleanSlug)) {
      throw new BadRequestException(
        `Слаг «${cleanSlug}» зарезервирован системой и не может быть использован для страницы`,
      );
    }

    // 2. Проверка уникальности слага
    const existing = this.pages.find((p) => p.slug.toLowerCase() === cleanSlug && !p.deletedAt);
    if (existing) {
      throw new BadRequestException(`Страница со слагом «${cleanSlug}» уже существует`);
    }

    // 3. Валидация и санитизация сетки строк и блоков
    let cleanRows: GridRow[] = [];
    let cleanBlocks: PageBlock[] = [];

    if (dto.rows !== undefined && dto.rows.length > 0) {
      const gridValidation = validatePageGrid(dto.rows, 0, 2);
      if (!gridValidation.valid) {
        throw new BadRequestException(gridValidation.error);
      }
      cleanRows = sanitizeGridRows(dto.rows);
      cleanBlocks = extractFlatBlocksFromRows(cleanRows);
    } else if (dto.blocks && dto.blocks.length > 0) {
      const validation = validatePageBlocks(dto.blocks);
      if (!validation.valid) {
        throw new BadRequestException(validation.error);
      }
      cleanBlocks = dto.blocks.map((b) => ({
        ...b,
        config: sanitizeBlockConfig(b.config as Record<string, unknown>),
      })) as unknown as PageBlock[];
      cleanRows = migrateBlocksToRows(cleanBlocks);
    }

    const title = dto.title || dto.titleUz || dto.titleRu || 'Yangi sahifa';
    const cleanContentHtml = sanitizeHtmlContent(dto.contentHtml || '');

    const newPage: PageItem = {
      id: `page-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title,
      titleUz: dto.titleUz || title,
      titleRu: dto.titleRu || title,
      slug: cleanSlug,
      section: dto.section || 'general',
      pageType: dto.pageType || 'custom',
      contentHtml: cleanContentHtml,
      schemaVersion: dto.schemaVersion || 2,
      rows: cleanRows,
      blocks: cleanBlocks,
      metaTitle: dto.metaTitle || null,
      metaDescription: dto.metaDescription || null,
      ogImageUrl: dto.ogImageUrl || null,
      isPublished: dto.isPublished !== undefined ? dto.isPublished : true,
      isSystem: Boolean(dto.isSystem),
      isRequired: Boolean(dto.isRequired),
      orderIndex: dto.orderIndex || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.pages.push(newPage);

    // Сохраняем первую ревизию
    await this.recordRevision(newPage.id, user, 'Создание страницы', newPage);

    await this.auditService.log(
      user.id,
      'CREATE',
      'pages',
      newPage.id,
      newPage as unknown as Record<string, unknown>,
    );
    await this.cacheService.delByPattern('pages:*');

    return {
      success: true,
      data: newPage,
      message: 'Страница успешно создана',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Обновление страницы (Admin / Editor)
   */
  async update(id: string, dto: UpdatePageDto, user: UserProfile): Promise<ApiResponse<PageItem>> {
    this.assertCanEditPages(user);

    const index = this.pages.findIndex((p) => p.id === id && !p.deletedAt);
    if (index === -1) {
      throw new NotFoundException(`Страница с ID «${id}» не найдена`);
    }

    const old = this.pages[index]!;

    // Защита обязательных разделов (ст. 37 ЗРУ-637): снятие с публикации требует confirm=true
    if (old.isRequired && dto.isPublished === false && !dto.confirm) {
      throw new BadRequestException(
        'Скрытие обязательного уставного раздела (ст. 37 ЗРУ-637) требует обязательного флага подтверждения confirm=true',
      );
    }

    // Обработка смены slug
    let updatedSlug = old.slug;
    if (dto.slug && dto.slug.toLowerCase().trim() !== old.slug.toLowerCase()) {
      const cleanSlug = dto.slug.toLowerCase().trim();
      if (RESERVED_SLUGS.has(cleanSlug)) {
        throw new BadRequestException(
          `Слаг «${cleanSlug}» зарезервирован системой и не может быть использован для страницы`,
        );
      }
      const duplicate = this.pages.find(
        (p) => p.id !== id && p.slug.toLowerCase() === cleanSlug && !p.deletedAt,
      );
      if (duplicate) {
        throw new BadRequestException(`Страница со слагом «${cleanSlug}» уже существует`);
      }

      // Создаем 301-редирект
      await this.createRedirect(old.slug, cleanSlug);
      updatedSlug = cleanSlug;
    }

    // Валидация и санитизация сетки строк и блоков
    let cleanRows = old.rows || normalizePageRows(old);
    let cleanBlocks = old.blocks || [];

    if (dto.rows !== undefined) {
      const gridValidation = validatePageGrid(dto.rows, 0, 2);
      if (!gridValidation.valid) {
        throw new BadRequestException(gridValidation.error);
      }
      cleanRows = sanitizeGridRows(dto.rows);
      cleanBlocks = extractFlatBlocksFromRows(cleanRows);
    } else if (dto.blocks !== undefined) {
      const validation = validatePageBlocks(dto.blocks);
      if (!validation.valid) {
        throw new BadRequestException(validation.error);
      }
      cleanBlocks = dto.blocks.map((b) => ({
        ...b,
        config: sanitizeBlockConfig(b.config as Record<string, unknown>),
      })) as unknown as PageBlock[];
      cleanRows = migrateBlocksToRows(cleanBlocks);
    }

    const cleanContentHtml =
      dto.contentHtml !== undefined ? sanitizeHtmlContent(dto.contentHtml) : old.contentHtml;

    const updated: PageItem = {
      ...old,
      ...dto,
      slug: updatedSlug,
      contentHtml: cleanContentHtml,
      schemaVersion: dto.schemaVersion !== undefined ? dto.schemaVersion : (old.schemaVersion || 2),
      rows: cleanRows,
      blocks: cleanBlocks,
      updatedAt: new Date().toISOString(),
    };

    this.pages[index] = updated;

    // Сохраняем снимок в историю ревизий и выполняем авто-очистку до 20 записей
    await this.recordRevision(
      id,
      user,
      dto.changeSummary || 'Обновление контента страницы',
      updated,
    );

    await this.auditService.log(
      user.id,
      'UPDATE',
      'pages',
      id,
      updated as unknown as Record<string, unknown>,
      old as unknown as Record<string, unknown>,
    );
    await this.cacheService.delByPattern('pages:*');

    return {
      success: true,
      data: updated,
      message: 'Страница успешно обновлена',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Удаление страницы (только Admin)
   */
  async delete(id: string, dto: DeletePageDto, user: UserProfile): Promise<ApiResponse<{ deleted: boolean }>> {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Только администратор имеет право удалять страницы');
    }

    const index = this.pages.findIndex((p) => p.id === id && !p.deletedAt);
    if (index === -1) {
      throw new NotFoundException(`Страница с ID «${id}» не найдена`);
    }

    const old = this.pages[index]!;

    // Системные и обязательные разделы удалять запрещено
    if (old.isSystem || old.isRequired) {
      throw new BadRequestException(
        'Системные и обязательные уставные страницы (ст. 37 ЗРУ-637) не подлежат удалению',
      );
    }

    this.pages[index].deletedAt = new Date().toISOString();

    await this.auditService.log(
      user.id,
      'DELETE',
      'pages',
      id,
      undefined,
      old as unknown as Record<string, unknown>,
    );
    await this.cacheService.delByPattern('pages:*');

    return {
      success: true,
      data: { deleted: true },
      message: 'Страница перемещена в корзину',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Дублирование страницы как нового черновика (Admin / Editor)
   */
  async duplicate(id: string, user: UserProfile): Promise<ApiResponse<PageItem>> {
    this.assertCanEditPages(user);

    const source = this.pages.find((p) => p.id === id && !p.deletedAt);
    if (!source) {
      throw new NotFoundException(`Исходная страница с ID «${id}» не найдена`);
    }

    const newSlug = `${source.slug}-copy-${Date.now().toString().slice(-4)}`;
    const clonedPage: PageItem = {
      ...JSON.parse(JSON.stringify(source)),
      id: `page-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      slug: newSlug,
      title: `${source.title} (Nusxa / Копия)`,
      titleUz: source.titleUz ? `${source.titleUz} (Nusxa)` : undefined,
      titleRu: source.titleRu ? `${source.titleRu} (Копия)` : undefined,
      isPublished: false,
      isSystem: false,
      isRequired: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.pages.push(clonedPage);
    await this.recordRevision(clonedPage.id, user, `Дубликат страницы «${source.title}»`, clonedPage);

    await this.auditService.log(
      user.id,
      'CREATE',
      'pages',
      clonedPage.id,
      clonedPage as unknown as Record<string, unknown>,
    );
    await this.cacheService.delByPattern('pages:*');

    return {
      success: true,
      data: clonedPage,
      message: 'Страница успешно скопирована как черновик',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Получение истории ревизий страницы (до 20 записей)
   */
  async listRevisions(pageId: string): Promise<ApiResponse<PageRevision[]>> {
    const pageRevs = this.revisions
      .filter((r) => r.pageId === pageId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
      success: true,
      data: pageRevs,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Восстановление состояния страницы из ревизии
   */
  async restoreRevision(
    pageId: string,
    revisionId: string,
    user: UserProfile,
  ): Promise<ApiResponse<PageItem>> {
    this.assertCanEditPages(user);

    const pageIndex = this.pages.findIndex((p) => p.id === pageId && !p.deletedAt);
    if (pageIndex === -1) {
      throw new NotFoundException(`Страница с ID «${pageId}» не найдена`);
    }

    const revision = this.revisions.find((r) => r.id === revisionId && r.pageId === pageId);
    if (!revision) {
      throw new NotFoundException(`Ревизия с ID «${revisionId}» не найдена для этой страницы`);
    }

    const snapshot = revision.snapshot;
    const restored: PageItem = {
      ...this.pages[pageIndex]!,
      title: snapshot.title,
      titleUz: snapshot.titleUz,
      titleRu: snapshot.titleRu,
      contentHtml: snapshot.contentHtml,
      blocks: snapshot.blocks,
      metaTitle: snapshot.metaTitle,
      metaDescription: snapshot.metaDescription,
      ogImageUrl: snapshot.ogImageUrl,
      updatedAt: new Date().toISOString(),
    };

    this.pages[pageIndex] = restored;

    await this.recordRevision(
      pageId,
      user,
      `Восстановлено из ревизии от ${new Date(revision.createdAt).toLocaleString('ru-RU')}`,
      restored,
    );

    await this.auditService.log(user.id, 'UPDATE', 'pages', pageId, {
      restoredFromRevision: revisionId,
    });
    await this.cacheService.delByPattern('pages:*');

    return {
      success: true,
      data: restored,
      message: 'Страница успешно восстановлена из выбранной ревизии',
      timestamp: new Date().toISOString(),
    };
  }

  // Вспомогательные функции

  private assertCanEditPages(user: UserProfile): void {
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.EDITOR) {
      throw new ForbiddenException(
        'Действие доступно только для ролей администратора и редактора (Admin / Editor)',
      );
    }
  }

  private async recordRevision(
    pageId: string,
    user: UserProfile,
    summary: string,
    pageSnapshot: PageItem,
  ): Promise<void> {
    const rev: PageRevision = {
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      pageId,
      authorId: user.id,
      authorName: user.fullName || 'Foydalanuvchi',
      changeSummary: summary,
      snapshot: JSON.parse(JSON.stringify(pageSnapshot)),
      createdAt: new Date().toISOString(),
    };

    this.revisions.unshift(rev);

    // Авто-очистка истории: сохраняем максимум 20 последних ревизий на страницу!
    const pageRevs = this.revisions.filter((r) => r.pageId === pageId);
    if (pageRevs.length > 20) {
      const toKeep = new Set(pageRevs.slice(0, 20).map((r) => r.id));
      this.revisions = this.revisions.filter(
        (r) => r.pageId !== pageId || toKeep.has(r.id),
      );
    }
  }

  private async createRedirect(oldSlug: string, newSlug: string): Promise<void> {
    const existingIndex = this.redirects.findIndex((r) => r.oldSlug === oldSlug);
    const redirect: PageSlugRedirect = {
      id: `redir-${Date.now()}`,
      oldSlug,
      newSlug,
      statusCode: 301,
      createdAt: new Date().toISOString(),
    };

    if (existingIndex !== -1) {
      this.redirects[existingIndex] = redirect;
    } else {
      this.redirects.push(redirect);
    }
  }

  private async findRedirect(slug: string): Promise<PageSlugRedirect | null> {
    return this.redirects.find((r) => r.oldSlug.toLowerCase() === slug.toLowerCase()) || null;
  }

  private async findActivePageBySlug(slug: string): Promise<PageItem | null> {
    return (
      this.pages.find(
        (p) =>
          p.slug.toLowerCase() === slug.toLowerCase() && p.isPublished && !p.deletedAt,
      ) || null
    );
  }

  private localizePage(page: PageItem, lang: string): PageItem {
    const localized: PageItem = {
      ...page,
      schemaVersion: page.schemaVersion || 2,
      rows: normalizePageRows(page),
    };
    if (lang === 'ru' && page.titleRu) {
      localized.title = page.titleRu;
    } else if (lang === 'uz' && page.titleUz) {
      localized.title = page.titleUz;
    }
    return localized;
  }

  // ---------------------------------------------------------------------------
  // ПЕРЕИСПОЛЬЗУЕМЫЕ И ГЛОБАЛЬНЫЕ БЛОКИ (REUSABLE & GLOBAL BLOCKS)
  // ---------------------------------------------------------------------------

  /**
   * Подсчет количества страниц, использующих переиспользуемый блок
   */
  countReusableBlockUsage(blockId: string): number {
    let count = 0;
    for (const page of this.pages) {
      if (page.deletedAt) continue;
      const jsonStr = JSON.stringify(page.rows || []);
      if (jsonStr.includes(blockId)) {
        count++;
      }
    }
    return count;
  }

  /**
   * Получение списка всех переиспользуемых блоков с количеством использований
   */
  async getAllReusableBlocks(): Promise<ApiResponse<ReusableBlock[]>> {
    const list = this.reusableBlocks.map((b) => ({
      ...b,
      usageCount: this.countReusableBlockUsage(b.id),
    }));
    return {
      success: true,
      data: list,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Получение одного переиспользуемого блока по ID
   */
  async getReusableBlockById(id: string): Promise<ApiResponse<ReusableBlock>> {
    const block = this.reusableBlocks.find((b) => b.id === id);
    if (!block) {
      throw new NotFoundException(`Переиспользуемый блок с ID «${id}» не найден`);
    }
    return {
      success: true,
      data: {
        ...block,
        usageCount: this.countReusableBlockUsage(id),
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Сохранение строки как переиспользуемого блока
   */
  async createReusableBlock(
    dto: CreateReusableBlockDto,
    user: UserProfile,
  ): Promise<ApiResponse<ReusableBlock>> {
    this.assertCanEditPages(user);

    const gridValidation = validatePageGrid([dto.rowData]);
    if (!gridValidation.valid) {
      throw new BadRequestException(gridValidation.error);
    }

    const sanitizedRow = sanitizeGridRows([dto.rowData])[0]!;

    const newBlock: ReusableBlock = {
      id: `reusable-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      titleUz: dto.titleUz.trim(),
      titleRu: dto.titleRu.trim(),
      category: dto.category || 'custom',
      isGlobal: Boolean(dto.isGlobal),
      rowData: sanitizedRow,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.reusableBlocks.unshift(newBlock);

    await this.auditService.log(
      user.id,
      'CREATE',
      'reusable_blocks',
      newBlock.id,
      newBlock as unknown as Record<string, unknown>,
    );

    return {
      success: true,
      data: newBlock,
      message: 'Переиспользуемый блок успешно сохранен',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Обновление переиспользуемого или глобального блока
   */
  async updateReusableBlock(
    id: string,
    dto: UpdateReusableBlockDto,
    user: UserProfile,
  ): Promise<ApiResponse<ReusableBlock>> {
    this.assertCanEditPages(user);

    const index = this.reusableBlocks.findIndex((b) => b.id === id);
    if (index === -1) {
      throw new NotFoundException(`Переиспользуемый блок с ID «${id}» не найден`);
    }

    const old = this.reusableBlocks[index]!;
    let sanitizedRow = old.rowData;
    if (dto.rowData) {
      const gridValidation = validatePageGrid([dto.rowData]);
      if (!gridValidation.valid) {
        throw new BadRequestException(gridValidation.error);
      }
      sanitizedRow = sanitizeGridRows([dto.rowData])[0]!;
    }

    const updated: ReusableBlock = {
      ...old,
      titleUz: dto.titleUz !== undefined ? dto.titleUz.trim() : old.titleUz,
      titleRu: dto.titleRu !== undefined ? dto.titleRu.trim() : old.titleRu,
      category: dto.category !== undefined ? dto.category : old.category,
      isGlobal: dto.isGlobal !== undefined ? Boolean(dto.isGlobal) : old.isGlobal,
      rowData: sanitizedRow,
      updatedAt: new Date().toISOString(),
      usageCount: this.countReusableBlockUsage(id),
    };

    this.reusableBlocks[index] = updated;

    await this.auditService.log(
      user.id,
      'UPDATE',
      'reusable_blocks',
      id,
      updated as unknown as Record<string, unknown>,
      old as unknown as Record<string, unknown>,
    );

    return {
      success: true,
      data: updated,
      message: 'Переиспользуемый блок успешно обновлен',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Удаление переиспользуемого блока с фиксацией количества использований
   */
  async deleteReusableBlock(
    id: string,
    user: UserProfile,
  ): Promise<ApiResponse<{ deleted: boolean; usageCount: number }>> {
    this.assertCanEditPages(user);

    const index = this.reusableBlocks.findIndex((b) => b.id === id);
    if (index === -1) {
      throw new NotFoundException(`Переиспользуемый блок с ID «${id}» не найден`);
    }

    const usageCount = this.countReusableBlockUsage(id);
    const deletedBlock = this.reusableBlocks.splice(index, 1)[0]!;

    await this.auditService.log(
      user.id,
      'DELETE',
      'reusable_blocks',
      id,
      undefined,
      deletedBlock as unknown as Record<string, unknown>,
    );

    return {
      success: true,
      data: { deleted: true, usageCount },
      message: usageCount > 0
        ? `Блок удален (использовался на ${usageCount} страницах)`
        : 'Переиспользуемый блок успешно удален',
      timestamp: new Date().toISOString(),
    };
  }
}
