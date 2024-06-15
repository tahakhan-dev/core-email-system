import { LoggingFunctions } from './utils/interceptor/activityLogging/activity-logging.function';
import { LoggingInterceptor } from './utils/interceptor/activityLogging/logging.interceptor';
import { MicroServiceHealthCheckService } from './microservice-health-check.service';
import { CacheConfigService } from './common/cache/config/cache_config.service';
import { ClusterModule, ClusterModuleOptions } from '@liaoliaots/nestjs-redis';
import { DatabaseModule } from './modules/database/connection/database.module';
import { CacheConfigModule } from './common/cache/config/cache_config.module';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import { HttpExceptionFilter } from './utils/filters/http-exeception.filter';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { entitiesList } from './entitiesList/entities.list';
import { EmailModule } from './modules/email/email.module';
import { ShutdownService } from './shutdown.service';
import { TerminusModule } from '@nestjs/terminus';
import { AppController } from './app.controller';
import { Module, Scope } from '@nestjs/common';
import { AppService } from './app.service';
import { CqrsModule } from '@nestjs/cqrs';
import Redis from 'ioredis';


@Module({
  imports: [
    CqrsModule,
    ClusterModule.forRootAsync({ // using this redis cluster module 
      imports: [CacheConfigModule],
      inject: [CacheConfigService],
      useFactory: async (configService: CacheConfigService): Promise<ClusterModuleOptions> => {
        const redisConfig = configService.get().db
        return {
          readyLog: redisConfig.cacheReadyLog,
          closeClient: redisConfig.cacheCloseClient,
          errorLog: redisConfig.cacheErrorLog,
          config: {
            nodes: [
              { host: redisConfig.cacheNode1, port: redisConfig.cacheNodePort1 },
              { host: redisConfig.cacheNode2, port: redisConfig.cacheNodePort2 },
              { host: redisConfig.cacheNode3, port: redisConfig.cacheNodePort3 }
            ],
            enableAutoPipelining: redisConfig.cacheEnableAutoPipelining,
            enableOfflineQueue: redisConfig.cacheEnableOfflineQueue,
            enableReadyCheck: redisConfig.cacheReadyCheck,
            scaleReads: redisConfig.cacheClusterScaleRead,
            // redisOptions: { password: 'authpassword' }
          }
        };
      }
    }),
    ThrottlerModule.forRootAsync({  //  Throttling limits the number of requests that a client can make within a certain time period.
      imports: [CacheConfigModule], //  It helps to prevent abuse and protect your application's resources from being overwhelmed by excessive requests.
      inject: [CacheConfigService],
      useFactory: (configService: CacheConfigService) => [{
        ttl: configService.get().db.ThrottlerTtl,
        limit: configService.get().db.ThrottlerLimit,
        storage: new ThrottlerStorageRedisService(new Redis.Cluster(  // We utilized a Redis store to manage the throttling mechanism. 
          [
            { host: configService.get().db.cacheNode1, port: configService.get().db.cacheNodePort1 },
            { host: configService.get().db.cacheNode2, port: configService.get().db.cacheNodePort2 },
            { host: configService.get().db.cacheNode3, port: configService.get().db.cacheNodePort3 }
          ],
          {
            enableAutoPipelining: configService.get().db.cacheEnableAutoPipelining,
            enableOfflineQueue: configService.get().db.cacheEnableOfflineQueue,
            enableReadyCheck: configService.get().db.cacheReadyCheck,
            scaleReads: configService.get().db.cacheClusterScaleRead,
          }
        )),
      }],
    }),
    // Module listing
    DatabaseModule.forRoot({ entities: entitiesList }),
    TerminusModule,
    EmailModule,

  ],
  controllers: [AppController],
  providers: [
    AppService,
    ShutdownService,
    MicroServiceHealthCheckService,
    LoggingFunctions,
    {
      provide: APP_INTERCEPTOR,
      scope: Scope.REQUEST,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,  // ThrottlerGuard class will be used as a guard to protect routes or endpoints in the application
    }
  ],
})
export class AppModule { }
