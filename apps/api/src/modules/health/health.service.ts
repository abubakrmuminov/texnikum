import { Injectable } from '@nestjs/common';
import { ApiResponse } from '@college/shared';

export interface HealthStatus {
  status: 'ok';
  timestamp: string;
  uptimeSeconds: number;
}

@Injectable()
export class HealthService {
  check(): ApiResponse<HealthStatus> {
    return {
      success: true,
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
      },
      message: 'Сервис работает в штатном режиме',
      timestamp: new Date().toISOString(),
    };
  }
}
