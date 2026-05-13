import { Controller, Post, Get, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto, UpdatePrescriptionStatusDto, PrescriptionResponseDto } from './prescriptions.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('prescriptions')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class PrescriptionsController {
  constructor(private prescriptionsService: PrescriptionsService) {}

  @Post()
  @Roles('DOCTOR')
  async createPrescription(
    @Request() req,
    @Body() createPrescriptionDto: CreatePrescriptionDto,
  ): Promise<PrescriptionResponseDto> {
    // Get doctorId from the user's doctor profile
    const userId = req.user.userId;
    // In a real app, you'd get the doctor profile associated with this user
    // For now, we'll pass a doctorId (this would need to be enhanced)
    return this.prescriptionsService.createPrescription(req.body.doctorId, createPrescriptionDto);
  }

  @Get(':id')
  @Roles('DOCTOR', 'PATIENT', 'ADMIN')
  async getPrescription(@Param('id') id: string): Promise<PrescriptionResponseDto> {
    return this.prescriptionsService.getPrescription(id);
  }

  @Get('doctor/:doctorId')
  @Roles('DOCTOR', 'ADMIN')
  async getPrescriptionsByDoctor(@Param('doctorId') doctorId: string): Promise<PrescriptionResponseDto[]> {
    return this.prescriptionsService.getPrescriptionsByDoctor(doctorId);
  }

  @Get('patient/:patientId')
  @Roles('PATIENT', 'DOCTOR', 'ADMIN')
  async getPrescriptionsByPatient(@Param('patientId') patientId: string): Promise<PrescriptionResponseDto[]> {
    return this.prescriptionsService.getPrescriptionsByPatient(patientId);
  }

  @Patch(':id/status')
  @Roles('PATIENT')
  async updatePrescriptionStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdatePrescriptionStatusDto,
  ): Promise<PrescriptionResponseDto> {
    return this.prescriptionsService.updatePrescriptionStatus(id, req.user.userId, updateDto);
  }
}
