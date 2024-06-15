import { IEvent } from "@nestjs/cqrs";
import { Request } from 'express';

export class EmailSyncEvent implements IEvent {
    constructor(
        public readonly request: Request,
        public readonly emailData: any
    ) { }
}
