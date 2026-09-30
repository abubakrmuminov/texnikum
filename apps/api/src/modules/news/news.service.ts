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

@Injectable()
export class NewsService {
  private categories: NewsCategory[] = [
    { id: 1, name: 'Официально', slug: 'oficialno', colorBadge: 'slate', createdAt: '2026-09-01T00:00:00Z' },
    { id: 2, name: 'Студенческая жизнь', slug: 'studencheskaya-zhizn', colorBadge: 'indigo', createdAt: '2026-09-01T00:00:00Z' },
    { id: 3, name: 'Наука и инновации', slug: 'nauka-i-innovacii', colorBadge: 'purple', createdAt: '2026-09-01T00:00:00Z' },
    { id: 4, name: 'Спорт и достижения', slug: 'sport-i-dostizheniya', colorBadge: 'emerald', createdAt: '2026-09-01T00:00:00Z' },
    { id: 5, name: 'Абитуриенту', slug: 'abiturientu', colorBadge: 'amber', createdAt: '2026-09-01T00:00:00Z' },
  ];

  private newsList: NewsItem[] = [
    {
      id: '10000000-0000-0000-0000-000000000001',
      title: 'Студенты колледжа завоевали золото на чемпионате профессионального мастерства «Профессионалы 2026»',
      slug: 'studenty-kolledzha-zavoevali-zoloto-chempionat-professionaly-2026',
      categoryId: 3,
      leadText: 'В финале регионального этапа чемпионата команда колледжа заняла первые места в ключевых ИТ-компетенциях.',
      contentHtml: '<p class="lead">Студенты нашего колледжа заняли первые места в компетенциях «Веб-технологии» и «Сетевое и системное администрирование».</p>',
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
      title: 'Приемная кампания 2026: контрольные цифры приема, правила подачи документов и новые бюджетные места',
      slug: 'priemnaya-kampaniya-2026-pravila-priema-i-kcp',
      categoryId: 5,
      leadText: 'Приемная комиссия колледжа информирует выпускников 9-х и 11-х классов о порядке подачи заявлений на 2026/2027 учебный год.',
      contentHtml: '<p class="lead">С 20 июня открыт прием заявлений на очную форму обучения. Выделено 150 бюджетных мест.</p>',
      coverImageUrl: '/images/news/admissions-2026.webp',
      readingTimeMin: 3,
      status: NewsStatus.PUBLISHED,
      isFeatured: false,
      authorId: 'a0000000-0000-0000-0000-000000000001',
      publishedAt: '2026-09-26T10:00:00Z',
      createdAt: '2026-09-26T09:00:00Z',
      updatedAt: '2026-09-26T10:00:00Z',
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
              categoryId: Number(d.category_id),
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
    const index = this.newsList.findIndex((n) => n.id === id);
    if (index === -1) {
      throw new NotFoundException(`Новость с ID «${id}» не найдена`);
    }

    const oldItem = this.newsList[index]!;
    const updatedItem: NewsItem = {
      ...oldItem,
      ...dto,
      categoryId: dto.categoryId ? Number(dto.categoryId) : oldItem.categoryId,
      updatedAt: new Date().toISOString(),
    };

    this.newsList[index] = updatedItem;
    await this.auditService.log(
      user.id,
      'UPDATE',
      'news',
      id,
      updatedItem as unknown as Record<string, unknown>,
      oldItem as unknown as Record<string, unknown>,
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
    const index = this.newsList.findIndex((n) => n.id === id);
    if (index === -1) {
      throw new NotFoundException(`Новость с ID «${id}» не найдена`);
    }

    const oldItem = this.newsList[index]!;
    this.newsList.splice(index, 1);
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
