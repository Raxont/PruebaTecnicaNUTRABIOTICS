import { Module } from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { PrescriptionsController } from './prescriptions.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PdfService } from '../common/services/pdf.service';

@Module({
  imports: [PrismaModule],
  providers: [PrescriptionsService, PdfService],
  controllers: [PrescriptionsController],
  exports: [PrescriptionsService],
})
export class PrescriptionsModule {}
