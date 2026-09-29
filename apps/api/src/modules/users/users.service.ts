import { Injectable, NotFoundException } from '@nestjs/common';
import { ApiResponse, UserProfile, UserRole } from '@college/shared';
import { AuditService } from '../audit/audit.service';
import { SupabaseService } from '../supabase/supabase.service';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@Injectable()
export class UsersService {
  private users: UserProfile[] = [
    {
      id: 'a0000000-0000-0000-0000-000000000001',
      email: 'admin@college.edu.ru',
      fullName: 'Иванов Алексей Сергеевич',
      role: UserRole.ADMIN,
      avatarUrl: null,
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    },
    {
      id: 'a0000000-0000-0000-0000-000000000002',
      email: 'editor@college.edu.ru',
      fullName: 'Смирнова Елена Николаевна',
      role: UserRole.EDITOR,
      avatarUrl: null,
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    },
  ];

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly auditService: AuditService,
  ) {}

  async findAll(): Promise<ApiResponse<UserProfile[]>> {
    if (this.supabaseService.isReady()) {
      const supabase = this.supabaseService.getClient();
      if (supabase) {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, full_name, role_id, avatar_url, created_at, updated_at, roles(name)');

        if (!error && data) {
          const profiles: UserProfile[] = data.map((d: Record<string, unknown>) => {
            const rolesObj = d.roles as unknown;
            let roleName = 'moderator';
            if (rolesObj && typeof rolesObj === 'object') {
              if (
                Array.isArray(rolesObj) &&
                rolesObj.length > 0 &&
                typeof rolesObj[0] === 'object' &&
                rolesObj[0] !== null &&
                'name' in rolesObj[0]
              ) {
                roleName = String((rolesObj[0] as { name: unknown }).name);
              } else if ('name' in rolesObj) {
                roleName = String((rolesObj as { name: unknown }).name);
              }
            }

            let role = UserRole.MODERATOR;
            if (roleName === 'admin') role = UserRole.ADMIN;
            else if (roleName === 'editor') role = UserRole.EDITOR;

            return {
              id: String(d.id),
              email: String(d.email),
              fullName: String(d.full_name),
              role,
              avatarUrl: d.avatar_url ? String(d.avatar_url) : null,
              createdAt: String(d.created_at),
              updatedAt: String(d.updated_at),
            };
          });

          return {
            success: true,
            data: profiles,
            timestamp: new Date().toISOString(),
          };
        }
      }
    }

    return {
      success: true,
      data: this.users,
      timestamp: new Date().toISOString(),
    };
  }

  async findOne(id: string): Promise<ApiResponse<UserProfile>> {
    const user = this.users.find((u) => u.id === id);
    if (!user) {
      throw new NotFoundException(`Пользователь с ID «${id}» не найден`);
    }
    return {
      success: true,
      data: user,
      timestamp: new Date().toISOString(),
    };
  }

  async updateRole(
    id: string,
    dto: UpdateUserRoleDto,
    currentUser: UserProfile,
  ): Promise<ApiResponse<UserProfile>> {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) {
      throw new NotFoundException(`Пользователь с ID «${id}» не найден`);
    }

    const oldUser = this.users[index]!;
    const updated: UserProfile = {
      ...oldUser,
      role: dto.role,
      updatedAt: new Date().toISOString(),
    };

    this.users[index] = updated;

    await this.auditService.log(
      currentUser.id,
      'UPDATE',
      'users',
      id,
      { role: dto.role },
      { role: oldUser.role },
    );

    return {
      success: true,
      data: updated,
      message: 'Роль пользователя успешно изменена',
      timestamp: new Date().toISOString(),
    };
  }
}
