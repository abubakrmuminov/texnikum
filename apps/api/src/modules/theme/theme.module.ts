import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { CacheModule } from '../cache/cache.module';
import { SupabaseModule } from '../supabase/supabase.module';
import { AdminThemeController, ThemeController } from './theme.controller';
import { ThemeService } from './theme.service';

@Module({
  imports: [SupabaseModule, AuditModule, CacheModule],
  controllers: [ThemeController, AdminThemeController],
  providers: [ThemeService],
  exports: [ThemeService],
})
export class ThemeModule {}
