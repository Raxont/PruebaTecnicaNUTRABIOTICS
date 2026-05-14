import { Module } from '@nestjs/common';
import { MeController } from './me.controller';
import { PrescriptionsModule } from '../prescriptions/prescriptions.module';

@Module({
  imports: [PrescriptionsModule],
  controllers: [MeController],
})
export class MeModule {}
