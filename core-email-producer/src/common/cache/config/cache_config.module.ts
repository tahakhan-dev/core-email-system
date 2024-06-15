import { CacheConfigService } from './cache_config.service';
import { Module } from '@nestjs/common';

const configFactory = {
    provide: CacheConfigService,
    useFactory: () => {
        const config = new CacheConfigService();
        config.lofusingDotEnv();
        return config;
    },
};

@Module({
    imports: [],
    controllers: [],
    providers: [configFactory],
    exports: [configFactory],
})
export class CacheConfigModule { }
