import { Injectable, NotFoundException } from '@nestjs/common';
import { ApiResponse, ScheduleItem, UserProfile } from '@college/shared';
import { AuditService } from '../audit/audit.service';
import { CacheService } from '../cache/cache.service';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { QueryScheduleDto } from './dto/query-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Injectable()
export class ScheduleService {
  private scheduleList: ScheduleItem[] = [
    {
      id: '30000000-0000-0000-0000-000000000001',
      groupName: 'ИС-301',
      dayOfWeek: 1,
      lessonNumber: 1,
      timeStart: '08:30',
      timeEnd: '10:00',
      subject: 'Разработка веб-приложений (лек.)',
      teacherId: 'e0000000-0000-0000-0000-000000000002',
      classroom: 'Ауд. 305',
      parity: 'both',
      isActive: true,
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    },
    {
      id: '30000000-0000-0000-0000-000000000002',
      groupName: 'ИС-301',
      dayOfWeek: 1,
      lessonNumber: 2,
      timeStart: '10:10',
      timeEnd: '11:40',
      subject: 'Разработка веб-приложений (лаб.)',
      teacherId: 'e0000000-0000-0000-0000-000000000002',
      classroom: 'Лаб. 14',
      parity: 'both',
      isActive: true,
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    },
    {
      id: '30000000-0000-0000-0000-000000000003',
      groupName: 'СА-202',
      dayOfWeek: 1,
      lessonNumber: 1,
      timeStart: '08:30',
      timeEnd: '10:00',
      subject: 'Администрирование компьютерных сетей',
      teacherId: 'e0000000-0000-0000-0000-000000000003',
      classroom: 'Лаб. 21',
      parity: 'both',
      isActive: true,
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    },
  ];

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly auditService: AuditService,
    private readonly cacheService: CacheService,
  ) {}

  async findAll(query: QueryScheduleDto): Promise<ApiResponse<ScheduleItem[]>> {
    const act = query.isActive !== undefined ? String(query.isActive) : 'all';
    const grp = query.groupName ? encodeURIComponent(query.groupName.trim().toLowerCase()) : 'all';
    const tch = query.teacherId || 'all';
    const day = query.dayOfWeek !== undefined ? String(query.dayOfWeek) : 'all';
    const par = query.parity || 'all';
    const cacheKey = `schedule:list:act${act}:g${grp}:t${tch}:d${day}:p${par}`;

    return this.cacheService.getOrSet(cacheKey, 60, async () => {
      let filtered = [...this.scheduleList];

      if (query.isActive !== undefined) {
        filtered = filtered.filter((s) => s.isActive === query.isActive);
      }
      if (query.groupName) {
        filtered = filtered.filter(
          (s) => s.groupName.toLowerCase() === query.groupName!.toLowerCase(),
        );
      }
      if (query.teacherId) {
        filtered = filtered.filter((s) => s.teacherId === query.teacherId);
      }
      if (query.dayOfWeek !== undefined) {
        filtered = filtered.filter((s) => s.dayOfWeek === Number(query.dayOfWeek));
      }
      if (query.parity) {
        filtered = filtered.filter(
          (s) => s.parity === query.parity || s.parity === 'both',
        );
      }

      filtered.sort((a, b) => {
        if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
        return a.lessonNumber - b.lessonNumber;
      });

      return {
        success: true,
        data: filtered,
        timestamp: new Date().toISOString(),
      };
    });
  }

  async findGroups(): Promise<ApiResponse<string[]>> {
    return this.cacheService.getOrSet('schedule:groups:all', 300, async () => {
      const groups = Array.from(new Set(this.scheduleList.map((s) => s.groupName))).sort();
      return {
        success: true,
        data: groups,
        timestamp: new Date().toISOString(),
      };
    });
  }

  async findOne(id: string): Promise<ApiResponse<ScheduleItem>> {
    return this.cacheService.getOrSet(`schedule:detail:${id}`, 180, async () => {
      const item = this.scheduleList.find((s) => s.id === id);
      if (!item) {
        throw new NotFoundException(`Занятие с ID «${id}» не найдено`);
      }
      return {
        success: true,
        data: item,
        timestamp: new Date().toISOString(),
      };
    });
  }

  async create(dto: CreateScheduleDto, user: UserProfile): Promise<ApiResponse<ScheduleItem>> {
    const newItem: ScheduleItem = {
      id: `schedule-${Date.now()}`,
      groupName: dto.groupName,
      dayOfWeek: dto.dayOfWeek,
      lessonNumber: dto.lessonNumber,
      timeStart: dto.timeStart,
      timeEnd: dto.timeEnd,
      subject: dto.subject,
      teacherId: dto.teacherId || null,
      classroom: dto.classroom,
      parity: dto.parity || 'both',
      isActive: dto.isActive !== undefined ? dto.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.scheduleList.push(newItem);
    await this.auditService.log(
      user.id,
      'CREATE',
      'schedule',
      newItem.id,
      newItem as unknown as Record<string, unknown>,
    );
    await this.cacheService.delByPattern('schedule:*');

    return {
      success: true,
      data: newItem,
      message: 'Занятие добавлено в расписание',
      timestamp: new Date().toISOString(),
    };
  }

  async update(id: string, dto: UpdateScheduleDto, user: UserProfile): Promise<ApiResponse<ScheduleItem>> {
    const index = this.scheduleList.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new NotFoundException(`Занятие с ID «${id}» не найдено`);
    }

    const old = this.scheduleList[index]!;
    const updated: ScheduleItem = {
      ...old,
      ...dto,
      updatedAt: new Date().toISOString(),
    };

    this.scheduleList[index] = updated;
    await this.auditService.log(
      user.id,
      'UPDATE',
      'schedule',
      id,
      updated as unknown as Record<string, unknown>,
      old as unknown as Record<string, unknown>,
    );
    await this.cacheService.delByPattern('schedule:*');

    return {
      success: true,
      data: updated,
      message: 'Расписание обновлено',
      timestamp: new Date().toISOString(),
    };
  }

  async delete(id: string, user: UserProfile): Promise<ApiResponse<{ deleted: boolean }>> {
    const index = this.scheduleList.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new NotFoundException(`Занятие с ID «${id}» не найдено`);
    }

    const old = this.scheduleList[index]!;
    this.scheduleList.splice(index, 1);
    await this.auditService.log(user.id, 'DELETE', 'schedule', id, undefined, old as unknown as Record<string, unknown>);
    await this.cacheService.delByPattern('schedule:*');

    return {
      success: true,
      data: { deleted: true },
      message: 'Занятие удалено из расписания',
      timestamp: new Date().toISOString(),
    };
  }
}
