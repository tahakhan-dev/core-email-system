import { SignUpDto } from '../dto/sign-up.dto';
import { ICommand } from '@nestjs/cqrs';
import { Request } from 'express';


export class SignUpCommand implements ICommand {
    constructor(
        public readonly signUpDto: SignUpDto,
        public readonly request: Request,
    ) { }
}
