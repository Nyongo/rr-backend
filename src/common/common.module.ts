import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonFunctionsService } from './services/common-functions.service';
import { FileUploadService } from './services/file-upload.service';

@Module({
  imports: [ConfigModule],
  providers: [CommonFunctionsService, FileUploadService],
  exports: [CommonFunctionsService, FileUploadService],
})
export class CommonModule {}
