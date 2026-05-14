import { IsOptional, IsString } from 'class-validator';

export class MetricsFiltersDto {
  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;
}

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
