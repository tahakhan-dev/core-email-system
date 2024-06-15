import { ICommand } from '@nestjs/cqrs';
import { Request } from 'express';


export class DeleteEmailCommand implements ICommand {
    constructor(
        public readonly request: Request,
        public readonly deleteEmailBody: any,
    ) { }
}
