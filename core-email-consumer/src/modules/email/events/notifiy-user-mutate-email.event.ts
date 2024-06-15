import { IEvent } from "@nestjs/cqrs";

export class NotifyUserMutateEmailEvent implements IEvent {
    constructor(
        public readonly userId: any
    ) { }
}
