import { ConfigService } from './config.service';
import { Module } from '@nestjs/common';

const configFactory = {
    provide: ConfigService,
    useFactory: () => {
        const config = new ConfigService();
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
export class ConfigModule {}
