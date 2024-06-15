import { OnApplicationShutdown, Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ShutdownService implements OnApplicationShutdown {
    constructor() { }


    async onApplicationShutdown(signal: string) {
        Logger.log(`SHUTDOWN_SIGNAL: ${signal}`);
        Logger.log("TypeORM Database connections closed");
        // call api here to signal that particular service is down...
    }
}
