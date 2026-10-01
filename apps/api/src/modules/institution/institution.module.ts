import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuditModule } from '../audit/audit.module';
import { CacheModule } from '../cache/cache.module';
import { SupabaseModule } from '../supabase/supabase.module';
import { AdminInstitutionController } from './admin-institution.controller';
import { InstitutionService } from './institution.service';
import { PublicInstitutionController } from './public-institution.controller';
import { SetupController } from './setup.controller';

@Module({
  imports: [ConfigModule, SupabaseModule, AuditModule, CacheModule],
  controllers: [
    PublicInstitutionController,
    SetupController,
    AdminInstitutionController,
  ],
  providers: [InstitutionService],
  exports: [InstitutionService],
})
export class InstitutionModule {}
