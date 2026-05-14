import { IsOptional, IsString, IsEnum, IsInt, IsBoolean, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { PrescriptionStatus } from '@prisma/client';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  order?: 'asc' | 'desc';
}

export class PrescriptionFiltersDto extends PaginationDto {
  @IsOptional()
  @IsEnum(PrescriptionStatus)
  status?: PrescriptionStatus;

  @IsOptional()
  @IsString()
  doctorId?: string;

  @IsOptional()
  @IsString()
  patientId?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  mine?: boolean;

  @IsOptional()
  @IsString()
  from?: string; // YYYY-MM-DD

  @IsOptional()
  @IsString()
  to?: string; // YYYY-MM-DD

  @IsOptional()
  @IsString()
  dateFrom?: string; // YYYY-MM-DD

  @IsOptional()
  @IsString()
  dateTo?: string; // YYYY-MM-DD
}

export class UserFiltersDto extends PaginationDto {
  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  query?: string; // Para buscar por nombre o email
}

export class SearchFiltersDto extends PaginationDto {
  @IsOptional()
  @IsString()
  query?: string; // Búsqueda simple de texto
}