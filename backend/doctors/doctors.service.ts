import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDoctorDto, DoctorResponseDto } from './doctors.dto';

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

  async getAllDoctors(): Promise<DoctorResponseDto[]> {
    const doctors = await this.prisma.doctor.findMany({
      include: { user: true },
    });

    return doctors.map(doctor => this.formatDoctorResponse(doctor));
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
      specialization: doctor.specialization || undefined,
      user: doctor.user ? {
        id: doctor.user.id,
        email: doctor.user.email,
        firstName: doctor.user.firstName || '',
        lastName: doctor.user.lastName || '',
      } : undefined,
    };
  }
}
