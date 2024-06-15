import { CommandHandler, EventBus, EventPublisher, ICommandHandler } from "@nestjs/cqrs";
import { CreateSubscriptionEmailEvent } from "./events/create-subscription-email.event";
import { IUserResponse } from "src/interface/base.response.interface";
import { SyncEmailCommand } from "./command/sync-email.command";
import { EmailSyncEvent } from "./events/sync-email.event";
import { SignUpCommand } from "./command/sign-up.command";
import { UnauthorizedException } from "@nestjs/common";
import { LoginCommand } from "./command/login.command";
import { UserRepository } from "./user.repository";

@CommandHandler(SignUpCommand)
export class SignUpCommandHandler implements ICommandHandler<SignUpCommand> {
    constructor(
        private readonly userRepo: UserRepository,
        private readonly publisher: EventPublisher,
    ) { }

    // @ts-ignore
    async execute(command: SignUpCommand, resolve: (value?) => void): Promise<IUserResponse> {
        try {
            const singUp = this.publisher.mergeObjectContext(
                await this.userRepo.signUp(command?.signUpDto, command?.request),
            );
            return singUp;
        } catch (error) {
            console.log(error);
            throw new UnauthorizedException("Internal Server Error");
        }
    }
}



@CommandHandler(LoginCommand)
export class LoginCommandHandler implements ICommandHandler<LoginCommand> {
    constructor(
        private readonly userRepo: UserRepository,
        private readonly publisher: EventPublisher,
    ) { }

    // @ts-ignore
    async execute(command: LoginCommand, resolve: (value?) => void): Promise<IUserResponse> {
        try {
            const login = this.publisher.mergeObjectContext(
                await this.userRepo.login(command?.loginDto, command?.request),
            );
            return login;
        } catch (error) {
            console.log(error);
            throw new UnauthorizedException("Internal Server Error");
        }

    }
}

@CommandHandler(SyncEmailCommand)
export class SyncEmailCommandHandler implements ICommandHandler<SyncEmailCommand> {
    constructor(
        private readonly userRepo: UserRepository,
        private readonly publisher: EventPublisher,
        private readonly eventBus: EventBus,

    ) { }

    // @ts-ignore
    async execute(command: SyncEmailCommand, resolve: (value?) => void): Promise<IUserResponse> {
        try {
            const syncEmail = this.publisher.mergeObjectContext(
                await this.userRepo.syncEmail(command?.request),
            );

            if (syncEmail?.status === 0) return syncEmail

            const emailSyncEvent = new EmailSyncEvent(command?.request, syncEmail?.result);
            const createSubscriptionEmailEvent = new CreateSubscriptionEmailEvent(command?.request);

            const allEvent = [emailSyncEvent, createSubscriptionEmailEvent];
            this.eventBus.publishAll(allEvent)

            delete syncEmail?.result;
            return syncEmail;

        } catch (error) {
            console.log(error);
            throw new UnauthorizedException("Internal Server Error");
        }

    }
}

