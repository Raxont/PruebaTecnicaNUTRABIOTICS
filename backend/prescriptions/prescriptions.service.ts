import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePrescriptionDto, UpdatePrescriptionStatusDto, PrescriptionResponseDto } from './prescriptions.dto';
import { PrescriptionStatus } from '@prisma/client';

@Injectable()
export class PrescriptionsService {
  constructor(private prisma: PrismaService) {}

  async createPrescription(
    doctorId: string,
    createPrescriptionDto: CreatePrescriptionDto,
  ): Promise<PrescriptionResponseDto> {
    const { patientId, items } = createPrescriptionDto;

    // Verify doctor exists
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    // Verify patient exists
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new BadRequestException('Patient not found');
    }

    // Create prescription with items
    const prescription = await this.prisma.prescription.create({
      data: {
        doctorId,
        patientId,
        items: {
          create: items.map(item => ({
            name: item.name,
            dosage: item.dosage,
            quantity: parseInt(item.quantity),
            instructions: item.instructions,
          })),
        },
      },
      include: {
        items: true,
        doctor: {
          include: { user: true },
        },
        patient: {
          include: { user: true },
        },
      },
    });

    return this.formatPrescriptionResponse(prescription);
  }

  async getPrescription(id: string): Promise<PrescriptionResponseDto> {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id },
      include: {
        items: true,
        doctor: {
          include: { user: true },
        },
        patient: {
          include: { user: true },
        },
      },
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    return this.formatPrescriptionResponse(prescription);
  }

  async getPrescriptionsByDoctor(doctorId: string): Promise<PrescriptionResponseDto[]> {
    const prescriptions = await this.prisma.prescription.findMany({
      where: { doctorId },
      include: {
        items: true,
        doctor: {
          include: { user: true },
        },
        patient: {
          include: { user: true },
        },
      },
    });

    return prescriptions.map(p => this.formatPrescriptionResponse(p));
  }

  async getPrescriptionsByPatient(patientId: string): Promise<PrescriptionResponseDto[]> {
    const prescriptions = await this.prisma.prescription.findMany({
      where: { patientId },
      include: {
        items: true,
        doctor: {
          include: { user: true },
        },
        patient: {
          include: { user: true },
        },
      },
    });

    return prescriptions.map(p => this.formatPrescriptionResponse(p));
  }

  async updatePrescriptionStatus(
    id: string,
    userId: string,
    updateDto: UpdatePrescriptionStatusDto,
  ): Promise<PrescriptionResponseDto> {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id },
      include: {
        patient: {
          include: { user: true },
        },
      },
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    // Only the patient can update the status
    if (prescription.patient.user.id !== userId) {
      throw new ForbiddenException('You can only update your own prescriptions');
    }

    const updated = await this.prisma.prescription.update({
      where: { id },
      data: {
        status: updateDto.status as PrescriptionStatus,
      },
      include: {
        items: true,
        doctor: {
          include: { user: true },
        },
        patient: {
          include: { user: true },
        },
      },
    });

    return this.formatPrescriptionResponse(updated);
  }

  private formatPrescriptionResponse(prescription: any): PrescriptionResponseDto {
    return {
      id: prescription.id,
      doctorId: prescription.doctorId,
      patientId: prescription.patientId,
      status: prescription.status,
      items: prescription.items.map(item => ({
        id: item.id,
        name: item.name,
        dosage: item.dosage,
        quantity: item.quantity,
        instructions: item.instructions,
      })),
      doctor: prescription.doctor ? {
        id: prescription.doctor.id,
        user: {
          firstName: prescription.doctor.user.firstName,
          lastName: prescription.doctor.user.lastName,
          email: prescription.doctor.user.email,
        },
      } : undefined,
      patient: prescription.patient ? {
        id: prescription.patient.id,
        user: {
          firstName: prescription.patient.user.firstName,
          lastName: prescription.patient.user.lastName,
          email: prescription.patient.user.email,
        },
      } : undefined,
      createdAt: prescription.createdAt,
    };
  }
}
