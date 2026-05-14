import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PatientsService } from './patients.service';
import { PatientResponseDto } from './patients.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { SearchFiltersDto } from '../common/dto/pagination.dto';

@Controller('patients')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class PatientsController {
  constructor(private patientsService: PatientsService) {}

  @Get()
  @Roles('ADMIN', 'DOCTOR')
  async getAllPatients(@Query() filters: SearchFiltersDto) {
    return this.patientsService.getAllPatients(filters);
  }

  @Get(':id')
  @Roles('ADMIN', 'DOCTOR', 'PATIENT')
  async getPatient(@Param('id') id: string): Promise<PatientResponseDto> {
    return this.patientsService.getPatient(id);
  }
}
