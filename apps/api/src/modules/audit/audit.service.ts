import { Injectable, Logger } from '@nestjs/common';
import { ApiResponse, AuditAction, AuditLogItem, PaginatedResponse } from '@college/shared';
import { SupabaseService } from '../supabase/supabase.service';
import { QueryAuditDto } from './dto/query-audit.dto';
import { CreateAuditDto } from './dto/create-audit.dto';
import { AuthenticatedUser } from '../auth/decorators/current-user.decorator';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);
  private localAuditLogs: AuditLogItem[] = [
    {
      id: '60000000-0000-0000-0000-000000000001',
      userId: 'a0000000-0000-0000-0000-000000000001',
      action: 'CREATE',
      entityType: 'system',
      entityId: 'initial_seed',
      oldValues: null,
      newValues: { message: 'Инициализация демонстрационных данных колледжа' },
      ipAddress: '127.0.0.1',
      createdAt: new Date().toISOString(),
    },
  ];

  constructor(private readonly supabaseService: SupabaseService) {}

  async create(
    dto: CreateAuditDto,
    user?: AuthenticatedUser,
    ipAddress?: string,
  ): Promise<ApiResponse<AuditLogItem>> {
    const userId = user?.id || null;
    const finalIp = ipAddress || dto.ipAddress || '127.0.0.1';

    await this.log(
      userId,
      dto.action,
      dto.entityType,
      dto.entityId,
      dto.newValues,
      dto.oldValues,
      finalIp,
    );

    const createdItem = this.localAuditLogs[0]!;

    return {
      success: true,
      data: createdItem,
      message: 'Запись аудита успешно зафиксирована',
      timestamp: new Date().toISOString(),
    };
  }

  async log(
    userId: string | null,
    action: AuditAction,
    entityType: string,
    entityId: string,
    newValues?: Record<string, unknown>,
    oldValues?: Record<string, unknown>,
    ipAddress?: string,
  ): Promise<void> {
    const entry: AuditLogItem = {
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      userId,
      action,
      entityType,
      entityId,
      oldValues: oldValues ?? null,
      newValues: newValues ?? null,
      ipAddress: ipAddress ?? '127.0.0.1',
      createdAt: new Date().toISOString(),
    };

    this.localAuditLogs.unshift(entry);
    if (this.localAuditLogs.length > 200) {
      this.localAuditLogs = this.localAuditLogs.slice(0, 200);
    }

    if (this.supabaseService.isReady()) {
      const supabase = this.supabaseService.getClient();
      if (supabase) {
        const validDbUserId = userId && UUID_REGEX.test(userId) ? userId : null;
        const payloadNewValues = validDbUserId === userId ? newValues : { ...(newValues || {}), originalUserId: userId };

        const { error } = await supabase.from('audit_log').insert({
          user_id: validDbUserId,
          action,
          entity_type: entityType,
          entity_id: entityId,
          new_values: payloadNewValues,
          old_values: oldValues,
          ip_address: ipAddress || '127.0.0.1',
        });

        if (error) {
          this.logger.warn(`Ошибка первичной записи в audit_log: ${error.message}. Повтор с user_id=null...`);
          if (validDbUserId) {
            // Если была ошибка внешнего ключа в profiles, сохраняем с user_id = null
            await supabase.from('audit_log').insert({
              user_id: null,
              action,
              entity_type: entityType,
              entity_id: entityId,
              new_values: { ...(newValues || {}), originalUserId: userId },
              old_values: oldValues,
              ip_address: ipAddress || '127.0.0.1',
            });
          }
        }
      }
    }
  }

  async findAll(query: QueryAuditDto): Promise<ApiResponse<PaginatedResponse<AuditLogItem>>> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const offset = (page - 1) * limit;

    if (this.supabaseService.isReady()) {
      const supabase = this.supabaseService.getClient();
      if (supabase) {
        let dbQuery = supabase
          .from('audit_log')
          .select('*', { count: 'exact' });

        if (query.entityType) {
          dbQuery = dbQuery.eq('entity_type', query.entityType);
        }
        if (query.action) {
          dbQuery = dbQuery.eq('action', query.action);
        }

        const { data, count, error } = await dbQuery
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (!error && data) {
          const items: AuditLogItem[] = data.map((d: Record<string, unknown>) => ({
            id: String(d.id),
            userId: d.user_id ? String(d.user_id) : null,
            action: d.action as AuditAction,
            entityType: String(d.entity_type),
            entityId: String(d.entity_id),
            oldValues: (d.old_values as Record<string, unknown>) || null,
            newValues: (d.new_values as Record<string, unknown>) || null,
            ipAddress: d.ip_address ? String(d.ip_address) : null,
            createdAt: String(d.created_at),
          }));
          const existingIds = new Set(items.map((i) => i.id));
          const extraLocal = this.localAuditLogs.filter((l) => {
            if (existingIds.has(l.id)) return false;
            if (query.entityType && l.entityType !== query.entityType) return false;
            if (query.action && l.action !== query.action) return false;
            return true;
          });
          const merged = [...extraLocal, ...items];
          const total = (count ?? items.length) + extraLocal.length;
          return {
            success: true,
            data: {
              items: merged.slice(0, limit),
              total,
              page,
              limit,
              totalPages: Math.ceil(total / limit) || 1,
            },
            timestamp: new Date().toISOString(),
          };
        }
      }
    }

    let filtered = [...this.localAuditLogs];
    if (query.entityType) {
      filtered = filtered.filter((item) => item.entityType === query.entityType);
    }
    if (query.action) {
      filtered = filtered.filter((item) => item.action === query.action);
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
  }
}
