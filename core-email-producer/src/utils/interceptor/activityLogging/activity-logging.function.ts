import { ActivityLogEvent } from "src/modules/user/events/activity-log.event";
import { ILoggerMapper } from "src/interface/base.response.interface";
import { Injectable } from "@nestjs/common";
import { EventBus } from "@nestjs/cqrs";
import { Request } from 'express';


@Injectable()
export class LoggingFunctions {  // class related to logging function 
    constructor(
        private readonly eventBus: EventBus,
    ) { }

    activityLogHandler(
        request: Request, payload: string,
        response: any, invokationRestMethod: string, invokationApiUrl: string, invokationIp: string,
        invokationUserAgent: string, invokationController: string, invokationMethod: string, completionTime: string, statusCode: number
    ) {
        let loggerMapper = {} as ILoggerMapper;

        //  for activity logging
        const activityCase = response.getHeader(process.env.ACTIVITY_CASE);
        const activityMessage = response.getHeader('activity_message');

        loggerMapper.apiMessage = JSON.stringify(activityMessage);
        loggerMapper.invokationController = invokationController;
        loggerMapper.invokationRestMethod = invokationRestMethod;
        loggerMapper.invokationUserAgent = invokationUserAgent;
        loggerMapper.body = JSON.stringify(payload ?? '');
        loggerMapper.invokationMethod = invokationMethod;
        loggerMapper.invokationApiUrl = invokationApiUrl;
        loggerMapper.completionTime = completionTime;
        loggerMapper.invokationIp = invokationIp;
        loggerMapper.statusCode = statusCode;

        const event = new ActivityLogEvent(request, loggerMapper);
        this.eventBus.publish(event);
    }


}
