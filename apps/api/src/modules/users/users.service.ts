import { Injectable, NotFoundException } from '@nestjs/common';
import { ApiResponse, OnboardingState, UserProfile, UserRole } from '@college/shared';
import { AuditService } from '../audit/audit.service';
import { SupabaseService } from '../supabase/supabase.service';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateOnboardingDto } from './dto/update-onboarding.dto';

@Injectable()
export class UsersService {
  private users: UserProfile[] = [
    {
      id: 'a0000000-0000-0000-0000-000000000001',
      email: 'admin@texnikum.uz',
      fullName: 'Karimov Jasur Alisherovich (Admin)',
      role: UserRole.ADMIN,
      avatarUrl: null,
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    },
    {
      id: 'a0000000-0000-0000-0000-000000000002',
      email: 'editor@texnikum.uz',
      fullName: 'Yusupova Nilufar Rustamovna (Editor)',
      role: UserRole.EDITOR,
      avatarUrl: null,
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    },
    {
      id: 'a0000000-0000-0000-0000-000000000003',
      email: 'moderator@texnikum.uz',
      fullName: 'Ahmedov Sardor Baxtiyorovich (Moderator)',
      role: UserRole.MODERATOR,
      avatarUrl: null,
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    },
  ];

  private readonly onboardingStore = new Map<string, OnboardingState>();

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
          .select('id, email, full_name, role_id, avatar_url, onboarding, created_at, updated_at, roles(name)');

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

            const onboarding = (d.onboarding as OnboardingState) || {};
            this.onboardingStore.set(String(d.id), onboarding);

            return {
              id: String(d.id),
              email: String(d.email),
              fullName: String(d.full_name),
              role,
              avatarUrl: d.avatar_url ? String(d.avatar_url) : null,
              createdAt: String(d.created_at),
              updatedAt: String(d.updated_at),
              onboarding,
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

    const profilesWithOnboarding = this.users.map((u) => ({
      ...u,
      onboarding: this.onboardingStore.get(u.id) || {},
    }));

    return {
      success: true,
      data: profilesWithOnboarding,
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
      data: {
        ...user,
        onboarding: this.onboardingStore.get(user.id) || {},
      },
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

  async getOnboarding(userId: string): Promise<ApiResponse<OnboardingState>> {
    if (this.supabaseService.isReady()) {
      const supabase = this.supabaseService.getClient();
      if (supabase) {
        const { data, error } = await supabase
          .from('profiles')
          .select('onboarding')
          .eq('id', userId)
          .single();

        if (!error && data) {
          const onboarding = (data.onboarding as OnboardingState) || {};
          this.onboardingStore.set(userId, onboarding);
          return {
            success: true,
            data: onboarding,
            timestamp: new Date().toISOString(),
          };
        }
      }
    }

    const state = this.onboardingStore.get(userId) || {};
    return {
      success: true,
      data: state,
      timestamp: new Date().toISOString(),
    };
  }

  async patchOnboarding(
    userId: string,
    dto: UpdateOnboardingDto,
  ): Promise<ApiResponse<OnboardingState>> {
    let current: OnboardingState = this.onboardingStore.get(userId) || {};

    if (this.supabaseService.isReady()) {
      const supabase = this.supabaseService.getClient();
      if (supabase) {
        const { data } = await supabase
          .from('profiles')
          .select('onboarding')
          .eq('id', userId)
          .single();

        if (data?.onboarding) {
          current = (data.onboarding as OnboardingState) || {};
        }
      }
    }

    // Слияние (merge) без перезаписи существующих разделов
    const merged: OnboardingState = {
      ...current,
      ...(dto.main !== undefined ? { main: dto.main } : {}),
      sections: {
        ...(current.sections || {}),
        ...(dto.sections || {}),
      },
    };

    this.onboardingStore.set(userId, merged);

    if (this.supabaseService.isReady()) {
      const supabase = this.supabaseService.getClient();
      if (supabase) {
        await supabase
          .from('profiles')
          .update({
            onboarding: merged,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);
      }
    }

    return {
      success: true,
      data: merged,
      message: 'Onboarding holati yangilandi',
      timestamp: new Date().toISOString(),
    };
  }

  async resetOnboarding(
    targetUserId: string,
    currentAdmin: UserProfile,
  ): Promise<ApiResponse<{ id: string; onboarding: OnboardingState }>> {
    const emptyState: OnboardingState = {};
    this.onboardingStore.set(targetUserId, emptyState);

    if (this.supabaseService.isReady()) {
      const supabase = this.supabaseService.getClient();
      if (supabase) {
        await supabase
          .from('profiles')
          .update({
            onboarding: emptyState,
            updated_at: new Date().toISOString(),
          })
          .eq('id', targetUserId);
      }
    }

    await this.auditService.log(
      currentAdmin.id,
      'UPDATE',
      'users',
      targetUserId,
      { onboarding: emptyState, action: 'RESET_ONBOARDING' },
      { action: 'RESET_ONBOARDING' },
    );

    return {
      success: true,
      data: { id: targetUserId, onboarding: emptyState },
      message: 'Foydalanuvchi onbordingi muvaffaqiyatli qayta tiklandi',
      timestamp: new Date().toISOString(),
    };
  }
}
