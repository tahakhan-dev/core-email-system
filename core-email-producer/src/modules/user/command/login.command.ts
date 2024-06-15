import { LoginDto } from '../dto/login.dto';
import { ICommand } from '@nestjs/cqrs';
import { Request } from 'express';


export class LoginCommand implements ICommand {
    constructor(
        public readonly loginDto: LoginDto,
        public readonly request: Request,
    ) { }
}
