import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PatientResponseDto } from './patients.dto';

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) {}

  async getPatient(id: string): Promise<PatientResponseDto> {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return this.formatPatientResponse(patient);
  }

  async getPatientByUserId(userId: string): Promise<PatientResponseDto> {
    const patient = await this.prisma.patient.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return this.formatPatientResponse(patient);
  }

  async getAllPatients(): Promise<PatientResponseDto[]> {
    const patients = await this.prisma.patient.findMany({
      include: { user: true },
    });

    return patients.map(patient => this.formatPatientResponse(patient));
  }

  private formatPatientResponse(patient: any): PatientResponseDto {
    return {
      id: patient.id,
      userId: patient.userId,
      user: patient.user ? {
        id: patient.user.id,
        email: patient.user.email,
        firstName: patient.user.firstName || '',
        lastName: patient.user.lastName || '',
      } : undefined,
    };
  }
}
