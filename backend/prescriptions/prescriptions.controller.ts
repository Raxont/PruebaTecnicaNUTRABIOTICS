import { Controller, Post, Get, Patch, Put, Param, Body, UseGuards, Request, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto, UpdatePrescriptionStatusDto, PrescriptionResponseDto } from './prescriptions.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PrescriptionFiltersDto } from '../common/dto/pagination.dto';

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
    const userId = req.user.userId;
    return this.prescriptionsService.createPrescription(userId, createPrescriptionDto);
  }

  /**
   * Get prescriptions with pagination and filters
   */
  @Get()
  @Roles('ADMIN', 'DOCTOR')
  async getPrescriptions(@Request() req, @Query() filters: PrescriptionFiltersDto) {
    return this.prescriptionsService.getPrescriptions(filters, req.user);
  }

  /**
   * Download prescription as PDF
   */
  @Get(':id/pdf')
  @Roles('DOCTOR', 'PATIENT', 'ADMIN')
  async downloadPrescriptionPdf(
    @Param('id') id: string,
    @Request() req,
    @Res() res: Response,
  ): Promise<void> {
    const pdfBuffer = await this.prescriptionsService.generatePrescriptionPdfForUser(id, req.user);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="prescription-${id}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);
  }

  /**
   * Get QR code for prescription
   */
  @Get(':id/qr')
  @Roles('DOCTOR', 'PATIENT', 'ADMIN')
  async getPrescriptionQr(
    @Param('id') id: string,
    @Request() req,
    @Res() res: Response,
  ): Promise<void> {
    // Verify access to prescription
    await this.prescriptionsService.getPrescriptionForUser(id, req.user);

    const qrDataUrl = await this.prescriptionsService.generatePrescriptionQr(id);
    const qrBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');

    res.set({
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename="prescription-${id}-qr.png"`,
      'Content-Length': qrBuffer.length,
    });

    res.send(qrBuffer);
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

  @Put(':id/consume')
  @Roles('PATIENT')
  async consumePrescription(
    @Request() req,
    @Param('id') id: string,
  ): Promise<PrescriptionResponseDto> {
    return this.prescriptionsService.consumePrescription(id, req.user.userId);
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

  @Get(':id')
  @Roles('DOCTOR', 'PATIENT', 'ADMIN')
  async getPrescription(@Param('id') id: string, @Request() req): Promise<PrescriptionResponseDto> {
    return this.prescriptionsService.getPrescriptionForUser(id, req.user);
  }
}
