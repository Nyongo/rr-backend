import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { ConfigsModule } from './configs/configs.module';
import { ConfigModule } from '@nestjs/config';
import { FleetModule } from './fleet/fleet.module';
import { AcademicSuiteModule } from './academic-suite/academic-suite.module';
import { LoggingMiddleware } from './common/middleware/logging.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes the config available globally
      envFilePath: '.env', // Path to the .env file
    }),
    UsersModule,
    AuthModule,
    ConfigsModule,
    FleetModule,
    AcademicSuiteModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, LoggingMiddleware],
  exports: [PrismaService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
