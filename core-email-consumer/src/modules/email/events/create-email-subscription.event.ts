import { IEvent } from "@nestjs/cqrs";

export class CreateEmailSubscriptionEvent implements IEvent {
    constructor(
        public readonly newEmailIdsArray: any
    ) { }
}
