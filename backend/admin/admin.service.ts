import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MetricsResponseDto } from './admin.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getMetrics(): Promise<MetricsResponseDto> {
    // Total patients
    const totalPatients = await this.prisma.patient.count();

    // Total doctors
    const totalDoctors = await this.prisma.doctor.count();

    // Total prescriptions
    const totalPrescriptions = await this.prisma.prescription.count();

    // Prescriptions by status
    const prescriptionsByStatus = await this.prisma.prescription.groupBy({
      by: ['status'],
      _count: true,
    });

    const statusCounts = {
      pending: 0,
      consumed: 0,
    };

    prescriptionsByStatus.forEach(item => {
      statusCounts[item.status.toLowerCase()] = item._count;
    });

    // Prescriptions by day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const prescriptionsRaw = await this.prisma.prescription.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
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
