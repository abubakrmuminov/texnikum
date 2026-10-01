import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { CacheModule } from '../cache/cache.module';
import { SupabaseModule } from '../supabase/supabase.module';
import { AdminPagesController, PagesController } from './pages.controller';
import { PagesService } from './pages.service';

@Module({
  imports: [AuthModule, SupabaseModule, AuditModule, CacheModule],
  controllers: [PagesController, AdminPagesController],
  providers: [PagesService],
  exports: [PagesService],
})
export class PagesModule {}
