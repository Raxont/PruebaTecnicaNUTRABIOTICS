import { IsString, IsOptional } from 'class-validator';

export class CreateDoctorDto {
  @IsOptional()
  @IsString()
  specialization?: string;
}

export class DoctorResponseDto {
  id: string;
  userId: string;
  specialization?: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}
