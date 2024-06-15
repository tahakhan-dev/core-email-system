import { CacheUserService } from 'src/common/cache/cache-user.service';
import { AppGateway } from '../../common/helper/app.gateway';
import { AuthModule } from '../auth/auth.module';
import { KafkaService } from './kafka.service';
import { Module } from '@nestjs/common';

@Module({
    imports: [AuthModule],
    providers: [KafkaService, AppGateway, CacheUserService],
    exports: [KafkaService, AppGateway], // Export KafkaService to use it in other parts of your app
})
export class KafkaModule { }
