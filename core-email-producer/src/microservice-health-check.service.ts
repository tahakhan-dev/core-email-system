import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { IHealthCheck } from './interface/health-check.interface';
import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import 'dotenv/config';


@Injectable()
export class MicroServiceHealthCheckService extends HealthIndicator {
    public constructor(
    ) {
        super();
    }

    async isHealthy(key: string): Promise<HealthIndicatorResult> {
        const serviceId = process.env.MICRO_SERVICE_1_ID;

        const isActive = await this.checkMicroServiceHealth(); // Replace this with actual health check logic

        const healthCheck: IHealthCheck = { checkedOn: new Date(), microServiceId: serviceId, isActive: isActive };
        await this.writeLogToFile(healthCheck);
        if (isActive) {
            return this.getStatus('exampleKey', true, { checkedOn: new Date() });
        } else {
            const message = `HEALTH-CHECK FAILED FOR ${serviceId}`;
            throw new HealthCheckError(message, false);
        }
    }

    async writeLogToFile(dataToWrite: object) {
        const fileName = 'health_check.log';
        await fs.writeFile(fileName, JSON.stringify(dataToWrite), { flag: 'a+' }, (err) => {
            Logger.log(err);
        });
    }

    async checkMicroServiceHealth(): Promise<boolean> {
        try {
            // if the required resources are available, or if external dependencies are accessible
            // In this example, we check if a file exists
            const filePath = 'healthcheck.txt';
            // await fs.promises.access(filePath, fs.constants.R_OK);
            return true; // If the file exists, consider the microservice as healthy
        } catch (error) {
            return false; // If an error occurs, consider the microservice as unhealthy
        }
    }
}
