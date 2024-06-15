import { CreateEmailSubscriptionCronEvent } from "./events/create-email-subscription-cron.event";
import { CreateSubscriptionsCronCommand } from "./command/create-subscriptions-cron.command";
import { CommandHandler, EventBus, EventPublisher, ICommandHandler } from "@nestjs/cqrs";
import { CreateEmailSubscriptionEvent } from "./events/create-email-subscription.event";
import { UpdateEmailSubscriptionEvent } from "./events/update-email-subscription.event";
import { EmailSubscriptionCommand } from "./command/email-subscription.command";
import { IEmailResponse } from "src/interface/base.response.interface";
import { CreateEmailCommand } from "./command/create-email.command";
import { UpdateEmailCommand } from "./command/update-email.command";
import { DeleteEmailCommand } from "./command/delete-email.command";
import { InternalServerErrorException } from "@nestjs/common";
import { EmailRepository } from "./email.repository";


@CommandHandler(EmailSubscriptionCommand)
export class EmailSubscriptionCommandHandler implements ICommandHandler<EmailSubscriptionCommand> {
    constructor(
        private readonly emailRepo: EmailRepository,
        private readonly publisher: EventPublisher,
    ) { }

    // @ts-ignore
    async execute(command: EmailSubscriptionCommand, resolve: (value?) => void): Promise<IEmailResponse> {
        try {
            const emailSubscription = this.publisher.mergeObjectContext(
                await this.emailRepo.emailSubscription(command?.request, command?.status),
            );
            return emailSubscription;
        } catch (error) {
            throw new InternalServerErrorException()
        }
    }
}

@CommandHandler(CreateEmailCommand)
export class CreateEmailCommandHandler implements ICommandHandler<CreateEmailCommand> {
    constructor(
        private readonly emailRepo: EmailRepository,
        private readonly publisher: EventPublisher,
        private readonly eventBus: EventBus,
    ) { }

    // @ts-ignore
    async execute(command: CreateEmailCommand, resolve: (value?) => void): Promise<IEmailResponse> {
        try {
            const createEmail = this.publisher.mergeObjectContext(
                await this.emailRepo.createEmail(command?.request, command?.createEmailBody),
            );
            if (createEmail.status === 0) return createEmail
            const emailCreateEvent = new CreateEmailSubscriptionEvent(createEmail?.result);
            const allEvent = [emailCreateEvent];
            this.eventBus.publishAll(allEvent)

            return createEmail;
        } catch (error) {
            throw new InternalServerErrorException()
        }
    }
}

@CommandHandler(UpdateEmailCommand)
export class UpdateEmailCommandHandler implements ICommandHandler<UpdateEmailCommand> {
    constructor(
        private readonly emailRepo: EmailRepository,
        private readonly publisher: EventPublisher,
        private readonly eventBus: EventBus,

    ) { }

    // @ts-ignore
    async execute(command: UpdateEmailCommand, resolve: (value?) => void): Promise<IEmailResponse> {
        try {
            const updateEmail = this.publisher.mergeObjectContext(
                await this.emailRepo.updateEmail(command?.request, command?.updateEmailBody),
            );
            if (updateEmail.status === 0) return updateEmail

            const emailUpdateEvent = new UpdateEmailSubscriptionEvent(updateEmail?.result);
            const allEvent = [emailUpdateEvent];
            this.eventBus.publishAll(allEvent)

            return updateEmail;
        } catch (error) {
            throw new InternalServerErrorException()
        }
    }
}

@CommandHandler(DeleteEmailCommand)
export class DeleteEmailCommandHandler implements ICommandHandler<DeleteEmailCommand> {
    constructor(
        private readonly emailRepo: EmailRepository,
        private readonly publisher: EventPublisher,
    ) { }

    // @ts-ignore
    async execute(command: DeleteEmailCommand, resolve: (value?) => void): Promise<IEmailResponse> {
        try {
            const deleteEmail = this.publisher.mergeObjectContext(
                await this.emailRepo.deleteEmail(command?.request, command?.deleteEmailBody),
            );
            return deleteEmail;
        } catch (error) {
            throw new InternalServerErrorException()
        }
    }
}

@CommandHandler(CreateSubscriptionsCronCommand)
export class CreateSubscriptionsCronCommandHandler implements ICommandHandler<CreateSubscriptionsCronCommand> {
    constructor(
        private readonly emailRepo: EmailRepository,
        private readonly publisher: EventPublisher,
        private readonly eventBus: EventBus,
    ) { }

    // @ts-ignore
    async execute() {
        try {
            const createEmailSubscriptionCron = this.publisher.mergeObjectContext(
                await this.emailRepo.createEmailSubscriptionCron(),
            );
            console.log(createEmailSubscriptionCron?.result);
            if (createEmailSubscriptionCron.status === 0) return createEmailSubscriptionCron

            const createEmailSubscriptionCronEvent = new CreateEmailSubscriptionCronEvent(createEmailSubscriptionCron?.result);
            const allEvent = [createEmailSubscriptionCronEvent];
            this.eventBus.publishAll(allEvent)

            return createEmailSubscriptionCronEvent;


        } catch (error) {
            throw new InternalServerErrorException()
        }
    }
}