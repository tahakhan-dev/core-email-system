import { ILoggerMapper } from "src/interface/base.response.interface";
import { IEvent } from "@nestjs/cqrs";
import { Request } from 'express';

export class ActivityLogEvent implements IEvent {
    constructor(
        public readonly request: Request,
        public readonly logMapper: ILoggerMapper
    ) { }
}
