import { ConfigData, ConfigDBData } from './config.interface';
import { DEFAULT_CONFIG } from './config.default';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
    private config: ConfigData;

    constructor(data: ConfigData = DEFAULT_CONFIG) {
        this.config = data;
    }

    public lofusingDotEnv() {
        try {
            this.config = this.parseConfigFromEnv(process.env);
        } catch (error) {
            console.log(error);
        }
    }

    private parseConfigFromEnv(env: NodeJS.ProcessEnv): ConfigData {
        try {
            return {
                env: env.NODE_ENV || DEFAULT_CONFIG.env,
                port: env.PORT ? parseInt(env.PORT, 10) : DEFAULT_CONFIG.port,
                db: this.parseDbConfigFromEnv(env) || DEFAULT_CONFIG.db,
                logLevel: env.LOG_LEVEL || DEFAULT_CONFIG.logLevel,
            };
        } catch (error) {
            console.log(error);
        }
    }

    private parseDbConfigFromEnv(env: NodeJS.ProcessEnv): ConfigDBData {
        try {
            return {
                type: env.DB_TYPE || DEFAULT_CONFIG.db.type,
                user: env.DB_USER || DEFAULT_CONFIG.db.user,
                pass: env.DB_PASSWORD || DEFAULT_CONFIG.db.pass,
                name: env.DB_DATABASE || DEFAULT_CONFIG.db.name,
                host: env.DB_HOST || DEFAULT_CONFIG.db.host,
                port: parseInt(env.DB_PORT, 10) || DEFAULT_CONFIG.db.port,
                synchronize: JSON.parse(env.ENABLE_AUTOMATIC_CREATION),
                autoLoadEntities: JSON.parse(env.AUTO_LOAD_ENTITIES) || DEFAULT_CONFIG.db.autoLoadEntities,
                poolSize: +env.POOL_SIZE || DEFAULT_CONFIG.db.poolSize,
                dialect: env.DB_DIALECT || '',
                charset: env.DB_CHARSET || '',
                collate: env.DB_COLLATE || '',
            };
        } catch (error) {
            console.log(error);
        }
    }

    public get(): Readonly<ConfigData> {
        try {
            return this.config;
        } catch (error) {
            console.log(error);
        }
    }
}
