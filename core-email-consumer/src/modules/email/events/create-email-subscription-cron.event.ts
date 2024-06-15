import { IEvent } from "@nestjs/cqrs";

export class CreateEmailSubscriptionCronEvent implements IEvent {
    constructor(
        public readonly usersIdArray: any
    ) { }
}
