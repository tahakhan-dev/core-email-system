import { SubscriptionStatus } from 'src/common/enums/status.enum';
import { ICommand } from '@nestjs/cqrs';
import { Request } from 'express';


export class EmailSubscriptionCommand implements ICommand {
    constructor(
        public readonly request: Request,
        public readonly status: SubscriptionStatus,
    ) { }
}
