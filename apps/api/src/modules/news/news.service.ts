import { Injectable, NotFoundException } from '@nestjs/common';
import {
  ApiResponse,
  NewsCategory,
  NewsItem,
  NewsStatus,
  PaginatedResponse,
  UserProfile,
} from '@college/shared';
import { AuditService } from '../audit/audit.service';
import { CacheService } from '../cache/cache.service';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateNewsDto } from './dto/create-news.dto';
import { QueryNewsDto } from './dto/query-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';

const CATEGORY_UUID_MAP: Record<number, string> = {
  1: 'b0000000-0000-0000-0000-000000000001',
  2: 'b0000000-0000-0000-0000-000000000002',
  3: 'b0000000-0000-0000-0000-000000000003',
  4: 'b0000000-0000-0000-0000-000000000004',
  5: 'b0000000-0000-0000-0000-000000000005',
};

const CATEGORY_NUM_MAP: Record<string, number> = {
  'b0000000-0000-0000-0000-000000000001': 1,
  'b0000000-0000-0000-0000-000000000002': 2,
  'b0000000-0000-0000-0000-000000000003': 3,
  'b0000000-0000-0000-0000-000000000004': 4,
  'b0000000-0000-0000-0000-000000000005': 5,
};

function toCategoryUuid(cat: string | number | undefined): string {
  if (typeof cat === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cat)) {
    return cat;
  }
  const num = Number(cat);
  return CATEGORY_UUID_MAP[num] || 'b0000000-0000-0000-0000-000000000001';
}

function toCategoryNum(catId: unknown): number {
  if (typeof catId === 'number' && !isNaN(catId)) return catId;
  const str = String(catId);
  if (CATEGORY_NUM_MAP[str]) return CATEGORY_NUM_MAP[str];
  const parsed = parseInt(str, 10);
  return isNaN(parsed) ? 1 : parsed;
}

@Injectable()
export class NewsService {
  private categories: NewsCategory[] = [
    { id: 1, name: 'Rasmiy', slug: 'rasmiy', colorBadge: 'slate', createdAt: '2026-09-01T00:00:00Z' },
    { id: 2, name: 'Talabalar hayoti', slug: 'talabalar-hayoti', colorBadge: 'indigo', createdAt: '2026-09-01T00:00:00Z' },
    { id: 3, name: 'Fan va innovatsiyalar', slug: 'fan-va-innovatsiyalar', colorBadge: 'purple', createdAt: '2026-09-01T00:00:00Z' },
    { id: 4, name: 'Sport va yutuqlar', slug: 'sport-va-yutuqlar', colorBadge: 'emerald', createdAt: '2026-09-01T00:00:00Z' },
    { id: 5, name: 'Abituriyentga', slug: 'abituriyentga', colorBadge: 'amber', createdAt: '2026-09-01T00:00:00Z' },
  ];

