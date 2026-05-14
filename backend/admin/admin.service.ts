import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MetricsResponseDto, MetricsFiltersDto } from './admin.dto';
import { PrescriptionFiltersDto } from '../common/dto/pagination.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getMetrics(filters: MetricsFiltersDto): Promise<MetricsResponseDto> {
    const from = filters.from ? new Date(filters.from) : null;
    const to = filters.to ? new Date(`${filters.to}T23:59:59`) : null;
    const dateFilter: any = {};

    if (from) dateFilter.gte = from;
    if (to) dateFilter.lte = to;

    const where = from || to ? { createdAt: dateFilter } : {};

    // Total patients
    const totalPatients = await this.prisma.patient.count();

    // Total doctors
    const totalDoctors = await this.prisma.doctor.count();

    // Total prescriptions
    const totalPrescriptions = await this.prisma.prescription.count({ where });

    const groupByWhere = from || to ? { createdAt: dateFilter } : {};

    // Prescriptions by status
    const prescriptionsByStatus = await this.prisma.prescription.groupBy({
      by: ['status'],
      where: groupByWhere,
      _count: true,
    });

    const statusCounts = {
      pending: 0,
      consumed: 0,
    };

    prescriptionsByStatus.forEach(item => {
      statusCounts[item.status.toLowerCase()] = item._count;
    });

    // Prescriptions by day
    const prescriptionsRaw = await this.prisma.prescription.findMany({
      where: from || to ? { createdAt: dateFilter } : {
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 30)),
        },
      },
      select: {
        createdAt: true,
      },
    });

    const prescriptionsByDay = this.groupByDay(prescriptionsRaw);

    return {
      totalPatients,
      totalDoctors,
      totalPrescriptions,
      prescriptionsByStatus: {
        pending: statusCounts.pending,
        consumed: statusCounts.consumed,
      },
      prescriptionsByDay,
    };
  }

  async getPrescriptions(filters: PrescriptionFiltersDto) {
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

    const where: any = {};
    if (status) where.status = status;
    if (doctorId) where.doctorId = doctorId;
    if (patientId) where.patientId = patientId;

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
      data: prescriptions.map(p => ({
        id: p.id,
        code: p.code,
        doctorId: p.doctorId,
        patientId: p.patientId ?? undefined,
        patientEmail: p.patientEmail ?? undefined,
        status: p.status,
        notes: p.notes ?? undefined,
        consumedAt: p.consumedAt ?? undefined,
        items: p.items.map(item => ({
          id: item.id,
          name: item.name,
          dosage: item.dosage,
          quantity: item.quantity,
          instructions: item.instructions,
        })),
        doctor: p.doctor ? {
          id: p.doctor.id,
          user: {
            firstName: p.doctor.user.firstName,
            lastName: p.doctor.user.lastName,
            email: p.doctor.user.email,
          },
        } : undefined,
        patient: p.patient ? {
          id: p.patient.id,
          user: {
            firstName: p.patient.user.firstName,
            lastName: p.patient.user.lastName,
            email: p.patient.user.email,
          },
        } : undefined,
        createdAt: p.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private groupByDay(prescriptions: any[]): { date: string; count: number }[] {
    const grouped: { [key: string]: number } = {};

    prescriptions.forEach(prescription => {
      const date = new Date(prescription.createdAt).toISOString().split('T')[0];
      grouped[date] = (grouped[date] || 0) + 1;
    });

    return Object.entries(grouped)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
}
