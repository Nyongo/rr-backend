import { Module } from '@nestjs/common';
import { TelemetryController } from './controllers/telemetry.controller';
import { TelemetryService } from './services/telemetry.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [TelemetryController],
  providers: [TelemetryService, PrismaService],
  exports: [TelemetryService],
})
export class TelemetryModule {}
