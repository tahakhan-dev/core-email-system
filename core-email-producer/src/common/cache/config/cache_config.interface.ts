import { NodeRole } from "./cache_config.default";

/**
 * Configuration for the database connection.
 */
export interface ConfigCacheData {
    cacheType: string,
    cacheNode1: string,
    cacheNode2: string,
    cacheNode3: string,
    cacheNodePort1: number,
    cacheNodePort2: number,
    cacheNodePort3: number,
    cachePassword: string,
    cacheCloseClient: boolean,
    cacheReadyLog: boolean,
    cacheErrorLog: boolean,
    cacheTTL: number,
    cacheEnableAutoPipelining: boolean,
    cacheEnableOfflineQueue: boolean,
    cacheReadyCheck: boolean,
    cacheClusterScaleRead: NodeRole
    ThrottlerLimit: number,
    ThrottlerTtl: number
}

/**
 * Configuration data for the app.
 */
export interface ConfigData {
    env: string;

    db?: ConfigCacheData;

}
