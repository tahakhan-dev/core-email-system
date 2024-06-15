import { CreateEmailSubscriptionCronEvent } from "./events/create-email-subscription-cron.event";
import { CreateEmailSubscriptionEvent } from "./events/create-email-subscription.event";
import { UpdateEmailSubscriptionEvent } from "./events/update-email-subscription.event";
import { NotifyUserMutateEmailEvent } from "./events/notifiy-user-mutate-email.event";
import { Inject, InternalServerErrorException } from "@nestjs/common";
import { ActivityLogEvent } from "./events/activity-log.event";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { ClientKafka } from "@nestjs/microservices";

@EventsHandler(ActivityLogEvent)
export class ActivityLogEventHandler implements IEventHandler<ActivityLogEvent> {
    constructor() { }

    handle(event: ActivityLogEvent) {
        try {
            console.log(event.logMapper, '==========event.logMapper===============');
        } catch (error) {
            throw new InternalServerErrorException()
        }
    }
}


@EventsHandler(CreateEmailSubscriptionEvent)
export class CreateEmailSubscriptionEventHandler implements IEventHandler<CreateEmailSubscriptionEvent> {
    constructor(
        @Inject(process.env.KAFKA_NAME) private readonly kafkaClient: ClientKafka,
    ) { }

    handle(event: CreateEmailSubscriptionEvent) {
        try {
            event.newEmailIdsArray.forEach(element => {
                this.kafkaClient.emit(process.env.KAFKA_CREATE_EMAIL_SUBSCRIPTION_TOPIC, JSON.stringify({
                    userId: element?.id,
                    emailId: element?.emailId,
                    accessToken: element?.accessToken
                }))
            });
        } catch (error) {
            throw new InternalServerErrorException()
        }
    }
}

@EventsHandler(CreateEmailSubscriptionCronEvent)
export class CreateEmailSubscriptionCronEventtHandler implements IEventHandler<CreateEmailSubscriptionCronEvent> {
    constructor(
        @Inject(process.env.KAFKA_NAME) private readonly kafkaClient: ClientKafka,
    ) { }

    handle(event: CreateEmailSubscriptionCronEvent) {
        try {
            event.usersIdArray.forEach(element => {
                this.kafkaClient.emit(process.env.KAFKA_EMAIL_SUBSCRIPTION_TOPIC, JSON.stringify({ userId: element }))
            });
        } catch (error) {
            throw new InternalServerErrorException()
        }
    }
}

@EventsHandler(NotifyUserMutateEmailEvent)
export class NotifyUserMutateEmailEventtHandler implements IEventHandler<NotifyUserMutateEmailEvent> {
    constructor(
        @Inject(process.env.KAFKA_NAME) private readonly kafkaClient: ClientKafka,
    ) { }

    handle(event: NotifyUserMutateEmailEvent) {
        try {
            this.kafkaClient.emit(process.env.KAFKA_NOTIFY_MUTATION_EMAIL_TOPIC, JSON.stringify({ userId: event.userId }))
        } catch (error) {
            throw new InternalServerErrorException()
        }
    }
}

@EventsHandler(UpdateEmailSubscriptionEvent)
export class UpdateEmailSubscriptionEventHandler implements IEventHandler<UpdateEmailSubscriptionEvent> {
    constructor(
        @Inject(process.env.KAFKA_NAME) private readonly kafkaClient: ClientKafka,
    ) { }

    handle(event: UpdateEmailSubscriptionEvent) {
        try {
            event.updateEmailIdsArray.forEach(element => {
                this.kafkaClient.emit(process.env.KAFKA_UPDATE_EMAIL_SUBSCRIPTION_TOPIC, JSON.stringify({
                    userId: element?.id,
                    emailId: element?.emailId,
                    accessToken: element?.accessToken
                }))
            });
        } catch (error) {
            throw new InternalServerErrorException()
        }
    }
}

