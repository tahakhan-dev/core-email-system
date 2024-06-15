import { ICommand } from '@nestjs/cqrs';
import { Request } from 'express';


export class CreateEmailCommand implements ICommand {
    constructor(
        public readonly request: Request,
        public readonly createEmailBody: any,
    ) { }
}
