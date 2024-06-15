import { IQuery } from '@nestjs/cqrs';
import { Request } from 'express';


export class UserRefreshTokenQuery implements IQuery {
    public constructor(
        public readonly request: Request,
        public readonly refreshToken: string
    ) { }
}
