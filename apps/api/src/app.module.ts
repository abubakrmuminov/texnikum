import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuditModule } from './modules/audit/audit.module';
import { AuthModule } from './modules/auth/auth.module';
import { EventsModule } from './modules/events/events.module';
import { HealthModule } from './modules/health/health.module';
import { MediaModule } from './modules/media/media.module';
import { NewsModule } from './modules/news/news.module';
import { PagesModule } from './modules/pages/pages.module';
import { ScheduleModule } from './modules/schedule/schedule.module';
import { SpecialtiesModule } from './modules/specialties/specialties.module';
import { SupabaseModule } from './modules/supabase/supabase.module';
import { TeachersModule } from './modules/teachers/teachers.module';
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
    SupabaseModule,
    AuditModule,
    HealthModule,
    AuthModule,

    // Бизнес-модули образовательного портала СПО
    NewsModule,
    TeachersModule,
    SpecialtiesModule,
    EventsModule,
    ScheduleModule,
    PagesModule,
    MediaModule,
    UsersModule,
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
