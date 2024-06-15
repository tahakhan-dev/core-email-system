import { EventPublisher, IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetUserEmailByIdQuery } from "./query/get-user-email-by-id.query";
import { GetAllUserEmailQuery } from "./query/get-all-user-email.query";
import { IEmailResponse } from "src/interface/base.response.interface";
import { InternalServerErrorException } from "@nestjs/common";
import { EmailRepository } from "./email.repository";

@QueryHandler(GetAllUserEmailQuery)
export class GetAllUserEmailQueryHandler implements IQueryHandler<GetAllUserEmailQuery> {
    constructor(
        private readonly emailRepo: EmailRepository,
        private readonly publisher: EventPublisher,
    ) { }

    // @ts-ignore
    async execute(query: GetAllUserEmailQuery, resolve: (value?) => void): Promise<IEmailResponse> {
        try {
            const getAllUserEmail = this.publisher.mergeObjectContext(
                await this.emailRepo.getAllUserEmail(query.request),
            );
            return getAllUserEmail;
        } catch (error) {
            throw new InternalServerErrorException()
        }
    }
}

@QueryHandler(GetUserEmailByIdQuery)
export class GetUserEmailByIdQueryHandler implements IQueryHandler<GetUserEmailByIdQuery> {
    constructor(
        private readonly emailRepo: EmailRepository,
        private readonly publisher: EventPublisher,
    ) { }

    // @ts-ignore
    async execute(query: GetUserEmailByIdQuery, resolve: (value?) => void): Promise<IEmailResponse> {
        try {
            const getUserEmailById = this.publisher.mergeObjectContext(
                await this.emailRepo.getUserEmailById(query.request, query.id),
            );
            return getUserEmailById;
        } catch (error) {
            throw new InternalServerErrorException()
        }
    }
}