import { IQuery } from '@nestjs/cqrs';
import { Request } from 'express';


export class GetUserEmailByIdQuery implements IQuery {
    public constructor(
        public readonly request: Request,
        public readonly id: number,

    ) { }
}
