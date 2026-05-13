import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PatientsService } from './patients.service';
import { PatientResponseDto } from './patients.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('patients')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class PatientsController {
  constructor(private patientsService: PatientsService) {}

  @Get()
  @Roles('ADMIN', 'DOCTOR')
  async getAllPatients(): Promise<PatientResponseDto[]> {
    return this.patientsService.getAllPatients();
  }

  @Get(':id')
  @Roles('ADMIN', 'DOCTOR', 'PATIENT')
  async getPatient(@Param('id') id: string): Promise<PatientResponseDto> {
    return this.patientsService.getPatient(id);
  }
}
