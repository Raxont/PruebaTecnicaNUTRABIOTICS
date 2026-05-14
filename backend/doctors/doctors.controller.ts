import { Controller, Get, Patch, Param, Body, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DoctorsService } from './doctors.service';
import { DoctorResponseDto, CreateDoctorDto } from './doctors.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { SearchFiltersDto } from '../common/dto/pagination.dto';

@Controller('doctors')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class DoctorsController {
  constructor(private doctorsService: DoctorsService) {}

  @Get()
  @Roles('ADMIN', 'DOCTOR', 'PATIENT')
  async getAllDoctors(@Query() filters: SearchFiltersDto) {
    return this.doctorsService.getAllDoctors(filters);
  }

  @Get(':id')
  @Roles('ADMIN', 'DOCTOR', 'PATIENT')
  async getDoctor(@Param('id') id: string): Promise<DoctorResponseDto> {
    return this.doctorsService.getDoctor(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  async updateDoctor(
    @Param('id') id: string,
    @Body() updateDoctorDto: Partial<CreateDoctorDto>,
  ): Promise<DoctorResponseDto> {
    return this.doctorsService.updateDoctor(id, updateDoctorDto);
  }
}
