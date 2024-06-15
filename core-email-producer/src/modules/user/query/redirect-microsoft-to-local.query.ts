import { IQuery } from '@nestjs/cqrs';
import { Request } from 'express';


export class RedirectMicrosoftToLocalQuery implements IQuery {
    public constructor(
        public readonly request: Request,
        public readonly code: string,
        public readonly state: string,
    ) { }
}
