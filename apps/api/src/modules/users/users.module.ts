import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MeOnboardingController } from './me-onboarding.controller';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [AuthModule],
  controllers: [UsersController, MeOnboardingController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
