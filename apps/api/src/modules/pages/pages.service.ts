import { Injectable, NotFoundException } from '@nestjs/common';
import { ApiResponse, PageItem, UserProfile } from '@college/shared';
import { AuditService } from '../audit/audit.service';
import { CacheService } from '../cache/cache.service';
import { SupabaseService } from '../supabase/supabase.service';
import { CreatePageDto } from './dto/create-page.dto';
import { QueryPagesDto } from './dto/query-pages.dto';
import { UpdatePageDto } from './dto/update-page.dto';

@Injectable()
export class PagesService {
  private pages: PageItem[] = [
    {
      id: '40000000-0000-0000-0000-000000000001',
      title: 'Asosiy maʼlumotlar (Основные сведения)',
      slug: 'info-common',
      section: 'info',
      contentHtml: '<h2>Asosiy maʼlumotlar / Основные сведения об образовательной организации</h2><p>Fargʻona 2-son axborot texnologiyalari texnikumi 1978-yilda tashkil etilgan. Oʻzbekiston Respublikasi Oliy taʼlim, fan va innovatsiyalar vazirligi tasarrufidagi davlat taʼlim muassasasi.</p>',
      metaTitle: 'Asosiy maʼlumotlar — Texnikum nizomi',
      metaDescription: 'Texnikum haqida rasmiy maʼlumotlar, tashkil topgan yili, muassisi va manzili',
      isPublished: true,
      orderIndex: 1,
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    },
    {
      id: '40000000-0000-0000-0000-000000000002',
      title: 'Tuzilma va boshqaruv (Структура и управление)',
      slug: 'info-struct',
      section: 'info',
      contentHtml: '<h2>Tuzilma va boshqaruv organlari</h2><p>Texnikum faoliyati Oʻzbekiston Respublikasining «Taʼlim toʻgʻrisida»gi Qonuni va Texnikum Ustavi asosida boshqariladi.</p>',
      metaTitle: 'Tuzilma va boshqaruv organlari',
      metaDescription: 'Texnikum boshqaruv organlari, pedagogik kengash va boʻlimlar',
      isPublished: true,
      orderIndex: 2,
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    },
    {
      id: '40000000-0000-0000-0000-000000000003',
      title: 'Ustav va meʼyoriy hujjatlar (Устав и документы)',
      slug: 'info-document',
      section: 'info',
      contentHtml: '<h2>Rasmiy hujjatlar</h2><p>Texnikum Ustavi, Davlat akkreditatsiyasi sertifikati va taʼlim litsenziyasi.</p>',
      metaTitle: 'Ustav va meʼyoriy hujjatlar',
      metaDescription: 'Taʼlim muassasasining huquqiy va taʼsis hujjatlari',
      isPublished: true,
      orderIndex: 3,
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    },
    {
      id: '40000000-0000-0000-0000-000000000004',
      title: 'Taʼlim tillari (Языки обучения)',
      slug: 'info-languages',
      section: 'info',
      contentHtml: '<h2>Taʼlim tillari / Языки обучения</h2><p>«Davlat tili haqida»gi va «Taʼlim toʻgʻrisida»gi Qonunlarga muvofiq texnikumda taʼlim oʻzbek va rus tillarida olib boriladi.</p>',
      metaTitle: 'Taʼlim tillari — Texnikum maʼlumotlari',
      metaDescription: 'Taʼlim jarayonida qoʻllaniladigan tillar haqida maʼlumot',
      isPublished: true,
      orderIndex: 4,
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    },
    {
      id: '40000000-0000-0000-0000-000000000005',
      title: 'Imkoniyati cheklangan shaxslar uchun sharoitlar (Доступная среда)',
      slug: 'info-accessible-env',
      section: 'info',
      contentHtml: '<h2>Nogironligi boʻlgan shaxslar uchun qulay muhit</h2><p>Oʻzbekiston Respublikasining «Nogironligi boʻlgan shaxslarning huquqlari toʻgʻrisida»gi Qonuni va WCAG 2.1 AA talablariga mos ravishda bino va veb-portal qulayliklari taʼminlangan.</p>',
      metaTitle: 'Qulay muhit — WCAG 2.1 AA',
      metaDescription: 'Nogironligi boʻlgan talabalar uchun inklyuziv va qulay taʼlim sharoitlari',
      isPublished: true,
      orderIndex: 5,
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    },
  ];

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly auditService: AuditService,
    private readonly cacheService: CacheService,
  ) {}

  async findAll(query: QueryPagesDto): Promise<ApiResponse<PageItem[]>> {
    const pub = query.isPublished !== undefined ? String(query.isPublished) : 'all';
    const sec = query.section || 'all';
    const cacheKey = `pages:list:pub${pub}:sec${sec}`;

    return this.cacheService.getOrSet(cacheKey, 300, async () => {
      let filtered = [...this.pages];
      if (query.isPublished !== undefined) {
        filtered = filtered.filter((p) => p.isPublished === query.isPublished);
      }
      if (query.section) {
        filtered = filtered.filter((p) => p.section === query.section);
      }
      filtered.sort((a, b) => a.orderIndex - b.orderIndex);

      return {
        success: true,
        data: filtered,
        timestamp: new Date().toISOString(),
      };
    });
  }

  async findOne(slug: string): Promise<ApiResponse<PageItem>> {
    return this.cacheService.getOrSet(`pages:detail:${slug}`, 600, async () => {
      const page = this.pages.find((p) => p.slug === slug || p.id === slug);
      if (!page) {
        throw new NotFoundException(`Страница «${slug}» не найдена`);
      }
      return {
        success: true,
        data: page,
        timestamp: new Date().toISOString(),
      };
    });
  }

  async create(dto: CreatePageDto, user: UserProfile): Promise<ApiResponse<PageItem>> {
    const newPage: PageItem = {
      id: `page-${Date.now()}`,
      title: dto.title,
      slug: dto.slug,
      section: dto.section,
      contentHtml: dto.contentHtml,
      metaTitle: dto.metaTitle || null,
      metaDescription: dto.metaDescription || null,
      isPublished: dto.isPublished !== undefined ? dto.isPublished : true,
      orderIndex: dto.orderIndex || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.pages.push(newPage);
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

  async update(id: string, dto: UpdatePageDto, user: UserProfile): Promise<ApiResponse<PageItem>> {
    const index = this.pages.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new NotFoundException(`Страница с ID «${id}» не найдена`);
    }

    const old = this.pages[index]!;
    const updated: PageItem = {
      ...old,
      ...dto,
      updatedAt: new Date().toISOString(),
    };

    this.pages[index] = updated;
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
      message: 'Страница обновлена',
      timestamp: new Date().toISOString(),
    };
  }

  async delete(id: string, user: UserProfile): Promise<ApiResponse<{ deleted: boolean }>> {
    const index = this.pages.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new NotFoundException(`Страница с ID «${id}» не найдена`);
    }

    const old = this.pages[index]!;
    this.pages.splice(index, 1);
    await this.auditService.log(user.id, 'DELETE', 'pages', id, undefined, old as unknown as Record<string, unknown>);
    await this.cacheService.delByPattern('pages:*');

    return {
      success: true,
      data: { deleted: true },
      message: 'Страница удалена',
      timestamp: new Date().toISOString(),
    };
  }
}
