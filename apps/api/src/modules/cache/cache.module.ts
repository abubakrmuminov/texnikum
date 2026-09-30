import { Global, Module } from '@nestjs/common';
import { CacheService } from './cache.service';
import { SingleFlightService } from './single-flight.service';

@Global()
@Module({
  providers: [SingleFlightService, CacheService],
  exports: [SingleFlightService, CacheService],
})
export class CacheModule {}
