import { CacheEmailService } from './cache-email.service';
import { Module } from '@nestjs/common';

@Module({
    providers: [CacheEmailService],
    exports: [CacheEmailService]
})
export class CacheModule { }