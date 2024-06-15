import { RedirectMicrosoftToLocalQuery } from "./query/redirect-microsoft-to-local.query";
import { EventPublisher, IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { UserRefreshTokenQuery } from "./query/user-refresh-token.query";
import { IUserResponse } from "src/interface/base.response.interface";
import { GetUserProfileQuery } from "./query/get-user-profile.query";
import { InternalServerErrorException } from "@nestjs/common";
import { UserRepository } from "./user.repository";

@QueryHandler(GetUserProfileQuery)
export class GetUserProfileQueryHandler implements IQueryHandler<GetUserProfileQuery> {
    constructor(
        private readonly userRepo: UserRepository,
        private readonly publisher: EventPublisher,
    ) { }

    // @ts-ignore
    async execute(query: GetUserProfileQuery, resolve: (value?) => void): Promise<IUserResponse> {
        try {
            const getUserProfile = this.publisher.mergeObjectContext(
                await this.userRepo.getUserProfile(query.request),
            );
            return getUserProfile;
        } catch (error) {
            throw new InternalServerErrorException(error)
        }
    }
}

@QueryHandler(RedirectMicrosoftToLocalQuery)
export class RedirectMicrosoftToLocalQueryHandler implements IQueryHandler<RedirectMicrosoftToLocalQuery> {
    constructor(
        private readonly userRepo: UserRepository,
        private readonly publisher: EventPublisher,
    ) { }

    // @ts-ignore
    async execute(query: RedirectMicrosoftToLocalQuery, resolve: (value?) => void): Promise<IUserResponse> {
        try {
            const redirectMicrosoftToLocal = this.publisher.mergeObjectContext(
                await this.userRepo.redirectMicrosoftToLocal(query.request, query.code, query.state),
            );
            return redirectMicrosoftToLocal;
        } catch (error) {
            throw new InternalServerErrorException(error)
        }
    }
}

@QueryHandler(UserRefreshTokenQuery)
export class UserRefreshTokenQueryHandler implements IQueryHandler<UserRefreshTokenQuery> {
    constructor(
        private readonly userRepo: UserRepository,
        private readonly publisher: EventPublisher,
    ) { }

    // @ts-ignore
    async execute(query: UserRefreshTokenQuery, resolve: (value?) => void): Promise<IUserResponse> {
        try {
            const userRefreshToken = this.publisher.mergeObjectContext(
                await this.userRepo.refreshToken(query.request, query.refreshToken),
            );
            return userRefreshToken;
        } catch (error) {
            throw new InternalServerErrorException(error)
        }
    }
}

