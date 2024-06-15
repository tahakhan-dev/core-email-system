import { IQuery } from '@nestjs/cqrs';
import { Request } from 'express';


export class GetAllUserEmailQuery implements IQuery {
    public constructor(
        public readonly request: Request,
    ) { }
}
