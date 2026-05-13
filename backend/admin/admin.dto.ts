export class MetricsResponseDto {
  totalPatients: number;
  totalDoctors: number;
  totalPrescriptions: number;
  prescriptionsByStatus: {
    pending: number;
    consumed: number;
  };
  prescriptionsByDay: {
    date: string;
    count: number;
  }[];
}
