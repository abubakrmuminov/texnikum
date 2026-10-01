import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import {
  ApiResponse,
  THEME_PRESETS,
  ThemePreset,
  ThemeSettings,
  UserProfile,
  UserRole,
} from '@college/shared';
import { AuditService } from '../audit/audit.service';
import { CacheService } from '../cache/cache.service';
import { SupabaseService } from '../supabase/supabase.service';
import { SelectThemeDto } from './dto/select-theme.dto';

@Injectable()
export class ThemeService {
  private readonly logger = new Logger(ThemeService.name);

  private currentTheme: ThemeSettings = {
    id: 1,
    preset: 'classic_academic',
    fontFamily: 'Inter',
    borderRadiusMode: 'rounded',
    updatedAt: new Date().toISOString(),
  };

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly auditService: AuditService,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Получение активных настроек темы оформления (публичный)
   */
  async getCurrentTheme(): Promise<ApiResponse<ThemeSettings>> {
    const cacheKey = 'theme:current';
    const cached = await this.cacheService.get<ThemeSettings>(cacheKey);
    if (cached) {
      return {
        success: true,
        data: cached,
        timestamp: new Date().toISOString(),
      };
    }

    if (this.supabaseService.isReady()) {
      const client = this.supabaseService.getClient()!;
      const { data, error } = await client.from('theme_settings').select('*').eq('id', 1).single();
      if (!error && data) {
        this.currentTheme = {
          id: 1,
          preset: data.preset || 'classic_academic',
          fontFamily: data.font_family || 'Inter',
          borderRadiusMode: data.border_radius_mode || 'rounded',
          updatedAt: data.updated_at || new Date().toISOString(),
        };
      }
    }

    await this.cacheService.set(cacheKey, this.currentTheme, 600);

    return {
      success: true,
      data: this.currentTheme,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Список доступных дизайн-пресетов
   */
  async listPresets(): Promise<ApiResponse<ThemePreset[]>> {
    return {
      success: true,
      data: THEME_PRESETS,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Выбор и применение пресета темы оформления (только Admin)
   */
  async selectPreset(dto: SelectThemeDto, user: UserProfile): Promise<ApiResponse<ThemeSettings>> {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Только администратор имеет право изменять тему оформления сайта');
    }

    const preset = THEME_PRESETS.find((p) => p.id === dto.preset);
    if (!preset) {
      throw new BadRequestException(`Неизвестный пресет темы оформления «${dto.preset}»`);
    }

    const old = { ...this.currentTheme };

    this.currentTheme = {
      id: 1,
      preset: dto.preset,
      fontFamily: dto.fontFamily || preset.fontFamily,
      borderRadiusMode: dto.borderRadiusMode || 'rounded',
      updatedAt: new Date().toISOString(),
    };

    if (this.supabaseService.isReady()) {
      const client = this.supabaseService.getClient()!;
      await client
        .from('theme_settings')
        .upsert({
          id: 1,
          preset: this.currentTheme.preset,
          font_family: this.currentTheme.fontFamily,
          border_radius_mode: this.currentTheme.borderRadiusMode,
          updated_at: new Date().toISOString(),
        });
    }

    await this.auditService.log(
      user.id,
      'UPDATE',
      'theme_settings',
      '1',
      this.currentTheme as unknown as Record<string, unknown>,
      old as unknown as Record<string, unknown>,
    );
    await this.cacheService.delByPattern('theme:*');

    return {
      success: true,
      data: this.currentTheme,
      message: `Пресет оформления «${preset.nameRu}» успешно применен`,
      timestamp: new Date().toISOString(),
    };
  }
}
