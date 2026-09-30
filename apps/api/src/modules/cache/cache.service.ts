import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { Redis as RedisClient } from 'ioredis';
import { SingleFlightService } from './single-flight.service';

interface MemoryCacheItem {
  value: unknown;
  expiresAt: number;
}

export interface CacheStats {
  engine: 'redis' | 'memory';
  isRedisConnected: boolean;
  hits: number;
  misses: number;
  coalesced: number;
  memoryEntriesCount: number;
  inFlightRequests: number;
}

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private redisClient: RedisClient | null = null;
  private isRedisReady = false;
  private readonly memoryCache = new Map<string, MemoryCacheItem>();
  private memoryCleanupTimer: NodeJS.Timeout | null = null;

  private hitsCount = 0;
  private missesCount = 0;

  constructor(
    private readonly configService: ConfigService,
    private readonly singleFlightService: SingleFlightService,
  ) {}

  async onModuleInit(): Promise<void> {
    const redisUrl =
      this.configService.get<string>('REDIS_URL') ||
      process.env.REDIS_URL;

    if (redisUrl) {
      this.initRedis(redisUrl);
    } else {
      this.logger.log('REDIS_URL не задан. Используется быстрый in-memory кэш.');
    }

    // Запуск регулярной очистки устаревших записей в in-memory кэше каждые 60 секунд
    this.memoryCleanupTimer = setInterval(() => {
      this.cleanExpiredMemoryCache();
    }, 60000);
    this.memoryCleanupTimer.unref();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.memoryCleanupTimer) {
      clearInterval(this.memoryCleanupTimer);
    }
    if (this.redisClient) {
      try {
        await this.redisClient.quit();
      } catch {
        this.redisClient.disconnect();
      }
    }
  }

  private initRedis(redisUrl: string): void {
    try {
      this.redisClient = new Redis(redisUrl, {
        lazyConnect: false,
        maxRetriesPerRequest: 2,
        connectTimeout: 5000,
        retryStrategy: (times) => {
          // Экспоненциальный откат повторных подключений с ограничением в 5 секунд
          const delay = Math.min(times * 500, 5000);
          return delay;
        },
      });

      this.redisClient.on('connect', () => {
        this.logger.log('Подключение к серверу Redis установлено.');
      });

      this.redisClient.on('ready', () => {
        this.isRedisReady = true;
        this.logger.log('Redis кэш готов к обслуживанию запросов.');
      });

      this.redisClient.on('error', (err) => {
        this.isRedisReady = false;
        this.logger.warn(`Предупреждение Redis: ${err.message}. Временный переход на in-memory кэш.`);
      });

      this.redisClient.on('close', () => {
        this.isRedisReady = false;
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Не удалось инициализировать Redis: ${errorMsg}. Активен in-memory кэш.`);
      this.redisClient = null;
      this.isRedisReady = false;
    }
  }

  /**
   * Получение значения из кэша (Redis или in-memory fallback)
   */
  async get<T>(key: string): Promise<T | null> {
    if (this.isRedisReady && this.redisClient) {
      try {
        const raw = await this.redisClient.get(key);
        if (raw !== null) {
          this.hitsCount++;
          return JSON.parse(raw) as T;
        }
      } catch (err: unknown) {
        this.logger.warn(`Ошибка чтения из Redis для ключа "${key}": ${(err as Error).message}`);
      }
    }

    // Проверка in-memory хранилища
    const item = this.memoryCache.get(key);
    if (item) {
      if (item.expiresAt > Date.now()) {
        this.hitsCount++;
        return item.value as T;
      }
      this.memoryCache.delete(key);
    }

    this.missesCount++;
    return null;
  }

  /**
   * Сохранение значения в кэш с TTL (в секундах)
   */
  async set<T>(key: string, value: T, ttlSeconds = 120): Promise<void> {
    const serialized = JSON.stringify(value);

    if (this.isRedisReady && this.redisClient) {
      try {
        await this.redisClient.set(key, serialized, 'EX', ttlSeconds);
        return;
      } catch (err: unknown) {
        this.logger.warn(`Ошибка записи в Redis для ключа "${key}": ${(err as Error).message}`);
      }
    }

    // Запись в in-memory fallback
    this.memoryCache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  /**
   * Удаление точечного ключа
   */
  async del(key: string): Promise<void> {
    if (this.isRedisReady && this.redisClient) {
      try {
        await this.redisClient.del(key);
      } catch (err: unknown) {
        this.logger.warn(`Ошибка удаления ключа Redis "${key}": ${(err as Error).message}`);
      }
    }
    this.memoryCache.delete(key);
  }

  /**
   * Инвалидация ключей по маске (например, 'news:*' или 'specialties:*')
   * В Redis используется неблокирующий SCAN.
   */
  async delByPattern(pattern: string): Promise<void> {
    // 1. Очистка в Redis через SCAN (не блокирует event loop)
    if (this.isRedisReady && this.redisClient) {
      try {
        let cursor = '0';
        do {
          const [nextCursor, keys] = await this.redisClient.scan(
            cursor,
            'MATCH',
            pattern,
            'COUNT',
            100,
          );
          cursor = nextCursor;
          if (keys.length > 0) {
            await this.redisClient.del(...keys);
          }
        } while (cursor !== '0');
      } catch (err: unknown) {
        this.logger.warn(`Ошибка очистки по шаблону "${pattern}" в Redis: ${(err as Error).message}`);
      }
    }

    // 2. Очистка в memory cache
    const regexPattern = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    for (const key of this.memoryCache.keys()) {
      if (regexPattern.test(key)) {
        this.memoryCache.delete(key);
      }
    }
  }

  /**
   * Защита от Thundering Herd (Single-Flight + Caching).
   * Если 1000 пользователей одновременно запросят один и тот же холодный ключ,
   * функция fetcher выполнится ровно 1 раз, а результат отдастся всем 1000 клиентам.
   */
  async getOrSet<T>(
    key: string,
    ttlSeconds: number,
    fetcher: () => Promise<T>,
  ): Promise<T> {
    // 1. Быстрая проверка кэша
    const cached = await this.get<T>(key);
    if (cached !== null && cached !== undefined) {
      return cached;
    }

    // 2. Схлопывание одновременных запросов (Single-Flight)
    return this.singleFlightService.do<T>(key, async () => {
      // Повторная проверка внутри схлопнутой группы (вдруг предыдущий запрос только что прогрел кэш)
      const doubleCheck = await this.get<T>(key);
      if (doubleCheck !== null && doubleCheck !== undefined) {
        return doubleCheck;
      }

      // 3. Единственное выполнение тяжелого запроса к БД
      const result = await fetcher();

      // 4. Запись в кэш
      if (result !== null && result !== undefined) {
        await this.set(key, result, ttlSeconds);
      }

      return result;
    });
  }

  /**
   * Статистика кэширования
   */
  getStats(): CacheStats {
    return {
      engine: this.isRedisReady ? 'redis' : 'memory',
      isRedisConnected: this.isRedisReady,
      hits: this.hitsCount,
      misses: this.missesCount,
      coalesced: this.singleFlightService.getCoalescedCount(),
      memoryEntriesCount: this.memoryCache.size,
      inFlightRequests: this.singleFlightService.getInFlightCount(),
    };
  }

  private cleanExpiredMemoryCache(): void {
    const now = Date.now();
    for (const [key, item] of this.memoryCache.entries()) {
      if (item.expiresAt <= now) {
        this.memoryCache.delete(key);
      }
    }
  }
}
