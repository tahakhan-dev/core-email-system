import { DEFAULT__CACHE_CONFIG, NodeRole } from './cache_config.default';
import { ConfigData, ConfigCacheData } from './cache_config.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CacheConfigService {
    private config: ConfigData;

    constructor(data: ConfigData = DEFAULT__CACHE_CONFIG) {
        this.config = data;
    }

    public lofusingDotEnv() {
        this.config = this.parseConfigFromEnv(process.env);
    }

    private parseConfigFromEnv(env: NodeJS.ProcessEnv): ConfigData {
        return {
            env: env?.NODE_ENV || DEFAULT__CACHE_CONFIG.env,

            db: this.parseCacheConfigFromEnv(env) || DEFAULT__CACHE_CONFIG.db,
        };
    }

    private parseCacheConfigFromEnv(env: NodeJS.ProcessEnv): ConfigCacheData {
        return {
            cacheType: env?.CACHE_TYPE || DEFAULT__CACHE_CONFIG?.db?.cacheType,
            cacheNode1: env?.CACHE_CLUSTER_NODE1_HOST || DEFAULT__CACHE_CONFIG?.db?.cacheNode1,
            cacheNode2: env?.CACHE_CLUSTER_NODE2_HOST || DEFAULT__CACHE_CONFIG?.db?.cacheNode2,
            cacheNode3: env?.CACHE_CLUSTER_NODE3_HOST || DEFAULT__CACHE_CONFIG?.db?.cacheNode3,
            cacheNodePort1: parseInt(env?.CACHE_CLUSTER_NODE1_PORT) || DEFAULT__CACHE_CONFIG?.db?.cacheNodePort1,
            cacheNodePort2: parseInt(env?.CACHE_CLUSTER_NODE2_PORT) || DEFAULT__CACHE_CONFIG?.db?.cacheNodePort2,
            cacheNodePort3: parseInt(env?.CACHE_CLUSTER_NODE3_PORT) || DEFAULT__CACHE_CONFIG?.db?.cacheNodePort3,
            cachePassword: env?.CACHE_PASSWORD || DEFAULT__CACHE_CONFIG?.db?.cachePassword,
            cacheCloseClient: JSON.parse(env?.CACHE_CLOSE_CLIENT) || DEFAULT__CACHE_CONFIG?.db?.cacheCloseClient,
            cacheReadyLog: JSON.parse(env?.CACHE_READY_LOG) || DEFAULT__CACHE_CONFIG?.db?.cacheReadyLog,
            cacheErrorLog: JSON.parse(env?.CACHE_ERROR_LOG) || DEFAULT__CACHE_CONFIG?.db?.cacheErrorLog,
            cacheTTL: parseInt(env?.CACHE_TTL) || DEFAULT__CACHE_CONFIG?.db?.cacheTTL,
            cacheEnableAutoPipelining: JSON.parse(env?.CACHE_ENABLE_AUTO_PIPELINING) || DEFAULT__CACHE_CONFIG?.db?.cacheEnableAutoPipelining,
            cacheEnableOfflineQueue: JSON.parse(env?.CACHE_ENABLE_OFFLINE_QUEUE) || DEFAULT__CACHE_CONFIG?.db?.cacheEnableOfflineQueue,
            cacheReadyCheck: JSON.parse(env?.CACHE_READY_CHECK) || DEFAULT__CACHE_CONFIG?.db?.cacheReadyCheck,
            cacheClusterScaleRead: env?.CACHE_CLUSTER_SCALE_READ as NodeRole || DEFAULT__CACHE_CONFIG?.db?.cacheClusterScaleRead,
            ThrottlerLimit: parseInt(env?.THROTTLER_LIMIT) || DEFAULT__CACHE_CONFIG?.db?.ThrottlerLimit,
            ThrottlerTtl: parseInt(env?.THROTTLER_TTL) || DEFAULT__CACHE_CONFIG?.db?.ThrottlerTtl,
        };
    }

    public get(): Readonly<ConfigData> {
        return this.config;
    }
}
