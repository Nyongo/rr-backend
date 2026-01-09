import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CommonModule } from '../common/common.module';
import { CustomerController } from './controllers/customer.controller';
import { SchoolController } from './controllers/school.controller';
import { BusController } from './controllers/bus.controller';
import { DriverController } from './controllers/driver.controller';
import { MinderController } from './controllers/minder.controller';
import { ParentController } from './controllers/parent.controller';
import { StudentController } from './controllers/student.controller';
import { AddressController } from './controllers/address.controller';
import { RouteController } from './controllers/route.controller';
import { SchoolTripController, StudentTrackingController } from './controllers/school-trip.controller';
import { CustomerDbService } from './services/customer-db.service';
import { SchoolDbService } from './services/school-db.service';
import { BusDbService } from './services/bus-db.service';
import { DriverDbService } from './services/driver-db.service';
import { MinderDbService } from './services/minder-db.service';
import { ParentDbService } from './services/parent-db.service';
import { StudentDbService } from './services/student-db.service';
import { AddressDbService } from './services/address-db.service';
import { RouteDbService } from './services/route-db.service';
import { SchoolTripDbService } from './services/school-trip-db.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../common/services/mail.service';
import { SmsService } from '../common/services/sms.service';
import { SchoolTripTrackingGateway } from './gateways/school-trip-tracking.gateway';

@Module({
  imports: [CommonModule, ConfigModule],
  providers: [
    PrismaService,
    CustomerDbService,
    SchoolDbService,
    BusDbService,
    DriverDbService,
    MinderDbService,
    ParentDbService,
    StudentDbService,
    AddressDbService,
    RouteDbService,
    SchoolTripDbService,
    MailService,
    SmsService,
    SchoolTripTrackingGateway,
    ConfigService,
  ],
  controllers: [
    CustomerController,
    SchoolController,
    BusController,
    DriverController,
    MinderController,
    ParentController,
    StudentController,
    AddressController,
    RouteController,
    SchoolTripController,
    StudentTrackingController,
  ],
  exports: [
    CustomerDbService,
    SchoolDbService,
    BusDbService,
    DriverDbService,
    MinderDbService,
    ParentDbService,
    StudentDbService,
    AddressDbService,
    RouteDbService,
    SchoolTripDbService,
    SchoolTripTrackingGateway,
  ],
})
export class AcademicSuiteModule {
  constructor(
    private readonly schoolTripDbService: SchoolTripDbService,
    private readonly schoolTripTrackingGateway: SchoolTripTrackingGateway,
    private readonly smsService: SmsService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {
    // Wire up the gateway and services to the service after initialization
    this.schoolTripDbService.setTrackingGateway(
      this.schoolTripTrackingGateway,
    );
    this.schoolTripDbService.setServices(
      this.smsService,
      this.mailService,
      this.configService,
    );
  }
}
