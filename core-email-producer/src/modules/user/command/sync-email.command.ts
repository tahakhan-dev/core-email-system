import { ICommand } from '@nestjs/cqrs';
import { Request } from 'express';


export class SyncEmailCommand implements ICommand {
    constructor(
        public readonly request: Request,
    ) { }
}
