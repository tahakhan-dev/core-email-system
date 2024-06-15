import { CacheConfigService } from '../../../common/cache/config/cache_config.service';
import { CacheConfigModule } from '../../../common/cache/config/cache_config.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigDBData } from '../config/config.interface';
import { ConfigService } from '../config/config.service';
import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { DataSourceOptions } from 'typeorm';
import { DbConfigError } from './db.error';
import { DbConfig } from './db.interface';

@Module({})
export class DatabaseModule {
    static forRoot(dbconfig: DbConfig): DynamicModule {
        return {
            global: true,
            module: DatabaseModule,
            imports: [
                TypeOrmModule.forRootAsync({
                    imports: [ConfigModule, CacheConfigModule],
                    useFactory: (configService: ConfigService, cacheConfigService: CacheConfigService) =>
                        DatabaseModule.getConnectionOptions(configService, dbconfig, cacheConfigService),
                    inject: [ConfigService, CacheConfigService],
                }),
            ],
        };
    }

    public static getConnectionOptions(config: ConfigService, dbconfig: DbConfig, cacheConfig: CacheConfigService): TypeOrmModuleOptions {
        try {
            const dbdata = config.get().db;
            const cacheData = cacheConfig.get().db
            type dbCacheType = "database" | "redis" | "ioredis" | "ioredis/cluster"

            let connectionOptions: TypeOrmModuleOptions;

            if (!dbdata) {
                throw new DbConfigError('Database config is missing');
            }
            connectionOptions = this.getConnectionOptionsDatabase(dbdata);

            return {
                ...connectionOptions,
                entities: dbconfig.entities,
                autoLoadEntities: JSON.parse(process.env.AUTO_LOAD_ENTITIES) || dbdata.autoLoadEntities,
                logging: true,
                cache: {
                    type: cacheData.cacheType as dbCacheType,
                    options: {
                        startupNodes: [
                            {
                                host: cacheData.cacheNode1,
                                port: cacheData.cacheNodePort1,
                            },
                            {
                                host: cacheData.cacheNode2,
                                port: cacheData.cacheNodePort2,
                            },
                            {
                                host: cacheData.cacheNode3,
                                port: cacheData.cacheNodePort3,
                            }
                        ],
                        options: {
                            scaleReads: cacheData.cacheClusterScaleRead,
                            enableAutoPipelining: cacheData.cacheEnableAutoPipelining,
                            enableOfflineQueue: cacheData.cacheEnableOfflineQueue,
                            enableReadyCheck: cacheData.cacheReadyCheck,
                            clusterRetryStrategy: function (times) { return null },
                            redisOptions: {
                                maxRetriesPerRequest: 1
                            }
                        }
                    }
                }
                // extra: {
                //     "validateConnection": false,
                //     "trustServerCertificate": true
                // }
            };
        } catch (error) {
            console.log(error);
        }
    }


    private static getConnectionOptionsDatabase(dbdata: ConfigDBData): DataSourceOptions {
        try {
            return {
                type: process.env.DB_TYPE || dbdata.type,
                host: process.env.DB_HOST || dbdata.host,
                port: +process.env.DB_PORT || dbdata.port,
                username: process.env.DB_USER || dbdata.user,
                password: process.env.DB_PASSWORD || dbdata.pass,
                database: process.env.DB_DATABASE || dbdata.name,
                synchronize: JSON.parse(process.env.ENABLE_AUTOMATIC_CREATION) || dbdata.synchronize,
                poolSize: +process.env.POOL_SIZE || dbdata.poolSize
            };
        } catch (error) {
            console.log(error);
        }
    }
}
