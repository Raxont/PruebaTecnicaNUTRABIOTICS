import { IsString, IsOptional } from 'class-validator';

export class CreateDoctorDto {
  @IsOptional()
  @IsString()
  specialty?: string;
}

export class DoctorResponseDto {
  id: string;
  userId: string;
  specialty?: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}
