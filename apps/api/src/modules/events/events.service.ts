import { Injectable, NotFoundException } from '@nestjs/common';
import { ApiResponse, EventItem, PaginatedResponse, UserProfile } from '@college/shared';
import { AuditService } from '../audit/audit.service';
import { CacheService } from '../cache/cache.service';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateEventDto } from './dto/create-event.dto';
import { QueryEventsDto } from './dto/query-events.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  private events: EventItem[] = [
    {
      id: '20000000-0000-0000-0000-000000000001',
      title: 'Общегородской день открытых дверей для абитуриентов и родителей',
      slug: 'den-otkrytyh-dverej-aprel-2026',
      description: 'Знакомство со специальностями колледжа, мастер-классы от преподавателей и консультации приемной комиссии.',
      contentHtml: '<p>Приглашаем выпускников 9-х и 11-х классов. В программе: презентация образовательных программ, мастер-классы и консультации по бюджетным местам.</p>',
      eventDate: '2026-04-15T10:00:00Z',
      endDate: '2026-04-15T14:00:00Z',
      location: 'Главный корпус, Актовый зал (ул. Студенческая, д. 10)',
      category: 'open_doors',
      coverImageUrl: '/images/events/open-doors.webp',
      isFeatured: true,
      isPublished: true,
      organizer: 'Приемная комиссия колледжа',
      registrationUrl: 'https://college.edu.ru/admissions/register',
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    },
    {
      id: '20000000-0000-0000-0000-000000000002',
      title: 'Научно-практическая студенческая конференция «Шаг в цифровую науку 2026»',
      slug: 'konferenciya-shag-v-nauku-2026',
      description: 'Ежегодная конференция с докладами студентов по секциям программирования, системной инженерии и логистики.',
      contentHtml: '<p>Конференция объединит молодых исследователей и авторов инновационных дипломных проектов.</p>',
      eventDate: '2026-04-25T11:00:00Z',
      endDate: '2026-04-25T17:00:00Z',
      location: 'Конференц-зал корпуса № 2, ауд. 310',
      category: 'science',
      coverImageUrl: '/images/events/conference.webp',
      isFeatured: false,
      isPublished: true,
      organizer: 'Студенческое научное общество',
      registrationUrl: null,
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    },
  ];

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly auditService: AuditService,
    private readonly cacheService: CacheService,
  ) {}

  async findAll(query: QueryEventsDto): Promise<ApiResponse<PaginatedResponse<EventItem>>> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const pub = query.isPublished !== undefined ? String(query.isPublished) : 'all';
    const cat = query.category || 'all';
    const search = query.search ? encodeURIComponent(query.search.trim().toLowerCase()) : '';
    const cacheKey = `events:list:p${page}:l${limit}:pub${pub}:c${cat}:q${search}`;

    return this.cacheService.getOrSet(cacheKey, 120, async () => {
      const offset = (page - 1) * limit;

      let filtered = [...this.events];
      if (query.isPublished !== undefined) {
        filtered = filtered.filter((e) => e.isPublished === query.isPublished);
      }
      if (query.category) {
        filtered = filtered.filter((e) => e.category === query.category);
      }
      if (query.search) {
        const s = query.search.toLowerCase();
        filtered = filtered.filter(
          (e) =>
            e.title.toLowerCase().includes(s) ||
            e.description.toLowerCase().includes(s) ||
            e.location.toLowerCase().includes(s),
        );
      }

      filtered.sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());

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

  async findOne(slugOrId: string): Promise<ApiResponse<EventItem>> {
    return this.cacheService.getOrSet(`events:detail:${slugOrId}`, 300, async () => {
      const item = this.events.find((e) => e.slug === slugOrId || e.id === slugOrId);
      if (!item) {
        throw new NotFoundException(`Событие «${slugOrId}» не найдено`);
      }
      return {
        success: true,
        data: item,
        timestamp: new Date().toISOString(),
      };
    });
  }

  async create(dto: CreateEventDto, user: UserProfile): Promise<ApiResponse<EventItem>> {
    const slug =
      dto.slug ||
      dto.title.toLowerCase().replace(/[^a-z0-9а-яё]/gi, '-').slice(0, 50);

    const newEvent: EventItem = {
      id: `event-${Date.now()}`,
      title: dto.title,
      slug,
      description: dto.description,
      contentHtml: dto.contentHtml || null,
      eventDate: dto.eventDate,
      endDate: dto.endDate || null,
      location: dto.location,
      category: dto.category,
      coverImageUrl: dto.coverImageUrl || null,
      isFeatured: dto.isFeatured || false,
      isPublished: dto.isPublished !== undefined ? dto.isPublished : true,
      organizer: dto.organizer || null,
      registrationUrl: dto.registrationUrl || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.events.push(newEvent);
    await this.auditService.log(
      user.id,
      'CREATE',
      'events',
      newEvent.id,
      newEvent as unknown as Record<string, unknown>,
    );
    await this.cacheService.delByPattern('events:*');

    return {
      success: true,
      data: newEvent,
      message: 'Мероприятие успешно создано',
      timestamp: new Date().toISOString(),
    };
  }

  async update(id: string, dto: UpdateEventDto, user: UserProfile): Promise<ApiResponse<EventItem>> {
    const index = this.events.findIndex((e) => e.id === id);
    if (index === -1) {
      throw new NotFoundException(`Мероприятие с ID «${id}» не найдено`);
    }

    const old = this.events[index]!;
    const updated: EventItem = {
      ...old,
      ...dto,
      updatedAt: new Date().toISOString(),
    };

    this.events[index] = updated;
    await this.auditService.log(
      user.id,
      'UPDATE',
      'events',
      id,
      updated as unknown as Record<string, unknown>,
      old as unknown as Record<string, unknown>,
    );
    await this.cacheService.delByPattern('events:*');

    return {
      success: true,
      data: updated,
      message: 'Мероприятие обновлено',
      timestamp: new Date().toISOString(),
    };
  }

  async delete(id: string, user: UserProfile): Promise<ApiResponse<{ deleted: boolean }>> {
    const index = this.events.findIndex((e) => e.id === id);
    if (index === -1) {
      throw new NotFoundException(`Мероприятие с ID «${id}» не найдено`);
    }

    const old = this.events[index]!;
    this.events.splice(index, 1);
    await this.auditService.log(user.id, 'DELETE', 'events', id, undefined, old as unknown as Record<string, unknown>);
    await this.cacheService.delByPattern('events:*');

    return {
      success: true,
      data: { deleted: true },
      message: 'Мероприятие удалено',
      timestamp: new Date().toISOString(),
    };
  }
}
