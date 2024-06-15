import { DiskHealthIndicator, HealthCheck, HealthCheckService, MemoryHealthIndicator, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { MicroServiceHealthCheckService } from './microservice-health-check.service';
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import 'dotenv/config';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly healthCheckService: MicroServiceHealthCheckService,
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private readonly disk: DiskHealthIndicator,
    private memory: MemoryHealthIndicator,
  ) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/health')
  async getHealth(): Promise<string> {
    try {
      await this.healthCheckService.isHealthy('exampleKey'); // Call the health check service
      return 'OK'; // If no error is thrown, it means the health check passed
    } catch (error) {
      // If an error is thrown, it means the health check failed
      return 'FAIL';
    }
  }

  @Get('/health/typeorm')
  @HealthCheck()
  checkDB() {
    return this.health.check([
      () => this.db.pingCheck('database'),
    ]);
  }

  @Get('/health/disk')
  @HealthCheck()
  checkDisk() {
    return this.health.check([
      () => this.disk.checkStorage('storage', { path: '/', thresholdPercent: 0.9 }),
    ]);
  }

  @Get('/health/memory')
  @HealthCheck()
  checkMemory() {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
    ]);
  }

}
