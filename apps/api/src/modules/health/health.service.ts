import { Injectable } from '@nestjs/common';
import { ApiResponse } from '@college/shared';
import { CacheService, CacheStats } from '../cache/cache.service';

export interface HealthStatus {
  status: 'ok';
  timestamp: string;
  uptimeSeconds: number;
  cache: CacheStats;
}

@Injectable()
export class HealthService {
  constructor(private readonly cacheService: CacheService) {}

  check(): ApiResponse<HealthStatus> {
    return {
      success: true,
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
        cache: this.cacheService.getStats(),
      },
      message: 'Сервис работает в штатном режиме',
      timestamp: new Date().toISOString(),
    };
  }
}
