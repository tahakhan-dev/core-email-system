import { CacheUserService } from './cache-user.service';
import { Module } from '@nestjs/common';

@Module({
    providers: [CacheUserService],
    exports: [CacheUserService]
})
export class CacheModule { }