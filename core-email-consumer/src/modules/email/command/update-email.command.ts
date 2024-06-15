import { ICommand } from '@nestjs/cqrs';
import { Request } from 'express';


export class UpdateEmailCommand implements ICommand {
    constructor(
        public readonly request: Request,
        public readonly updateEmailBody: any,
    ) { }
}