  private newsList: NewsItem[] = [
    {
      id: '10000000-0000-0000-0000-000000000001',
      title: 'Texnikum talabalari «WorldSkills Uzbekistan 2026» kasbiy mahorat chempionatida oltin medalni qoʻlga kiritishdi',
      slug: 'texnikum-talabalari-worldskills-uzbekistan-2026-oltin-medal',
      categoryId: 3,
      leadText: 'Viloyat va respublika bosqichida texnikumimiz jamoasi «Veb-texnologiyalar» hamda «Tarmoq va tizim maʼmurligi» yoʻnalishlarida faxrli 1-oʻrinni egalladi.',
      contentHtml: '<p class="lead">2026-yil 20–25-mart kunlari oʻtkazilgan «WorldSkills Uzbekistan» milliy kasbiy mahorat chempionatida texnikumimiz iqtidorli talabalari yuqori amaliy tayyorgarlik darajasini namoyish etishdi.</p>',
      coverImageUrl: '/images/news/champion-2026.webp',
      readingTimeMin: 4,
      status: NewsStatus.PUBLISHED,
      isFeatured: true,
      authorId: 'a0000000-0000-0000-0000-000000000001',
      publishedAt: '2026-09-28T09:00:00Z',
      createdAt: '2026-09-28T08:00:00Z',
      updatedAt: '2026-09-28T09:00:00Z',
    },
    {
      id: '10000000-0000-0000-0000-000000000002',
      title: 'Qabul 2026: davlat granti oʻrinlari, my.edu.uz orqali ariza topshirish tartibi va yoʻnalishlar',
      slug: 'qabul-2026-davlat-granti-va-hujjat-topshirish-tartibi',
      categoryId: 5,
      leadText: 'Texnikum qabul komissiyasi 9 va 11-sinf bitiruvchilarini 2026/2027 oʻquv yili uchun qabul shartlari bilan tanishtiradi.',
      contentHtml: '<p class="lead">2026-yil 20-iyundan boshlab texnikumda kunduzgi taʼlim shakli boʻyicha oʻrta maxsus professional taʼlim dasturlariga arizalar qabul qilinadi. Joriy oʻquv yilida davlat granti asosida 75 ta maqsadli oʻrin ajratildi.</p>',
      coverImageUrl: '/images/news/admissions-2026.webp',
      readingTimeMin: 3,
      status: NewsStatus.PUBLISHED,
      isFeatured: false,
      authorId: 'a0000000-0000-0000-0000-000000000001',
      publishedAt: '2026-09-26T10:00:00Z',
      createdAt: '2026-09-26T09:00:00Z',
      updatedAt: '2026-09-26T10:00:00Z',
    },
    {
      id: '10000000-0000-0000-0000-000000000003',
      title: 'Texnikumda bulutli hisoblash va sunʼiy intellekt laboratoriyasi ochildi',
      slug: 'texnikumda-bulutli-hisoblash-va-ai-laboratoriyasi-ochildi',
      categoryId: 3,
      leadText: 'Raqamli taʼlim texnologiyalarini rivojlantirish dasturi doirasida texnikumda 25 oʻrinli yangi innovatsion laboratoriya ishga tushirildi.',
      contentHtml: '<p class="lead">Yangi laboratoriya zamonaviy server uskunalari, yuqori tezlikdagi optik tolali aloqa hamda amaliy IT-loyihalarni amalga oshirish uchun dasturiy vositalar bilan toʻliq jihozlandi.</p>',
      coverImageUrl: '/images/news/lab-opening.webp',
      readingTimeMin: 3,
      status: NewsStatus.PUBLISHED,
      isFeatured: false,
      authorId: 'a0000000-0000-0000-0000-000000000001',
      publishedAt: '2026-09-24T12:00:00Z',
      createdAt: '2026-09-24T11:00:00Z',
      updatedAt: '2026-09-24T12:00:00Z',
    },
    {
      id: '10000000-0000-0000-0000-000000000004',
      title: 'Texnikum voleybol jamoasi mintaqaviy texnikumlar oʻrtasidagi spartakiada gʻolibi boʻldi',
      slug: 'texnikum-voleybol-jamoasi-viloyat-spartakiadasida-golib',
      categoryId: 4,
      leadText: 'Final uchrashuvida texnikumimiz sportchilari murosasiz kurashda 3:1 hisobida gʻalaba qozonib, kubok sohibiga aylanishdi.',
      contentHtml: '<p class="lead">Shahrimiz sport majmuasida oʻtkazilgan professional taʼlim muassasalari spartakiadasida texnikum voleybol terma jamoasi barcha oʻyinlarda ishonchli oʻyin koʻrsatib, 1-oʻrinni egalladi.</p>',
      coverImageUrl: '/images/news/volleyball-cup.webp',
      readingTimeMin: 2,
      status: NewsStatus.PUBLISHED,
      isFeatured: false,
      authorId: 'a0000000-0000-0000-0000-000000000001',
      publishedAt: '2026-09-22T15:00:00Z',
      createdAt: '2026-09-22T14:00:00Z',
      updatedAt: '2026-09-22T15:00:00Z',
    },
  ];

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly auditService: AuditService,
    private readonly cacheService: CacheService,
  ) {}

  async findAll(query: QueryNewsDto): Promise<ApiResponse<PaginatedResponse<NewsItem>>> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const status = query.status || NewsStatus.PUBLISHED;
    const search = query.search ? query.search.trim().toLowerCase() : '';
    const cacheKey = `news:list:p${page}:l${limit}:s${status}:q${encodeURIComponent(search)}`;

    return this.cacheService.getOrSet(cacheKey, 60, async () => {
      const offset = (page - 1) * limit;

      if (this.supabaseService.isReady()) {
        const supabase = this.supabaseService.getClient();
        if (supabase) {
          let dbQuery = supabase
            .from('news')
            .select('*, news_categories(*)', { count: 'exact' });

          if (query.status) {
            dbQuery = dbQuery.eq('status', query.status);
          } else {
            dbQuery = dbQuery.eq('status', NewsStatus.PUBLISHED);
          }

          if (query.category) {
            const catUuid = toCategoryUuid(query.category);
            dbQuery = dbQuery.eq('category_id', catUuid);
          }

          if (query.search) {
            dbQuery = dbQuery.ilike('title', `%${query.search}%`);
          }

          const { data, count, error } = await dbQuery
            .order('published_at', { ascending: false })
            .range(offset, offset + limit - 1);

          if (!error && data) {
            const items: NewsItem[] = data.map((d: Record<string, unknown>) => ({
              id: String(d.id),
              title: String(d.title),
              slug: String(d.slug),
              categoryId: toCategoryNum(d.category_id),
              leadText: String(d.lead_text),
              contentHtml: String(d.content_html),
              coverImageUrl: d.cover_image_url ? String(d.cover_image_url) : null,
              readingTimeMin: Number(d.reading_time_min),
              status: d.status as NewsStatus,
              isFeatured: Boolean(d.is_featured),
              authorId: d.author_id ? String(d.author_id) : null,
              publishedAt: d.published_at ? String(d.published_at) : null,
              createdAt: String(d.created_at),
              updatedAt: String(d.updated_at),
            }));
            const total = count ?? items.length;
            return {
              success: true,
              data: {
                items,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
              },
              timestamp: new Date().toISOString(),
            };
          }
        }
      }

      let filtered = [...this.newsList];
      if (query.status) {
        filtered = filtered.filter((n) => n.status === query.status);
      } else {
        filtered = filtered.filter((n) => n.status === NewsStatus.PUBLISHED);
      }
      if (query.search) {
        const s = query.search.toLowerCase();
        filtered = filtered.filter((n) => n.title.toLowerCase().includes(s) || n.leadText.toLowerCase().includes(s));
      }

      const total = filtered.length;
      const items = filtered.slice(offset, offset + limit);

      return {
        success: true,
        data: {
          items,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        timestamp: new Date().toISOString(),
      };
    });
  }

  async findFeatured(): Promise<ApiResponse<NewsItem | null>> {
    return this.cacheService.getOrSet('news:featured', 120, async () => {
      if (this.supabaseService.isReady()) {
        const supabase = this.supabaseService.getClient();
        if (supabase) {
          const { data, error } = await supabase
            .from('news')
            .select('*, news_categories(*)')
            .eq('status', NewsStatus.PUBLISHED)
            .order('is_featured', { ascending: false })
            .order('published_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (!error && data) {
            const item: NewsItem = {
              id: String(data.id),
              title: String(data.title),
              slug: String(data.slug),
              categoryId: toCategoryNum(data.category_id),
              leadText: String(data.lead_text),
              contentHtml: String(data.content_html),
              coverImageUrl: data.cover_image_url ? String(data.cover_image_url) : null,
              readingTimeMin: Number(data.reading_time_min),
              status: data.status as NewsStatus,
              isFeatured: Boolean(data.is_featured),
              authorId: data.author_id ? String(data.author_id) : null,
              publishedAt: data.published_at ? String(data.published_at) : null,
              createdAt: String(data.created_at),
              updatedAt: String(data.updated_at),
            };
            return {
              success: true,
              data: item,
              timestamp: new Date().toISOString(),
            };
          }
        }
      }

      const featured =
        this.newsList.find((n) => n.isFeatured && n.status === NewsStatus.PUBLISHED) ||
        this.newsList[0] ||
        null;
      return {
        success: true,
        data: featured,
        timestamp: new Date().toISOString(),
      };
    });
  }

  async findOne(slugOrId: string): Promise<ApiResponse<NewsItem>> {
    return this.cacheService.getOrSet(`news:detail:${slugOrId}`, 180, async () => {
      if (this.supabaseService.isReady()) {
        const supabase = this.supabaseService.getClient();
        if (supabase) {
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
          let dbQuery = supabase
            .from('news')
            .select('*, news_categories(*)');
          if (isUuid) {
            dbQuery = dbQuery.or(`id.eq.${slugOrId},slug.eq.${slugOrId}`);
          } else {
            dbQuery = dbQuery.eq('slug', slugOrId);
          }

          const { data, error } = await dbQuery.maybeSingle();
          if (!error && data) {
            const item: NewsItem = {
              id: String(data.id),
              title: String(data.title),
              slug: String(data.slug),
              categoryId: toCategoryNum(data.category_id),
              leadText: String(data.lead_text),
              contentHtml: String(data.content_html),
              coverImageUrl: data.cover_image_url ? String(data.cover_image_url) : null,
              readingTimeMin: Number(data.reading_time_min),
              status: data.status as NewsStatus,
              isFeatured: Boolean(data.is_featured),
              authorId: data.author_id ? String(data.author_id) : null,
              publishedAt: data.published_at ? String(data.published_at) : null,
              createdAt: String(data.created_at),
              updatedAt: String(data.updated_at),
            };
            return {
              success: true,
              data: item,
              timestamp: new Date().toISOString(),
            };
          }
        }
      }

      const item = this.newsList.find((n) => n.slug === slugOrId || n.id === slugOrId);
      if (!item) {
        throw new NotFoundException(`Новость «${slugOrId}» не найдена`);
      }
      return {
        success: true,
        data: item,
        timestamp: new Date().toISOString(),
      };
    });
  }

  async findAllCategories(): Promise<ApiResponse<NewsCategory[]>> {
    return this.cacheService.getOrSet('news:categories:all', 600, async () => {
      return {
        success: true,
        data: this.categories,
        timestamp: new Date().toISOString(),
      };
    });
  }

  async create(dto: CreateNewsDto, user: UserProfile): Promise<ApiResponse<NewsItem>> {
    const slug = dto.slug || dto.title.toLowerCase().replace(/[^a-z0-9а-яё]/gi, '-').slice(0, 50);
    const newItem: NewsItem = {
      id: `news-${Date.now()}`,
      title: dto.title,
      slug,
      categoryId: Number(dto.categoryId) || 1,
      leadText: dto.leadText,
      contentHtml: dto.contentHtml,
      coverImageUrl: dto.coverImageUrl || null,
      readingTimeMin: dto.readingTimeMin || 3,
      status: dto.status || NewsStatus.DRAFT,
      isFeatured: dto.isFeatured || false,
      authorId: user.id,
      publishedAt: dto.status === NewsStatus.PUBLISHED ? dto.publishedAt || new Date().toISOString() : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (this.supabaseService.isReady()) {
      const supabase = this.supabaseService.getClient();
      if (supabase) {
        const { data, error } = await supabase.from('news').insert({
          title: newItem.title,
          slug: newItem.slug,
          category_id: toCategoryUuid(newItem.categoryId),
          lead_text: newItem.leadText,
          content_html: newItem.contentHtml,
          cover_image_url: newItem.coverImageUrl,
          reading_time_min: newItem.readingTimeMin,
          status: newItem.status,
          is_featured: newItem.isFeatured,
          published_at: newItem.publishedAt,
        }).select().maybeSingle();

        if (error) {
          console.error('[Supabase Insert Error]:', error);
        } else if (data) {
          newItem.id = String(data.id);
        }
      }
    }

    this.newsList.unshift(newItem);
    await this.auditService.log(user.id, 'CREATE', 'news', newItem.id, newItem as unknown as Record<string, unknown>);
    await this.cacheService.delByPattern('news:*');

    return {
      success: true,
      data: newItem,
      message: 'Новость успешно создана',
      timestamp: new Date().toISOString(),
    };
  }

  async update(id: string, dto: UpdateNewsDto, user: UserProfile): Promise<ApiResponse<NewsItem>> {
    let existingItem = this.newsList.find((n) => n.id === id || n.slug === id);

    if (this.supabaseService.isReady()) {
      const supabase = this.supabaseService.getClient();
      if (supabase) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        let updateQuery = supabase.from('news').update({
          ...(dto.title !== undefined && { title: dto.title }),
          ...(dto.slug !== undefined && { slug: dto.slug }),
          ...(dto.categoryId !== undefined && { category_id: toCategoryUuid(dto.categoryId) }),
          ...(dto.leadText !== undefined && { lead_text: dto.leadText }),
          ...(dto.contentHtml !== undefined && { content_html: dto.contentHtml }),
          ...(dto.coverImageUrl !== undefined && { cover_image_url: dto.coverImageUrl }),
          ...(dto.readingTimeMin !== undefined && { reading_time_min: dto.readingTimeMin }),
          ...(dto.status !== undefined && { status: dto.status }),
          ...(dto.isFeatured !== undefined && { is_featured: dto.isFeatured }),
          ...(dto.publishedAt !== undefined && { published_at: dto.publishedAt }),
          updated_at: new Date().toISOString(),
        });

        if (isUuid) {
          updateQuery = updateQuery.eq('id', id);
        } else {
          updateQuery = updateQuery.or(`id.eq.${id},slug.eq.${id}`);
        }

        const { data, error } = await updateQuery.select().maybeSingle();
        if (error) {
          console.error('[Supabase Update Error]:', error);
        } else if (data) {
          existingItem = {
            id: String(data.id),
            title: String(data.title),
            slug: String(data.slug),
            categoryId: toCategoryNum(data.category_id),
            leadText: String(data.lead_text),
            contentHtml: String(data.content_html),
            coverImageUrl: data.cover_image_url ? String(data.cover_image_url) : null,
            readingTimeMin: Number(data.reading_time_min),
            status: data.status as NewsStatus,
            isFeatured: Boolean(data.is_featured),
            authorId: data.author_id ? String(data.author_id) : null,
            publishedAt: data.published_at ? String(data.published_at) : null,
            createdAt: String(data.created_at),
            updatedAt: String(data.updated_at),
          };
        }
      }
    }

    if (!existingItem) {
      throw new NotFoundException(`Новость с ID «${id}» не найдена`);
    }

    const updatedItem: NewsItem = {
      ...existingItem,
      ...dto,
      categoryId: dto.categoryId ? Number(dto.categoryId) : existingItem.categoryId,
      updatedAt: new Date().toISOString(),
    };

    const index = this.newsList.findIndex((n) => n.id === id || n.slug === id);
    if (index !== -1) {
      this.newsList[index] = updatedItem;
    } else {
      this.newsList.unshift(updatedItem);
    }

    await this.auditService.log(
      user.id,
      'UPDATE',
      'news',
      id,
      updatedItem as unknown as Record<string, unknown>,
      existingItem as unknown as Record<string, unknown>,
    );
    await this.cacheService.delByPattern('news:*');

    return {
      success: true,
      data: updatedItem,
      message: 'Новость успешно обновлена',
      timestamp: new Date().toISOString(),
    };
  }

  async delete(id: string, user: UserProfile): Promise<ApiResponse<{ deleted: boolean }>> {
    if (this.supabaseService.isReady()) {
      const supabase = this.supabaseService.getClient();
      if (supabase) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        let deleteQuery = supabase.from('news').delete();
        if (isUuid) {
          deleteQuery = deleteQuery.eq('id', id);
        } else {
          deleteQuery = deleteQuery.or(`id.eq.${id},slug.eq.${id}`);
        }
        await deleteQuery;
      }
    }

    const index = this.newsList.findIndex((n) => n.id === id || n.slug === id);
    let oldItem: NewsItem | undefined;
    if (index !== -1) {
      oldItem = this.newsList[index];
      this.newsList.splice(index, 1);
    }

    await this.auditService.log(user.id, 'DELETE', 'news', id, undefined, oldItem as unknown as Record<string, unknown>);
    await this.cacheService.delByPattern('news:*');

    return {
      success: true,
      data: { deleted: true },
      message: 'Новость успешно удалена',
      timestamp: new Date().toISOString(),
    };
  }

  async createCategory(dto: CreateCategoryDto, user: UserProfile): Promise<ApiResponse<NewsCategory>> {
    const slug = dto.slug || dto.name.toLowerCase().replace(/[^a-z0-9а-яё]/gi, '-');
    const newCat: NewsCategory = {
      id: this.categories.length + 1,
      name: dto.name,
      slug,
      colorBadge: dto.colorBadge || 'slate',
      createdAt: new Date().toISOString(),
    };
    this.categories.push(newCat);
    await this.auditService.log(user.id, 'CREATE', 'news_category', String(newCat.id), newCat as unknown as Record<string, unknown>);
    await this.cacheService.delByPattern('news:*');

    return {
      success: true,
      data: newCat,
      message: 'Категория успешно создана',
      timestamp: new Date().toISOString(),
    };
  }
}
