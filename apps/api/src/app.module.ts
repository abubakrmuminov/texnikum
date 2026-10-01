import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuditModule } from './modules/audit/audit.module';
import { AuthModule } from './modules/auth/auth.module';
import { CacheModule } from './modules/cache/cache.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { EventsModule } from './modules/events/events.module';
import { HealthModule } from './modules/health/health.module';
import { InstitutionModule } from './modules/institution/institution.module';
import { MediaModule } from './modules/media/media.module';
import { NavigationModule } from './modules/navigation/navigation.module';
import { NewsModule } from './modules/news/news.module';
import { PagesModule } from './modules/pages/pages.module';
import { ScheduleModule } from './modules/schedule/schedule.module';
import { SpecialtiesModule } from './modules/specialties/specialties.module';
import { SupabaseModule } from './modules/supabase/supabase.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { ThemeModule } from './modules/theme/theme.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    // Глобальная загрузка конфигурации переменных окружения
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Ограничение частоты запросов (Rate Limiting) - защита от перегрузок и брутфорса
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 120, // 120 запросов в минуту на IP
      },
    ]),

    // Глобальные и инфраструктурные модули
    CacheModule,
    SupabaseModule,
    AuditModule,
    HealthModule,
    AuthModule,

    // Бизнес-модули образовательного портала
    NewsModule,
    TeachersModule,
    SpecialtiesModule,
    EventsModule,
    ScheduleModule,
    PagesModule,
    NavigationModule,
    ThemeModule,
    MediaModule,
    UsersModule,
    ContactsModule,
    InstitutionModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
