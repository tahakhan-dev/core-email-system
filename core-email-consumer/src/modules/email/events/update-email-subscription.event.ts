import { IEvent } from "@nestjs/cqrs";

export class UpdateEmailSubscriptionEvent implements IEvent {
    constructor(
        public readonly updateEmailIdsArray: any
    ) { }
}
