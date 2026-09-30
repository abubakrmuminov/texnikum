import { Injectable, Logger } from '@nestjs/common';

/**
 * SingleFlightService
 *
 * Реализует паттерн Single-Flight (Request Coalescing / схлопывание запросов).
 * Защищает базу данных от Thundering Herd (лавинообразных запросов / Cache Stampede).
 * Если 1000 пользователей одновременно запрашивают один и тот же холодный ресурс,
 * выполняется ровно ОДИН запрос к источнику данных, а результат параллельно отдается
 * всем 1000 ожидающим запросам.
 */
@Injectable()
export class SingleFlightService {
  private readonly logger = new Logger(SingleFlightService.name);
  private readonly inFlight = new Map<string, Promise<unknown>>();
  private coalescedCount = 0;

  /**
   * Выполняет операцию или присоединяется к уже выполняющемуся промису по заданному ключу.
   */
  async do<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const existing = this.inFlight.get(key);
    if (existing) {
      this.coalescedCount++;
      this.logger.debug(
        `[SingleFlight] Запрос схлопнут (coalesced) для ключа "${key}" (всего схлопнуто: ${this.coalescedCount})`,
      );
      return existing as Promise<T>;
    }

    const promise = (async () => {
      try {
        return await fn();
      } finally {
        this.inFlight.delete(key);
      }
    })();

    this.inFlight.set(key, promise);
    return promise;
  }

  getCoalescedCount(): number {
    return this.coalescedCount;
  }

  getInFlightCount(): number {
    return this.inFlight.size;
  }
}
