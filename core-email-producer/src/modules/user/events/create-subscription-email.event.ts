import { IEvent } from "@nestjs/cqrs";
import { Request } from 'express';

export class CreateSubscriptionEmailEvent implements IEvent {
    constructor(
        public readonly request: Request,
    ) { }
}
