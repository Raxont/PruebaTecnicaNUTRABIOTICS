import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDoctorDto, DoctorResponseDto } from './doctors.dto';
import { SearchFiltersDto } from '../common/dto/pagination.dto';

@Injectable()
export class DoctorsService {
  constructor(private prisma: PrismaService) {}

  async getDoctor(id: string): Promise<DoctorResponseDto> {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return this.formatDoctorResponse(doctor);
  }

  async getDoctorByUserId(userId: string): Promise<DoctorResponseDto> {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return this.formatDoctorResponse(doctor);
  }

  async getAllDoctors(filters: SearchFiltersDto) {
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

    const total = await this.prisma.doctor.count({ where });
    const doctors = await this.prisma.doctor.findMany({
      where,
      include: { user: true },
      skip,
      take: limit,
      orderBy: {
        [sortBy]: actualSortOrder,
      },
    });

    return {
      data: doctors.map(doctor => this.formatDoctorResponse(doctor)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateDoctor(id: string, updateDoctorDto: Partial<CreateDoctorDto>): Promise<DoctorResponseDto> {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const updatedDoctor = await this.prisma.doctor.update({
      where: { id },
      data: updateDoctorDto,
      include: { user: true },
    });

    return this.formatDoctorResponse(updatedDoctor);
  }

  private formatDoctorResponse(doctor: any): DoctorResponseDto {
    return {
      id: doctor.id,
      userId: doctor.userId,
      specialty: doctor.specialty || undefined,
      user: doctor.user ? {
        id: doctor.user.id,
        email: doctor.user.email,
        firstName: doctor.user.firstName || '',
        lastName: doctor.user.lastName || '',
      } : undefined,
    };
  }
}
