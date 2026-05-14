import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PatientResponseDto } from './patients.dto';
import { SearchFiltersDto } from '../common/dto/pagination.dto';

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

  async getAllPatients(filters: SearchFiltersDto) {
    const {
      page = 1,
      limit = 10,
      query,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      order,
    } = filters;

    const skip = (page - 1) * limit;
    const actualSortOrder = order || sortOrder;

    const where: any = {};
    if (query) {
      where.OR = [
        { user: { email: { contains: query, mode: 'insensitive' } } },
        { user: { firstName: { contains: query, mode: 'insensitive' } } },
        { user: { lastName: { contains: query, mode: 'insensitive' } } },
      ];
    }

    const total = await this.prisma.patient.count({ where });
    const patients = await this.prisma.patient.findMany({
      where,
      include: { user: true },
      skip,
      take: limit,
      orderBy: {
        [sortBy]: actualSortOrder,
      },
    });

    return {
      data: patients.map(patient => this.formatPatientResponse(patient)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
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
