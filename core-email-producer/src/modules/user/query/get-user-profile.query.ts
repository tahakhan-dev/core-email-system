import { IQuery } from '@nestjs/cqrs';
import { Request } from 'express';


export class GetUserProfileQuery implements IQuery {
    public constructor(
        public readonly request: Request,
    ) { }
}
