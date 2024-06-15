import { ConfigData } from './config.interface';
import 'dotenv/config';

const userName = process.env.DB_USER;
const Pass = process.env.DB_PASSWORD;
const Host = process.env.DB_HOST;
const dbName = process.env.DB_DATABASE;
const dbType = process.env.DB_TYPE;
const dbPort = process.env.DB_PORT;
const poolSize = +process.env.POOL_SIZE
const enable_db_creation = JSON.parse(process.env.ENABLE_AUTOMATIC_CREATION)
const auto_load_entities = JSON.parse(process.env.AUTO_LOAD_ENTITIES);


export const DEFAULT_CONFIG: ConfigData = {
    env: 'DEVELOPMENT',
    db: {
        type: dbType,
        host: Host,
        name: dbName,
        user: userName,
        pass: Pass,
        port: +dbPort,
        synchronize: enable_db_creation,
        poolSize: poolSize,
        autoLoadEntities: auto_load_entities
    },
    logLevel: 'info',
};


