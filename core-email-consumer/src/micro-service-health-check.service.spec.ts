import { Test } from '@nestjs/testing';
import { HealthCheckError, HealthIndicatorResult } from '@nestjs/terminus';
import * as fs from 'fs';
import { MicroServiceHealthCheckService } from './microservice-health-check.service';

describe('MicroServiceHealthCheckService', () => {
  let microServiceHealthCheckService: MicroServiceHealthCheckService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [MicroServiceHealthCheckService],
    }).compile();
    microServiceHealthCheckService = moduleRef.get<MicroServiceHealthCheckService>(MicroServiceHealthCheckService);
  });

  describe('isHealthy', () => {
    it('should return a successful health check result if microservice is healthy', async () => {
      jest.spyOn(microServiceHealthCheckService, 'checkMicroServiceHealth').mockResolvedValue(true);
      const result: HealthIndicatorResult = await microServiceHealthCheckService.isHealthy('exampleKey');
      expect(result).toEqual({ exampleKey: { status: 'up', checkedOn: expect.any(Date) } });
    });

    it('should throw a HealthCheckError if microservice is unhealthy', async () => {
      jest.spyOn(microServiceHealthCheckService, 'checkMicroServiceHealth').mockResolvedValue(false);
      await expect(microServiceHealthCheckService.isHealthy('exampleKey')).rejects.toThrow(HealthCheckError);
    });
  });

  describe('checkMicroServiceHealth', () => {
    it('should return true if file exists', async () => {
      jest.spyOn(fs.promises, 'access').mockResolvedValue(Promise.resolve());
      const result: boolean = await microServiceHealthCheckService.checkMicroServiceHealth();
      expect(result).toBe(true);
    });

    it('should return false if file does not exist', async () => {
      jest.spyOn(fs.promises, 'access').mockRejectedValue(new Error());
      const result: boolean = await microServiceHealthCheckService.checkMicroServiceHealth();
      expect(result).toBe(false);
    });
  });
});
