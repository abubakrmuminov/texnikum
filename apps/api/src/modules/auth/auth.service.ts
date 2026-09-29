import { Injectable } from '@nestjs/common';
import { ApiResponse, UserProfile } from '@college/shared';

@Injectable()
export class AuthService {
  getProfile(user: UserProfile): ApiResponse<UserProfile> {
    return {
      success: true,
      data: user,
      message: 'Профиль успешно получен',
      timestamp: new Date().toISOString(),
    };
  }
}
