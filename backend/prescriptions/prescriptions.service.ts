import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePrescriptionDto, UpdatePrescriptionStatusDto, PrescriptionResponseDto } from './prescriptions.dto';
import { PrescriptionStatus, UserRole } from '@prisma/client';
import { PrescriptionFiltersDto } from '../common/dto/pagination.dto';
import { PdfService } from '../common/services/pdf.service';

@Injectable()
export class PrescriptionsService {
  constructor(
    private prisma: PrismaService,
    private pdfService: PdfService,
  ) {}

  async createPrescription(
    doctorUserId: string,
    createPrescriptionDto: CreatePrescriptionDto,
  ): Promise<PrescriptionResponseDto> {
    const { patientId, patientEmail, items, notes } = createPrescriptionDto;

    // Verify doctor exists by authenticated user
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId: doctorUserId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    if (!patientId && !patientEmail) {
      throw new BadRequestException('patientId or patientEmail is required');
    }

    let patient = null;
    if (patientId) {
      patient = await this.prisma.patient.findUnique({
        where: { id: patientId },
      });

      if (!patient) {
        throw new BadRequestException('Patient not found');
      }
    }

    const prescription = await this.prisma.prescription.create({
      data: {
        doctorId: doctor.id,
        patientId: patient?.id,
        patientEmail,
        notes,
        items: {
          create: items.map(item => ({
            name: item.name,
            dosage: item.dosage,
            quantity: parseInt(item.quantity, 10),
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

    if (!prescription.patient || prescription.patient.user.id !== userId) {
      throw new ForbiddenException('You can only update your own prescriptions');
    }

    const updated = await this.prisma.prescription.update({
      where: { id },
      data: {
        status: updateDto.status as PrescriptionStatus,
        consumedAt: updateDto.status === PrescriptionStatus.CONSUMED ? new Date() : null,
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

  /**
   * Get prescriptions with pagination and filters
   */
  async getPrescriptions(filters: PrescriptionFiltersDto, user?: { userId: string; role: string }) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      order,
      status,
      doctorId,
      patientId,
      from,
      to,
      dateFrom,
      dateTo,
    } = filters;

    const skip = (page - 1) * limit;
    const actualSortOrder = order || sortOrder;

    // Build where clause
    const where: any = {};
    if (status) where.status = status;
    if (user?.role === UserRole.DOCTOR) {
      const doctor = await this.prisma.doctor.findUnique({
        where: { userId: user.userId },
      });

      if (!doctor) {
        throw new NotFoundException('Doctor not found');
      }

      where.doctorId = doctor.id;
    } else if (doctorId) {
      where.doctorId = doctorId;
    }

    if (patientId) where.patientId = patientId;
    const effectiveFrom = from || dateFrom;
    const effectiveTo = to || dateTo;

    if (effectiveFrom || effectiveTo) {
      where.createdAt = {};
      if (effectiveFrom) where.createdAt.gte = new Date(effectiveFrom);
      if (effectiveTo) where.createdAt.lte = new Date(effectiveTo + 'T23:59:59');
    }

    // Get total count
    const total = await this.prisma.prescription.count({ where });

    // Get paginated results
    const prescriptions = await this.prisma.prescription.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: actualSortOrder,
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

    return {
      data: prescriptions.map(p => this.formatPrescriptionResponse(p)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPrescriptionForUser(id: string, user: { userId: string; role: string }): Promise<PrescriptionResponseDto> {
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

    if (user.role === UserRole.ADMIN) {
      return this.formatPrescriptionResponse(prescription);
    }

    if (user.role === UserRole.DOCTOR) {
      const doctor = await this.prisma.doctor.findUnique({
        where: { userId: user.userId },
      });
      if (!doctor || doctor.id !== prescription.doctorId) {
        throw new ForbiddenException('You can only access your own prescriptions');
      }

      return this.formatPrescriptionResponse(prescription);
    }

    if (user.role === UserRole.PATIENT) {
      if (!prescription.patient || prescription.patient.userId !== user.userId) {
        throw new ForbiddenException('You can only access your own prescriptions');
      }

      return this.formatPrescriptionResponse(prescription);
    }

    throw new ForbiddenException('Access denied');
  }

  async generatePrescriptionPdfForUser(id: string, user: { userId: string; role: string }): Promise<Buffer> {
    const prescription = await this.getPrescriptionForUser(id, user);
    return this.pdfService.generatePrescriptionPdf(prescription);
  }

  async getMyPrescriptions(userId: string, filters: PrescriptionFiltersDto) {
    const patient = await this.prisma.patient.findUnique({
      where: { userId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      order,
      status,
      from,
      to,
      dateFrom,
      dateTo,
    } = filters;

    const skip = (page - 1) * limit;
    const actualSortOrder = order || sortOrder;

    const where: any = { patientId: patient.id };
    if (status) where.status = status;

    const effectiveFrom = from || dateFrom;
    const effectiveTo = to || dateTo;

    if (effectiveFrom || effectiveTo) {
      where.createdAt = {};
      if (effectiveFrom) where.createdAt.gte = new Date(effectiveFrom);
      if (effectiveTo) where.createdAt.lte = new Date(effectiveTo + 'T23:59:59');
    }

    const total = await this.prisma.prescription.count({ where });
    const prescriptions = await this.prisma.prescription.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: actualSortOrder,
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

    return {
      data: prescriptions.map(p => this.formatPrescriptionResponse(p)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async consumePrescription(id: string, userId: string): Promise<PrescriptionResponseDto> {
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

    if (!prescription.patient || prescription.patient.user.id !== userId) {
      throw new ForbiddenException('You can only consume your own prescriptions');
    }

    const updated = await this.prisma.prescription.update({
      where: { id },
      data: {
        status: PrescriptionStatus.CONSUMED,
        consumedAt: new Date(),
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

  /**
   * Generate PDF for a prescription
   */
  async generatePrescriptionPdf(id: string): Promise<Buffer> {
    const prescription = await this.getPrescription(id);
    return this.pdfService.generatePrescriptionPdf(prescription);
  }

  private formatPrescriptionResponse(prescription: any): PrescriptionResponseDto {
    return {
      id: prescription.id,
      code: prescription.code,
      doctorId: prescription.doctorId,
      patientId: prescription.patientId ?? undefined,
      patientEmail: prescription.patientEmail ?? undefined,
      status: prescription.status,
      notes: prescription.notes ?? undefined,
      consumedAt: prescription.consumedAt ?? undefined,
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
