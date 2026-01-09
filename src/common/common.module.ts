import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonFunctionsService } from './services/common-functions.service';
import { FileUploadService } from './services/file-upload.service';
import { SmsService } from './services/sms.service';
import { MailService } from './services/mail.service';

@Module({
  imports: [ConfigModule],
  providers: [CommonFunctionsService, FileUploadService, SmsService, MailService],
  exports: [CommonFunctionsService, FileUploadService, SmsService, MailService],
})
export class CommonModule {}
