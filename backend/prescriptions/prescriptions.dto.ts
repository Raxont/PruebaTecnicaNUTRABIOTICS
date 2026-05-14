import { IsString, IsArray, ValidateNested, IsOptional, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';
import { PrescriptionStatus } from '@prisma/client';

export class CreatePrescriptionItemDto {
  @IsString()
  name: string;

  @IsString()
  dosage: string;

  @IsString()
  quantity: string;

  @IsOptional()
  @IsString()
  instructions?: string;
}

export class CreatePrescriptionDto {
  @IsOptional()
  @IsString()
  patientId?: string;

  @IsOptional()
  @IsEmail()
  patientEmail?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePrescriptionItemDto)
  items: CreatePrescriptionItemDto[];
}

export class UpdatePrescriptionStatusDto {
  @IsString()
  status: PrescriptionStatus;
}

export class PrescriptionItemResponseDto {
  id: string;
  name: string;
  dosage: string;
  quantity: number;
  instructions?: string;
}

export class PrescriptionResponseDto {
  id: string;
  code: string;
  doctorId: string;
  patientId?: string;
  patientEmail?: string;
  status: PrescriptionStatus;
  notes?: string;
  consumedAt?: Date;
  items: PrescriptionItemResponseDto[];
  doctor?: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  patient?: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  createdAt: Date;
}
