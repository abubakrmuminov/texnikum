import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { CacheModule } from '../cache/cache.module';
import { SupabaseModule } from '../supabase/supabase.module';
import { AdminNavigationController } from './admin-navigation.controller';
import { NavigationController } from './navigation.controller';
import { NavigationService } from './navigation.service';

@Module({
  imports: [SupabaseModule, AuditModule, CacheModule],
  controllers: [NavigationController, AdminNavigationController],
  providers: [NavigationService],
  exports: [NavigationService],
})
export class NavigationModule {}
