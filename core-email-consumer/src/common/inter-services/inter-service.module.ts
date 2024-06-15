import { CacheEmailService } from "../cache/cache-email.service";
import { InterServices } from "./inter-service.service";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";

@Module({
    imports: [
        HttpModule.registerAsync({
            useFactory: () => ({
                timeout: 5000,
                maxRedirects: 5,
            }),
        }),
    ],
    providers: [
        InterServices,
        CacheEmailService
    ],
    exports: [InterServices]

})
export class InterServicesModule { }